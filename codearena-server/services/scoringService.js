const ScoringSubmission = require("../models/ScoringSubmission");
const { computeScores } = require("../utils/scoringEngine");
const { getIo } = require("../sockets/socketManager");

/**
 * ScoringService
 *
 * Orchestrates:
 *   1. Input validation
 *   2. Score computation (via scoringEngine)
 *   3. Upsert into MongoDB (one entry per user + event)
 *   4. Ranked leaderboard retrieval with tie-breakers
 *   5. Real-time Socket.io broadcast
 *
 * Tie-Breaker Rules (applied via MongoDB sort):
 *   1. totalScore       DESC  — higher is better
 *   2. syntaxErrors     ASC   — fewer is better
 *   3. executionTimeMs  ASC   — faster is better
 *   4. submittedAt      ASC   — earlier is better
 */
class ScoringService {
  // ──────────────────────────────────────────────────────────────────────────
  // SUBMIT + SCORE
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Validate raw input, compute scores, upsert into DB, broadcast update.
   *
   * @param {object} payload – raw submission data
   * @returns {{ success: boolean, submission: object, scores: object }}
   * @throws {Error} with descriptive message for validation failures
   */
  async submitAndScore(payload) {
    // ── 1. Validate ──────────────────────────────────────────────────────
    const errors = this._validate(payload);
    if (errors.length > 0) {
      const err = new Error(`Validation failed: ${errors.join("; ")}`);
      err.status = 400;
      throw err;
    }

    // ── 2. Compute scores ────────────────────────────────────────────────
    const scores = computeScores({
      passedTestCases: payload.passedTestCases,
      totalTestCases: payload.totalTestCases,
      executionTimeMs: payload.executionTimeMs,
      maxTimeAllowed: payload.maxTimeAllowed,
      syntaxErrors: payload.syntaxErrors,
      maxSyntaxErrorsAllowed: payload.maxSyntaxErrorsAllowed,
      understandingScore: payload.understandingScore,
      readabilityScore: payload.readabilityScore,
    });

    // ── 3. Upsert (one entry per user × event) ──────────────────────────
    const filter = {
      userId: payload.userId,
      eventId: payload.eventId || "global",
    };

    const update = {
      $set: {
        username: payload.username,
        problemId: payload.problemId || null,
        // Raw inputs (stored for audit / re-calculation)
        passedTestCases: payload.passedTestCases,
        totalTestCases: payload.totalTestCases,
        executionTimeMs: payload.executionTimeMs,
        maxTimeAllowed: payload.maxTimeAllowed,
        syntaxErrors: payload.syntaxErrors,
        maxSyntaxErrorsAllowed: payload.maxSyntaxErrorsAllowed,
        understandingScore: scores.understandingScore,
        readabilityScore: scores.readabilityScore,
        // Computed
        correctnessScore: scores.correctnessScore,
        efficiencyScore: scores.efficiencyScore,
        syntaxScore: scores.syntaxScore,
        totalScore: scores.totalScore,
        submittedAt: payload.submittedAt || new Date(),
      },
    };

    const options = { upsert: true, new: true, runValidators: true };
    const submission = await ScoringSubmission.findOneAndUpdate(
      filter,
      update,
      options,
    );

    console.log(
      `[ScoringService] Scored: ${payload.username} | ` +
        `C=${scores.correctnessScore} E=${scores.efficiencyScore} ` +
        `S=${scores.syntaxScore} U=${scores.understandingScore} ` +
        `R=${scores.readabilityScore} | TOTAL=${scores.totalScore} | ` +
        `Event=${filter.eventId}`,
    );

    // ── 4. Broadcast updated leaderboard ─────────────────────────────────
    const rankings = await this.getLeaderboard(filter.eventId);
    this._emit("scoring:leaderboard-update", {
      eventId: filter.eventId,
      rankings,
    });

    return {
      success: true,
      submission: {
        id: submission._id,
        userId: submission.userId,
        username: submission.username,
        eventId: submission.eventId,
        problemId: submission.problemId,
        submittedAt: submission.submittedAt,
      },
      scores,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // LEADERBOARD
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Returns a ranked leaderboard for a given event.
   *
   * Sorted by the 4-tier tie-breaker chain (see class docs).
   *
   * @param {string} eventId – defaults to 'global'
   * @returns {Array<object>} ranked participants
   */
  async getLeaderboard(eventId = "global") {
    const entries = await ScoringSubmission.find({ eventId })
      .sort({
        totalScore: -1, // 1. higher total is better
        syntaxErrors: 1, // 2. fewer errors is better
        executionTimeMs: 1, // 3. faster is better
        submittedAt: 1, // 4. earlier is better
      })
      .select(
        "userId username totalScore correctnessScore efficiencyScore " +
          "syntaxScore understandingScore readabilityScore " +
          "passedTestCases totalTestCases executionTimeMs syntaxErrors submittedAt",
      )
      .lean();

    return entries.map((entry, idx) => ({
      rank: idx + 1,
      userId: entry.userId,
      username: entry.username,
      totalScore: entry.totalScore,
      breakdown: {
        correctness: entry.correctnessScore,
        efficiency: entry.efficiencyScore,
        syntax: entry.syntaxScore,
        understanding: entry.understandingScore,
        readability: entry.readabilityScore,
      },
      stats: {
        passedTestCases: entry.passedTestCases,
        totalTestCases: entry.totalTestCases,
        executionTimeMs: entry.executionTimeMs,
        syntaxErrors: entry.syntaxErrors,
      },
      submittedAt: entry.submittedAt,
    }));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Returns an array of human-readable error strings. Empty = valid.
   * @private
   */
  _validate(p) {
    const errs = [];

    // Required identity
    if (!p.userId) errs.push("userId is required");
    if (!p.username || typeof p.username !== "string" || !p.username.trim()) {
      errs.push("username is required (non-empty string)");
    }

    // Numeric fields — present + finite + sane range
    const numChecks = [
      ["passedTestCases", 0, Infinity, true],
      ["totalTestCases", 1, Infinity, true],
      ["executionTimeMs", 0, Infinity, true],
      ["maxTimeAllowed", 1, Infinity, true],
      ["syntaxErrors", 0, Infinity, true],
      ["maxSyntaxErrorsAllowed", 1, Infinity, true],
      ["understandingScore", 0, 750, true],
      ["readabilityScore", 0, 500, true],
    ];

    for (const [field, min, max, required] of numChecks) {
      const val = p[field];
      if (val === undefined || val === null) {
        if (required) errs.push(`${field} is required`);
        continue;
      }
      if (typeof val !== "number" || !Number.isFinite(val)) {
        errs.push(`${field} must be a finite number`);
        continue;
      }
      if (val < min) errs.push(`${field} must be >= ${min}`);
      if (val > max) errs.push(`${field} must be <= ${max}`);
    }

    // Cross-field checks
    if (
      Number.isFinite(p.passedTestCases) &&
      Number.isFinite(p.totalTestCases) &&
      p.passedTestCases > p.totalTestCases
    ) {
      errs.push("passedTestCases cannot exceed totalTestCases");
    }

    return errs;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SOCKET BROADCAST
  // ──────────────────────────────────────────────────────────────────────────

  /** @private */
  _emit(event, data) {
    try {
      const io = getIo();
      if (io) io.emit(event, data);
    } catch {
      // Socket not ready — safe to ignore (unit tests, startup, etc.)
    }
  }
}

module.exports = new ScoringService();
