import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT token.
 * Extracts the token from the Authorization header, verifies it, and attaches the decoded user data to `req.user`.
 */
export const verifyToken = (req, res, next) => {
  console.log('🔹 Verifying token for request:', req.method, req.url);

  try {
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader || 'None provided');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid Authorization header provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted Token:', token ? `${token.substring(0, 10)}...` : 'None');

    if (!token) {
      console.log('❌ No token found after splitting header');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token Payload:', decoded);

    if (!decoded.userId) {
      console.log('❌ No userId in token payload:', decoded);
      return res.status(401).json({ message: 'Invalid token format' });
    }

    req.user = { id: decoded.userId };
    console.log('✅ Token verified successfully for user ID:', decoded.userId);

    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};