import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, '../../data/portfoliopro.db');

// Ensure data directory exists
import { mkdirSync } from 'fs';
try {
  mkdirSync(path.dirname(dbPath), { recursive: true });
} catch (error) {
  // Directory might already exist
}

// Create database connection
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT,
      phone TEXT,
      photoUrl TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      lastLogin TEXT,
      language TEXT DEFAULT 'it'
    )
  `);

  // Projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      businessCaseSummary TEXT,
      objectives TEXT,
      scope TEXT,
      constraints TEXT,
      assumptions TEXT,
      startDate TEXT NOT NULL,
      endDate TEXT,
      forecastEndDate TEXT,
      budgetPlanned REAL DEFAULT 0,
      budgetSpent REAL DEFAULT 0,
      budgetForecast REAL DEFAULT 0,
      sponsor TEXT,
      sponsorId TEXT,
      projectManagerId TEXT,
      department TEXT,
      methodology TEXT,
      stage TEXT,
      statusRAG TEXT DEFAULT 'Green',
      priority TEXT DEFAULT 'Medium',
      percentComplete REAL DEFAULT 0,
      risksSummary TEXT,
      issuesSummary TEXT,
      dependencies TEXT,
      benefitsSummary TEXT,
      toleranceSummary TEXT,
      kpis TEXT,
      successCriteria TEXT,
      resourcesAllocated TEXT,
      isArchived INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      createdBy TEXT,
      FOREIGN KEY (projectManagerId) REFERENCES users(id),
      FOREIGN KEY (sponsorId) REFERENCES users(id),
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )
  `);

  // Weekly Reports table
  db.exec(`
    CREATE TABLE IF NOT EXISTS weekly_reports (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      weekStart TEXT NOT NULL,
      weekEnd TEXT NOT NULL,
      reportDate TEXT NOT NULL,
      submittedBy TEXT NOT NULL,
      overallRAG TEXT DEFAULT 'Green',
      percentComplete REAL DEFAULT 0,
      summaryNotes TEXT,
      plannedProgress REAL DEFAULT 0,
      actualProgress REAL DEFAULT 0,
      budgetInitial REAL DEFAULT 0,
      budgetSpentToDate REAL DEFAULT 0,
      budgetForecast REAL DEFAULT 0,
      budgetVariance REAL DEFAULT 0,
      decisions TEXT,
      lessonsLearned TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      autoSaved INTEGER DEFAULT 0,
      FOREIGN KEY (projectId) REFERENCES projects(id),
      FOREIGN KEY (submittedBy) REFERENCES users(id)
    )
  `);

  // Activities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      reportId TEXT NOT NULL,
      description TEXT NOT NULL,
      percentComplete REAL DEFAULT 0,
      plannedEndDate TEXT,
      actualEndDate TEXT,
      assignee TEXT,
      status TEXT DEFAULT 'in-progress',
      FOREIGN KEY (reportId) REFERENCES weekly_reports(id) ON DELETE CASCADE,
      FOREIGN KEY (assignee) REFERENCES users(id)
    )
  `);

  // Milestones table
  db.exec(`
    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      reportId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      projectPhase TEXT,
      plannedEndDate TEXT,
      originalEndDate TEXT,
      percentComplete REAL DEFAULT 0,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'upcoming',
      reachedDate TEXT,
      FOREIGN KEY (reportId) REFERENCES weekly_reports(id) ON DELETE CASCADE
    )
  `);

  // Open Points table
  db.exec(`
    CREATE TABLE IF NOT EXISTS open_points (
      id TEXT PRIMARY KEY,
      reportId TEXT NOT NULL,
      description TEXT NOT NULL,
      openedDate TEXT NOT NULL,
      responsible TEXT,
      priority TEXT DEFAULT 'Medium',
      targetResolutionDate TEXT,
      status TEXT DEFAULT 'Nuovo',
      resolvedDate TEXT,
      notes TEXT,
      FOREIGN KEY (reportId) REFERENCES weekly_reports(id) ON DELETE CASCADE,
      FOREIGN KEY (responsible) REFERENCES users(id)
    )
  `);

  // Issues table
  db.exec(`
    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      reportId TEXT NOT NULL,
      description TEXT NOT NULL,
      impact TEXT DEFAULT 'Medio',
      correctiveActions TEXT,
      responsible TEXT,
      detectedDate TEXT NOT NULL,
      targetResolutionDate TEXT,
      status TEXT DEFAULT 'Nuovo',
      resolvedDate TEXT,
      escalationDate TEXT,
      FOREIGN KEY (reportId) REFERENCES weekly_reports(id) ON DELETE CASCADE,
      FOREIGN KEY (responsible) REFERENCES users(id)
    )
  `);

  // Risks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS risks (
      id TEXT PRIMARY KEY,
      reportId TEXT NOT NULL,
      description TEXT NOT NULL,
      probability INTEGER DEFAULT 3,
      impact INTEGER DEFAULT 3,
      riskLevel INTEGER DEFAULT 9,
      responseStrategy TEXT DEFAULT 'Mitigazione',
      contingencyPlan TEXT,
      owner TEXT,
      status TEXT DEFAULT 'Identificato',
      identifiedDate TEXT NOT NULL,
      closedDate TEXT,
      FOREIGN KEY (reportId) REFERENCES weekly_reports(id) ON DELETE CASCADE,
      FOREIGN KEY (owner) REFERENCES users(id)
    )
  `);

  // Opportunities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      reportId TEXT NOT NULL,
      description TEXT NOT NULL,
      potentialBenefit TEXT,
      requiredActions TEXT,
      responsible TEXT,
      decisionTimeline TEXT,
      status TEXT DEFAULT 'Identificata',
      identifiedDate TEXT NOT NULL,
      implementedDate TEXT,
      FOREIGN KEY (reportId) REFERENCES weekly_reports(id) ON DELETE CASCADE,
      FOREIGN KEY (responsible) REFERENCES users(id)
    )
  `);

  // Change Requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS change_requests (
      id TEXT PRIMARY KEY,
      reportId TEXT NOT NULL,
      description TEXT NOT NULL,
      requestedBy TEXT,
      impactScope TEXT,
      impactTime TEXT,
      impactCost TEXT,
      requestDate TEXT NOT NULL,
      status TEXT DEFAULT 'Richiesta',
      approvedBy TEXT,
      approvedDate TEXT,
      FOREIGN KEY (reportId) REFERENCES weekly_reports(id) ON DELETE CASCADE,
      FOREIGN KEY (requestedBy) REFERENCES users(id),
      FOREIGN KEY (approvedBy) REFERENCES users(id)
    )
  `);

  // Documents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      filePath TEXT,
      fileType TEXT,
      fileSize INTEGER,
      category TEXT,
      version INTEGER DEFAULT 1,
      uploadedBy TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (uploadedBy) REFERENCES users(id)
    )
  `);

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT,
      role TEXT,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      link TEXT,
      read INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium',
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Sessions table (for authentication)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Database initialized successfully');
}

// Helper functions for common operations
export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(0, 5);
}

// Close database connection
export function closeDatabase() {
  db.close();
}


