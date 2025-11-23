import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    userType: string;
  };
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        userType: string;
      };

      (req as AuthRequest).user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Session expired. Please log in again.' });
      } else {
        res.status(401).json({ message: 'Invalid token' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(authReq.user.userType)) {
      res.status(403).json({ message: 'Access forbidden' });
      return;
    }

    next();
  };
};
