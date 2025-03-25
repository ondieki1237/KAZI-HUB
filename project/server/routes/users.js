import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Create uploads directories if they don't exist
const uploadsDir = 'uploads';
const avatarsDir = path.join(uploadsDir, 'avatars');
const documentsDir = path.join(uploadsDir, 'documents');

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: avatarsDir,
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Configure multer for document uploads
const documentStorage = multer.diskStorage({
  destination: documentsDir,
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Define allowed file types
const allowedFileTypes = /jpeg|jpg|png|pdf|doc|docx/;

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for avatars
  fileFilter: (req, file, cb) => {
    const mimetype = allowedFileTypes.test(file.mimetype);
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg, .jpeg, .pdf, .doc, and .docx formats are allowed!'));
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for documents
  fileFilter: (req, file, cb) => {
    const mimetype = allowedFileTypes.test(file.mimetype);
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg, .jpeg, .pdf, .doc, and .docx formats are allowed!'));
  }
});

// Get current user's profile
router.get('/my-profile', verifyToken, async (req, res) => {
  try {
    console.log('Fetching profile for user ID:', req.user.id);

    const user = await User.findById(req.user.id)
      .select('-password')
      .lean();

    if (!user) {
      console.log('No user found for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile fetched successfully:', user);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) {
      console.log(`User not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(`User profile fetched for ID: ${req.params.id}`);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Update current user's profile
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, location, locationString, bio, skills, addressString } = req.body;

    console.log('Updating profile for user ID:', req.user.id, 'with data:', { 
      name, phone, location, locationString, bio, skills, addressString 
    });

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('No user found for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields only if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location && location.type === 'Point' && Array.isArray(location.coordinates)) {
      user.location = location;
      user.locationString = locationString;
    }
    if (bio !== undefined) user.bio = bio; // Allow empty string to clear bio
    if (Array.isArray(skills)) user.skills = skills; // Ensure skills is an array
    if (addressString) user.addressString = addressString;

    await user.save();

    // Fetch the updated user and structure the response
    const updatedUser = await User.findById(req.user.id)
      .select('-password')
      .lean();

    // Structure the response to match the frontend expectations
    const response = {
      ...updatedUser,
      profile: {
        location: updatedUser.locationString,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        skills: updatedUser.skills,
        rating: updatedUser.rating,
        completedJobs: updatedUser.completedJobs,
        yearsOfExperience: updatedUser.yearsOfExperience,
        addressString: updatedUser.addressString
      }
    };

    console.log('Profile updated successfully:', response);
    res.json(response);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Upload avatar for current user
router.post('/profile/avatar', verifyToken, avatarUpload.single('avatar'), async (req, res) => {
  try {
    console.log('Avatar upload request for user ID:', req.user.id);

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('No user found for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarPath;
    await user.save();

    console.log('Avatar uploaded successfully:', { avatar: avatarPath });
    res.json({ avatar: avatarPath });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Error uploading avatar', error: error.message });
  }
});

// Get user documents
router.get('/:userId/documents', verifyToken, async (req, res) => {
  try {
    console.log('Fetching documents for user ID:', req.params.userId);

    const user = await User.findById(req.params.userId).lean();
    if (!user) {
      console.log('No user found for ID:', req.params.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.documents || []);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

// Upload document for a user
router.post('/:userId/documents', verifyToken, documentUpload.single('document'), async (req, res) => {
  try {
    console.log('Upload document request received:', {
      userId: req.params.userId,
      file: req.file ? req.file.originalname : 'No file',
      type: req.body.type
    });

    const user = await User.findById(req.params.userId);
    if (!user) {
      console.log('No user found for ID:', req.params.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const documentUrl = `/uploads/documents/${req.file.filename}`;
    const document = {
      type: req.body.type || 'other',
      url: documentUrl,
      name: req.file.originalname,
      uploadedAt: new Date()
    };

    user.documents = user.documents || [];
    user.documents.push(document);
    await user.save();

    console.log('Document uploaded successfully:', document);
    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      message: 'Error uploading document',
      error: error.message
    });
  }
});

export default router;