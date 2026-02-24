const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
const User = require("../models/User");
const executionService = require("../services/executionService");
const leaderboardService = require("../services/leaderboardService");

const SUPPORTED_LANGS = ["python", "c", "cpp", "java", "javascript"];

// ── GET /api/problems ────────────────────────────────────────────────────────
const getProblems = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const query = {};

    if (category && category !== "All") query.categories = category;
    if (difficulty && difficulty !== "All") query.difficulty = difficulty;

    const problems = await Problem.find(query)
      .select("-testCases -templates")
      .lean();

    return res.json(problems);
  } catch (err) {
    console.error("[Problems] getProblems:", err.message);
    return res.status(500).json({ message: "Failed to fetch problems." });
  }
};

// ── GET /api/problems/:id ────────────────────────────────────────────────────
const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjId = /^[0-9a-fA-F]{24}$/.test(id);

    const problem = await (
      isObjId ? Problem.findById(id) : Problem.findOne({ slug: id })
    ).select("-testCases.output"); // hide expected outputs from client

    if (!problem)
      return res.status(404).json({ message: "Problem not found." });

    return res.json(problem);
  } catch (err) {
    console.error("[Problems] getProblemById:", err.message);
    return res.status(500).json({ message: "Failed to fetch problem." });
  }
};

// ── POST /api/problems/:id/submit ────────────────────────────────────────────
const submitSolution = async (req, res) => {
  const { code, language, eventId } = req.body;
  const problemId = req.params.id;
  const userId = req.user._id;
  const user = req.user;

  // ── Validate ──────────────────────────────────────────────────────────────
  if (!code || !language) {
    return res.status(400).json({ message: "code and language are required." });
  }

  const lang = language.toLowerCase();
  if (!SUPPORTED_LANGS.includes(lang)) {
    return res.status(400).json({
      message: `'${language}' is not supported. Use: ${SUPPORTED_LANGS.join(", ")}.`,
    });
  }

  if (Buffer.byteLength(code, "utf8") > 65_536) {
    return res
      .status(400)
      .json({ message: "Code exceeds the 64 KB size limit." });
  }

  try {
    // ── 1. Fetch Problem ──────────────────────────────────────────────────
    const isObjId = /^[0-9a-fA-F]{24}$/.test(problemId);
    const problem = await (isObjId
      ? Problem.findById(problemId)
      : Problem.findOne({ slug: problemId }));

    if (!problem)
      return res.status(404).json({ message: "Problem not found." });

    const testCases = problem.testCases || [];
    let passedCount = 0;
    let totalRuntime = 0;
    let verdict = "Accepted";
    let firstError = "";
    const submittedAt = new Date();

    // ── 2. Run All Test Cases ─────────────────────────────────────────────
    if (testCases.length > 0) {
      for (const tc of testCases) {
        const result = await executionService.executeCode({
          language: lang,
          code,
          input: String(tc.input ?? ""),
        });

        totalRuntime += result.executionTime ?? 0;

        if (result.status === "timeout") {
          verdict = "Time Limit Exceeded";
          firstError = "Your solution exceeded the time limit.";
          break;
        }

        if (result.exitCode !== 0) {
          verdict = "Runtime Error";
          // More helpful message if stderr is empty but exit code is non-zero
          if (!result.stderr) {
            firstError = `Process exited with non-zero code (${result.exitCode}). Ensure you return 0 from main and your logic is correct.`;
          } else {
            firstError = result.stderr;
          }
          break;
        }

        const expected = (tc.output ?? "").trim();
        const actual = (result.stdout ?? "").trim();

        // Lenient Comparison Logic:
        const cleanActual = actual.toLowerCase().replace(/[^a-z0-9]/g, "");
        const cleanExpected = expected.toLowerCase().replace(/[^a-z0-9]/g, "");

        const isCorrect =
          actual === expected ||
          actual.toLowerCase().endsWith(expected.toLowerCase()) ||
          cleanActual.endsWith(cleanExpected);

        if (isCorrect) {
          passedCount++;
        } else {
          verdict = "Wrong Answer";
          // Show a snippet of the mismatch for the first failure
          firstError = `Test Case #${passedCount + 1} Failed.\nExpected: ${expected}\nActual: ${actual.length > 100 ? actual.substring(0, 100) + "..." : actual}`;
          break;
        }
      }
    } else {
      // No test cases: just check it runs without error
      const result = await executionService.executeCode({
        language: lang,
        code,
        input: "",
      });
      totalRuntime = result.executionTime ?? 0;
      if (result.exitCode !== 0) {
        verdict = "Runtime Error";
        firstError = result.stderr || "";
      } else {
        passedCount = 1;
      }
    }

    const totalTests = testCases.length || 1;

    // ── 3. Persist Submission ─────────────────────────────────────────────
    await Submission.create({
      user: userId,
      problem: problem._id,
      language: lang,
      code,
      status: verdict,
      passedTestCases: passedCount,
      totalTestCases: totalTests,
      executionTime: totalRuntime,
      error: firstError || undefined,
    });

    // ── 4. On Accepted — update user & leaderboard ────────────────────────
    if (verdict === "Accepted") {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { solvedProblems: problem._id },
        $inc: { xp: problem.xpReward || 10 },
      });

      // Fire-and-forget (non-blocking — never crash submission flow)
      leaderboardService
        .updateLeaderboard({
          userId,
          username: user.username,
          problemId: problem._id,
          status: verdict,
          executionTime: totalRuntime,
          submittedAt,
          eventId: eventId || "global",
        })
        .catch((e) => console.error("[Leaderboard] update failed:", e.message));
    }

    // ── 5. Respond ────────────────────────────────────────────────────────
    return res.json({
      success: true,
      submission: {
        status: verdict,
        passedTestCases: passedCount,
        totalTestCases: totalTests,
        executionTime: totalRuntime,
        language: lang,
        error: firstError || undefined,
      },
      xpGained: verdict === "Accepted" ? problem.xpReward || 10 : 0,
    });
  } catch (err) {
    console.error("[Problems] submitSolution:", err.message);
    return res
      .status(500)
      .json({ message: "Submission failed. Please try again." });
  }
};

// ── GET /api/problems/:id/submissions ───────────────────────────────────────
const getSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjId = /^[0-9a-fA-F]{24}$/.test(id);

    let problemObjId = id;
    if (!isObjId) {
      const problem = await Problem.findOne({ slug: id }).select("_id");
      if (!problem) return res.json([]);
      problemObjId = problem._id;
    }

    const submissions = await Submission.find({
      user: req.user._id,
      problem: problemObjId,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("-code") // don't send full code on list
      .lean();

    return res.json(submissions);
  } catch (err) {
    console.error("[Problems] getSubmissions:", err.message);
    return res.status(500).json({ message: "Failed to fetch submissions." });
  }
};

module.exports = {
  getProblems,
  getProblemById,
  submitSolution,
  getSubmissions,
};
