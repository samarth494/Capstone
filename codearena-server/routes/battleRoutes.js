const express = require('express');
const router = express.Router();
const Battle = require('../models/Battle');

// @desc    Get battle replay data
// @route   GET /api/battles/:battleId/replay
// @access  Public
router.get('/:battleId/replay', async (req, res) => {
    try {
        const battle = await Battle.findOne({ battleId: req.params.battleId })
            .populate('players', 'username')
            .populate('winnerId', 'username');

        if (!battle) {
            return res.status(404).json({ message: 'Battle not found' });
        }

        res.json(battle);
    } catch (error) {
        console.error("Error fetching replay:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
