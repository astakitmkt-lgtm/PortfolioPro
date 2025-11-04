import { Router, Request, Response } from 'express';
import { generateId, Project } from '../models.js';
import { AuthenticatedRequest, authenticate } from '../middleware/auth.js';
import { projectService } from '../db-service.js';

export const projectsRouter = Router();

projectsRouter.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const projects = projectService.getAll().filter(p => !p.isArchived);
  res.json(projects);
});

projectsRouter.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const project = projectService.getById(req.params.id);
  if (!project) {
    res.status(404).json({ error: 'Progetto non trovato' });
    return;
  }
  res.json(project);
});

projectsRouter.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non autenticato' });
    return;
  }

  const now = new Date().toISOString();
  const body = req.body as Partial<Project>;
  const id = generateId();
  
  const project: Project = {
    id,
    code: body.code || `PRJ-${Date.now().toString().slice(-6)}`,
    name: body.name ?? 'Untitled Project',
    description: body.description ?? '',
    businessCaseSummary: body.businessCaseSummary ?? '',
    objectives: body.objectives ?? '',
    scope: body.scope ?? '',
    constraints: body.constraints ?? '',
    assumptions: body.assumptions ?? '',
    startDate: body.startDate ?? now,
    endDate: body.endDate,
    forecastEndDate: body.forecastEndDate,
    budgetPlanned: Number(body.budgetPlanned ?? 0),
    budgetSpent: Number(body.budgetSpent ?? 0),
    budgetForecast: Number(body.budgetForecast ?? body.budgetPlanned ?? 0),
    sponsor: body.sponsor ?? '',
    sponsorId: body.sponsorId,
    projectManagerId: body.projectManagerId,
    department: body.department,
    methodology: body.methodology ?? 'Hybrid',
    stage: body.stage ?? 'Initiation',
    statusRAG: body.statusRAG ?? 'Green',
    risksSummary: body.risksSummary ?? '',
    issuesSummary: body.issuesSummary ?? '',
    dependencies: body.dependencies ?? '',
    benefitsSummary: body.benefitsSummary ?? '',
    toleranceSummary: body.toleranceSummary ?? '',
    priority: body.priority ?? 'Medium',
    percentComplete: Number(body.percentComplete ?? 0),
    kpis: body.kpis || [],
    successCriteria: body.successCriteria || '',
    resourcesAllocated: body.resourcesAllocated || '',
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    createdBy: req.user.id,
  };
  
  projectService.create(project);
  res.status(201).json(project);
});

projectsRouter.put('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non autenticato' });
    return;
  }

  const current = projectService.getById(req.params.id);
  if (!current) {
    res.status(404).json({ error: 'Progetto non trovato' });
    return;
  }

  // Check permissions
  if (current.createdBy !== req.user.id && 
      req.user.role !== 'Admin' && 
      req.user.role !== 'PortfolioManager' &&
      (req.user.role !== 'ProjectManager' || current.projectManagerId !== req.user.id)) {
    res.status(403).json({ error: 'Permessi insufficienti' });
    return;
  }

  const body = req.body as Partial<Project>;
  const updated: Project = { 
    ...current, 
    ...body,
    updatedAt: new Date().toISOString(),
  };
  
  projectService.update(updated);
  res.json(updated);
});

projectsRouter.delete('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non autenticato' });
    return;
  }

  const project = projectService.getById(req.params.id);
  if (!project) {
    res.status(404).json({ error: 'Progetto non trovato' });
    return;
  }

  // Check permissions
  if (req.user.role !== 'Admin' && req.user.role !== 'PortfolioManager') {
    res.status(403).json({ error: 'Solo Admin e Portfolio Manager possono eliminare progetti' });
    return;
  }

  // Archive instead of delete
  project.isArchived = true;
  project.updatedAt = new Date().toISOString();
  projectService.update(project);
  
  res.status(204).send();
});

// Duplicate project
projectsRouter.post('/:id/duplicate', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non autenticato' });
    return;
  }

  const source = projectService.getById(req.params.id);
  if (!source) {
    res.status(404).json({ error: 'Progetto non trovato' });
    return;
  }

  const now = new Date().toISOString();
  const id = generateId();
  
  const duplicated: Project = {
    ...source,
    id,
    code: `COPY-${source.code}`,
    name: `${source.name} (Copia)`,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    createdBy: req.user.id,
  };

  projectService.create(duplicated);
  res.status(201).json(duplicated);
});
