import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  message: String
});

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  locationArea: {
    type: String,
    required: true
  },
  locationCity: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requirements: {
    isRemote: {
      type: Boolean,
      default: false
    },
    numberOfOpenings: {
      type: Number,
      default: 1
    },
    isConfidential: {
      type: Boolean,
      default: false
    }
  },
  skillsRequired: [{
    type: String
  }],
  duration: {
    type: String,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default to 30 days from now
  },
  applications: [applicationSchema]
}, {
  timestamps: true
});

export default mongoose.model('Job', jobSchema);