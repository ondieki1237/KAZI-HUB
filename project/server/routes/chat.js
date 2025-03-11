import express from 'express';
import { Server } from 'socket.io';
import Message from '../models/Message.js';
import { verifyToken } from '../middleware/auth.js';
import cors from 'cors';
import mongoose from 'mongoose';
import Job from '../models/Job.js';
import User from '../models/User.js';
const { ObjectId } = mongoose.Types;

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

// Get messages for a specific job
router.get('/:jobId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      jobId: new ObjectId(req.params.jobId)
    })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name email');

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a new message
router.post('/:jobId', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const jobId = req.params.jobId;

    // Validate the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Create and save the message
    const message = new Message({
      jobId: new ObjectId(jobId),
      senderId: new ObjectId(req.user.id),
      content,
    });

    await message.save();

    // Populate sender details before sending response
    await message.populate('senderId', 'name email');

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Get all conversations for the current user
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    // Find all messages where the user is either sender or recipient
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new ObjectId(req.user.id) },
            { recipientId: new ObjectId(req.user.id) }
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
          jobId: { $first: '$jobId' }
        }
      }
    ]);

    // Get job details and other user details for each conversation
    const conversations = await Promise.all(
      messages.map(async (msg) => {
        const job = await Job.findById(msg.jobId);
        if (!job) return null;

        // Determine the other user (employer or worker)
        const otherUserId = job.employerId.toString() === req.user.id 
          ? job.workerId 
          : job.employerId;

        const otherUser = await User.findById(otherUserId)
          .select('name email');

        return {
          jobId: msg.jobId,
          jobTitle: job.title,
          otherUser,
          lastMessage: msg.lastMessage,
          updatedAt: msg.updatedAt
        };
      })
    );

    // Filter out null values and send response
    res.json(conversations.filter(Boolean));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
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
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
});

export default router;