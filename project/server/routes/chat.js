import express from 'express';
import { Server } from 'socket.io';
import Message from '../models/Message.js';
import { verifyToken } from '../middleware/auth.js';
import cors from 'cors';
import mongoose from 'mongoose';

const router = express.Router();

// Initialize Socket.IO
export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com' 
        : 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (jobId) => {
      socket.join(jobId);
      console.log(`User ${socket.id} joined room ${jobId}`);
    });

    socket.on('send_message', (data) => {
      socket.to(data.jobId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

// Handle CORS preflight requests
router.options('/:jobId/messages', cors());

// Get messages for a specific job and user pair
router.get('/:jobId/messages/:userId', verifyToken, async (req, res) => {
  try {
    console.log('Fetching messages for job:', req.params.jobId, 'with user:', req.params.userId);
    
    const messages = await Message.find({
      jobId: req.params.jobId,
      $or: [
        { senderId: req.user.id, recipientId: req.params.userId },
        { senderId: req.params.userId, recipientId: req.user.id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name')
    .populate('recipientId', 'name');
    
    console.log(`Found ${messages.length} messages`);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Send a message to a specific user
router.post('/:jobId/messages/:userId', verifyToken, async (req, res) => {
  try {
    console.log('New message:', {
      jobId: req.params.jobId,
      senderId: req.user.id,
      recipientId: req.params.userId,
      content: req.body.content
    });

    const message = new Message({
      jobId: req.params.jobId,
      senderId: req.user.id,
      recipientId: req.params.userId,
      content: req.body.content
    });

    await message.save();
    await message.populate('senderId', 'name');
    await message.populate('recipientId', 'name');
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Get all chat conversations for a user
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    // Find all unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: mongoose.Types.ObjectId(req.user.id) },
            { recipientId: mongoose.Types.ObjectId(req.user.id) }
          ]
        }
      },
      {
        $group: {
          _id: {
            jobId: '$jobId',
            otherUser: {
              $cond: [
                { $eq: ['$senderId', mongoose.Types.ObjectId(req.user.id)] },
                '$recipientId',
                '$senderId'
              ]
            }
          },
          lastMessage: { $last: '$content' },
          updatedAt: { $max: '$createdAt' }
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
        $unwind: '$job'
      },
      {
        $unwind: '$otherUser'
      },
      {
        $project: {
          jobId: '$_id.jobId',
          jobTitle: '$job.title',
          otherUser: {
            _id: '$otherUser._id',
            name: '$otherUser.name',
            email: '$otherUser.email'
          },
          lastMessage: 1,
          updatedAt: 1
        }
      },
      {
        $sort: { updatedAt: -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
});

export default router;