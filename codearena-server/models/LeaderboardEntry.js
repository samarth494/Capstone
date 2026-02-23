const mongoose = require('mongoose');

/**
 * CompetitionLeaderboard Schema
 *
 * Stores one document per user in a given competition event (or 'global' for singleplayer).
 * Updated in-place on every Accepted submission — no full collection re-scan needed.
 *
 * Ranking Rules (enforced via sort on read):
 *   1. solvedCount   DESC  — More solved = higher rank
 *   2. totalRuntime  ASC   — Faster total runtime = higher rank
 *   3. lastSolvedAt  ASC   — Earlier finish = higher rank
 */
const leaderboardEntrySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        eventId: {
            type: String,
            default: 'global',  // 'global' = singleplayer leaderboard
        },
        solvedCount: {
            type: Number,
            default: 0,
        },
        totalRuntime: {
            type: Number,  // Sum of executionTime (ms) of all Accepted submissions
            default: 0,
        },
        lastSolvedAt: {
            type: Date,
            default: null,
        },
        solvedProblems: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Problem',
            }
        ],
    },
    { timestamps: true }
);

// Compound unique index — one entry per user per event
leaderboardEntrySchema.index({ userId: 1, eventId: 1 }, { unique: true });

// Index for efficient sorted reads
leaderboardEntrySchema.index(
    { eventId: 1, solvedCount: -1, totalRuntime: 1, lastSolvedAt: 1 }
);

module.exports = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);
