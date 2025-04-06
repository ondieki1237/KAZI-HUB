import express from 'express';
import Job from '../models/Job.js';
import { verifyToken } from '../middleware/auth.js';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import JobApplication from '../models/JobApplication.js';

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

// Get featured jobs with category filter
router.get('/featured', async (req, res) => {
  try {
    const { category } = req.query;
    let query = { status: 'open' };

    // Define category keywords
    const jobCategories = {
      'Electrical': ['electric', 'wiring', 'circuit', 'lighting', 'power'],
      'Plumbing': ['plumb', 'pipe', 'water', 'drain', 'leak'],
      'Carpentry': ['carpenter', 'wood', 'furniture', 'cabinet', 'frame'],
      'Painting': ['paint', 'color', 'wall', 'finish', 'coat'],
      'Gardening': ['garden', 'landscape', 'plant', 'lawn', 'tree']
    };

    // If category is specified and not 'All', add category filter
    if (category && category !== 'All' && jobCategories[category]) {
      const keywords = jobCategories[category];
      query = {
        ...query,
        $or: [
          { title: { $regex: keywords.join('|'), $options: 'i' } },
          { description: { $regex: keywords.join('|'), $options: 'i' } }
        ]
      };
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employerId', 'name location');

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching featured jobs:', error);
    res.status(500).json({ message: 'Error fetching featured jobs' });
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
      expirationDate: job.expirationDate ? new Date(job.expirationDate).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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

// Get job applications
router.get('/:id/applications', verifyToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate({
        path: 'applications.workerId',
        select: 'name email phone'
      });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the employer
    if (job.employerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      _id: job._id,
      title: job.title,
      applications: job.applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// Get applications by user ID
router.get('/applications/user/:userId', verifyToken, async (req, res) => {
  try {
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Verify that the requesting user is accessing their own applications
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await JobApplication.find({ 
      workerId: req.params.userId 
    })
    .populate({
      path: 'jobId',
      select: 'title description locationArea locationCity budget status employerId',
      populate: {
        path: 'employerId',
        select: 'name email'
      }
    })
    .sort({ createdAt: -1 });

    // Transform the data to ensure proper ID formatting
    const formattedApplications = applications.map(app => ({
      ...app.toObject(),
      _id: app._id.toString(),
      jobId: {
        ...app.jobId.toObject(),
        _id: app.jobId._id.toString(),
        employerId: {
          ...app.jobId.employerId.toObject(),
          _id: app.jobId.employerId._id.toString()
        }
      }
    }));

    console.log(`Found ${applications.length} applications for user ${req.params.userId}`);
    res.json(formattedApplications);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ 
      message: 'Error fetching applications',
      error: error.message 
    });
  }
});

// Get job history by user ID
router.get('/history/user/:userId', verifyToken, async (req, res) => {
  try {
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Verify that the requesting user is accessing their own history
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized to view this history' });
    }

    // Get all applications for the user, including completed and rejected ones
    const applications = await JobApplication.find({ 
      workerId: req.params.userId,
      status: { $in: ['completed', 'rejected', 'accepted', 'pending'] }
    })
    .populate({
      path: 'jobId',
      select: 'title description locationArea locationCity budget status employerId',
      populate: {
        path: 'employerId',
        select: 'name email rating'
      }
    })
    .sort({ updatedAt: -1 });

    // Transform the data to ensure proper ID formatting
    const formattedApplications = applications.map(app => ({
      ...app.toObject(),
      _id: app._id.toString(),
      jobId: app.jobId ? {
        ...app.jobId.toObject(),
        _id: app.jobId._id.toString(),
        employerId: app.jobId.employerId ? {
          ...app.jobId.employerId.toObject(),
          _id: app.jobId.employerId._id.toString()
        } : null
      } : null
    }));

    console.log(`Found ${applications.length} applications in history for user ${req.params.userId}`);
    res.json(formattedApplications);
  } catch (error) {
    console.error('Error fetching user job history:', error);
    res.status(500).json({ 
      message: 'Error fetching job history',
      error: error.message 
    });
  }
});

// Get my applications
router.get('/applications/my', verifyToken, async (req, res) => {
  try {
    const applications = await Job.find({
      'applications.workerId': req.user.id
    })
    .select('title description locationArea locationCity budget status employerId applications')
    .populate('employerId', 'name email')
    .lean();

    // Filter and format applications for the current user
    const myApplications = applications.flatMap(job => {
      const userApplications = job.applications.filter(
        app => app.workerId.toString() === req.user.id
      );
      
      return userApplications.map(app => ({
        _id: app._id,
        jobId: {
          _id: job._id,
          title: job.title,
          description: job.description,
          locationArea: job.locationArea,
          locationCity: job.locationCity,
          budget: job.budget,
          status: job.status,
          employerId: job.employerId
        },
        status: app.status,
        appliedAt: app.appliedAt,
        message: app.message
      }));
    });

    res.json(myApplications);
  } catch (error) {
    console.error('Error fetching my applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
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
      status: 'open',
      expirationDate: req.body.expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default to 30 days if not provided
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

// Update application status
router.patch('/:jobId/applications/:applicationId', verifyToken, async (req, res) => {
  try {
    const { jobId, applicationId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find the job and verify ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    // Find and update the application
    const application = job.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update the application status
    application.status = status;
    await job.save();

    // Send notification to the applicant
    // You can implement this part based on your notification system

    res.json({ 
      message: `Application ${status} successfully`,
      job
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
});

// Get all jobs with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('employerId', 'name location')
        .exec(),
      Job.countDocuments()
    ]);

    const hasMore = total > skip + jobs.length;

    res.json({
      jobs,
      hasMore,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ 
      message: 'Error fetching jobs', 
      error: error.message 
    });
  }
});

// Delete job
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    console.log('Attempting to delete/close job:', req.params.id);
    console.log('User ID:', req.user.id);

    // Validate job ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid job ID format');
      return res.status(400).json({ message: 'Invalid job ID format' });
    }

    // Find the job
    const job = await Job.findById(req.params.id);
    
    // Check if job exists
    if (!job) {
      console.log('Job not found');
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the employer
    if (job.employerId.toString() !== req.user.id) {
      console.log('User not authorized to delete job');
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    // Update status to closed instead of deleting
    job.status = 'closed';
    await job.save();

    console.log('Job closed successfully');
    res.json({ message: 'Job closed successfully' });
  } catch (error) {
    console.error('Error in DELETE /jobs/:id:', error);
    res.status(500).json({ 
      message: 'Error closing job', 
      error: error.message 
    });
  }
});

export default router;