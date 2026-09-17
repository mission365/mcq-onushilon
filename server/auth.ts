import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'mcq-onushilon-super-secret-jwt-key-2026';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'admin';
  isVerified?: boolean;
  curriculumVersion?: 'bangla' | 'english' | 'british' | 'ib' | null;
  academicLevel?: 'hsc' | 'ssc' | 'alevel' | 'olevel' | 'dp' | 'myp' | null;
  stream?: 'science' | 'commerce' | 'humanities' | 'common' | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isVerified: user.isVerified ?? true,
      curriculumVersion: user.curriculumVersion ?? null,
      academicLevel: user.academicLevel ?? 'hsc',
      stream: user.stream ?? 'science',
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const verifyToken = (token: string): AuthUser => {
  return jwt.verify(token, JWT_SECRET) as AuthUser;
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.slice(7).trim();
  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    try {
      req.user = verifyToken(token);
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  });
};
