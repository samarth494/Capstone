const mongoose = require("mongoose");

/**
 * ScoringSubmission Schema
 *
 * Stores a fully-scored submission for the 5-dimension scoring system.
 * Total Score = Correctness + Efficiency + Syntax + Understanding + Readability
 * Max = 2000 + 1000 + 750 + 750 + 500 = 5000
 *
 * Tie-breaker order (enforced on read):
 *   1. totalScore        DESC
 *   2. syntaxErrors      ASC   (fewer = better)
 *   3. executionTimeMs   ASC   (faster = better)
 *   4. submittedAt       ASC   (earlier = better)
 */
const scoringSubmissionSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    eventId: {
      type: String,
      default: "global",
      trim: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      default: null,
    },

    // ── Raw Inputs ────────────────────────────────────────────────────────
    passedTestCases: {
      type: Number,
      required: true,
      min: [0, "passedTestCases cannot be negative"],
    },
    totalTestCases: {
      type: Number,
      required: true,
      min: [1, "totalTestCases must be at least 1"],
    },
    executionTimeMs: {
      type: Number,
      required: true,
      min: [0, "executionTimeMs cannot be negative"],
    },
    maxTimeAllowed: {
      type: Number,
      required: true,
      min: [1, "maxTimeAllowed must be at least 1"],
    },
    syntaxErrors: {
      type: Number,
      required: true,
      min: [0, "syntaxErrors cannot be negative"],
    },
    maxSyntaxErrorsAllowed: {
      type: Number,
      required: true,
      min: [1, "maxSyntaxErrorsAllowed must be at least 1"],
    },
    understandingScore: {
      type: Number,
      required: true,
      min: [0, "understandingScore cannot be negative"],
      max: [750, "understandingScore cannot exceed 750"],
    },
    readabilityScore: {
      type: Number,
      required: true,
      min: [0, "readabilityScore cannot be negative"],
      max: [500, "readabilityScore cannot exceed 500"],
    },

    // ── Computed Scores ───────────────────────────────────────────────────
    correctnessScore: {
      type: Number,
      default: 0,
    },
    efficiencyScore: {
      type: Number,
      default: 0,
    },
    syntaxScore: {
      type: Number,
      default: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
    },

    // ── Metadata ──────────────────────────────────────────────────────────
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// ── Indexes ──────────────────────────────────────────────────────────────────

// Compound unique: one scored submission per user+event (latest replaces old)
scoringSubmissionSchema.index({ userId: 1, eventId: 1 }, { unique: true });

// Leaderboard query performance (matches tie-breaker sort)
scoringSubmissionSchema.index({
  eventId: 1,
  totalScore: -1,
  syntaxErrors: 1,
  executionTimeMs: 1,
  submittedAt: 1,
});

module.exports = mongoose.model("ScoringSubmission", scoringSubmissionSchema);
