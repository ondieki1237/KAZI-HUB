const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  try {
    return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
  } catch (e) {
    return false;
  }
};

router.get('/api/conversations', authMiddleware, async (req, res) => {
  try {
    // Get user ID from auth token
    const userId = req.user.userId;
    console.log('Fetching conversations for user:', userId);

    if (!isValidObjectId(userId)) {
      console.error('Invalid user ID format:', userId);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conversations = await Conversation.find({
      $or: [
        { senderId: userObjectId },
        { recipientId: userObjectId }
      ]
    })
    .populate('jobId', '_id title')
    .populate('senderId', '_id name email avatar')
    .populate('recipientId', '_id name email avatar')
    .populate({
      path: 'lastMessage',
      select: '_id content createdAt senderId read'
    })
    .sort('-updatedAt');

    console.log('Found conversations:', conversations.length);

    // Transform conversations to plain objects with string IDs
    const transformedConversations = conversations.map(conv => {
      const plainConv = conv.toObject();
      return {
        _id: String(plainConv._id),
        jobId: {
          _id: String(plainConv.jobId._id),
          title: plainConv.jobId.title
        },
        senderId: {
          _id: String(plainConv.senderId._id),
          name: plainConv.senderId.name,
          email: plainConv.senderId.email,
          avatar: plainConv.senderId.avatar
        },
        recipientId: {
          _id: String(plainConv.recipientId._id),
          name: plainConv.recipientId.name,
          email: plainConv.recipientId.email,
          avatar: plainConv.recipientId.avatar
        },
        lastMessage: plainConv.lastMessage ? {
          _id: String(plainConv.lastMessage._id),
          content: plainConv.lastMessage.content,
          createdAt: plainConv.lastMessage.createdAt,
          senderId: String(plainConv.lastMessage.senderId),
          read: Boolean(plainConv.lastMessage.read)
        } : null,
        unreadCount: await Message.countDocuments({
          conversationId: plainConv._id,
          recipientId: userObjectId,
          read: false
        })
      };
    });

    res.json(transformedConversations);
  } catch (error) {
    console.error('Error in /api/conversations:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}); 