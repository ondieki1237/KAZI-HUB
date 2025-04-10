import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Joi from 'joi';
import { verifyToken } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

const router = express.Router();

// Validation schema
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

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', {
      ...req.body,
      password: '[REDACTED]'
    });

    // Validate input
    const { error } = registerSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password, name, phone, role, location, username } = req.body;

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
        phone,
        role,
        location: {
          type: 'Point',
          coordinates: [0, 0] // Default coordinates
        },
        locationString: '',
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

    if (!user.verificationCode || !user.verificationCode.code) {
      return res.status(400).json({ message: 'No verification code found' });
    }

    if (new Date() > user.verificationCode.expiresAt) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    if (user.verificationCode.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Mark user as verified
    user.verified = true;
    user.verificationCode = undefined;
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Error verifying email' });
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
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.verified) {
      return res.status(403).json({ 
        message: 'Email not verified',
        requiresVerification: true,
        email: user.email
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token with user ID
    const token = jwt.sign(
      { 
        userId: user._id.toString() // Ensure userId is included
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Generated token for user:', {
      userId: user._id,
      tokenPreview: token.substring(0, 20) + '...'
    });

    // Send response without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
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
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

export default router;