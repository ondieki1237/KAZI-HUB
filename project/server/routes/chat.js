
// ------------------- IMPORTS -------------------
import express from 'express';
import { Server } from 'socket.io';
import Message from '../models/Message.js';
import { verifyToken } from '../middleware/auth.js';
import cors from 'cors';
import mongoose from 'mongoose';
import Job from '../models/Job.js';
import User from '../models/User.js';
const { ObjectId } = mongoose.Types;

// ------------------- ROUTER INIT -------------------
const router = express.Router();
let io; // Declare io variable at the top level

// ------------------- SOCKET.IO INIT -------------------
export const initializeSocket = (server) => {
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] // <-- Replace with your actual frontend domain
    : ['http://localhost:5173', 'http://192.168.1.246:5173'];

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS not allowed for this origin'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io'
  });

  io.on('connection', (socket) => {
    console.log('🔗 User connected:', socket.id);

    socket.on('join_room', (jobId) => {
      socket.join(jobId);
      console.log(`👥 User ${socket.id} joined room ${jobId}`);
    });

    socket.on('send_message', async (data) => {
      // Emit to all users in the job room
      socket.to(data.jobId).emit('new_message', data);
      // Also emit to the specific recipient
      socket.to(data.recipientId).emit('new_message', data);
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });

  return io;
};

// ------------------- ROUTES -------------------

// Handle CORS preflight requests
router.options('/:jobId/messages', cors());

// Get all conversations for a specific user by userId (admin or system use)
router.get('/conversations/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new ObjectId(userId) },
            { recipientId: new ObjectId(userId) }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$jobId',
          lastMessage: { $first: '$content' },
          updatedAt: { $first: '$createdAt' },
          jobId: { $first: '$jobId' },
          messageCount: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipientId', new ObjectId(userId)] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const conversations = await Promise.all(
      messages.map(async (msg) => {
        try {
          if (!mongoose.isValidObjectId(msg.jobId)) return null;
          const job = await Job.findById(msg.jobId).select('title employerId workerId').lean();
          if (!job) return null;
          const otherUserId = job.employerId.toString() === userId ? job.workerId : job.employerId;
          if (!mongoose.isValidObjectId(otherUserId)) return null;
          const otherUser = await User.findById(otherUserId).select('name email').lean();
          if (!otherUser) return null;
          return {
            jobId: msg.jobId.toString(),
            jobTitle: job.title,
            otherUser: { ...otherUser, _id: otherUser._id.toString() },
            lastMessage: msg.lastMessage,
            updatedAt: msg.updatedAt,
            messageCount: msg.messageCount,
            unreadCount: msg.unreadCount
          };
        } catch {
          return null;
        }
      })
    );
    res.json(conversations.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
});

// Get messages for a specific job
router.get('/:jobId', verifyToken, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const currentUserId = req.user.id;
    const otherUserId = req.query.userId;

    // Validate IDs
    if (!mongoose.isValidObjectId(jobId) || !mongoose.isValidObjectId(otherUserId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Find the job
    const job = await Job.findById(jobId).lean();
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the current user is either the employer or an applicant
    const isEmployer = job.employerId.toString() === currentUserId;
    const isApplicant = job.applications?.some(app => 
      app.workerId.toString() === currentUserId
    );

    if (!isEmployer && !isApplicant) {
      return res.status(403).json({ 
        message: 'You must be the employer or an applicant to access this conversation' 
      });
    }

    // Check if the other user is also related to this job
    const isOtherUserEmployer = job.employerId.toString() === otherUserId;
    const isOtherUserApplicant = job.applications?.some(app => 
      app.workerId.toString() === otherUserId
    );

    if (!isOtherUserEmployer && !isOtherUserApplicant) {
      return res.status(403).json({ 
        message: 'The recipient must be related to this job' 
      });
    }

    // Find messages between these two users for this job
    const messages = await Message.find({
      jobId: new ObjectId(jobId),
      $or: [
        { 
          senderId: new ObjectId(currentUserId),
          recipientId: new ObjectId(otherUserId)
        },
        {
          senderId: new ObjectId(otherUserId),
          recipientId: new ObjectId(currentUserId)
        }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name email')
    .populate('recipientId', 'name email')
    .lean();

    // Mark messages as read where current user is recipient
    if (messages.length > 0) {
      await Message.updateMany(
        {
          jobId: new ObjectId(jobId),
          recipientId: new ObjectId(currentUserId),
          read: false
        },
        { $set: { read: true } }
      );
    }

    res.json(messages);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching messages',
      error: error.message 
    });
  }
});

// Send a new message
router.post('/:jobId', verifyToken, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const senderId = req.user.id;
    const { content, recipientId } = req.body;

    // Validate request
    if (!mongoose.isValidObjectId(jobId) || !mongoose.isValidObjectId(recipientId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Find the job
    const job = await Job.findById(jobId).lean();
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Verify both users are related to the job
    const isSenderEmployer = job.employerId.toString() === senderId;
    const isSenderApplicant = job.applications?.some(app => 
      app.workerId.toString() === senderId
    );

    const isRecipientEmployer = job.employerId.toString() === recipientId;
    const isRecipientApplicant = job.applications?.some(app => 
      app.workerId.toString() === recipientId
    );

    if ((!isSenderEmployer && !isSenderApplicant) || 
        (!isRecipientEmployer && !isRecipientApplicant)) {
      return res.status(403).json({ 
        message: 'Both users must be related to this job' 
      });
    }

    // Create and save the message
    const message = new Message({
      jobId: new ObjectId(jobId),
      senderId: new ObjectId(senderId),
      recipientId: new ObjectId(recipientId),
      content: content.trim()
    });

    const savedMessage = await message.save();
    
    // Populate the message with user details
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('senderId', 'name email')
      .populate('recipientId', 'name email')
      .lean();

    // Emit socket event if available
    if (io) {
      io.to(jobId).emit('new_message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error sending message',
      error: error.message 
    });
  }
});

// Test route to check if chat routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Chat routes are working' });
});

// Get all conversations for the current user
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Validate user ID format
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Find all messages where user is either sender or recipient
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new ObjectId(userId) },
            { recipientId: new ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$jobId',
          lastMessage: { $first: '$content' },
          updatedAt: { $first: '$createdAt' },
          jobId: { $first: '$jobId' },
          messageCount: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$recipientId', new ObjectId(userId)] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // If no messages found, return empty array early
    if (!messages.length) {
      return res.json([]);
    }

    const conversations = await Promise.all(
      messages.map(async (msg) => {
        try {
          if (!mongoose.isValidObjectId(msg.jobId)) {
            return null;
          }

          const job = await Job.findById(msg.jobId)
            .select('title employerId workerId')
            .lean();

          if (!job) {
            return null;
          }

          const otherUserId = job.employerId.toString() === userId 
            ? job.workerId 
            : job.employerId;

          if (!mongoose.isValidObjectId(otherUserId)) {
            return null;
          }

          const otherUser = await User.findById(otherUserId)
            .select('name email')
            .lean();

          if (!otherUser) {
            return null;
          }

          return {
            jobId: msg.jobId.toString(),
            jobTitle: job.title,
            otherUser: {
              ...otherUser,
              _id: otherUser._id.toString()
            },
            lastMessage: msg.lastMessage,
            updatedAt: msg.updatedAt,
            messageCount: msg.messageCount,
            unreadCount: msg.unreadCount
          };
        } catch (error) {
          return null;
        }
      })
    );

    const validConversations = conversations.filter(Boolean);
    res.json(validConversations);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching conversations',
      error: error.message 
    });
  }
});

// Get user details
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details' });
  }
});

export default router;