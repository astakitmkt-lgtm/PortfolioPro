import { Router, Request, Response } from 'express';
import { createUser, createSession, verifyPassword, deleteSession, getSession, hashPassword } from '../auth.js';
import { User, generateId } from '../models.js';
import { AuthenticatedRequest, authenticate } from '../middleware/auth.js';
import { userService } from '../db-service.js';

export const authRouter = Router();

// Login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email e password richieste' });
    return;
  }

  const user = userService.getByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: 'Credenziali non valide' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: 'Account disattivato' });
    return;
  }

  const sessionId = createSession(user.id);
  
  // Update last login
  user.lastLogin = new Date().toISOString();
  userService.update(user);

  res.json({
    sessionId,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      photoUrl: user.photoUrl,
      language: user.language,
    },
  });
});

// Logout
authRouter.post('/logout', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.sessionId;
  if (sessionId) {
    deleteSession(sessionId);
  }
  res.json({ success: true });
});

// Get current user
authRouter.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non autenticato' });
    return;
  }

  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
    department: req.user.department,
    photoUrl: req.user.photoUrl,
    phone: req.user.phone,
    language: req.user.language,
  });
});

// Register (Admin only - typically)
authRouter.post('/register', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'PortfolioManager')) {
    res.status(403).json({ error: 'Solo Admin e Portfolio Manager possono creare utenti' });
    return;
  }

  const { email, password, name, role, department } = req.body;

  if (!email || !password || !name || !role) {
    res.status(400).json({ error: 'Email, password, nome e ruolo richiesti' });
    return;
  }

  // Check if user exists
  const existing = userService.getByEmail(email);
  if (existing) {
    res.status(400).json({ error: 'Email già registrata' });
    return;
  }

  const user = createUser(email, password, name, role);
  if (department) user.department = department;
  
  userService.create(user);

  res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
  });
});

// Change password
authRouter.post('/change-password', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non autenticato' });
    return;
  }

  const { oldPassword, newPassword } = req.body;

  if (!verifyPassword(oldPassword, req.user.passwordHash)) {
    res.status(400).json({ error: 'Password corrente non corretta' });
    return;
  }

  req.user.passwordHash = hashPassword(newPassword);
  userService.update(req.user);

  res.json({ success: true });
});

