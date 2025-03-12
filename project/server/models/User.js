import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const cvSchema = new mongoose.Schema({
  name: String,
  data: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  location: String,
  bio: String,
  avatar: String,
  role: {
    type: String,
    enum: ['worker', 'employer', 'admin'],
    required: true
  },
  skills: [String],
  rating: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  yearsOfExperience: { type: Number, default: 0 },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  addressString: {
    type: String,
    required: true
  },
  documents: [{
    type: {
      type: String,
      enum: ['id', 'certificate', 'license'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  cvs: [cvSchema]
}, {
  timestamps: true
});

// Remove any existing indexes (if needed)
userSchema.index({ location: 1 }, { background: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);