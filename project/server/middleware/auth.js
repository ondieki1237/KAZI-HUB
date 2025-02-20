import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT token.
 * Extracts the token from the Authorization header, verifies it, and attaches the decoded user data to `req.user`.
 */
export const verifyToken = (req, res, next) => {
  // Get the authorization header
  const authHeader = req.headers.authorization;

  // Check if the authorization header exists
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Extract the token from the header
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  try {
    // Verify the token using the JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user data to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If the token is invalid or expired, return an error
    return res.status(401).json({ message: 'Invalid token' });
  }
};