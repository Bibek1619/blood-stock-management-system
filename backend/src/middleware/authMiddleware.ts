import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';

// ================= TYPES =================
interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        phone: string;
        role: string;
      };
    }
  }
}

// ================= PROTECT MIDDLEWARE =================
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Check Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // 2. Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // 3. Verify JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not defined');
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
      return;
    }

    // 4. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as JwtPayload;

    if (!decoded || !decoded.id) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // 5. Get user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // 6. Attach user to request
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }

    console.error('Auth Middleware Error:', error);

    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }
};

// ================= AUTHORIZE MIDDLEWARE =================
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 1. Check authentication
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // 2. Check role
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden - Requires: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
};