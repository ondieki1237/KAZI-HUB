import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define CV Schema
const cvSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: undefined
      }
    },
    locationString: {
      type: String,
      default: ''
    },
    bio: {
      type: String
    },
    avatar: {
      type: String
    },
    role: {
      type: String,
      enum: ['worker', 'employer', 'admin'],
      required: true
    },
    skills: {
      type: [String],
      default: []
    },
    rating: {
      type: Number,
      default: 0
    },
    completedJobs: {
      type: Number,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    },
    yearsOfExperience: {
      type: Number,
      default: 0
    },
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
    documents: [
      {
        type: {
          type: String,
          enum: ['id', 'certificate', 'license', 'cv', 'resume', 'cover_letter'],
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
      }
    ],
    cvs: [cvSchema]
  },
  {
    timestamps: true
  }
);

// Index for location (if needed)
userSchema.index({ location: '2dsphere' });

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the User model
export default mongoose.model('User', userSchema);