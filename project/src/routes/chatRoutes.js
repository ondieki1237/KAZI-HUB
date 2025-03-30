const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// Send a message
router.post('/messages', auth, chatController.sendMessage);

// Get conversation history for a user
router.get('/conversations/:userId', auth, chatController.getConversations);

// Mark messages as read
router.put('/messages/read/:jobId/:userId', auth, chatController.markMessagesAsRead);

module.exports = router; 