import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import userRoutes from './routes/users.js';
import mpesaRoutes from './routes/mpesa.js';
import chatRoutes, { initializeSocket } from './routes/chat.js';
import { verifyToken } from './middleware/auth.js';
import skillRoutes from './routes/skills.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import cvRoutes from './routes/cv.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = initializeSocket(server);

// Environment variables
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '192.168.1.110';
const CLIENT_PORT = 5173;

// CORS configuration
app.use(cors({
  origin: [
    `http://localhost:${CLIENT_PORT}`,
    `http://${HOST}:${CLIENT_PORT}`
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition']
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || '127.0.0.1'
});
app.use('/api/', limiter);

// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log('Connection string used:', process.env.MONGO_URL.replace(/\/\/[^:]+:[^@]+@/, '//[REDACTED]@'));
})
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', {
    message: err.message,
    code: err.code,
    name: err.name
  });
});

// Add MongoDB connection error handling
mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', {
    message: err.message,
    code: err.code,
    name: err.name
  });
});

mongoose.connection.on('disconnected', () => {
  console.error('MongoDB disconnected. Attempting to reconnect...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/mpesa', verifyToken, mpesaRoutes);
app.use('/api/chats', verifyToken, chatRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cv-maker', cvRoutes);

// Serve Static Files in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
} else {
  // Development Routes
  app.get('/api', (req, res) => {
    res.json({ 
      status: 'success',
      message: 'Blue Collar Jobs API is running',
      endpoints: {
        auth: '/api/auth',
        jobs: '/api/jobs',
        users: '/api/users',
        mpesa: '/api/mpesa',
        chat: '/api/chats',
        payments: '/api/payments',
      }
    });
  });

  // Redirect other routes to the frontend during development
  app.get('*', (req, res) => {
    res.redirect(`http://${HOST}:${CLIENT_PORT}`);
  });
}

// Serve static files
app.use('/cvs', express.static(path.join(__dirname, 'public/cvs')));
app.use('/uploads', express.static('uploads'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Local:            http://localhost:${PORT}`);
  console.log(`📡 On Your Network:  http://${HOST}:${PORT}`);
  console.log(`🌐 API URL:          ${process.env.API_URL}`);
});