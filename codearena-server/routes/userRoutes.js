const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Battle = require('../models/Battle');

// @desc    Get user profile and recent battles
// @route   GET /api/users/profile/:userId
// @access  Public (or Private if we add auth)
router.get('/profile/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch recent battles (limit to 10)
        const battles = await Battle.find({ players: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('players', 'username')
            .populate('winnerId', 'username');

        const winRate = user.battlesPlayed > 0
            ? ((user.wins / user.battlesPlayed) * 100).toFixed(1)
            : 0;

        res.json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                battlesPlayed: user.battlesPlayed,
                wins: user.wins,
                losses: user.losses,
                winRate: `${winRate}%`,
                rank: user.rank || 'Bronze',
                joinedAt: user.createdAt
            },
            recentBattles: battles.map(battle => {
                const opponent = battle.players.find(p => p._id.toString() !== req.params.userId);
                const isWinner = battle.winnerId && battle.winnerId._id.toString() === req.params.userId;
                const isDraw = !battle.winnerId;

                return {
                    id: battle._id,
                    battleId: battle.battleId,
                    opponent: opponent ? opponent.username : 'Unknown',
                    winner: battle.winnerId ? battle.winnerId.username : 'Draw/Timeout',
                    result: isWinner ? 'VICTORY' : (isDraw ? 'DRAW' : 'DEFEAT'),
                    date: battle.createdAt,
                    problemId: battle.problemId
                };
            })
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
