const express = require('express');
const router = express.Router();
const { getMessages, markAsRead, deleteMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:userId', protect, getMessages);
router.put('/read/:senderId', protect, markAsRead);
router.delete('/:userId', protect, deleteMessages);

module.exports = router;
