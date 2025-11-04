import { Router, Request, Response } from 'express';
import { User } from '../models.js';
import { AuthenticatedRequest, authenticate } from '../middleware/auth.js';
import { userService } from '../db-service.js';
import { createUser } from '../auth.js';

export const managersRouter = Router();

// Get all project managers
managersRouter.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const managers = userService.getAll()
    .filter(u => u.role === 'ProjectManager' && u.isActive)
    .map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      department: u.department,
    }));
  
  res.json(managers);
});

// Get all users (for admin/portfolio manager)
managersRouter.get('/users', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'PortfolioManager')) {
    res.status(403).json({ error: 'Permessi insufficienti' });
    return;
  }

  const users = userService.getAll()
    .map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      isActive: u.isActive,
    }));
  
  res.json(users);
});

// Create a new user (can be a PM, Admin, etc.)
managersRouter.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'PortfolioManager')) {
    res.status(403).json({ error: 'Permessi insufficienti' });
    return;
  }

  const { email, password, name, role, department } = req.body;
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Email, password, name, and role are required' });
  }

  const existing = userService.getByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const newUser = createUser(email, password, name, role);
  if (department) newUser.department = department;
  userService.create(newUser);
  
  res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
});

// Delete a user
managersRouter.delete('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'PortfolioManager')) {
    res.status(403).json({ error: 'Permessi insufficienti' });
    return;
  }

  const userIdToDelete = req.params.id;
  if (userService.delete(userIdToDelete)) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});
