import { Request, Response, NextFunction } from 'express';
import { getSession, deleteSession } from '../auth.js';
import { User } from '../models.js';
import { userService } from '../db-service.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '') || 
                     req.cookies?.sessionId;

    if (!sessionId) {
      res.status(401).json({ error: 'Non autenticato' });
      return;
    }

    const session = getSession(sessionId);
    if (!session) {
      res.status(401).json({ error: 'Sessione scaduta' });
      return;
    }

    const user = userService.getById(session.userId);
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Utente non valido' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Errore autenticazione' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Non autenticato' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Permessi insufficienti' });
      return;
    }

    next();
  };
};

