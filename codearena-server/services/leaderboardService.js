const LeaderboardEntry = require('../models/LeaderboardEntry');
const { getIo } = require('../sockets/socketManager');

/**
 * LeaderboardService
 *
 * Architecture Flow:
 *   Submission Controller
 *     → ExecutionService  (runs code)
 *     → LeaderboardService.updateLeaderboard(submission)
 *         → MongoDB upsert
 *         → LeaderboardService.calculateRankings()
 *         → Socket.io emit("leaderboard:update")
 *
 * Design: Each user has ONE document per eventId (upserted, never re-inserted).
 * Only Accepted submissions trigger an update.
 * Rankings are calculated via a simple .find().sort() — no full re-scan.
 */
class LeaderboardService {
    /**
     * Called after every Accepted submission.
     * Safely skips if submission status is not 'Accepted'.
     *
     * @param {object} submission
     * @param {string} submission.userId
     * @param {string} submission.username
     * @param {ObjectId} submission.problemId
     * @param {string} submission.status       - 'Accepted' | 'Wrong Answer' | etc.
     * @param {number} submission.executionTime - ms
     * @param {Date}   submission.submittedAt
     * @param {string} [submission.eventId]     - defaults to 'global'
     */
    async updateLeaderboard({ userId, username, problemId, status, executionTime, submittedAt, eventId = 'global' }) {
        if (status !== 'Accepted') return; // Only Accepted runs count

        try {
            // ── Fetch existing entry (or prepare a blank one) ─────────────────
            let entry = await LeaderboardEntry.findOne({ userId, eventId });

            if (!entry) {
                // First-time entry for this user × event
                entry = new LeaderboardEntry({ userId, username, eventId });
            }

            // ── Skip duplicate solves for the same problem ────────────────────
            const alreadySolved = entry.solvedProblems.some(pid => pid.toString() === problemId.toString());
            if (alreadySolved) {
                console.log(`[Leaderboard] User ${username} already solved problem ${problemId} — skipping update.`);
                return;
            }

            // ── Apply the new solve ───────────────────────────────────────────
            entry.username = username;              // Keep username fresh
            entry.solvedCount += 1;
            entry.totalRuntime += (executionTime || 0);
            entry.lastSolvedAt = submittedAt || new Date();
            entry.solvedProblems.push(problemId);

            await entry.save();

            console.log(`[Leaderboard] Updated: ${username} | Solved: ${entry.solvedCount} | Runtime: ${entry.totalRuntime}ms | Event: ${eventId}`);

            // ── Broadcast updated rankings ────────────────────────────────────
            const rankings = await this.calculateRankings(eventId);
            this._emit('leaderboard:update', { eventId, rankings });

        } catch (error) {
            // Non-critical — never crash the submission flow
            console.error('[LeaderboardService] updateLeaderboard error:', error.message);
        }
    }

    /**
     * Returns sorted rankings for a given event.
     * Sort order:
     *   1. solvedCount   DESC
     *   2. totalRuntime  ASC
     *   3. lastSolvedAt  ASC
     *
     * MongoDB index on { eventId, solvedCount, totalRuntime, lastSolvedAt }
     * makes this O(log n) — no full scan.
     *
     * @param {string} eventId
     * @returns {Array} Ranked list of players
     */
    async calculateRankings(eventId = 'global') {
        const entries = await LeaderboardEntry.find({ eventId })
            .sort({ solvedCount: -1, totalRuntime: 1, lastSolvedAt: 1 })
            .select('userId username solvedCount totalRuntime lastSolvedAt')
            .lean();

        return entries.map((entry, index) => ({
            rank: index + 1,
            userId: entry.userId,
            username: entry.username,
            solvedCount: entry.solvedCount,
            totalRuntime: entry.totalRuntime,
            lastSolvedAt: entry.lastSolvedAt,
        }));
    }

    /**
     * Emit via Socket.io.
     * Fails silently if socket not initialized (e.g. during unit tests).
     */
    _emit(event, data) {
        try {
            const io = getIo();
            if (io) io.emit(event, data);
        } catch {
            // Socket not ready — safe to ignore
        }
    }
}

module.exports = new LeaderboardService();
