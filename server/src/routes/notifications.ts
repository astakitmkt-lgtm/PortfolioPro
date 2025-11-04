import { Router, Request, Response } from 'express';
import { db, Notification, generateId, Priority } from '../models.js';
import { AuthenticatedRequest, authenticate } from '../middleware/auth.js';

export const notificationsRouter = Router();

// Get user notifications
notificationsRouter.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non autenticato' });
    return;
  }

  const { unreadOnly } = req.query;
  let notifications = Array.from(db.notifications.values())
    .filter(n => n.userId === req.user!.id);

  if (unreadOnly === 'true') {
    notifications = notifications.filter(n => !n.isRead);
  }

  notifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json(notifications);
});

// Mark notification as read
notificationsRouter.put('/:id/read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non autenticato' });
    return;
  }

  const notification = db.notifications.get(req.params.id);
  if (!notification || notification.userId !== req.user.id) {
    res.status(404).json({ error: 'Notifica non trovata' });
    return;
  }

  notification.isRead = true;
  db.notifications.set(notification.id, notification);

  res.json(notification);
});

// Mark all as read
notificationsRouter.put('/read-all', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non autenticato' });
    return;
  }

  const notifications = Array.from(db.notifications.values())
    .filter(n => n.userId === req.user!.id && !n.isRead);

  notifications.forEach(n => {
    n.isRead = true;
    db.notifications.set(n.id, n);
  });

  res.json({ count: notifications.length });
});

// Delete notification
notificationsRouter.delete('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non autenticato' });
    return;
  }

  const notification = db.notifications.get(req.params.id);
  if (!notification || notification.userId !== req.user.id) {
    res.status(404).json({ error: 'Notifica non trovata' });
    return;
  }

  db.notifications.delete(req.params.id);
  res.status(204).send();
});

// Helper function to create notifications (used by other services)
export const createNotification = (
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  link?: string,
  priority: Priority = 'Medium'
): Notification => {
  const notification: Notification = {
    id: generateId(),
    userId,
    type,
    title,
    message,
    link,
    isRead: false,
    createdAt: new Date().toISOString(),
    priority,
  };

  db.notifications.set(notification.id, notification);
  return notification;
};


