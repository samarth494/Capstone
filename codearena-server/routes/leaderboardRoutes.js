const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Get top users by wins
// @route   GET /api/leaderboard
// @access  Public
router.get('/', async (req, res) => {
    try {
        const topUsers = await User.find({})
            .sort({ wins: -1, battlesPlayed: -1 })
            .limit(20)
            .select('username wins losses battlesPlayed rank');

        const leaderboard = topUsers.map(user => {
            const winRate = user.battlesPlayed > 0
                ? ((user.wins / user.battlesPlayed) * 100).toFixed(1)
                : 0;

            return {
                username: user.username,
                wins: user.wins,
                losses: user.losses,
                battlesPlayed: user.battlesPlayed,
                winRate: `${winRate}%`,
                rank: user.rank || 'Bronze'
            };
        });

        res.json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: 'Server error fetching leaderboard' });
    }
});

module.exports = router;
