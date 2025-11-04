// Seed data for development/testing
import { Project, WeeklyReport } from './models.js';
import { createUser } from './auth.js';
import { generateId } from './models.js';
import { userService, projectService, reportService } from './db-service.js';

export const seedDatabase = () => {
  // Check if users already exist (avoid duplicate seeding)
  const existingUsers = userService.getAll();
  if (existingUsers.length > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  // Create admin user
  const admin = createUser('admin@portfoliopro.com', 'admin123', 'Admin User', 'Admin');
  admin.department = 'IT';
  userService.create(admin);

  // Create portfolio manager
  const pm = createUser('portfoliomanager@portfoliopro.com', 'pm123', 'Portfolio Manager', 'PortfolioManager');
  pm.department = 'Operations';
  userService.create(pm);

  // Create project managers
  const pm1 = createUser('pm1@portfoliopro.com', 'pm123', 'Mario Rossi', 'ProjectManager');
  pm1.department = 'IT';
  userService.create(pm1);

  const pm2 = createUser('pm2@portfoliopro.com', 'pm123', 'Luigi Bianchi', 'ProjectManager');
  pm2.department = 'Marketing';
  userService.create(pm2);

  // Create stakeholder
  const stakeholder = createUser('stakeholder@portfoliopro.com', 'stake123', 'Stakeholder User', 'Stakeholder');
  userService.create(stakeholder);

  // Create sample projects
  const now = new Date().toISOString();
  const project1: Project = {
    id: 'proj_1',
    code: 'PRJ-001',
    name: 'Digital Transformation',
    description: 'Progetto di trasformazione digitale aziendale',
    businessCaseSummary: 'Migliorare efficienza operativa',
    objectives: 'Digitalizzare processi core',
    scope: 'Sistemi ERP e CRM',
    constraints: 'Budget limitato',
    assumptions: 'Team disponibile',
    startDate: now,
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    budgetPlanned: 500000,
    budgetSpent: 150000,
    budgetForecast: 520000,
    sponsor: 'CEO',
    sponsorId: stakeholder.id,
    projectManagerId: pm1.id,
    department: 'IT',
    methodology: 'Hybrid',
    stage: 'Execution',
    statusRAG: 'Green',
    priority: 'High',
    percentComplete: 30,
    risksSummary: 'Rischi tecnologici moderati',
    issuesSummary: 'Nessun problema critico',
    dependencies: 'Fornitore esterno',
    benefitsSummary: 'ROI positivo in 2 anni',
    toleranceSummary: 'Budget ±10%',
    kpis: ['Completion rate', 'Budget adherence', 'User satisfaction'],
    successCriteria: 'Deploy entro Q2 2024',
    resourcesAllocated: '5 developers, 2 PM',
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    createdBy: admin.id,
  };

  const project2: Project = {
    id: 'proj_2',
    code: 'PRJ-002',
    name: 'Website Redesign',
    description: 'Rinnovamento completo del sito web aziendale',
    businessCaseSummary: 'Migliorare user experience',
    objectives: 'Modernizzare interfaccia',
    scope: 'Design e sviluppo frontend',
    constraints: 'Timeline stretta',
    assumptions: 'Contenuti pronti',
    startDate: now,
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    budgetPlanned: 200000,
    budgetSpent: 80000,
    budgetForecast: 210000,
    sponsor: 'CMO',
    projectManagerId: pm2.id,
    department: 'Marketing',
    methodology: 'Agile',
    stage: 'Planning',
    statusRAG: 'Amber',
    priority: 'Medium',
    percentComplete: 15,
    risksSummary: 'Ritardi possibili',
    issuesSummary: 'Feedback lenti dal cliente',
    dependencies: 'Design agency',
    benefitsSummary: 'Aumento traffico +30%',
    toleranceSummary: 'Budget ±5%',
    kpis: ['Page load time', 'Conversion rate'],
    successCriteria: 'Launch entro marzo 2024',
    resourcesAllocated: '3 designers, 2 developers',
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    createdBy: pm.id,
  };

  projectService.create(project1);
  projectService.create(project2);

  // Create sample weekly reports
  const report1Id = generateId();
  const report1: WeeklyReport = {
    id: report1Id,
    projectId: project1.id,
    weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last week
    weekEnd: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reportDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    submittedBy: pm1.id,
    overallRAG: 'Red',
    percentComplete: 30,
    summaryNotes: 'Il progetto sta procedendo con alcune difficoltà tecniche. È necessario un intervento urgente per risolvere i problemi di integrazione.',
    plannedProgress: 35,
    actualProgress: 30,
    activitiesCompleted: [
      {
        id: generateId(),
        description: 'Analisi requisiti completata',
        percentComplete: 100,
        status: 'completed',
        plannedEndDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actualEndDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignee: pm1.id,
      },
    ],
    activitiesPlanned: [
      {
        id: generateId(),
        description: 'Implementazione modulo integrazione',
        percentComplete: 60,
        status: 'in-progress',
        plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignee: pm1.id,
      },
    ],
    milestonesReached: [],
    milestonesUpcoming: [
      {
        id: generateId(),
        name: 'Milestone 1: Core Module',
        description: 'Completamento modulo principale',
        projectPhase: 'Sviluppo',
        plannedEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        originalEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        percentComplete: 45,
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'upcoming',
      },
    ],
    openPoints: [
      {
        id: generateId(),
        description: 'Problema di integrazione con sistema legacy',
        openedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        responsible: pm1.id,
        priority: 'High',
        targetResolutionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Escalation',
      },
    ],
    issues: [
      {
        id: generateId(),
        description: 'Ritardo nella consegna da parte del fornitore',
        impact: 'Alto',
        correctiveActions: 'Contattare fornitore e valutare alternative',
        responsible: pm1.id,
        detectedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        targetResolutionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Escalation',
      },
    ],
    risks: [
      {
        id: generateId(),
        description: 'Rischio di sovraccosto per ritardi',
        probability: 4,
        impact: 4,
        riskLevel: 16,
        responseStrategy: 'Mitigazione',
        contingencyPlan: 'Budget di riserva disponibile',
        owner: pm1.id,
        status: 'Monitorato',
        identifiedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ],
    opportunities: [],
    budgetInitial: 500000,
    budgetSpentToDate: 150000,
    budgetForecast: 520000,
    budgetVariance: 20000,
    changeRequests: [],
    decisions: 'Approvato cambio fornitore per modulo integrazione',
    lessonsLearned: 'Importante coinvolgere team tecnico fin dall\'inizio',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    autoSaved: false,
  };

  const report2Id = generateId();
  const report2: WeeklyReport = {
    id: report2Id,
    projectId: project2.id,
    weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    weekEnd: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reportDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    submittedBy: pm2.id,
    overallRAG: 'Amber',
    percentComplete: 15,
    summaryNotes: 'Progetto in fase di pianificazione. Alcuni ritardi nella definizione dei requisiti.',
    plannedProgress: 20,
    actualProgress: 15,
    activitiesCompleted: [],
    activitiesPlanned: [
      {
        id: generateId(),
        description: 'Definizione wireframe',
        percentComplete: 80,
        status: 'in-progress',
        plannedEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignee: pm2.id,
      },
    ],
    milestonesReached: [],
    milestonesUpcoming: [
      {
        id: generateId(),
        name: 'Design Approval',
        description: 'Approvazione design finale',
        projectPhase: 'Design',
        plannedEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        originalEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        percentComplete: 60,
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'upcoming',
      },
    ],
    openPoints: [
      {
        id: generateId(),
        description: 'In attesa di feedback dal cliente sui mockup',
        openedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        responsible: pm2.id,
        priority: 'Medium',
        targetResolutionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'In attesa',
      },
    ],
    issues: [],
    risks: [
      {
        id: generateId(),
        description: 'Ritardo possibile nella consegna contenuti',
        probability: 3,
        impact: 3,
        riskLevel: 9,
        responseStrategy: 'Mitigazione',
        contingencyPlan: 'Template di contenuti predefiniti',
        owner: pm2.id,
        status: 'Identificato',
        identifiedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ],
    opportunities: [],
    budgetInitial: 200000,
    budgetSpentToDate: 80000,
    budgetForecast: 210000,
    budgetVariance: 10000,
    changeRequests: [],
    decisions: '',
    lessonsLearned: '',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    autoSaved: false,
  };

  reportService.create(report1);
  reportService.create(report2);

  // Update project statusRAG based on latest report
  project1.statusRAG = report1.overallRAG;
  project2.statusRAG = report2.overallRAG;
  projectService.update(project1);
  projectService.update(project2);

  console.log('Database seeded with sample data:');
  console.log(`  - ${userService.getAll().length} users`);
  console.log(`  - ${projectService.getAll().length} projects`);
  console.log(`  - ${reportService.getAll().length} reports`);
};

