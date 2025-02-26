import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Joi from 'joi';

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

    // Create new user
    const user = new User({
      name,
      username,
      email,
      password,
      phone,
      role,
      addressString: location
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering user',
      error: error.message
    });
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

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token with employerId or workerId based on role
    const token = jwt.sign(
      { id: user._id, role: user.role, userId: user._id }, // Include userId in the token payload
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

export default router;