/**
 * Updates the user's daily activity streak.
 *
 * Rules:
 *  - First activity ever          → streak = 1
 *  - Activity today (same day)    → streak unchanged (already counted)
 *  - Activity yesterday           → streak + 1
 *  - Gap of 2+ days               → streak resets to 1
 *
 * @param {import('../models/User')} user  - Mongoose User document (must be saved after)
 * @returns {boolean} true if the streak was incremented
 */
function updateStreak(user) {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (!user.lastActiveDate) {
        // First ever activity
        user.currentStreak = 1;
        user.lastActiveDate = todayUTC;
        return true;
    }

    const lastUTC = new Date(user.lastActiveDate);
    const lastDay = new Date(Date.UTC(lastUTC.getUTCFullYear(), lastUTC.getUTCMonth(), lastUTC.getUTCDate()));
    const diffMs = todayUTC - lastDay;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Already active today — no change
        return false;
    } else if (diffDays === 1) {
        // Consecutive day — increment streak
        user.currentStreak = (user.currentStreak || 0) + 1;
        user.lastActiveDate = todayUTC;
        return true;
    } else {
        // Missed at least one day — reset
        user.currentStreak = 1;
        user.lastActiveDate = todayUTC;
        return true;
    }
}

module.exports = { updateStreak };
