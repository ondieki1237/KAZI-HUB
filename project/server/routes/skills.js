import express from 'express';
import Skill from '../models/Skill.js';
import { verifyToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory if it doesn't exist
    const dir = 'uploads/skills';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'skill-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create a new skill with file upload
router.post('/', verifyToken, upload.array('pastWorkFiles', 5), async (req, res) => {
  try {
    console.log('Creating new skill with data:', req.body);
    
    // Parse the contact JSON string back to an object
    const contact = JSON.parse(req.body.contact);
    
    // Update file paths to be relative to uploads directory
    const pastWorkFiles = req.files ? 
      req.files.map(file => file.path.replace('uploads/', '')) : 
      [];

    const skill = new Skill({
      userId: req.user.id,
      isGroup: req.body.isGroup === 'true',
      skillDescription: req.body.skillDescription,
      availability: req.body.availability,
      charges: req.body.charges,
      groupName: req.body.groupName,
      pastWorkFiles,
      contact,
      status: 'active'
    });

    await skill.save();
    console.log('Skill saved successfully:', skill);

    res.status(201).json({
      message: 'Skill posted successfully',
      skill
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ 
      message: 'Error creating skill', 
      error: error.message 
    });
  }
});

// Get all skills
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find({ status: 'active' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skills', error: error.message });
  }
});

// Get skills by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const skills = await Skill.find({ 
      userId: req.params.userId,
      status: 'active' 
    });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user skills', error: error.message });
  }
});

// Get skill by ID
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
      .populate('userId', 'name email phone rating completedJobs');
    
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    res.json(skill);
  } catch (error) {
    console.error('Error fetching skill:', error);
    res.status(500).json({ 
      message: 'Error fetching skill details',
      error: error.message 
    });
  }
});

export default router; 