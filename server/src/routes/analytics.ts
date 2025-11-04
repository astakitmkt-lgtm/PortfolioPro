import { Router, Request, Response } from 'express';
import { AuthenticatedRequest, authenticate } from '../middleware/auth.js';
import { projectService, reportService } from '../db-service.js';

export const analyticsRouter = Router();

// Get trend analysis
analyticsRouter.get('/trends', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { projectId, metric } = req.query;
  
  if (!projectId) {
    res.status(400).json({ error: 'projectId required' });
    return;
  }

  const reports = reportService.getByProjectId(projectId as string)
    .sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime());

  const trends = reports.map(report => {
    const week = new Date(report.weekStart).toISOString().split('T')[0];
    
    switch (metric) {
      case 'progress':
        return { week, value: report.percentComplete, planned: report.plannedProgress };
      case 'budget':
        return { 
          week, 
          spent: report.budgetSpentToDate, 
          forecast: report.budgetForecast,
          initial: report.budgetInitial,
        };
      case 'risks':
        return { 
          week, 
          count: report.risks.length,
          highRiskCount: report.risks.filter(r => r.riskLevel >= 15).length,
        };
      case 'issues':
        return { 
          week, 
          count: report.issues.length,
          criticalCount: report.issues.filter(i => i.impact === 'Alto').length,
        };
      default:
        return { week, value: report.percentComplete };
    }
  });

  res.json(trends);
});

// Get portfolio distribution
analyticsRouter.get('/distribution', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const projects = projectService.getAll().filter(p => !p.isArchived);
  
  const distribution = {
    byStatus: {
      Green: projects.filter(p => p.statusRAG === 'Green').length,
      Amber: projects.filter(p => p.statusRAG === 'Amber').length,
      Red: projects.filter(p => p.statusRAG === 'Red').length,
    },
    byPriority: {
      Low: projects.filter(p => p.priority === 'Low').length,
      Medium: projects.filter(p => p.priority === 'Medium').length,
      High: projects.filter(p => p.priority === 'High').length,
    },
    byMethodology: {
      PRINCE2: projects.filter(p => p.methodology === 'PRINCE2').length,
      PMI: projects.filter(p => p.methodology === 'PMI').length,
      Hybrid: projects.filter(p => p.methodology === 'Hybrid').length,
      Agile: projects.filter(p => p.methodology === 'Agile').length,
    },
    byDepartment: {} as Record<string, number>,
  };

  projects.forEach(p => {
    if (p.department) {
      distribution.byDepartment[p.department] = (distribution.byDepartment[p.department] || 0) + 1;
    }
  });

  res.json(distribution);
});

// Predictive risk analysis
analyticsRouter.get('/risk-prediction', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const projects = projectService.getAll().filter(p => !p.isArchived);
  const reports = reportService.getAll();

  const predictions = projects.map(project => {
    const projectReports = reports
      .filter(r => r.projectId === project.id)
      .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime())
      .slice(0, 4); // Last 4 weeks

    if (projectReports.length === 0) {
      return {
        projectId: project.id,
        projectName: project.name,
        riskTrend: 'stable',
        predictedRiskLevel: project.statusRAG === 'Red' ? 'high' : 'medium',
        confidence: 0,
      };
    }

    // Calculate trend
    const recentRisks = projectReports.flatMap(r => r.risks);
    const avgRiskLevel = recentRisks.length > 0
      ? recentRisks.reduce((sum, r) => sum + r.riskLevel, 0) / recentRisks.length
      : 0;

    const olderReports = projectReports.slice(2);
    const olderRisks = olderReports.flatMap(r => r.risks);
    const olderAvgRisk = olderRisks.length > 0
      ? olderRisks.reduce((sum, r) => sum + r.riskLevel, 0) / olderRisks.length
      : 0;

    const riskTrend = avgRiskLevel > olderAvgRisk * 1.2 ? 'increasing' 
      : avgRiskLevel < olderAvgRisk * 0.8 ? 'decreasing' 
      : 'stable';

    return {
      projectId: project.id,
      projectName: project.name,
      riskTrend,
      currentRiskLevel: avgRiskLevel,
      predictedRiskLevel: riskTrend === 'increasing' ? 'high' : riskTrend === 'decreasing' ? 'low' : 'medium',
      confidence: Math.min(projectReports.length / 4, 1),
    };
  });

  res.json(predictions);
});

