import { Router, Request, Response } from 'express';
import { generateId, WeeklyReport, Risk } from '../models.js';
import { AuthenticatedRequest, authenticate } from '../middleware/auth.js';
import { calculateRiskLevel, calculateBudgetVariance } from '../models.js';
import { reportService, projectService } from '../db-service.js';

export const reportsRouter = Router();

// Get all reports
reportsRouter.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const reports = reportService.getAll();
  res.json(reports);
});

// Get reports for a project
reportsRouter.get('/project/:projectId', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.params;
  const reports = reportService.getByProjectId(projectId);
  res.json(reports);
});

// Get single report
reportsRouter.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const report = reportService.getById(req.params.id);
  if (!report) {
    res.status(404).json({ error: 'Report non trovato' });
    return;
  }
  res.json(report);
});

// Create or update report
reportsRouter.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non autenticato' });
    return;
  }

  const body = req.body as Partial<WeeklyReport>;
  if (!body.projectId) {
    res.status(400).json({ error: 'projectId richiesto' });
    return;
  }

  const now = new Date().toISOString();
  
  // If an ID is provided, check if report exists and update it
  let existingReport: WeeklyReport | undefined;
  if (body.id) {
    existingReport = reportService.getById(body.id);
  } else {
    // Try to find existing report for the same project and week
    const weekStart = body.weekStart || now;
    const reports = reportService.getByProjectId(body.projectId);
    existingReport = reports.find(r => r.weekStart === weekStart);
  }
  
  const id = existingReport?.id || body.id || generateId();

  // Calculate risk levels for all risks
  const risks: Risk[] = (body.risks || []).map(r => ({
    ...r,
    riskLevel: calculateRiskLevel(r.probability, r.impact),
  }));

  // Get project budget
  const projectForBudget = projectService.getById(body.projectId);
  const budgetInitial = body.budgetInitial ?? projectForBudget?.budgetPlanned ?? 0;
  const budgetSpent = body.budgetSpentToDate ?? 0;
  const budgetForecast = body.budgetForecast ?? budgetInitial;
  const budgetVariance = calculateBudgetVariance(budgetInitial, budgetSpent, budgetForecast);

  // If updating existing report, merge with existing data
  const report: WeeklyReport = existingReport ? {
    ...existingReport,
    ...body,
    id, // Keep the same ID
    projectId: body.projectId,
    weekStart: body.weekStart || existingReport.weekStart,
    weekEnd: body.weekEnd || existingReport.weekEnd,
    reportDate: body.reportDate || existingReport.reportDate || now,
    submittedBy: body.submittedBy || existingReport.submittedBy || req.user.id,
    
    overallRAG: body.overallRAG !== undefined ? body.overallRAG : existingReport.overallRAG,
    percentComplete: body.percentComplete !== undefined ? body.percentComplete : existingReport.percentComplete,
    summaryNotes: body.summaryNotes !== undefined ? body.summaryNotes : existingReport.summaryNotes,
    plannedProgress: body.plannedProgress !== undefined ? body.plannedProgress : (body.percentComplete !== undefined ? body.percentComplete : existingReport.plannedProgress),
    actualProgress: body.actualProgress !== undefined ? body.actualProgress : (body.percentComplete !== undefined ? body.percentComplete : existingReport.actualProgress),
    
    activitiesCompleted: body.activitiesCompleted !== undefined ? body.activitiesCompleted : existingReport.activitiesCompleted,
    activitiesPlanned: body.activitiesPlanned !== undefined ? body.activitiesPlanned : existingReport.activitiesPlanned,
    milestonesReached: body.milestonesReached !== undefined ? body.milestonesReached : existingReport.milestonesReached,
    milestonesUpcoming: body.milestonesUpcoming !== undefined ? body.milestonesUpcoming : existingReport.milestonesUpcoming,
    
    openPoints: body.openPoints !== undefined ? body.openPoints : existingReport.openPoints,
    issues: body.issues !== undefined ? body.issues : existingReport.issues,
    risks: risks.length > 0 ? risks : existingReport.risks,
    opportunities: body.opportunities !== undefined ? body.opportunities : existingReport.opportunities,
    
    budgetInitial: body.budgetInitial !== undefined ? body.budgetInitial : existingReport.budgetInitial,
    budgetSpentToDate: body.budgetSpentToDate !== undefined ? budgetSpent : existingReport.budgetSpentToDate,
    budgetForecast: body.budgetForecast !== undefined ? budgetForecast : existingReport.budgetForecast,
    budgetVariance,
    
    changeRequests: body.changeRequests !== undefined ? body.changeRequests : existingReport.changeRequests,
    
    decisions: body.decisions !== undefined ? body.decisions : existingReport.decisions,
    lessonsLearned: body.lessonsLearned !== undefined ? body.lessonsLearned : existingReport.lessonsLearned,
    createdAt: existingReport.createdAt, // Keep original creation date
    updatedAt: now,
    autoSaved: body.autoSaved !== undefined ? body.autoSaved : existingReport.autoSaved,
  } : {
    id,
    projectId: body.projectId,
    weekStart: body.weekStart || now,
    weekEnd: body.weekEnd || now,
    reportDate: body.reportDate || now,
    submittedBy: body.submittedBy || req.user.id,
    
    overallRAG: body.overallRAG || 'Green',
    percentComplete: body.percentComplete || 0,
    summaryNotes: body.summaryNotes || '',
    plannedProgress: body.plannedProgress || body.percentComplete || 0,
    actualProgress: body.actualProgress || body.percentComplete || 0,
    
    activitiesCompleted: body.activitiesCompleted || [],
    activitiesPlanned: body.activitiesPlanned || [],
    milestonesReached: body.milestonesReached || [],
    milestonesUpcoming: body.milestonesUpcoming || [],
    
    openPoints: body.openPoints || [],
    issues: body.issues || [],
    risks: risks,
    opportunities: body.opportunities || [],
    
    budgetInitial,
    budgetSpentToDate: budgetSpent,
    budgetForecast,
    budgetVariance,
    
    changeRequests: body.changeRequests || [],
    
    decisions: body.decisions || '',
    lessonsLearned: body.lessonsLearned || '',
    createdAt: now,
    updatedAt: now,
    autoSaved: body.autoSaved || false,
  };

  if (existingReport) {
    reportService.update(report);
  } else {
    reportService.create(report);
  }
  
  // Update project statusRAG and percentComplete based on report
  const project = projectService.getById(body.projectId);
  if (project && report.overallRAG) {
    project.statusRAG = report.overallRAG;
    if (report.percentComplete !== undefined) {
      project.percentComplete = report.percentComplete;
    }
    project.updatedAt = new Date().toISOString();
    projectService.update(project);
  }
  
  res.status(existingReport ? 200 : 201).json(report);
});

// Update report (partial update)
reportsRouter.put('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non autenticato' });
    return;
  }

  const existing = reportService.getById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Report non trovato' });
    return;
  }

  // Check permissions
  if (existing.submittedBy !== req.user.id && 
      req.user.role !== 'Admin' && 
      req.user.role !== 'PortfolioManager') {
    res.status(403).json({ error: 'Permessi insufficienti' });
    return;
  }

  const body = req.body as Partial<WeeklyReport>;
  
  // Recalculate risk levels if risks are updated
  if (body.risks) {
    body.risks = body.risks.map(r => ({
      ...r,
      riskLevel: calculateRiskLevel(r.probability, r.impact),
    }));
  }

  // Recalculate budget variance if budget fields are updated
  if (body.budgetInitial !== undefined || body.budgetSpentToDate !== undefined || body.budgetForecast !== undefined) {
    const budgetInitial = body.budgetInitial ?? existing.budgetInitial;
    const budgetSpent = body.budgetSpentToDate ?? existing.budgetSpentToDate;
    const budgetForecast = body.budgetForecast ?? existing.budgetForecast;
    body.budgetVariance = calculateBudgetVariance(budgetInitial, budgetSpent, budgetForecast);
  }

  const updated: WeeklyReport = {
    ...existing,
    ...body,
    updatedAt: new Date().toISOString(),
  };

  reportService.update(updated);
  res.json(updated);
});

// Delete report
reportsRouter.delete('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non autenticato' });
    return;
  }

  const report = reportService.getById(req.params.id);
  if (!report) {
    res.status(404).json({ error: 'Report non trovato' });
    return;
  }

  // Check permissions
  if (report.submittedBy !== req.user.id && 
      req.user.role !== 'Admin' && 
      req.user.role !== 'PortfolioManager') {
    res.status(403).json({ error: 'Permessi insufficienti' });
    return;
  }

  reportService.delete(req.params.id);
  res.status(204).send();
});

// Auto-save report (partial save)
reportsRouter.post('/:id/autosave', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non autenticato' });
    return;
  }

  const existing = reportService.getById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Report non trovato' });
    return;
  }

  const body = req.body as Partial<WeeklyReport>;
  
  // Only update provided fields
  const updated: WeeklyReport = {
    ...existing,
    ...body,
    autoSaved: true,
    updatedAt: new Date().toISOString(),
  };

  // Recalculate if needed
  if (updated.risks) {
    updated.risks = updated.risks.map(r => ({
      ...r,
      riskLevel: calculateRiskLevel(r.probability, r.impact),
    }));
  }

  reportService.update(updated);
  
  // Update project statusRAG based on report overallRAG
  const project = projectService.getById(updated.projectId);
  if (project && updated.overallRAG) {
    project.statusRAG = updated.overallRAG;
    if (updated.percentComplete !== undefined) {
      project.percentComplete = updated.percentComplete;
    }
    project.updatedAt = new Date().toISOString();
    projectService.update(project);
  }
  
  res.json({ success: true, autoSaved: true });
});
