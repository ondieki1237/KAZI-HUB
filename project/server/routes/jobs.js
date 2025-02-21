import express from 'express';
import Job from '../models/Job.js';
import { verifyToken } from '../middleware/auth.js';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = express.Router();

// Get jobs posted by the authenticated user - Put this BEFORE the :id route
router.get('/my-posted', verifyToken, async (req, res) => {
  try {
    console.log('Fetching jobs for user:', req.user.id);
    
    const jobs = await Job.find({ employerId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('employerId', 'name location')
      .populate({
        path: 'applications',
        populate: {
          path: 'workerId',
          select: 'name email'
        }
      });

    console.log(`Found ${jobs.length} jobs`);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching my posted jobs:', error);
    res.status(500).json({ 
      message: 'Error fetching your posted jobs', 
      error: error.message 
    });
  }
});

// Search jobs - Put this BEFORE the :id route
router.get('/search', async (req, res) => {
  try {
    const { category, location, query } = req.query;
    const searchQuery = {};

    if (category) searchQuery.category = category;
    if (location) searchQuery.location = new RegExp(location, 'i');
    if (query) searchQuery.title = new RegExp(query, 'i');

    const jobs = await Job.find(searchQuery)
      .sort({ createdAt: -1 })
      .populate('employerId', 'name location');
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error searching jobs', error: error.message });
  }
});

// Featured jobs route
router.get('/featured', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employerId', 'name location')
      .exec();
    
    console.log('Fetched featured jobs:', jobs);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching featured jobs:', error);
    res.status(500).json({ 
      message: 'Error fetching jobs', 
      error: error.message 
    });
  }
});

// Get job by ID - Put this AFTER other GET routes
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching job with ID:', req.params.id);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid job ID format');
      return res.status(400).json({ message: 'Invalid job ID format' });
    }

    const job = await Job.findById(req.params.id)
      .populate('employerId', 'name email location')
      .lean()
      .exec();
    
    console.log('Found job:', job);
    
    if (!job) {
      console.log('Job not found');
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Format dates and ensure all required fields exist
    const formattedJob = {
      ...job,
      createdAt: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
      applications: job.applications || [],
      skillsRequired: job.skillsRequired || [],
      status: job.status || 'open',
      locationArea: job.locationArea || '',
      locationCity: job.locationCity || '',
      budget: job.budget || 0,
      duration: job.duration || ''
    };
    
    res.json(formattedJob);
  } catch (error) {
    console.error('Error in GET /jobs/:id:', error);
    res.status(500).json({ 
      message: 'Error fetching job details', 
      error: error.message 
    });
  }
});

// Protected routes
router.use(verifyToken); // Apply authentication middleware to all routes below this

// Create job
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Creating job with data:', {
      ...req.body,
      employerId: req.user.id // Log the data being used
    });
    
    // Create new job with employerId from authenticated user
    const job = new Job({
      ...req.body,
      employerId: req.user.id, // Use the ID from the authenticated user
      status: 'open'
    });

    const savedJob = await job.save();
    console.log('Job saved successfully:', savedJob);

    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ 
      message: 'Error creating job', 
      error: error.message 
    });
  }
});

// Apply for job
router.post('/:id/apply', verifyToken, async (req, res) => {
  try {
    console.log('Application request:', {
      jobId: req.params.id,
      userId: req.user.id,
      data: req.body
    });

    const job = await Job.findById(req.params.id).populate('employerId');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user has already applied
    const existingApplication = job.applications.find(
      app => app.workerId.toString() === req.user.id
    );
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Add application
    const application = {
      workerId: req.user.id,
      status: 'pending',
      message: req.body.message,
      coverLetter: req.body.coverLetter,
      appliedAt: new Date()
    };

    job.applications.push(application);
    await job.save();

    // Create notification for employer
    const notification = new Notification({
      recipient: job.employerId._id,
      type: 'job_application',
      jobId: job._id,
      senderId: req.user.id,
      message: `New application received for "${job.title}"`,
      read: false
    });

    await notification.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationCount: job.applications.length
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ 
      message: 'Error submitting application', 
      error: error.message 
    });
  }
});

// Update job status
router.patch('/:id/status', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only employer can update status
    if (job.employerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    job.status = req.body.status;
    await job.save();
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job status', error: error.message });
  }
});

export default router;