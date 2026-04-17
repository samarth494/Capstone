const Message = require('../models/Message');

// @desc    Get messages between two users
// @route   GET /api/chat/:userId
// @access  Private
const getMessages = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const myUserId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: myUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: myUserId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error while fetching messages' });
    }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/read/:senderId
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const senderId = req.params.senderId;
        const myUserId = req.user.id;

        await Message.updateMany(
            { sender: senderId, receiver: myUserId, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete (clear) messages between two users
const deleteMessages = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const myUserId = req.user.id;

        await Message.deleteMany({
            $or: [
                { sender: myUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: myUserId }
            ]
        });

        res.json({ success: true, message: 'Messages cleared' });
    } catch (error) {
        console.error('Error deleting messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMessages,
    markAsRead,
    deleteMessages
};
