import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: false // Changed to false for Google users
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true // Allows null/undefined for non-Google users
    },
    phone: {
      type: String,
      default: '' // Default empty for Google users
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0] // Default coordinates
      }
    },
    locationString: {
      type: String,
      default: 'Default Location' // Default for Google users
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
      default: 'worker'
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
      default: false // Google users will be set to true
    },
    verificationCode: {
      code: String,
      expiresAt: Date
    },
    passwordReset: {
      token: String,
      expiresAt: Date
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
      default: 'Default Location' // Changed to default for Google users
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
  if (this.isModified('password') && this.password) { // Only hash if password exists
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    if (!this.password) {
      console.error('No password hash found for user');
      return false;
    }
    if (!candidatePassword) {
      console.error('No candidate password provided');
      return false;
    }
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', {
      error: error.message,
      stack: error.stack
    });
    throw new Error('Error comparing passwords');
  }
};

// Generate verification code
userSchema.methods.generateVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = {
    code: code,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  };
  return code;
};

// Verify email verification code
userSchema.methods.verifyEmailCode = function(code) {
  if (!this.verificationCode || !this.verificationCode.code) {
    return false;
  }

  if (new Date() > this.verificationCode.expiresAt) {
    return false;
  }

  return this.verificationCode.code === code;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordReset = {
    token: token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  };
  return token;
};

// Export the User model
export default mongoose.model('User', userSchema);