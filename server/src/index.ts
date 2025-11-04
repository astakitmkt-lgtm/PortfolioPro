import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { managersRouter } from './routes/managers.js';
import { projectsRouter } from './routes/projects.js';
import { reportsRouter } from './routes/reports.js';
import { dashboardRouter } from './routes/dashboard.js';
import { analyticsRouter } from './routes/analytics.js';
import { notificationsRouter } from './routes/notifications.js';
import { seedDatabase } from './seed.js';
import { initializeDatabase } from './database.js';

const app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Auth routes
app.use('/api/auth', authRouter);

// Other routes (will add auth middleware later)
app.use('/api/managers', managersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notifications', notificationsRouter);

// Initialize database schema and seed data
initializeDatabase();
if (process.env.NODE_ENV !== 'production') {
  seedDatabase();
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`PortfolioPro API running on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log('Sample users:');
  // eslint-disable-next-line no-console
  console.log('  Admin: admin@portfoliopro.com / admin123');
  // eslint-disable-next-line no-console
  console.log('  PM: pm1@portfoliopro.com / pm123');
});

