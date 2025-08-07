import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library'; // Added for Google ID token verification
import User from '../models/User.js';
import Joi from 'joi';
import { verifyToken } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../utils/emailService.js';
import mongoose from 'mongoose';

const router = express.Router();

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// At the top of the file, after imports
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

// Validate JWT_SECRET length
if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET is too short. It should be at least 32 characters long');
  process.exit(1);
}

console.log('JWT_SECRET validation passed');

// Add connection check middleware
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.error('Database not connected. Current state:', mongoose.connection.readyState);
    return res.status(500).json({ message: 'Database connection not available' });
  }
  next();
};

// Apply middleware to all routes
router.use(checkDbConnection);

// Validation schema for regular registration
const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required()
    .messages({
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name cannot be longer than 30 characters',
      'any.required': 'Name is required'
    }),
  username: Joi.string().min(3).max(30).required().lowercase()
    .messages({
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot be longer than 30 characters',
      'any.required': 'Username is required'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
  phone: Joi.string().pattern(/^\d{10,12}$/).required()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number',
      'any.required': 'Phone number is required'
    }),
  location: Joi.string().min(3).required()
    .messages({
      'string.min': 'Location must be at least 3 characters long',
      'any.required': 'Location is required'
    }),
  role: Joi.string().valid('worker', 'employer').required()
    .messages({
      'any.only': 'Role must be either worker or employer',
      'any.required': 'Role is required'
    })
});

// Validation schema for Google registration
const googleRegisterSchema = Joi.object({
  name: Joi.string().min(3).max(30).required()
    .messages({
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name cannot be longer than 30 characters',
      'any.required': 'Name is required'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  googleId: Joi.string().required()
    .messages({
      'any.required': 'Google ID is required'
    }),
  role: Joi.string().valid('worker', 'employer').required()
    .messages({
      'any.only': 'Role must be either worker or employer',
      'any.required': 'Role is required'
    }),
  phone: Joi.string().pattern(/^\d{10,12}$/).allow('').optional()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number'
    }),
  location: Joi.string().min(3).allow('').optional()
    .messages({
      'string.min': 'Location must be at least 3 characters long'
    })
});

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', {
      ...req.body,
      password: '[REDACTED]'
    });

    // Transform request body to match schema
    const transformedBody = {
      ...req.body,
      phone: req.body.phone || req.body.phoneNumber, // Accept either phone or phoneNumber
      location: req.body.location || req.body.addressString || 'Default Location' // Make location optional with default
    };

    // Validate input
    const { error } = registerSchema.validate(transformedBody);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password, name, phone, role, location, username } = transformedBody;

    try {
      // Check if user exists (both email and username)
      const existingUser = await User.findOne({ 
        $or: [
          { email },
          { username }
        ]
      });
      
      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({ message: 'Email is already registered' });
        }
        if (existingUser.username === username) {
          return res.status(400).json({ message: 'Username is already taken' });
        }
      }

      // Create new user with default coordinates for location
      const user = new User({
        name,
        username,
        email,
        password,
        phone, // Using the transformed phone value
        role,
        location: {
          type: 'Point',
          coordinates: [0, 0] // Default coordinates
        },
        locationString: location,
        addressString: location
      });

      // Generate verification code
      const verificationCode = user.generateVerificationCode();

      // Save user
      await user.save();
      console.log('User saved successfully:', {
        id: user._id,
        email: user.email,
        username: user.username
      });

      // Send verification email
      try {
        const emailSent = await sendVerificationEmail(email, verificationCode);
        console.log('Verification email status:', emailSent);
        
        if (!emailSent) {
          console.error('Failed to send verification email, but user was created');
          return res.status(201).json({ 
            message: 'Registration successful, but there was an issue sending the verification email. Please try resending the verification code.',
            email
          });
        }

        return res.status(201).json({ 
          message: 'Registration successful. Please check your email for verification code.',
          email
        });
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        return res.status(201).json({ 
          message: 'Registration successful, but there was an issue sending the verification email. Please try resending the verification code.',
          email
        });
      }
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return res.status(500).json({ 
        message: 'Error saving user to database', 
        error: dbError.message 
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      message: 'Error registering user', 
      error: error.message 
    });
  }
});

// Google Register
router.post('/register/google', async (req, res) => {
  try {
    console.log('Google registration attempt:', {
      ...req.body,
      googleId: req.body.googleId ? '[REDACTED]' : undefined
    });

    // Validate input
    const { error } = googleRegisterSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, googleId, role, phone, location } = req.body;

    try {
      // Check if user exists (by email or googleId)
      const existingUser = await User.findOne({ 
        $or: [
          { email },
          { googleId }
        ]
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({ message: 'Email is already registered' });
        }
        if (existingUser.googleId === googleId) {
          return res.status(400).json({ message: 'Google account is already registered' });
        }
      }

      // Create new user
      const user = new User({
        name,
        email,
        googleId,
        role,
        phone: phone || '',
        location: {
          type: 'Point',
          coordinates: [0, 0] // Default coordinates
        },
        locationString: location || 'Default Location',
        addressString: location || 'Default Location',
        verified: true, // Google users are considered verified
      });

      // Save user
      await user.save();
      console.log('Google user saved successfully:', {
        id: user._id,
        email: user.email
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Send welcome email
      try {
        const emailSent = await sendWelcomeEmail(email, name);
        console.log('Welcome email status for Google user:', emailSent);
      } catch (emailError) {
        console.error('Error sending welcome email for Google user:', emailError);
        // Continue despite email failure
      }

      // Send response without sensitive data
      const userResponse = user.toObject();
      delete userResponse.googleId;
      delete userResponse.password;
      delete userResponse.verificationCode;

      return res.status(201).json({
        message: 'Google registration successful',
        token,
        user: userResponse
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return res.status(500).json({ 
        message: 'Error saving Google user to database', 
        error: dbError.message 
      });
    }
  } catch (error) {
    console.error('Google registration error:', error);
    return res.status(500).json({ 
      message: 'Error registering Google user', 
      error: error.message 
    });
  }
});

// Verify email with code
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (!user.verifyEmailCode(code)) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.verified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the verification if welcome email fails
    }

    return res.status(200).json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ message: 'Error verifying email' });
  }
});

// Resend verification code
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new verification code
    const verificationCode = user.generateVerificationCode();
    await user.save();

    // Send new verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);
    if (!emailSent) {
      return res.status(500).json({ message: 'Error sending verification email' });
    }

    res.json({ message: 'New verification code sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Error resending verification code' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt received:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    console.log('Finding user with email:', email);
    let user;
    try {
      user = await User.findOne({ email });
      console.log('User search result:', user ? 'Found' : 'Not found');
    } catch (dbError) {
      console.error('Database error while finding user:', {
        error: dbError.message,
        stack: dbError.stack
      });
      return res.status(500).json({ 
        message: 'Database error while finding user',
        error: dbError.message
      });
    }
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found, checking verification status');
    if (!user.verified) {
      console.log('User not verified:', email);
      return res.status(403).json({ 
        message: 'Email not verified',
        requiresVerification: true,
        email: user.email
      });
    }

    // Verify password
    console.log('Verifying password for user:', email);
    let isMatch;
    try {
      isMatch = await user.comparePassword(password);
      console.log('Password verification result:', isMatch ? 'Match' : 'No match');
    } catch (passwordError) {
      console.error('Error comparing passwords:', {
        error: passwordError.message,
        stack: passwordError.stack
      });
      return res.status(500).json({ 
        message: 'Error verifying password',
        error: passwordError.message
      });
    }
    
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token with user ID
    console.log('Creating token for user:', email);
    let token;
    try {
      token = jwt.sign(
        { 
          userId: user._id.toString()
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      console.log('Token created successfully');
    } catch (tokenError) {
      console.error('Error creating token:', {
        error: tokenError.message,
        stack: tokenError.stack
      });
      return res.status(500).json({ 
        message: 'Error creating authentication token',
        error: tokenError.message
      });
    }

    console.log('Login successful for user:', {
      userId: user._id,
      email: user.email,
      tokenPreview: token.substring(0, 20) + '...'
    });

    // Send response without password
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.verificationCode;
    delete userResponse.passwordReset;

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    res.status(500).json({ 
      message: 'Error logging in',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    console.log('Password reset request received for email:', req.body.email);
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    console.log('Generated reset token for user:', {
      userId: user._id,
      tokenPreview: resetToken.substring(0, 10) + '...'
    });

    await user.save();
    console.log('User saved with reset token');

    // Send password reset email
    try {
      const emailSent = await sendPasswordResetEmail(email, resetToken);
      console.log('Password reset email sending attempt result:', emailSent);
      
      if (!emailSent) {
        console.error('Failed to send password reset email');
        return res.status(500).json({ message: 'Error sending password reset email' });
      }

      res.json({ message: 'Password reset email sent' });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      return res.status(500).json({ message: 'Error sending password reset email', error: emailError.message });
    }
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Error processing password reset request', error: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      'passwordReset.token': token,
      'passwordReset.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.passwordReset = undefined;

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

// Welcome email endpoint
router.post('/welcome-email', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const sent = await sendWelcomeEmail(email, name);
    
    if (sent) {
      res.status(200).json({ message: 'Welcome email sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send welcome email' });
    }
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;