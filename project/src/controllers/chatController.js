const Message = require('../models/Message');
const Notification = require('../models/Notification');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { jobId, senderId, recipientId, content } = req.body;
    
    const message = new Message({
      jobId,
      senderId,
      recipientId,
      content,
      read: false
    });
    
    await message.save();

    // Create notification for recipient
    await Notification.create({
      userId: recipientId,
      type: 'message',
      jobId,
      jobTitle: req.body.jobTitle || 'Unknown Job',
      senderId,
      senderName: req.body.senderName || 'Unknown User',
      content,
      read: false,
      visible: true,
      sendAlerts: true
    });

    // Emit socket event for real-time updates
    req.app.get('io').to(recipientId).emit('new_message', {
      _id: message._id,
      jobId,
      jobTitle: req.body.jobTitle || 'Unknown Job',
      senderId: {
        _id: senderId,
        name: req.body.senderName || 'Unknown User'
      },
      recipientId: {
        _id: recipientId
      },
      content,
      createdAt: message.createdAt
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

// Get conversation history
exports.getConversations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { recipientId: userId }]
        }
      },
      {
        $group: {
          _id: {
            jobId: '$jobId',
            otherUser: {
              $cond: [
                { $eq: ['$senderId', userId] },
                '$recipientId',
                '$senderId'
              ]
            }
          },
          lastMessage: { $last: '$content' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$recipientId', userId] },
                  { $eq: ['$read', false] }
                ]},
                1,
                0
              ]
            }
          },
          updatedAt: { $last: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id.jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.otherUser',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $project: {
          _id: 1,
          jobId: '$_id.jobId',
          jobTitle: { $arrayElemAt: ['$job.title', 0] },
          otherUser: { $arrayElemAt: ['$otherUser', 0] },
          lastMessage: 1,
          unreadCount: 1,
          updatedAt: 1
        }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { jobId, userId } = req.params;
    
    await Message.updateMany(
      {
        jobId,
        recipientId: userId,
        read: false
      },
      { read: true }
    );

    // Update notification read status
    await Notification.updateMany(
      {
        jobId,
        userId,
        type: 'message',
        read: false
      },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
}; 