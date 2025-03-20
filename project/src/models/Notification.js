const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'jobAccepted', 'jobRejected', 'newJob', 'applicationSubmitted'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  visible: {
    type: Boolean,
    default: true
  },
  sendAlerts: {
    type: Boolean,
    default: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  // Fields for message notifications
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  senderName: String,
  content: String,
  // Fields for job status notifications
  employerName: String,
  // Fields for application submitted notifications
  applicantName: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema); 