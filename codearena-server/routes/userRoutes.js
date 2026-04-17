const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Battle = require('../models/Battle');
const { protect } = require('../middleware/authMiddleware');
const { getOnlineUsers } = require('../sockets/battleSocket');

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
                xp: user.xp || 0,
                solvedProblems: user.solvedProblems || [],
                currentStreak: user.currentStreak || 0,
                lastActiveDate: user.lastActiveDate || null,
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

// @desc    Search users by username
// @route   GET /api/users/search
// @access  Private
router.get('/search', protect, async (req, res) => {
    try {
        const { username } = req.query;
        console.log(`[Search-Debug] Query: "${username}" | Exclusion ID: ${req.user._id}`);

        if (!username) return res.json([]);

        // Exclude current user and non-friends (optional, let's just exclude self for now)
        const query = {
            _id: { $ne: req.user._id },
            username: { $regex: username, $options: 'i' }
        };

        const users = await User.find(query)
            .select('username rank wins battlesPlayed')
            .limit(10);

        console.log(`[Search-Debug] Raw results count: ${users.length}`);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Search failed' });
    }
});

// @desc    Send friend request
// @route   POST /api/users/friend-request
// @access  Private
router.post('/friend-request', protect, async (req, res) => {
    try {
        const { targetUserId } = req.body;

        if (targetUserId === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot add yourself as a friend' });
        }

        const targetUser = await User.findById(targetUserId);

        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        // Check if already friends
        if (req.user.friends && req.user.friends.includes(targetUserId)) {
            return res.status(400).json({ message: 'Already friends' });
        }

        // Check if request already sent
        const existingRequest = (targetUser.friendRequests || []).find(
            r => r.from && r.from.toString() === req.user._id.toString() && r.status === 'pending'
        );
        if (existingRequest) {
            return res.status(400).json({ message: 'Request already pending' });
        }

        targetUser.friendRequests.push({ from: req.user._id });
        const newRequest = targetUser.friendRequests[targetUser.friendRequests.length - 1];
        await targetUser.save();

        // Real-time notification to target user
        try {
            const { getIo } = require('../sockets/socketManager');
            const io = getIo();
            const onlineUsers = getOnlineUsers();
            const targetSocketId = onlineUsers[targetUserId.toString()];
            if (io && targetSocketId) {
                io.to(targetSocketId).emit('notification', {
                    type: 'friend_request',
                    requestId: newRequest._id,
                    message: `${req.user.username} sent you a friend request!`,
                    from: { _id: req.user._id, username: req.user.username },
                    createdAt: new Date().toISOString()
                });
            }
        } catch (e) { /* socket optional */ }

        res.json({ success: true, message: 'Friend request sent' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send request' });
    }
});

// @desc    Get pending friend requests
// @route   GET /api/users/friend-requests
// @access  Private
router.get('/friend-requests', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('friendRequests.from', 'username rank');

        const pending = user.friendRequests.filter(r => r.status === 'pending');
        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch requests' });
    }
});

// @desc    Accept/Reject friend request
// @route   POST /api/users/respond-request
// @access  Private
router.post('/respond-request', protect, async (req, res) => {
    try {
        const { requestId, action } = req.body; // action: 'accept' or 'reject'
        const user = await User.findById(req.user._id);

        const requestIndex = user.friendRequests.findIndex(r => r._id.toString() === requestId);
        if (requestIndex === -1) return res.status(404).json({ message: 'Request not found' });

        const request = user.friendRequests[requestIndex];

        if (action === 'accept') {
            request.status = 'accepted';
            // Add to both friends lists
            user.friends.push(request.from);

            const sender = await User.findById(request.from);
            if (sender) {
                sender.friends.push(user._id);
                await sender.save();
            }
        } else {
            request.status = 'rejected';
        }

        await user.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Response failed' });
    }
});

// @desc    Get friends list
// @route   GET /api/users/friends
// @access  Private
router.get('/friends', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('friends', 'username rank wins battlesPlayed');
        res.json(user.friends);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch friends' });
    }
});

// @desc    Get online friends
// @route   GET /api/users/online-friends
// @access  Private
router.get('/online-friends', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('friends', 'username rank wins battlesPlayed');

        const onlineUsers = getOnlineUsers();
        const onlineFriends = (user.friends || [])
            .filter(f => f._id.toString() !== req.user._id.toString()) // Exclude self
            .filter(f => !!onlineUsers[f._id.toString()]);
        res.json(onlineFriends);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch online friends' });
    }
});

module.exports = router;
