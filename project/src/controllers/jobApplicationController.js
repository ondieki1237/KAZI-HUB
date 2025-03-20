const JobApplication = require('../models/JobApplication');
const Notification = require('../models/Notification');

// Submit a job application
exports.submitApplication = async (req, res) => {
  try {
    const application = new JobApplication(req.body);
    await application.save();

    // Create notification for employer
    await Notification.create({
      userId: application.jobId.employerId,
      type: 'applicationSubmitted',
      jobId: application.jobId._id,
      jobTitle: application.jobId.title,
      read: false,
      visible: true,
      sendAlerts: true
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Error submitting application' });
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;
    const application = await JobApplication.findById(applicationId)
      .populate('jobId')
      .populate('workerId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    // Create notification for worker
    await Notification.create({
      userId: application.workerId._id,
      type: status === 'accepted' ? 'jobAccepted' : 'jobRejected',
      jobId: application.jobId._id,
      jobTitle: application.jobId.title,
      read: false,
      visible: true,
      sendAlerts: true
    });

    res.json(application);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
}; 