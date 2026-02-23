const express = require('express');
const router = express.Router();
const User = require('../models/User');
const leaderboardService = require('../services/leaderboardService');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leaderboard
// Battle wins leaderboard (existing — unchanged)
// ─────────────────────────────────────────────────────────────────────────────
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
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Server error fetching leaderboard' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leaderboard/live
// Competition/singleplayer problem-solving leaderboard.
//
// Query params:
//   ?eventId=global       (default) — singleplayer
//   ?eventId=blind-coding — a specific competition event
//
// Ranking: solved DESC → totalRuntime ASC → lastSolvedAt ASC
// ─────────────────────────────────────────────────────────────────────────────
router.get('/live', async (req, res) => {
    try {
        const eventId = req.query.eventId || 'global';
        const rankings = await leaderboardService.calculateRankings(eventId);

        res.json({
            success: true,
            eventId,
            rankings,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching live leaderboard:', error);
        res.status(500).json({ message: 'Server error fetching live leaderboard' });
    }
});

module.exports = router;
