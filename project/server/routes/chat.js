import express from 'express';
import { Server } from 'socket.io';
import Message from '../models/Message.js';

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

    // Join a chat room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    // Handle new messages
    socket.on('send_message', (data) => {
      socket.to(data.roomId).emit('receive_message', data);
    });

    // Handle typing status
    socket.on('typing', (data) => {
      socket.to(data.roomId).emit('user_typing', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

// Get chat history
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const messages = await Message.find({ jobId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name avatar');
    
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

// Save message
router.post('/:jobId/messages', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { content } = req.body;
    
    const message = new Message({
      jobId,
      senderId: req.user.id,
      content
    });
    
    await message.save();
    
    // Populate sender info before sending response
    await message.populate('senderId', 'name avatar');
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save message' });
  }
});

export default router;