import { Router, Request, Response } from 'express';
import { PortfolioMetrics, RAG, Priority } from '../models.js';
import { AuthenticatedRequest, authenticate } from '../middleware/auth.js';
import { projectService, reportService, userService } from '../db-service.js';

export const dashboardRouter = Router();

// Get portfolio metrics
dashboardRouter.get('/metrics', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const projects = projectService.getAll().filter(p => !p.isArchived);
  
  const metrics: PortfolioMetrics = {
    totalProjects: projects.length,
    activeProjects: projects.length,
    projectsByStatus: {
      Green: projects.filter(p => p.statusRAG === 'Green').length,
      Amber: projects.filter(p => p.statusRAG === 'Amber').length,
      Red: projects.filter(p => p.statusRAG === 'Red').length,
    },
    projectsByPriority: {
      Low: projects.filter(p => p.priority === 'Low').length,
      Medium: projects.filter(p => p.priority === 'Medium').length,
      High: projects.filter(p => p.priority === 'High').length,
    },
    totalBudgetAllocated: projects.reduce((sum, p) => sum + p.budgetPlanned, 0),
    totalBudgetSpent: projects.reduce((sum, p) => sum + p.budgetSpent, 0),
    totalBudgetVariance: projects.reduce((sum, p) => sum + (p.budgetForecast - p.budgetPlanned), 0),
    averageProgress: projects.length > 0 
      ? projects.reduce((sum, p) => sum + p.percentComplete, 0) / projects.length 
      : 0,
    highRiskProjects: projects.filter(p => p.statusRAG === 'Red').length,
    criticalIssues: 0, // Will calculate from reports
  };

  // Calculate critical issues from reports
  const reports = reportService.getAll();
  reports.forEach(report => {
    metrics.criticalIssues += report.issues.filter(i => i.impact === 'Alto' && i.status !== 'Risolto').length;
  });

  res.json(metrics);
});

// Get projects with filters
dashboardRouter.get('/projects', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { 
    department, 
    pmId, 
    status, 
    priority, 
    search,
    archived 
  } = req.query;

  let projects = projectService.getAll();

  // Apply filters
  if (department) {
    projects = projects.filter(p => p.department === department);
  }
  if (pmId) {
    projects = projects.filter(p => p.projectManagerId === pmId);
  }
  if (status) {
    projects = projects.filter(p => p.statusRAG === status);
  }
  if (priority) {
    projects = projects.filter(p => p.priority === priority);
  }
  if (search) {
    const searchLower = String(search).toLowerCase();
    projects = projects.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.code?.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    );
  }
  if (archived !== 'true') {
    projects = projects.filter(p => !p.isArchived);
  }

  // Enrich with PM info
  const enrichedProjects = projects.map(project => {
    const pm = project.projectManagerId 
      ? userService.getById(project.projectManagerId)
      : null;
    
    return {
      ...project,
      projectManager: pm ? { id: pm.id, name: pm.name, email: pm.email } : null,
    };
  });

  res.json(enrichedProjects);
});

// Get project timeline data
dashboardRouter.get('/timeline', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const projects = projectService.getAll().filter(p => !p.isArchived);
  
  const timeline = projects.map(p => ({
    id: p.id,
    name: p.name,
    startDate: p.startDate,
    endDate: p.endDate,
    forecastEndDate: p.forecastEndDate,
    statusRAG: p.statusRAG,
    priority: p.priority,
    percentComplete: p.percentComplete,
  }));

  res.json(timeline);
});

// Get risk heatmap data
dashboardRouter.get('/risk-heatmap', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const projects = projectService.getAll().filter(p => !p.isArchived);
  const reports = reportService.getAll();
  
  const heatmap = projects.map(project => {
    const projectReports = reports.filter(r => r.projectId === project.id);
    const allRisks = projectReports.flatMap(r => r.risks);
    const highRiskCount = allRisks.filter(r => r.riskLevel >= 15).length;
    const mediumRiskCount = allRisks.filter(r => r.riskLevel >= 9 && r.riskLevel < 15).length;
    
    return {
      projectId: project.id,
      projectName: project.name,
      statusRAG: project.statusRAG,
      priority: project.priority,
      highRiskCount,
      mediumRiskCount,
      totalRisks: allRisks.length,
      riskScore: allRisks.length > 0 
        ? allRisks.reduce((sum, r) => sum + r.riskLevel, 0) / allRisks.length 
        : 0,
    };
  });

  res.json(heatmap);
});

