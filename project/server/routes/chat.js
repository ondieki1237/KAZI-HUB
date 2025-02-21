import express from 'express';
import { Server } from 'socket.io';
import Message from '../models/Message.js';
import { verifyToken } from '../middleware/auth.js';
import cors from 'cors';

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

// Get messages for a job
router.get('/:jobId/messages', verifyToken, async (req, res) => {
  try {
    console.log('Fetching messages for job:', req.params.jobId);
    const messages = await Message.find({ jobId: req.params.jobId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name');
    
    console.log(`Found ${messages.length} messages`);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Send a message
router.post('/:jobId/messages', verifyToken, async (req, res) => {
  try {
    console.log('New message:', {
      jobId: req.params.jobId,
      senderId: req.user.id,
      content: req.body.content
    });

    const message = new Message({
      jobId: req.params.jobId,
      senderId: req.user.id,
      content: req.body.content
    });

    await message.save();
    console.log('Message saved:', message);

    // Populate sender info
    await message.populate('senderId', 'name');
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

export default router;