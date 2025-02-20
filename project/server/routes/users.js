import express from 'express';
import User from '../models/User.js';

const router = express.Router();

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

// Update user profile
router.patch('/:id', async (req, res) => {
  try {
    // Only allow users to update their own profile
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = { ...req.body };
    delete updates.password; // Prevent password update through this route

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Upload document
router.post('/:id/documents', async (req, res) => {
  try {
    // Only allow users to upload to their own profile
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // In a real app, you would upload the file to a storage service
    // and get back a URL. For now, we'll just store the document metadata
    user.documents.push({
      type: req.body.type,
      url: 'placeholder-url', // Replace with actual upload URL
      status: 'pending'
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
});

export default router;