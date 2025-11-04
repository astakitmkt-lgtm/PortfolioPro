import { db } from './database.js';
import { User, Project, WeeklyReport, Activity, Milestone, OpenPoint, Issue, Risk, Opportunity, ChangeRequest, Document, Notification } from './models.js';

// ============ USERS ============
export const userService = {
  getAll: () => {
    const rows = db.prepare('SELECT * FROM users').all() as any[];
    return rows.map(row => ({
      ...row,
      isActive: Boolean(row.isActive),
    } as User));
  },

  getById: (id: string): User | undefined => {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return {
      ...row,
      isActive: Boolean(row.isActive),
    } as User;
  },

  getByEmail: (email: string): User | undefined => {
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!row) return undefined;
    return {
      ...row,
      isActive: Boolean(row.isActive),
    } as User;
  },

  create: (user: User) => {
    db.prepare(`
      INSERT INTO users (id, email, passwordHash, name, role, department, phone, photoUrl, isActive, createdAt, lastLogin, language)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.id,
      user.email,
      user.passwordHash,
      user.name,
      user.role,
      user.department || null,
      user.phone || null,
      user.photoUrl || null,
      user.isActive ? 1 : 0,
      user.createdAt,
      user.lastLogin || null,
      user.language || 'it'
    );
    return user;
  },

  update: (user: User) => {
    db.prepare(`
      UPDATE users SET
        email = ?, passwordHash = ?, name = ?, role = ?, department = ?,
        phone = ?, photoUrl = ?, isActive = ?, lastLogin = ?, language = ?
      WHERE id = ?
    `).run(
      user.email,
      user.passwordHash,
      user.name,
      user.role,
      user.department || null,
      user.phone || null,
      user.photoUrl || null,
      user.isActive ? 1 : 0,
      user.lastLogin || null,
      user.language || 'it',
      user.id
    );
    return user;
  },

  delete: (id: string) => {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id).changes > 0;
  },
};

// ============ PROJECTS ============
export const projectService = {
  getAll: () => {
    const rows = db.prepare('SELECT * FROM projects').all() as any[];
    return rows.map(row => ({
      ...row,
      isArchived: Boolean(row.isArchived),
      kpis: row.kpis ? JSON.parse(row.kpis) : [],
    } as Project));
  },

  getById: (id: string): Project | undefined => {
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return {
      ...row,
      isArchived: Boolean(row.isArchived),
      kpis: row.kpis ? JSON.parse(row.kpis) : [],
    } as Project;
  },

  create: (project: Project) => {
    db.prepare(`
      INSERT INTO projects (
        id, code, name, description, businessCaseSummary, objectives, scope, constraints, assumptions,
        startDate, endDate, forecastEndDate, budgetPlanned, budgetSpent, budgetForecast,
        sponsor, sponsorId, projectManagerId, department, methodology, stage, statusRAG, priority,
        percentComplete, risksSummary, issuesSummary, dependencies, benefitsSummary, toleranceSummary,
        kpis, successCriteria, resourcesAllocated, isArchived, createdAt, updatedAt, createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      project.id,
      project.code,
      project.name,
      project.description || null,
      project.businessCaseSummary || null,
      project.objectives || null,
      project.scope || null,
      project.constraints || null,
      project.assumptions || null,
      project.startDate,
      project.endDate || null,
      project.forecastEndDate || null,
      project.budgetPlanned,
      project.budgetSpent,
      project.budgetForecast,
      project.sponsor || null,
      project.sponsorId || null,
      project.projectManagerId || null,
      project.department || null,
      project.methodology || null,
      project.stage || null,
      project.statusRAG,
      project.priority,
      project.percentComplete,
      project.risksSummary || null,
      project.issuesSummary || null,
      project.dependencies || null,
      project.benefitsSummary || null,
      project.toleranceSummary || null,
      JSON.stringify(project.kpis || []),
      project.successCriteria || null,
      project.resourcesAllocated || null,
      project.isArchived ? 1 : 0,
      project.createdAt,
      project.updatedAt,
      project.createdBy || null
    );
    return project;
  },

  update: (project: Project) => {
    db.prepare(`
      UPDATE projects SET
        code = ?, name = ?, description = ?, businessCaseSummary = ?, objectives = ?, scope = ?, constraints = ?, assumptions = ?,
        startDate = ?, endDate = ?, forecastEndDate = ?, budgetPlanned = ?, budgetSpent = ?, budgetForecast = ?,
        sponsor = ?, sponsorId = ?, projectManagerId = ?, department = ?, methodology = ?, stage = ?, statusRAG = ?, priority = ?,
        percentComplete = ?, risksSummary = ?, issuesSummary = ?, dependencies = ?, benefitsSummary = ?, toleranceSummary = ?,
        kpis = ?, successCriteria = ?, resourcesAllocated = ?, isArchived = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      project.code,
      project.name,
      project.description || null,
      project.businessCaseSummary || null,
      project.objectives || null,
      project.scope || null,
      project.constraints || null,
      project.assumptions || null,
      project.startDate,
      project.endDate || null,
      project.forecastEndDate || null,
      project.budgetPlanned,
      project.budgetSpent,
      project.budgetForecast,
      project.sponsor || null,
      project.sponsorId || null,
      project.projectManagerId || null,
      project.department || null,
      project.methodology || null,
      project.stage || null,
      project.statusRAG,
      project.priority,
      project.percentComplete,
      project.risksSummary || null,
      project.issuesSummary || null,
      project.dependencies || null,
      project.benefitsSummary || null,
      project.toleranceSummary || null,
      JSON.stringify(project.kpis || []),
      project.successCriteria || null,
      project.resourcesAllocated || null,
      project.isArchived ? 1 : 0,
      project.updatedAt,
      project.id
    );
    return project;
  },

  delete: (id: string) => {
    return db.prepare('DELETE FROM projects WHERE id = ?').run(id).changes > 0;
  },
};

// ============ WEEKLY REPORTS ============
export const reportService = {
  getAll: () => {
    const rows = db.prepare('SELECT * FROM weekly_reports ORDER BY createdAt DESC').all() as any[];
    return rows.map(row => reportService._enrichReport(row));
  },

  getById: (id: string): WeeklyReport | undefined => {
    const row = db.prepare('SELECT * FROM weekly_reports WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return reportService._enrichReport(row);
  },

  getByProjectId: (projectId: string): WeeklyReport[] => {
    const rows = db.prepare('SELECT * FROM weekly_reports WHERE projectId = ? ORDER BY weekStart DESC').all(projectId) as any[];
    return rows.map(row => reportService._enrichReport(row));
  },

  _enrichReport: (row: any): WeeklyReport => {
    const reportId = row.id;
    
    // Load related data
    const activities = db.prepare('SELECT * FROM activities WHERE reportId = ?').all(reportId) as any[];
    const milestones = db.prepare('SELECT * FROM milestones WHERE reportId = ?').all(reportId) as any[];
    const openPoints = db.prepare('SELECT * FROM open_points WHERE reportId = ?').all(reportId) as any[];
    const issues = db.prepare('SELECT * FROM issues WHERE reportId = ?').all(reportId) as any[];
    const risks = db.prepare('SELECT * FROM risks WHERE reportId = ?').all(reportId) as any[];
    const opportunities = db.prepare('SELECT * FROM opportunities WHERE reportId = ?').all(reportId) as any[];
    const changeRequests = db.prepare('SELECT * FROM change_requests WHERE reportId = ?').all(reportId) as any[];

    return {
      ...row,
      autoSaved: Boolean(row.autoSaved),
      activitiesCompleted: activities.filter(a => a.status === 'completed').map(reportService._mapActivity),
      activitiesPlanned: activities.filter(a => a.status !== 'completed').map(reportService._mapActivity),
      milestonesReached: milestones.filter(m => m.status === 'reached').map(reportService._mapMilestone),
      milestonesUpcoming: milestones.filter(m => m.status !== 'reached').map(reportService._mapMilestone),
      openPoints: openPoints.map(reportService._mapOpenPoint),
      issues: issues.map(reportService._mapIssue),
      risks: risks.map(reportService._mapRisk),
      opportunities: opportunities.map(reportService._mapOpportunity),
      changeRequests: changeRequests.map(reportService._mapChangeRequest),
    } as WeeklyReport;
  },

  _mapActivity: (row: any): Activity => ({
    id: row.id,
    description: row.description,
    percentComplete: row.percentComplete || 0,
    plannedEndDate: row.plannedEndDate || undefined,
    actualEndDate: row.actualEndDate || undefined,
    assignee: row.assignee || undefined,
    status: row.status as 'completed' | 'in-progress' | 'planned',
  }),

  _mapMilestone: (row: any): Milestone => ({
    id: row.id,
    name: row.name,
    description: row.description || '',
    projectPhase: row.projectPhase || '',
    plannedEndDate: row.plannedEndDate || row.date,
    originalEndDate: row.originalEndDate || row.date,
    percentComplete: row.percentComplete || 0,
    date: row.date,
    status: row.status as 'reached' | 'upcoming' | 'at-risk' | 'missed',
    reachedDate: row.reachedDate || undefined,
  }),

  _mapOpenPoint: (row: any): OpenPoint => ({
    id: row.id,
    description: row.description,
    openedDate: row.openedDate,
    responsible: row.responsible,
    priority: row.priority as 'Low' | 'Medium' | 'High',
    targetResolutionDate: row.targetResolutionDate || undefined,
    status: row.status as any,
    resolvedDate: row.resolvedDate || undefined,
    notes: row.notes || undefined,
  }),

  _mapIssue: (row: any): Issue => ({
    id: row.id,
    description: row.description,
    impact: row.impact as 'Alto' | 'Medio' | 'Basso',
    correctiveActions: row.correctiveActions || '',
    responsible: row.responsible,
    detectedDate: row.detectedDate,
    targetResolutionDate: row.targetResolutionDate || undefined,
    status: row.status as any,
    resolvedDate: row.resolvedDate || undefined,
    escalationDate: row.escalationDate || undefined,
  }),

  _mapRisk: (row: any): Risk => ({
    id: row.id,
    description: row.description,
    probability: row.probability,
    impact: row.impact,
    riskLevel: row.riskLevel,
    responseStrategy: row.responseStrategy as any,
    contingencyPlan: row.contingencyPlan || '',
    owner: row.owner,
    status: row.status as any,
    identifiedDate: row.identifiedDate,
    closedDate: row.closedDate || undefined,
  }),

  _mapOpportunity: (row: any): Opportunity => ({
    id: row.id,
    description: row.description,
    potentialBenefit: row.potentialBenefit || '',
    requiredActions: row.requiredActions || '',
    responsible: row.responsible,
    decisionTimeline: row.decisionTimeline || '',
    status: row.status as any,
    identifiedDate: row.identifiedDate,
    implementedDate: row.implementedDate || undefined,
  }),

  _mapChangeRequest: (row: any): ChangeRequest => ({
    id: row.id,
    description: row.description,
    requestedBy: row.requestedBy || '',
    impactScope: row.impactScope || '',
    impactTime: row.impactTime || '',
    impactCost: row.impactCost || '',
    requestDate: row.requestDate,
    status: row.status as any,
    approvedBy: row.approvedBy || undefined,
    approvedDate: row.approvedDate || undefined,
  }),

  create: (report: WeeklyReport) => {
    const transaction = db.transaction(() => {
      // Insert report
      db.prepare(`
        INSERT INTO weekly_reports (
          id, projectId, weekStart, weekEnd, reportDate, submittedBy,
          overallRAG, percentComplete, summaryNotes, plannedProgress, actualProgress,
          budgetInitial, budgetSpentToDate, budgetForecast, budgetVariance,
          decisions, lessonsLearned, createdAt, updatedAt, autoSaved
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        report.id,
        report.projectId,
        report.weekStart,
        report.weekEnd,
        report.reportDate,
        report.submittedBy,
        report.overallRAG,
        report.percentComplete,
        report.summaryNotes || null,
        report.plannedProgress,
        report.actualProgress,
        report.budgetInitial,
        report.budgetSpentToDate,
        report.budgetForecast,
        report.budgetVariance,
        report.decisions || null,
        report.lessonsLearned || null,
        report.createdAt,
        report.updatedAt,
        report.autoSaved ? 1 : 0
      );

      // Insert activities
      const insertActivity = db.prepare(`
        INSERT INTO activities (id, reportId, description, percentComplete, plannedEndDate, actualEndDate, assignee, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      [...(report.activitiesCompleted || []), ...(report.activitiesPlanned || [])].forEach(activity => {
        insertActivity.run(
          activity.id,
          report.id,
          activity.description,
          activity.percentComplete || 0,
          activity.plannedEndDate || null,
          activity.actualEndDate || null,
          activity.assignee || null,
          activity.status
        );
      });

      // Insert milestones
      const insertMilestone = db.prepare(`
        INSERT INTO milestones (id, reportId, name, description, projectPhase, plannedEndDate, originalEndDate, percentComplete, date, status, reachedDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      [...(report.milestonesReached || []), ...(report.milestonesUpcoming || [])].forEach(milestone => {
        insertMilestone.run(
          milestone.id,
          report.id,
          milestone.name,
          milestone.description || null,
          milestone.projectPhase || null,
          milestone.plannedEndDate || milestone.date,
          milestone.originalEndDate || milestone.date,
          milestone.percentComplete || 0,
          milestone.date,
          milestone.status,
          milestone.reachedDate || null
        );
      });

      // Insert open points
      const insertOpenPoint = db.prepare(`
        INSERT INTO open_points (id, reportId, description, openedDate, responsible, priority, targetResolutionDate, status, resolvedDate, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      (report.openPoints || []).forEach(op => {
        insertOpenPoint.run(
          op.id,
          report.id,
          op.description,
          op.openedDate,
          op.responsible,
          op.priority,
          op.targetResolutionDate || null,
          op.status,
          op.resolvedDate || null,
          op.notes || null
        );
      });

      // Insert issues
      const insertIssue = db.prepare(`
        INSERT INTO issues (id, reportId, description, impact, correctiveActions, responsible, detectedDate, targetResolutionDate, status, resolvedDate, escalationDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      (report.issues || []).forEach(issue => {
        insertIssue.run(
          issue.id,
          report.id,
          issue.description,
          issue.impact,
          issue.correctiveActions || null,
          issue.responsible,
          issue.detectedDate,
          issue.targetResolutionDate || null,
          issue.status,
          issue.resolvedDate || null,
          issue.escalationDate || null
        );
      });

      // Insert risks
      const insertRisk = db.prepare(`
        INSERT INTO risks (id, reportId, description, probability, impact, riskLevel, responseStrategy, contingencyPlan, owner, status, identifiedDate, closedDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      (report.risks || []).forEach(risk => {
        insertRisk.run(
          risk.id,
          report.id,
          risk.description,
          risk.probability,
          risk.impact,
          risk.riskLevel,
          risk.responseStrategy,
          risk.contingencyPlan || null,
          risk.owner,
          risk.status,
          risk.identifiedDate,
          risk.closedDate || null
        );
      });

      // Insert opportunities
      const insertOpportunity = db.prepare(`
        INSERT INTO opportunities (id, reportId, description, potentialBenefit, requiredActions, responsible, decisionTimeline, status, identifiedDate, implementedDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      (report.opportunities || []).forEach(opp => {
        insertOpportunity.run(
          opp.id,
          report.id,
          opp.description,
          opp.potentialBenefit || null,
          opp.requiredActions || null,
          opp.responsible,
          opp.decisionTimeline || null,
          opp.status,
          opp.identifiedDate,
          opp.implementedDate || null
        );
      });

      // Insert change requests
      const insertChangeRequest = db.prepare(`
        INSERT INTO change_requests (id, reportId, description, requestedBy, impactScope, impactTime, impactCost, requestDate, status, approvedBy, approvedDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      (report.changeRequests || []).forEach(cr => {
        insertChangeRequest.run(
          cr.id,
          report.id,
          cr.description,
          cr.requestedBy || null,
          cr.impactScope || null,
          cr.impactTime || null,
          cr.impactCost || null,
          cr.requestDate,
          cr.status,
          cr.approvedBy || null,
          cr.approvedDate || null
        );
      });
    });

    transaction();
    return report;
  },

  update: (report: WeeklyReport) => {
    const transaction = db.transaction(() => {
      // Update report
      db.prepare(`
        UPDATE weekly_reports SET
          projectId = ?, weekStart = ?, weekEnd = ?, reportDate = ?, submittedBy = ?,
          overallRAG = ?, percentComplete = ?, summaryNotes = ?, plannedProgress = ?, actualProgress = ?,
          budgetInitial = ?, budgetSpentToDate = ?, budgetForecast = ?, budgetVariance = ?,
          decisions = ?, lessonsLearned = ?, updatedAt = ?, autoSaved = ?
        WHERE id = ?
      `).run(
        report.projectId,
        report.weekStart,
        report.weekEnd,
        report.reportDate,
        report.submittedBy,
        report.overallRAG,
        report.percentComplete,
        report.summaryNotes || null,
        report.plannedProgress,
        report.actualProgress,
        report.budgetInitial,
        report.budgetSpentToDate,
        report.budgetForecast,
        report.budgetVariance,
        report.decisions || null,
        report.lessonsLearned || null,
        report.updatedAt,
        report.autoSaved ? 1 : 0,
        report.id
      );

      // Delete existing related data
      db.prepare('DELETE FROM activities WHERE reportId = ?').run(report.id);
      db.prepare('DELETE FROM milestones WHERE reportId = ?').run(report.id);
      db.prepare('DELETE FROM open_points WHERE reportId = ?').run(report.id);
      db.prepare('DELETE FROM issues WHERE reportId = ?').run(report.id);
      db.prepare('DELETE FROM risks WHERE reportId = ?').run(report.id);
      db.prepare('DELETE FROM opportunities WHERE reportId = ?').run(report.id);
      db.prepare('DELETE FROM change_requests WHERE reportId = ?').run(report.id);

      // Re-insert related data (same as create)
      const insertActivity = db.prepare(`
        INSERT INTO activities (id, reportId, description, percentComplete, plannedEndDate, actualEndDate, assignee, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      [...(report.activitiesCompleted || []), ...(report.activitiesPlanned || [])].forEach(activity => {
        insertActivity.run(
          activity.id,
          report.id,
          activity.description,
          activity.percentComplete || 0,
          activity.plannedEndDate || null,
          activity.actualEndDate || null,
          activity.assignee || null,
          activity.status
        );
      });

      const insertMilestone = db.prepare(`
        INSERT INTO milestones (id, reportId, name, description, projectPhase, plannedEndDate, originalEndDate, percentComplete, date, status, reachedDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      [...(report.milestonesReached || []), ...(report.milestonesUpcoming || [])].forEach(milestone => {
        insertMilestone.run(
          milestone.id,
          report.id,
          milestone.name,
          milestone.description || null,
          milestone.projectPhase || null,
          milestone.plannedEndDate || milestone.date,
          milestone.originalEndDate || milestone.date,
          milestone.percentComplete || 0,
          milestone.date,
          milestone.status,
          milestone.reachedDate || null
        );
      });

      const insertOpenPoint = db.prepare(`
        INSERT INTO open_points (id, reportId, description, openedDate, responsible, priority, targetResolutionDate, status, resolvedDate, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      (report.openPoints || []).forEach(op => {
        insertOpenPoint.run(
          op.id,
          report.id,
          op.description,
          op.openedDate,
          op.responsible,
          op.priority,
          op.targetResolutionDate || null,
          op.status,
          op.resolvedDate || null,
          op.notes || null
        );
      });

      const insertIssue = db.prepare(`
        INSERT INTO issues (id, reportId, description, impact, correctiveActions, responsible, detectedDate, targetResolutionDate, status, resolvedDate, escalationDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      (report.issues || []).forEach(issue => {
        insertIssue.run(
          issue.id,
          report.id,
          issue.description,
          issue.impact,
          issue.correctiveActions || null,
          issue.responsible,
          issue.detectedDate,
          issue.targetResolutionDate || null,
          issue.status,
          issue.resolvedDate || null,
          issue.escalationDate || null
        );
      });

      const insertRisk = db.prepare(`
        INSERT INTO risks (id, reportId, description, probability, impact, riskLevel, responseStrategy, contingencyPlan, owner, status, identifiedDate, closedDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      (report.risks || []).forEach(risk => {
        insertRisk.run(
          risk.id,
          report.id,
          risk.description,
          risk.probability,
          risk.impact,
          risk.riskLevel,
          risk.responseStrategy,
          risk.contingencyPlan || null,
          risk.owner,
          risk.status,
          risk.identifiedDate,
          risk.closedDate || null
        );
      });

      const insertOpportunity = db.prepare(`
        INSERT INTO opportunities (id, reportId, description, potentialBenefit, requiredActions, responsible, decisionTimeline, status, identifiedDate, implementedDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      (report.opportunities || []).forEach(opp => {
        insertOpportunity.run(
          opp.id,
          report.id,
          opp.description,
          opp.potentialBenefit || null,
          opp.requiredActions || null,
          opp.responsible,
          opp.decisionTimeline || null,
          opp.status,
          opp.identifiedDate,
          opp.implementedDate || null
        );
      });

      const insertChangeRequest = db.prepare(`
        INSERT INTO change_requests (id, reportId, description, requestedBy, impactScope, impactTime, impactCost, requestDate, status, approvedBy, approvedDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      (report.changeRequests || []).forEach(cr => {
        insertChangeRequest.run(
          cr.id,
          report.id,
          cr.description,
          cr.requestedBy || null,
          cr.impactScope || null,
          cr.impactTime || null,
          cr.impactCost || null,
          cr.requestDate,
          cr.status,
          cr.approvedBy || null,
          cr.approvedDate || null
        );
      });
    });

    transaction();
    return report;
  },

  delete: (id: string) => {
    return db.prepare('DELETE FROM weekly_reports WHERE id = ?').run(id).changes > 0;
  },
};

// ============ NOTIFICATIONS ============
export const notificationService = {
  getAll: () => {
    const rows = db.prepare('SELECT * FROM notifications ORDER BY createdAt DESC').all() as any[];
    return rows.map(row => ({
      ...row,
      read: Boolean(row.read),
    } as Notification));
  },

  getByUserId: (userId: string) => {
    const rows = db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC').all(userId) as any[];
    return rows.map(row => ({
      ...row,
      read: Boolean(row.read),
    } as Notification));
  },

  create: (notification: Notification) => {
    db.prepare(`
      INSERT INTO notifications (id, userId, role, message, type, link, read, createdAt, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      notification.id,
      notification.userId || null,
      notification.role || null,
      notification.message,
      notification.type,
      notification.link || null,
      notification.read ? 1 : 0,
      notification.createdAt,
      notification.priority || 'Medium'
    );
    return notification;
  },

  markAsRead: (id: string) => {
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(id);
  },

  delete: (id: string) => {
    return db.prepare('DELETE FROM notifications WHERE id = ?').run(id).changes > 0;
  },
};

// ============ SESSIONS ============
export const sessionService = {
  create: (id: string, userId: string, expiresAt: string) => {
    db.prepare(`
      INSERT INTO sessions (id, userId, expiresAt, createdAt)
      VALUES (?, ?, ?, ?)
    `).run(id, userId, expiresAt, new Date().toISOString());
  },

  get: (id: string): { userId: string; expiresAt: string } | undefined => {
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return {
      userId: row.userId,
      expiresAt: row.expiresAt,
    };
  },

  delete: (id: string) => {
    return db.prepare('DELETE FROM sessions WHERE id = ?').run(id).changes > 0;
  },

  deleteExpired: () => {
    const now = new Date().toISOString();
    return db.prepare('DELETE FROM sessions WHERE expiresAt < ?').run(now).changes;
  },
};

