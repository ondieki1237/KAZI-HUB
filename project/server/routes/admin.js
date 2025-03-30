import express from 'express';
import { verifyAdmin } from '../middleware/adminAuth.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Skill from '../models/Skill.js';
import Activity from '../models/Activity.js';
import mongoose from 'mongoose';

const router = express.Router();

// Test route to check if admin API is accessible
router.get('/test', (req, res) => {
  res.json({ message: 'Admin API is working' });
});

// Get dashboard stats with better error handling
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    console.log('Admin dashboard request received');
    console.log('Request headers:', req.headers);

    // Verify database connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection is not ready');
    }

    const [
      totalUsers,
      totalJobs,
      totalSkills,
      recentActivities,
      jobs,
      users
    ] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Skill.countDocuments(),
      Activity.find().sort({ timestamp: -1 }).limit(10),
      Job.find().select('category'),
      User.find().select('role')
    ]);

    const activeUsers = await User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 24*60*60*1000) }
    });

    // Transform data for charts
    const jobsByCategory = Object.entries(jobs.reduce((acc, job) => {
      acc[job.category || 'Uncategorized'] = (acc[job.category || 'Uncategorized'] || 0) + 1;
      return acc;
    }, {})).map(([name, value]) => ({ name, value }));

    const usersByRole = Object.entries(users.reduce((acc, user) => {
      acc[user.role || 'Unknown'] = (acc[user.role || 'Unknown'] || 0) + 1;
      return acc;
    }, {})).map(([name, value]) => ({ name, value }));

    const responseData = {
      totalUsers,
      totalJobs,
      totalSkills,
      activeUsers,
      jobsByCategory,
      usersByRole,
      recentActivities: recentActivities.map(activity => ({
        _id: activity._id,
        user: activity.user,
        action: activity.action,
        timestamp: activity.timestamp
      }))
    };

    console.log('Sending dashboard data:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Error in admin dashboard:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard data',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete job
router.delete('/jobs/:id', verifyAdmin, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job' });
  }
});

// Delete skill
router.delete('/skills/:id', verifyAdmin, async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting skill' });
  }
});

// Get all jobs
router.get('/jobs', verifyAdmin, async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get all skills
router.get('/skills', verifyAdmin, async (req, res) => {
  try {
    const skills = await Skill.find().sort({ createdAt: -1 });
    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ message: 'Error fetching skills' });
  }
});

// Get all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

export default router; 