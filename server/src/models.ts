// Domain models aligned with PRINCE2/PMI essentials - Enhanced Portfolio Management

export type RAG = 'Red' | 'Amber' | 'Green';
export type UserRole = 'Admin' | 'PortfolioManager' | 'ProjectManager' | 'Stakeholder';
export type Priority = 'Low' | 'Medium' | 'High';
export type IssueStatus = 'Nuovo' | 'In analisi' | 'In risoluzione' | 'Risolto' | 'Escalation';
export type RiskStatus = 'Identificato' | 'Monitorato' | 'Verificato' | 'Chiuso';
export type RiskResponse = 'Mitigazione' | 'Trasferimento' | 'Accettazione' | 'Evitamento';
export type OpportunityStatus = 'Identificata' | 'In valutazione' | 'Approvata' | 'Implementata' | 'Rifiutata';
export type ChangeRequestStatus = 'Richiesta' | 'In valutazione' | 'Approvata' | 'Rifiutata';
export type OpenPointStatus = 'Nuovo' | 'In corso' | 'In attesa' | 'Risolto' | 'Escalation';

// User Management
export interface User {
  id: string;
  email: string;
  passwordHash: string; // In production, use bcrypt
  name: string;
  role: UserRole;
  department?: string;
  phone?: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  language: 'it' | 'en';
}

// Project Management
export interface Project {
  id: string;
  code: string; // Project code/identifier
  name: string;
  description: string;
  businessCaseSummary: string;
  objectives: string;
  scope: string;
  constraints: string;
  assumptions: string;
  startDate: string;
  endDate?: string;
  forecastEndDate?: string;
  budgetPlanned: number;
  budgetSpent: number;
  budgetForecast: number;
  sponsor: string;
  sponsorId?: string; // User ID
  projectManagerId?: string;
  department?: string;
  methodology: 'PRINCE2' | 'PMI' | 'Hybrid' | 'Agile';
  stage: string;
  statusRAG: RAG;
  priority: Priority;
  percentComplete: number;
  risksSummary: string;
  issuesSummary: string;
  dependencies: string;
  benefitsSummary: string;
  toleranceSummary: string;
  kpis: string[]; // Key Performance Indicators
  successCriteria: string;
  resourcesAllocated: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

// Weekly Report - Complete Structure
export interface WeeklyReport {
  id: string;
  projectId: string;
  weekStart: string; // ISO date (Monday)
  weekEnd: string; // ISO date (Sunday)
  reportDate: string; // When report was created
  submittedBy: string; // User ID
  
  // Base Status
  overallRAG: RAG;
  percentComplete: number;
  summaryNotes: string;
  plannedProgress: number; // Planned % for comparison
  actualProgress: number; // Actual % achieved
  
  // Activities
  activitiesCompleted: Activity[];
  activitiesPlanned: Activity[];
  milestonesReached: Milestone[];
  milestonesUpcoming: Milestone[];
  
  // Open Points
  openPoints: OpenPoint[];
  
  // Issues
  issues: Issue[];
  
  // Risks
  risks: Risk[];
  
  // Opportunities
  opportunities: Opportunity[];
  
  // Budget Status
  budgetInitial: number;
  budgetSpentToDate: number;
  budgetForecast: number;
  budgetVariance: number; // Calculated
  
  // Change Requests
  changeRequests: ChangeRequest[];
  
  // Additional fields
  decisions: string;
  lessonsLearned: string;
  createdAt: string;
  updatedAt: string;
  autoSaved: boolean;
}

export interface Activity {
  id: string;
  description: string;
  completedDate?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  assignee?: string; // User ID
  status: 'completed' | 'in-progress' | 'planned';
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  projectPhase: string;
  plannedEndDate: string;
  originalEndDate: string;
  percentComplete: number;
  date: string;
  status: 'reached' | 'upcoming' | 'at-risk' | 'missed';
  reachedDate?: string;
}

export interface OpenPoint {
  id: string;
  description: string;
  openedDate: string;
  responsible: string; // User ID
  priority: Priority;
  targetResolutionDate?: string;
  status: OpenPointStatus;
  resolvedDate?: string;
  notes?: string;
}

export interface Issue {
  id: string;
  description: string;
  impact: 'Alto' | 'Medio' | 'Basso';
  correctiveActions: string;
  responsible: string; // User ID
  detectedDate: string;
  targetResolutionDate?: string;
  status: IssueStatus;
  resolvedDate?: string;
  escalationDate?: string;
}

export interface Risk {
  id: string;
  description: string;
  probability: number; // 1-5
  impact: number; // 1-5
  riskLevel: number; // probability × impact (calculated)
  responseStrategy: RiskResponse;
  contingencyPlan: string;
  owner: string; // User ID
  status: RiskStatus;
  identifiedDate: string;
  closedDate?: string;
}

export interface Opportunity {
  id: string;
  description: string;
  potentialBenefit: string;
  requiredActions: string;
  responsible: string; // User ID
  decisionTimeline: string;
  status: OpportunityStatus;
  identifiedDate: string;
  implementedDate?: string;
}

export interface ChangeRequest {
  id: string;
  description: string;
  requestedBy: string; // User ID
  impactScope: string;
  impactTimeline: string;
  impactCost: string;
  requestDate: string;
  status: ChangeRequestStatus;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
}

// Document Management
export interface Document {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  category: 'Contract' | 'Deliverable' | 'MeetingMinutes' | 'Report' | 'Other';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  version: number;
  uploadedBy: string; // User ID
  uploadedAt: string;
  isLatest: boolean;
  previousVersionId?: string;
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  type: 'report_due' | 'project_critical' | 'risk_high' | 'open_point_due' | 'system';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  priority: Priority;
}

// Analytics & Reporting
export interface PortfolioMetrics {
  totalProjects: number;
  activeProjects: number;
  projectsByStatus: { [key in RAG]: number };
  projectsByPriority: { [key in Priority]: number };
  totalBudgetAllocated: number;
  totalBudgetSpent: number;
  totalBudgetVariance: number;
  averageProgress: number;
  highRiskProjects: number;
  criticalIssues: number;
}

// In-memory database (replace with real DB in production)
export const db = {
  users: new Map<string, User>(),
  projects: new Map<string, Project>(),
  reports: new Map<string, WeeklyReport>(),
  documents: new Map<string, Document>(),
  notifications: new Map<string, Notification>(),
};

// Helper functions
export const generateId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const calculateRiskLevel = (probability: number, impact: number): number => {
  return probability * impact;
};

export const calculateBudgetVariance = (planned: number, spent: number, forecast: number): number => {
  return forecast - planned;
};
