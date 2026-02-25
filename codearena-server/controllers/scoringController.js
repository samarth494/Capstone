const scoringService = require("../services/scoringService");

/**
 * Scoring Controller
 *
 * Handles HTTP request → service call → response formatting.
 * All business logic lives in scoringService + scoringEngine.
 */

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/scoring/submit
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Submit a scored entry.
 *
 * Body (JSON):
 *   userId                 – ObjectId (string)       REQUIRED
 *   username               – string                  REQUIRED
 *   eventId                – string                  optional (default 'global')
 *   problemId              – ObjectId (string)       optional
 *   passedTestCases        – number >= 0             REQUIRED
 *   totalTestCases         – number >= 1             REQUIRED
 *   executionTimeMs        – number >= 0             REQUIRED
 *   maxTimeAllowed         – number >= 1 (ms)        REQUIRED
 *   syntaxErrors           – number >= 0             REQUIRED
 *   maxSyntaxErrorsAllowed – number >= 1             REQUIRED
 *   understandingScore     – number 0–750            REQUIRED  (judge)
 *   readabilityScore       – number 0–500            REQUIRED  (judge)
 *   submittedAt            – ISO date string         optional  (default now)
 *
 * Response 200:
 *   { success, submission, scores }
 *
 * Response 400:
 *   { success: false, message, errors }
 */
const submitScore = async (req, res) => {
  try {
    const result = await scoringService.submitAndScore(req.body);
    return res.status(200).json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      success: false,
      message: err.message,
      errors: err.message.includes("Validation failed")
        ? err.message.replace("Validation failed: ", "").split("; ")
        : undefined,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/scoring/leaderboard
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Retrieve the ranked leaderboard.
 *
 * Query params:
 *   ?eventId=global      (default)
 *   ?eventId=blind-coding
 *
 * Response 200:
 *   { success, eventId, leaderboard: [...], updatedAt }
 */
const getLeaderboard = async (req, res) => {
  try {
    const eventId = req.query.eventId || "global";
    const leaderboard = await scoringService.getLeaderboard(eventId);

    return res.status(200).json({
      success: true,
      eventId,
      totalParticipants: leaderboard.length,
      leaderboard,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[ScoringController] getLeaderboard error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error fetching scoring leaderboard",
    });
  }
};

module.exports = {
  submitScore,
  getLeaderboard,
};
