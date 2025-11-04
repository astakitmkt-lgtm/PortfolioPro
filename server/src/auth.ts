import { User, UserRole } from './models.js';
import { sessionService } from './db-service.js';

// Simple auth middleware (in production, use JWT tokens)
export interface AuthRequest extends Express.Request {
  user?: User;
}

// Simple password hashing (in production, use bcrypt)
export const hashPassword = (password: string): string => {
  // Simple hash for demo - USE BCRYPT IN PRODUCTION
  return Buffer.from(password).toString('base64');
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

export const createUser = (email: string, password: string, name: string, role: UserRole): User => {
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    email,
    passwordHash: hashPassword(password),
    name,
    role,
    isActive: true,
    createdAt: new Date().toISOString(),
    language: 'it',
  };
};

// Session storage using SQLite
export const createSession = (userId: string): string => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  sessionService.create(sessionId, userId, expiresAt.toISOString());
  return sessionId;
};

export const getSession = (sessionId: string): { userId: string } | null => {
  const session = sessionService.get(sessionId);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    sessionService.delete(sessionId);
    return null;
  }
  return { userId: session.userId };
};

export const deleteSession = (sessionId: string): void => {
  sessionService.delete(sessionId);
};

// Authorization helpers
export const hasRole = (user: User, ...roles: UserRole[]): boolean => {
  return roles.includes(user.role);
};

export const canAccessProject = (user: User, projectManagerId?: string): boolean => {
  if (hasRole(user, 'Admin', 'PortfolioManager')) return true;
  if (user.role === 'ProjectManager' && projectManagerId === user.id) return true;
  if (user.role === 'Stakeholder') return true; // Read-only for all
  return false;
};

export const canEditProject = (user: User, projectManagerId?: string): boolean => {
  if (hasRole(user, 'Admin', 'PortfolioManager')) return true;
  if (user.role === 'ProjectManager' && projectManagerId === user.id) return true;
  return false;
};

