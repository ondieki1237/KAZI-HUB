import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/avatars/',
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Get current user's profile
router.get('/my-profile', verifyToken, async (req, res) => {
  try {
    console.log('Fetching profile with user ID:', req.user.id);
    
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean();

    if (!user) {
      console.log('No user found for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the found user (without sensitive data)
    const userToLog = { ...user };
    delete userToLog.password;
    console.log('Found user:', userToLog);

    res.json(user);
  } catch (error) {
    console.error('Error in /my-profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, location, bio, skills } = req.body;
    
    // Find user and update
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (skills) user.skills = skills;

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(req.user.id)
      .select('-password')
      .lean();

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Upload avatar
router.post('/profile/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update avatar URL
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({ avatar: user.avatar });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

// Get user documents
router.get('/:userId/documents', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents' });
  }
});

// Upload document
router.post('/:userId/documents', verifyToken, upload.single('document'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // In a real app, you would upload the file to a storage service
    // and get back a URL. For now, we'll just store the document metadata
    user.documents.push({
      type: req.body.type,
      url: 'placeholder-url', // Replace with actual upload URL
      name: req.file.originalname,
      uploadedAt: new Date()
    });

    await user.save();
    res.status(201).json(user.documents[user.documents.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document' });
  }
});

export default router;