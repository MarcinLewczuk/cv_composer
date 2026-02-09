import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');

/**
 * Extends Express Request to include decoded JWT payload
 */
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string };
    }
  }
}

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key-change-this';
const JWT_EXPIRY = process.env['JWT_EXPIRY'] || '7d';

/**
 * Generate a JWT token for a user
 */
export function generateToken(userId: number, email: string): string {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Middleware to verify JWT token
 * Extracts token from Authorization header and verifies it
 */
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}
