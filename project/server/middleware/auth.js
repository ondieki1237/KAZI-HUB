import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT token.
 * Extracts the token from the Authorization header, verifies it, and attaches the decoded user data to `req.user`.
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('No auth header provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      console.log('No token in auth header');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.userId) {
      console.log('No userId in token payload:', decoded);
      return res.status(401).json({ message: 'Invalid token format' });
    }

    req.user = { id: decoded.userId };
    console.log('Token verified successfully for user:', decoded.userId);
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Authentication failed' });
  }
};