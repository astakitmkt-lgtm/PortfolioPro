import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReportSection } from '../components/ReportSection';

interface Activity {
  id: string;
  description: string;
  percentComplete: number;
  plannedEndDate?: string;
  actualEndDate?: string;
  assignee?: string;
  status: 'completed' | 'in-progress' | 'planned';
}

interface Milestone {
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

interface OpenPoint {
  id: string;
  description: string;
  openedDate: string;
  responsible: string;
  priority: 'Low' | 'Medium' | 'High';
  targetResolutionDate?: string;
  status: 'Nuovo' | 'In corso' | 'In attesa' | 'Risolto' | 'Escalation';
  resolvedDate?: string;
  notes?: string;
}

interface Issue {
  id: string;
  description: string;
  impact: 'Alto' | 'Medio' | 'Basso';
  correctiveActions: string;
  responsible: string;
  detectedDate: string;
  targetResolutionDate?: string;
  status: 'Nuovo' | 'In analisi' | 'In risoluzione' | 'Risolto' | 'Escalation';
  resolvedDate?: string;
  escalationDate?: string;
}

interface Risk {
  id: string;
  description: string;
  probability: number;
  impact: number;
  riskLevel: number;
  responseStrategy: 'Mitigazione' | 'Trasferimento' | 'Accettazione' | 'Evitamento';
  contingencyPlan: string;
  owner: string;
  status: 'Identificato' | 'Monitorato' | 'Verificato' | 'Chiuso' | 'Escalation';
  identifiedDate: string;
  closedDate?: string;
}

interface Opportunity {
  id: string;
  description: string;
  potentialBenefit: string;
  requiredActions: string;
  responsible: string;
  decisionTimeline: string;
  status: 'Identificata' | 'In valutazione' | 'Approvata' | 'Implementata' | 'Rifiutata' | 'Escalation';
  identifiedDate: string;
  implementedDate?: string;
}

interface ChangeRequest {
  id: string;
  description: string;
  requestedBy: string;
  impactScope: string;
  impactTimeline: string;
  impactCost: string;
  requestDate: string;
  status: 'Richiesta' | 'In valutazione' | 'Approvata' | 'Rifiutata';
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
}

export function WeeklyReport() {
  const { projectId } = useParams();
  const { sessionId, user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [availableReports, setAvailableReports] = useState<Array<{ id: string; weekStart: string; weekEnd: string; createdAt: string; autoSaved?: boolean }>>([]);
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>('');
  
  // Base Status
  const [overallRAG, setOverallRAG] = useState<'Red' | 'Amber' | 'Green'>('Green');
  const [percentComplete, setPercentComplete] = useState(0);
  const [summaryNotes, setSummaryNotes] = useState('');
  const [plannedProgress, setPlannedProgress] = useState(0);
  const [actualProgress, setActualProgress] = useState(0);
  
  // Activities
  const [activitiesInProgress, setActivitiesInProgress] = useState<Activity[]>([]);
  const [activitiesCompleted, setActivitiesCompleted] = useState<Activity[]>([]);
  const [milestonesReached, setMilestonesReached] = useState<Milestone[]>([]);
  const [milestonesUpcoming, setMilestonesUpcoming] = useState<Milestone[]>([]);
  
  // Open Points
  const [openPoints, setOpenPoints] = useState<OpenPoint[]>([]);
  
  // Issues
  const [issues, setIssues] = useState<Issue[]>([]);
  
  // Risks
  const [risks, setRisks] = useState<Risk[]>([]);
  
  // Opportunities
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  
  // Budget
  const [budgetInitial, setBudgetInitial] = useState(0);
  const [budgetSpentToDate, setBudgetSpentToDate] = useState(0);
  const [budgetForecast, setBudgetForecast] = useState(0);
  
  // Change Requests
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  
  // Additional
  const [decisions, setDecisions] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  
  // Users list for dropdowns
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);

  useEffect(() => {
    if (projectId && sessionId) {
      loadProject();
      loadExistingReport();
      loadUsers();
    }
  }, [projectId, sessionId]);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/managers/users', {
        headers: { Authorization: `Bearer ${sessionId}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.name} (${user.email})` : userId;
  };

  const loadProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${sessionId}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        setBudgetInitial(data.budgetPlanned || 0);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const loadAvailableReports = async () => {
    try {
      const res = await fetch(`/api/reports/project/${projectId}`, {
        headers: { Authorization: `Bearer ${sessionId}` },
      });
      if (res.ok) {
        const reports = await res.json();
        // Sort by weekStart descending (most recent first)
        const sortedReports = reports.sort((a: any, b: any) => 
          new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
        );
        setAvailableReports(sortedReports);
        
        // Set default to current week or most recent
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - now.getDay() + 1);
        const currentWeekStart = monday.toISOString().split('T')[0];
        
        // Find if there's a report for current week, otherwise use most recent
        const currentWeekReport = sortedReports.find((r: any) => r.weekStart === currentWeekStart);
        const defaultWeekStart = currentWeekReport ? currentWeekStart : (sortedReports[0]?.weekStart || currentWeekStart);
        setSelectedWeekStart(defaultWeekStart);
        
        return sortedReports;
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      return [];
    }
    return [];
  };

  const loadReportForWeek = async (weekStart: string) => {
    try {
      const res = await fetch(`/api/reports/project/${projectId}`, {
        headers: { Authorization: `Bearer ${sessionId}` },
      });
      if (res.ok) {
        const reports = await res.json();
        const report = reports.find((r: any) => r.weekStart === weekStart);
        
        if (report) {
          // Load existing report
          setCurrentReportId(report.id);
          setOverallRAG(report.overallRAG || 'Green');
          setPercentComplete(report.percentComplete || 0);
          setSummaryNotes(report.summaryNotes || '');
          setPlannedProgress(report.plannedProgress || 0);
          setActualProgress(report.actualProgress || 0);
          
          // Separate activities by completion status
          const allActivities = [...(report.activitiesCompleted || []), ...(report.activitiesPlanned || [])];
          const completed = allActivities.filter(a => a.percentComplete === 100 || a.status === 'completed');
          const inProgress = allActivities.filter(a => (a.percentComplete || 0) < 100 && a.status !== 'completed');
          setActivitiesCompleted(completed);
          setActivitiesInProgress(inProgress);
          
          // Separate milestones by completion status
          const allMilestones = [...(report.milestonesReached || []), ...(report.milestonesUpcoming || [])];
          const reached = allMilestones.filter(m => (m.percentComplete || 0) === 100 || m.status === 'reached');
          const upcoming = allMilestones.filter(m => (m.percentComplete || 0) < 100 && m.status !== 'reached');
          setMilestonesReached(reached);
          setMilestonesUpcoming(upcoming);
          setOpenPoints(report.openPoints || []);
          setIssues(report.issues || []);
          setRisks(report.risks || []);
          setOpportunities(report.opportunities || []);
          setBudgetSpentToDate(report.budgetSpentToDate || 0);
          setBudgetForecast(report.budgetForecast || 0);
          setChangeRequests(report.changeRequests || []);
          setDecisions(report.decisions || '');
          setLessonsLearned(report.lessonsLearned || '');
        } else {
          // No report for this week, reset to empty
          setCurrentReportId(null);
          setOverallRAG('Green');
          setPercentComplete(0);
          setSummaryNotes('');
          setPlannedProgress(0);
          setActualProgress(0);
          setActivitiesCompleted([]);
          setActivitiesInProgress([]);
          setMilestonesReached([]);
          setMilestonesUpcoming([]);
          setOpenPoints([]);
          setIssues([]);
          setRisks([]);
          setOpportunities([]);
          setBudgetSpentToDate(0);
          setBudgetForecast(0);
          setChangeRequests([]);
          setDecisions('');
          setLessonsLearned('');
        }
      }
    } catch (error) {
      console.error('Error loading report for week:', error);
    }
  };

  const loadExistingReport = async () => {
    const reports = await loadAvailableReports();
    if (reports.length > 0) {
      const weekStart = selectedWeekStart || reports[0].weekStart;
      await loadReportForWeek(weekStart);
    }
  };

  const generateId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(0, 5);

  const addActivity = () => {
    const newActivity: Activity = {
      id: generateId(),
      description: '',
      percentComplete: 0,
      status: 'in-progress',
    };
    setActivitiesInProgress([...activitiesInProgress, newActivity]);
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    // Check if activity is in completed or in-progress list
    const inCompleted = activitiesCompleted.find(a => a.id === id);
    const inProgress = activitiesInProgress.find(a => a.id === id);
    
    const activity = inCompleted || inProgress;
    if (!activity) return;

    const updated = { ...activity, ...updates };
    
    // If percentComplete is updated, check if we need to move the activity
    if (updates.percentComplete !== undefined) {
      if (updated.percentComplete === 100) {
        // Move to completed
        updated.status = 'completed';
        if (inCompleted) {
          setActivitiesCompleted(activitiesCompleted.map(a => a.id === id ? updated : a));
        } else {
          setActivitiesInProgress(activitiesInProgress.filter(a => a.id !== id));
          setActivitiesCompleted([...activitiesCompleted, updated]);
        }
      } else {
        // Move to in-progress
        updated.status = 'in-progress';
        if (inProgress) {
          setActivitiesInProgress(activitiesInProgress.map(a => a.id === id ? updated : a));
        } else {
          setActivitiesCompleted(activitiesCompleted.filter(a => a.id !== id));
          setActivitiesInProgress([...activitiesInProgress, updated]);
        }
      }
    } else {
      // Just update without moving
      if (inCompleted) {
        setActivitiesCompleted(activitiesCompleted.map(a => a.id === id ? updated : a));
      } else {
        setActivitiesInProgress(activitiesInProgress.map(a => a.id === id ? updated : a));
      }
    }
  };

  const removeActivity = (id: string) => {
    setActivitiesCompleted(activitiesCompleted.filter(a => a.id !== id));
    setActivitiesInProgress(activitiesInProgress.filter(a => a.id !== id));
  };

  const addOpenPoint = () => {
    setOpenPoints([...openPoints, {
      id: generateId(),
      description: '',
      openedDate: new Date().toISOString().split('T')[0],
      responsible: user?.id || '',
      priority: 'Medium',
      status: 'Nuovo',
    }]);
  };

  const addIssue = () => {
    setIssues([...issues, {
      id: generateId(),
      description: '',
      impact: 'Medio',
      correctiveActions: '',
      responsible: user?.id || '',
      detectedDate: new Date().toISOString().split('T')[0],
      status: 'Nuovo',
    }]);
  };

  const addRisk = () => {
    setRisks([...risks, {
      id: generateId(),
      description: '',
      probability: 3,
      impact: 3,
      riskLevel: 9,
      responseStrategy: 'Mitigazione',
      contingencyPlan: '',
      owner: user?.id || '',
      status: 'Identificato',
      identifiedDate: new Date().toISOString().split('T')[0],
    }]);
  };

  const addOpportunity = () => {
    setOpportunities([...opportunities, {
      id: generateId(),
      description: '',
      potentialBenefit: '',
      requiredActions: '',
      responsible: user?.id || '',
      decisionTimeline: '',
      status: 'Identificata',
      identifiedDate: new Date().toISOString().split('T')[0],
    }]);
  };

  const addChangeRequest = () => {
    setChangeRequests([...changeRequests, {
      id: generateId(),
      description: '',
      requestedBy: user?.id || '',
      impactScope: '',
      impactTimeline: '',
      impactCost: '',
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Richiesta',
    }]);
  };

  const addMilestone = () => {
    const now = new Date().toISOString().split('T')[0];
    setMilestonesUpcoming([...milestonesUpcoming, {
      id: generateId(),
      name: '',
      description: '',
      projectPhase: '',
      plannedEndDate: now,
      originalEndDate: now,
      percentComplete: 0,
      date: now,
      status: 'upcoming',
    }]);
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    // Check if milestone is in reached or upcoming list
    const inReached = milestonesReached.find(m => m.id === id);
    const inUpcoming = milestonesUpcoming.find(m => m.id === id);
    
    const milestone = inReached || inUpcoming;
    if (!milestone) return;

    const updated = { ...milestone, ...updates };
    
    // If percentComplete is updated, check if we need to move the milestone
    if (updates.percentComplete !== undefined) {
      if (updated.percentComplete === 100) {
        // Move to reached
        updated.status = 'reached';
        updated.reachedDate = new Date().toISOString().split('T')[0];
        if (inReached) {
          setMilestonesReached(milestonesReached.map(m => m.id === id ? updated : m));
        } else {
          setMilestonesUpcoming(milestonesUpcoming.filter(m => m.id !== id));
          setMilestonesReached([...milestonesReached, updated]);
        }
      } else {
        // Move to upcoming if it was in reached
        updated.status = 'upcoming';
        if (inUpcoming) {
          setMilestonesUpcoming(milestonesUpcoming.map(m => m.id === id ? updated : m));
        } else {
          setMilestonesReached(milestonesReached.filter(m => m.id !== id));
          setMilestonesUpcoming([...milestonesUpcoming, updated]);
        }
      }
    } else {
      // Just update without moving
      if (inReached) {
        setMilestonesReached(milestonesReached.map(m => m.id === id ? updated : m));
      } else {
        setMilestonesUpcoming(milestonesUpcoming.map(m => m.id === id ? updated : m));
      }
    }
  };

  const removeMilestone = (id: string) => {
    setMilestonesReached(milestonesReached.filter(m => m.id !== id));
    setMilestonesUpcoming(milestonesUpcoming.filter(m => m.id !== id));
  };

  const autoSave = async () => {
    if (!projectId || !sessionId) return;
    
    setSaving(true);
    try {
      const now = new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - now.getDay() + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      // Use selected week or current week
      const weekStartDate = selectedWeekStart ? new Date(selectedWeekStart) : monday;
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      const reportData: any = {
        projectId,
        weekStart: weekStartDate.toISOString().split('T')[0],
        weekEnd: weekEndDate.toISOString().split('T')[0],
        overallRAG,
        percentComplete,
        summaryNotes,
        plannedProgress,
        actualProgress,
        activitiesCompleted: activitiesCompleted.filter(a => a.description),
        activitiesPlanned: activitiesInProgress.filter(a => a.description),
        milestonesReached: milestonesReached.filter(m => m.name),
        milestonesUpcoming: milestonesUpcoming.filter(m => m.name),
        openPoints: openPoints.filter(op => op.description),
        issues: issues.filter(i => i.description),
        risks: risks.map(r => ({
          ...r,
          riskLevel: r.probability * r.impact,
        })),
        opportunities: opportunities.filter(o => o.description),
        budgetSpentToDate,
        budgetForecast,
        changeRequests: changeRequests.filter(cr => cr.description),
        decisions,
        lessonsLearned,
        autoSaved: true,
      };

      // If we have an existing report ID, update it instead of creating new
      if (currentReportId) {
        reportData.id = currentReportId;
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify(reportData),
      });

      if (res.ok) {
        const savedReport = await res.json();
        if (!currentReportId && savedReport.id) {
          setCurrentReportId(savedReport.id);
        }
        // Reload available reports to update the list
        await loadAvailableReports();
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const now = new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - now.getDay() + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      // Use selected week or current week
      const weekStartDate = selectedWeekStart ? new Date(selectedWeekStart) : monday;
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      const reportData: any = {
        projectId,
        weekStart: weekStartDate.toISOString().split('T')[0],
        weekEnd: weekEndDate.toISOString().split('T')[0],
        overallRAG,
        percentComplete,
        summaryNotes,
        plannedProgress,
        actualProgress,
        activitiesCompleted: activitiesCompleted.filter(a => a.description),
        activitiesPlanned: activitiesInProgress.filter(a => a.description),
        milestonesReached: milestonesReached.filter(m => m.name),
        milestonesUpcoming: milestonesUpcoming.filter(m => m.name),
        openPoints: openPoints.filter(op => op.description),
        issues: issues.filter(i => i.description),
        risks: risks.map(r => ({
          ...r,
          riskLevel: r.probability * r.impact,
        })),
        opportunities: opportunities.filter(o => o.description),
        budgetSpentToDate,
        budgetForecast,
        changeRequests: changeRequests.filter(cr => cr.description),
        decisions,
        lessonsLearned,
        autoSaved: false,
      };

      // If we have an existing report ID, update it instead of creating new
      if (currentReportId) {
        reportData.id = currentReportId;
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify(reportData),
      });

      if (res.ok) {
        const savedReport = await res.json();
        if (!currentReportId && savedReport.id) {
          setCurrentReportId(savedReport.id);
        }
        // Reload available reports to update the list
        await loadAvailableReports();
        alert('Report inviato con successo!');
        navigate('/');
      } else {
        const error = await res.json();
        alert(`Errore: ${error.error || 'Errore durante l\'invio'}`);
      }
    } catch (error) {
      alert('Errore durante l\'invio del report');
    } finally {
      setLoading(false);
    }
  };

  // Auto-save ogni 30 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      if (summaryNotes || activitiesCompleted.length > 0 || activitiesInProgress.length > 0) {
        autoSave();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [summaryNotes, activitiesCompleted, activitiesInProgress]);

  if (!project) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Caricamento...</div>;
  }

  const handleWeekChange = async (weekStart: string) => {
    setSelectedWeekStart(weekStart);
    await loadReportForWeek(weekStart);
  };

  const getCurrentWeekStart = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    return monday.toISOString().split('T')[0];
  };

  const formatWeekLabel = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })} - ${end.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#111827' }}>
          Report Settimanale
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          {project.name} - {project.code || project.id}
        </p>
        
        {/* Week Selector */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
            Seleziona Settimana:
          </label>
          <select
            className="select"
            value={selectedWeekStart}
            onChange={(e) => handleWeekChange(e.target.value)}
            style={{ minWidth: '250px' }}
          >
            {/* Current week option (may not exist yet) */}
            {(() => {
              const currentWeek = getCurrentWeekStart();
              const hasCurrentWeek = availableReports.some(r => r.weekStart === currentWeek);
              if (!hasCurrentWeek) {
                return (
                  <option key={currentWeek} value={currentWeek}>
                    {formatWeekLabel(currentWeek)} (Settimana Corrente)
                  </option>
                );
              }
              return null;
            })()}
            
            {/* Available reports */}
            {availableReports.map((report) => (
              <option key={report.id} value={report.weekStart}>
                {formatWeekLabel(report.weekStart)}
                {report.weekStart === getCurrentWeekStart() ? ' (Settimana Corrente)' : ''}
                {report.autoSaved ? ' (Bozza)' : ' (Completato)'}
              </option>
            ))}
          </select>
          
          {/* Quick navigation buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(() => {
              const currentIndex = availableReports.findIndex(r => r.weekStart === selectedWeekStart);
              const hasPrevious = currentIndex < availableReports.length - 1;
              const hasNext = currentIndex > 0;
              
              return (
                <>
                  {hasPrevious && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const prevWeek = availableReports[currentIndex + 1].weekStart;
                        handleWeekChange(prevWeek);
                      }}
                    >
                      ← Settimana Precedente
                    </button>
                  )}
                  {hasNext && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const nextWeek = availableReports[currentIndex - 1].weekStart;
                        handleWeekChange(nextWeek);
                      }}
                    >
                      Settimana Successiva →
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
        
        {saving && (
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#059669' }}>
            💾 Salvando automaticamente...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Informazioni Base */}
        <ReportSection title="1. Informazioni Base" defaultExpanded={true}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Periodo di Riferimento
              </label>
              <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '4px', fontSize: '0.875rem' }}>
                {(() => {
                  const now = new Date();
                  const monday = new Date(now);
                  monday.setDate(now.getDate() - now.getDay() + 1);
                  const sunday = new Date(monday);
                  sunday.setDate(monday.getDate() + 6);
                  return `${monday.toLocaleDateString('it-IT')} - ${sunday.toLocaleDateString('it-IT')}`;
                })()}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Compilatore
              </label>
              <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '4px', fontSize: '0.875rem' }}>
                {user?.name} ({user?.role})
              </div>
            </div>
            {project && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Obiettivi del Progetto
                  </label>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '4px', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                    {project.objectives || 'Nessun obiettivo definito'}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Data Stimata di Fine Progetto
                  </label>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '4px', fontSize: '0.875rem' }}>
                    {project.forecastEndDate 
                      ? new Date(project.forecastEndDate).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : project.endDate 
                        ? new Date(project.endDate).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : 'Non definita'}
                  </div>
                </div>
              </>
            )}
          </div>
        </ReportSection>

        {/* Stato Avanzamento */}
        <ReportSection title="2. Stato Avanzamento" defaultExpanded={true}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Stato Globale (RAG) *
              </label>
              <select
                className="select"
                value={overallRAG}
                onChange={e => setOverallRAG(e.target.value as any)}
                required
              >
                <option value="Green">🟢 Green</option>
                <option value="Amber">🟡 Amber</option>
                <option value="Red">🔴 Red</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Percentuale Completamento (%)
                </label>
                <input
                  type="number"
                  className="input"
                  min={0}
                  max={100}
                  value={percentComplete}
                  onChange={e => setPercentComplete(Number(e.target.value))}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Progresso Pianificato (%)
                </label>
                <input
                  type="number"
                  className="input"
                  min={0}
                  max={100}
                  value={plannedProgress}
                  onChange={e => setPlannedProgress(Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Riepilogo Esecutivo
              </label>
              <textarea
                className="input"
                rows={4}
                value={summaryNotes}
                onChange={e => setSummaryNotes(e.target.value)}
                placeholder="Sintesi dello stato del progetto..."
              />
            </div>
          </div>
        </ReportSection>

        {/* Attività */}
        <ReportSection title="3. Attività" defaultExpanded={true}>
          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Attività in Corso */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontWeight: 600 }}>Attività in Corso</h4>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addActivity}
                >
                  + Aggiungi Attività
                </button>
              </div>
              {activitiesInProgress.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '4px' }}>
                  Nessuna attività in corso
                </div>
              ) : (
                activitiesInProgress.map((activity) => (
                  <div key={activity.id} style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: '4px', border: '1px solid #fbbf24' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <input
                        className="input"
                        placeholder="Descrizione attività"
                        value={activity.description}
                        onChange={e => updateActivity(activity.id, { description: e.target.value })}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => removeActivity(activity.id)}
                        style={{ padding: '0.5rem 0.75rem' }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          % Completamento
                        </label>
                        <input
                          type="number"
                          className="input"
                          min={0}
                          max={100}
                          value={activity.percentComplete || 0}
                          onChange={e => {
                            const percent = Number(e.target.value);
                            updateActivity(activity.id, { percentComplete: percent });
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Fine Pianificata
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={activity.plannedEndDate || ''}
                          onChange={e => updateActivity(activity.id, { plannedEndDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Fine Effettiva
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={activity.actualEndDate || ''}
                          onChange={e => updateActivity(activity.id, { actualEndDate: e.target.value })}
                        />
                      </div>
                    </div>
                    {activity.percentComplete > 0 && activity.percentComplete < 100 && (
                      <div className="progress">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${activity.percentComplete}%`,
                            background: '#f59e0b',
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Attività Completate */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontWeight: 600 }}>Attività Completate</h4>
                <span className="badge badge-green" style={{ fontSize: '0.875rem' }}>
                  {activitiesCompleted.length}
                </span>
              </div>
              {activitiesCompleted.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '4px' }}>
                  Nessuna attività completata
                </div>
              ) : (
                activitiesCompleted.map((activity) => (
                  <div key={activity.id} style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', background: '#d1fae5', borderRadius: '4px', border: '1px solid #10b981' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <input
                        className="input"
                        placeholder="Descrizione attività"
                        value={activity.description}
                        onChange={e => updateActivity(activity.id, { description: e.target.value })}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => removeActivity(activity.id)}
                        style={{ padding: '0.5rem 0.75rem' }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          % Completamento
                        </label>
                        <input
                          type="number"
                          className="input"
                          min={0}
                          max={100}
                          value={activity.percentComplete || 100}
                          onChange={e => {
                            const percent = Number(e.target.value);
                            updateActivity(activity.id, { percentComplete: percent });
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Fine Pianificata
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={activity.plannedEndDate || ''}
                          onChange={e => updateActivity(activity.id, { plannedEndDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Fine Effettiva
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={activity.actualEndDate || ''}
                          onChange={e => updateActivity(activity.id, { actualEndDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{
                          width: '100%',
                          background: '#10b981',
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </ReportSection>

        {/* Milestone */}
        <ReportSection title="3. Milestone" defaultExpanded={false}>
          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Milestone in Corso */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontWeight: 600 }}>Milestone in Corso</h4>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addMilestone}
                >
                  + Aggiungi Milestone
                </button>
              </div>
              {milestonesUpcoming.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '4px' }}>
                  Nessuna milestone in corso
                </div>
              ) : (
                milestonesUpcoming.map((milestone) => (
                  <div key={milestone.id} style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', background: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <input
                        className="input"
                        placeholder="Nome milestone"
                        value={milestone.name}
                        onChange={e => updateMilestone(milestone.id, { name: e.target.value })}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => removeMilestone(milestone.id)}
                        style={{ padding: '0.5rem 0.75rem' }}
                      >
                        ✕
                      </button>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                        Descrizione
                      </label>
                      <textarea
                        className="input"
                        rows={2}
                        value={milestone.description}
                        onChange={e => updateMilestone(milestone.id, { description: e.target.value })}
                        placeholder="Descrizione milestone"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Fase Progetto
                        </label>
                        <input
                          className="input"
                          value={milestone.projectPhase}
                          onChange={e => updateMilestone(milestone.id, { projectPhase: e.target.value })}
                          placeholder="Fase progetto"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Data Prevista Fine
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={milestone.plannedEndDate}
                          onChange={e => updateMilestone(milestone.id, { plannedEndDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Data Originale Fine
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={milestone.originalEndDate}
                          onChange={e => updateMilestone(milestone.id, { originalEndDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          % Completamento
                        </label>
                        <input
                          type="number"
                          className="input"
                          min={0}
                          max={100}
                          value={milestone.percentComplete || 0}
                          onChange={e => {
                            const percent = Number(e.target.value);
                            updateMilestone(milestone.id, { percentComplete: percent });
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Data Milestone
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={milestone.date}
                          onChange={e => updateMilestone(milestone.id, { date: e.target.value })}
                        />
                      </div>
                    </div>
                    {milestone.percentComplete > 0 && milestone.percentComplete < 100 && (
                      <div className="progress">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${milestone.percentComplete}%`,
                            background: '#f59e0b',
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Milestone Raggiunte */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontWeight: 600 }}>Milestone Raggiunte</h4>
                <span className="badge badge-green" style={{ fontSize: '0.875rem' }}>
                  {milestonesReached.length}
                </span>
              </div>
              {milestonesReached.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '4px' }}>
                  Nessuna milestone raggiunta
                </div>
              ) : (
                milestonesReached.map((milestone) => (
                  <div key={milestone.id} style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', background: '#d1fae5', borderRadius: '4px', border: '1px solid #10b981' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <input
                        className="input"
                        placeholder="Nome milestone"
                        value={milestone.name}
                        onChange={e => updateMilestone(milestone.id, { name: e.target.value })}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => removeMilestone(milestone.id)}
                        style={{ padding: '0.5rem 0.75rem' }}
                      >
                        ✕
                      </button>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                        Descrizione
                      </label>
                      <textarea
                        className="input"
                        rows={2}
                        value={milestone.description}
                        onChange={e => updateMilestone(milestone.id, { description: e.target.value })}
                        placeholder="Descrizione milestone"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Fase Progetto
                        </label>
                        <input
                          className="input"
                          value={milestone.projectPhase}
                          onChange={e => updateMilestone(milestone.id, { projectPhase: e.target.value })}
                          placeholder="Fase progetto"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Data Prevista Fine
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={milestone.plannedEndDate}
                          onChange={e => updateMilestone(milestone.id, { plannedEndDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Data Originale Fine
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={milestone.originalEndDate}
                          onChange={e => updateMilestone(milestone.id, { originalEndDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          % Completamento
                        </label>
                        <input
                          type="number"
                          className="input"
                          min={0}
                          max={100}
                          value={milestone.percentComplete || 100}
                          onChange={e => {
                            const percent = Number(e.target.value);
                            updateMilestone(milestone.id, { percentComplete: percent });
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Data Raggiunta
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={milestone.reachedDate || milestone.date}
                          onChange={e => updateMilestone(milestone.id, { reachedDate: e.target.value, date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{
                          width: '100%',
                          background: '#10b981',
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </ReportSection>

        {/* Punti Aperti */}
        <ReportSection title="4. Punti Aperti" defaultExpanded={false}>
          <div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addOpenPoint}
              style={{ marginBottom: '1rem' }}
            >
              + Aggiungi Punto Aperto
            </button>
            <table className="table">
              <thead>
                <tr>
                  <th>Descrizione</th>
                  <th>Data Apertura</th>
                  <th>Responsabile</th>
                  <th>Priorità</th>
                  <th>Data Target</th>
                  <th>Stato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {openPoints.map(op => (
                  <tr key={op.id}>
                    <td>
                      <input
                        className="input"
                        value={op.description}
                        onChange={e => setOpenPoints(openPoints.map(p => p.id === op.id ? { ...p, description: e.target.value } : p))}
                        placeholder="Descrizione punto aperto"
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className="input"
                        value={op.openedDate}
                        onChange={e => setOpenPoints(openPoints.map(p => p.id === op.id ? { ...p, openedDate: e.target.value } : p))}
                      />
                    </td>
                    <td>
                      <select
                        className="select"
                        value={op.responsible}
                        onChange={e => setOpenPoints(openPoints.map(p => p.id === op.id ? { ...p, responsible: e.target.value } : p))}
                      >
                        <option value="">Seleziona</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="select"
                        value={op.priority}
                        onChange={e => setOpenPoints(openPoints.map(p => p.id === op.id ? { ...p, priority: e.target.value as any } : p))}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="date"
                        className="input"
                        value={op.targetResolutionDate || ''}
                        onChange={e => setOpenPoints(openPoints.map(p => p.id === op.id ? { ...p, targetResolutionDate: e.target.value } : p))}
                      />
                    </td>
                    <td>
                      <select
                        className="select"
                        value={op.status}
                        onChange={e => setOpenPoints(openPoints.map(p => p.id === op.id ? { ...p, status: e.target.value as any } : p))}
                      >
                        <option value="Nuovo">Nuovo</option>
                        <option value="In corso">In corso</option>
                        <option value="In attesa">In attesa</option>
                        <option value="Risolto">Risolto</option>
                        <option value="Escalation">Escalation</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setOpenPoints(openPoints.filter(p => p.id !== op.id))}
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>

        {/* Problemi */}
        <ReportSection title="5. Problemi (Issues)" defaultExpanded={false}>
          <div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addIssue}
              style={{ marginBottom: '1rem' }}
            >
              + Aggiungi Problema
            </button>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {issues.map(issue => (
                <div key={issue.id} className="card" style={{ background: '#fef2f2' }}>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <textarea
                      className="input"
                      rows={2}
                      value={issue.description}
                      onChange={e => setIssues(issues.map(i => i.id === issue.id ? { ...i, description: e.target.value } : i))}
                      placeholder="Descrizione problema"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      <select
                        className="select"
                        value={issue.impact}
                        onChange={e => setIssues(issues.map(i => i.id === issue.id ? { ...i, impact: e.target.value as any } : i))}
                      >
                        <option value="Basso">Basso</option>
                        <option value="Medio">Medio</option>
                        <option value="Alto">Alto</option>
                      </select>
                      <input
                        type="date"
                        className="input"
                        value={issue.detectedDate}
                        onChange={e => setIssues(issues.map(i => i.id === issue.id ? { ...i, detectedDate: e.target.value } : i))}
                      />
                      <select
                        className="select"
                        value={issue.status}
                        onChange={e => setIssues(issues.map(i => i.id === issue.id ? { ...i, status: e.target.value as any } : i))}
                      >
                        <option value="Nuovo">Nuovo</option>
                        <option value="In analisi">In analisi</option>
                        <option value="In risoluzione">In risoluzione</option>
                        <option value="Risolto">Risolto</option>
                        <option value="Escalation">Escalation</option>
                      </select>
                    </div>
                    <textarea
                      className="input"
                      rows={2}
                      value={issue.correctiveActions}
                      onChange={e => setIssues(issues.map(i => i.id === issue.id ? { ...i, correctiveActions: e.target.value } : i))}
                      placeholder="Azioni correttive"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <select
                        className="select"
                        value={issue.responsible}
                        onChange={e => setIssues(issues.map(i => i.id === issue.id ? { ...i, responsible: e.target.value } : i))}
                        style={{ flex: 1 }}
                      >
                        <option value="">Seleziona responsabile</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIssues(issues.filter(i => i.id !== issue.id))}
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ReportSection>

        {/* Rischi */}
        <ReportSection title="6. Rischi" defaultExpanded={false}>
          <div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addRisk}
              style={{ marginBottom: '1rem' }}
            >
              + Aggiungi Rischio
            </button>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {risks.map(risk => {
                const riskLevel = risk.probability * risk.impact;
                return (
                  <div key={risk.id} className="card" style={{ background: '#fef3c7' }}>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <textarea
                        className="input"
                        rows={2}
                        value={risk.description}
                        onChange={e => setRisks(risks.map(r => r.id === risk.id ? { ...r, description: e.target.value } : r))}
                        placeholder="Descrizione rischio"
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', display: 'block' }}>Probabilità (1-5)</label>
                          <input
                            type="number"
                            className="input"
                            min={1}
                            max={5}
                            value={risk.probability}
                            onChange={e => setRisks(risks.map(r => r.id === risk.id ? { ...r, probability: Number(e.target.value), riskLevel: Number(e.target.value) * r.impact } : r))}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', display: 'block' }}>Impatto (1-5)</label>
                          <input
                            type="number"
                            className="input"
                            min={1}
                            max={5}
                            value={risk.impact}
                            onChange={e => setRisks(risks.map(r => r.id === risk.id ? { ...r, impact: Number(e.target.value), riskLevel: r.probability * Number(e.target.value) } : r))}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', display: 'block' }}>Livello Rischio</label>
                          <div style={{ padding: '0.5rem', background: riskLevel >= 15 ? '#fee2e2' : riskLevel >= 9 ? '#fef3c7' : '#d1fae5', borderRadius: '4px', fontWeight: 600 }}>
                            {riskLevel}
                          </div>
                        </div>
                        <select
                          className="select"
                          value={risk.responseStrategy}
                          onChange={e => setRisks(risks.map(r => r.id === risk.id ? { ...r, responseStrategy: e.target.value as any } : r))}
                        >
                          <option value="Mitigazione">Mitigazione</option>
                          <option value="Trasferimento">Trasferimento</option>
                          <option value="Accettazione">Accettazione</option>
                          <option value="Evitamento">Evitamento</option>
                        </select>
                      </div>
                      <textarea
                        className="input"
                        rows={2}
                        value={risk.contingencyPlan}
                        onChange={e => setRisks(risks.map(r => r.id === risk.id ? { ...r, contingencyPlan: e.target.value } : r))}
                        placeholder="Piano di contingenza"
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <select
                          className="select"
                          value={risk.owner}
                          onChange={e => setRisks(risks.map(r => r.id === risk.id ? { ...r, owner: e.target.value } : r))}
                        >
                          <option value="">Seleziona proprietario</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                        <select
                          className="select"
                          value={risk.status}
                          onChange={e => setRisks(risks.map(r => r.id === risk.id ? { ...r, status: e.target.value as any } : r))}
                        >
                          <option value="Identificato">Identificato</option>
                          <option value="Monitorato">Monitorato</option>
                          <option value="Verificato">Verificato</option>
                          <option value="Chiuso">Chiuso</option>
                          <option value="Escalation">Escalation</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setRisks(risks.filter(r => r.id !== risk.id))}
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ReportSection>

        {/* Opportunità */}
        <ReportSection title="7. Opportunità" defaultExpanded={false}>
          <div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addOpportunity}
              style={{ marginBottom: '1rem' }}
            >
              + Aggiungi Opportunità
            </button>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {opportunities.map(opp => (
                <div key={opp.id} className="card" style={{ background: '#d1fae5' }}>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <textarea
                      className="input"
                      rows={2}
                      value={opp.description}
                      onChange={e => setOpportunities(opportunities.map(o => o.id === opp.id ? { ...o, description: e.target.value } : o))}
                      placeholder="Descrizione opportunità"
                    />
                    <textarea
                      className="input"
                      rows={2}
                      value={opp.potentialBenefit}
                      onChange={e => setOpportunities(opportunities.map(o => o.id === opp.id ? { ...o, potentialBenefit: e.target.value } : o))}
                      placeholder="Beneficio potenziale"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input
                        className="input"
                        value={opp.requiredActions}
                        onChange={e => setOpportunities(opportunities.map(o => o.id === opp.id ? { ...o, requiredActions: e.target.value } : o))}
                        placeholder="Azioni necessarie"
                      />
                      <input
                        className="input"
                        value={opp.decisionTimeline}
                        onChange={e => setOpportunities(opportunities.map(o => o.id === opp.id ? { ...o, decisionTimeline: e.target.value } : o))}
                        placeholder="Tempistica decisione"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <select
                        className="select"
                        value={opp.responsible}
                        onChange={e => setOpportunities(opportunities.map(o => o.id === opp.id ? { ...o, responsible: e.target.value } : o))}
                      >
                        <option value="">Seleziona responsabile</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                      <select
                        className="select"
                        value={opp.status}
                        onChange={e => setOpportunities(opportunities.map(o => o.id === opp.id ? { ...o, status: e.target.value as any } : o))}
                      >
                        <option value="Identificata">Identificata</option>
                        <option value="In valutazione">In valutazione</option>
                        <option value="Approvata">Approvata</option>
                        <option value="Implementata">Implementata</option>
                        <option value="Rifiutata">Rifiutata</option>
                        <option value="Escalation">Escalation</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setOpportunities(opportunities.filter(o => o.id !== opp.id))}
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ReportSection>

        {/* Budget */}
        <ReportSection title="8. Stato Budget" defaultExpanded={false}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Budget Iniziale
                </label>
                <input
                  type="number"
                  className="input"
                  value={budgetInitial}
                  onChange={e => setBudgetInitial(Number(e.target.value))}
                  readOnly
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Speso a Oggi
                </label>
                <input
                  type="number"
                  className="input"
                  value={budgetSpentToDate}
                  onChange={e => setBudgetSpentToDate(Number(e.target.value))}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Previsione a Finire
                </label>
                <input
                  type="number"
                  className="input"
                  value={budgetForecast}
                  onChange={e => setBudgetForecast(Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Varianza
              </label>
              <div style={{
                padding: '0.75rem',
                background: (budgetForecast - budgetInitial) > 0 ? '#fee2e2' : '#d1fae5',
                borderRadius: '4px',
                fontWeight: 600,
              }}>
                €{(budgetForecast - budgetInitial).toLocaleString()}
              </div>
            </div>
          </div>
        </ReportSection>

        {/* Richieste di Modifica */}
        <ReportSection title="9. Richieste di Modifica" defaultExpanded={false}>
          <div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addChangeRequest}
              style={{ marginBottom: '1rem' }}
            >
              + Aggiungi Richiesta
            </button>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {changeRequests.map(cr => (
                <div key={cr.id} className="card">
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <textarea
                      className="input"
                      rows={2}
                      value={cr.description}
                      onChange={e => setChangeRequests(changeRequests.map(c => c.id === cr.id ? { ...c, description: e.target.value } : c))}
                      placeholder="Descrizione modifica"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      <input
                        className="input"
                        value={cr.impactScope}
                        onChange={e => setChangeRequests(changeRequests.map(c => c.id === cr.id ? { ...c, impactScope: e.target.value } : c))}
                        placeholder="Impatto su scope"
                      />
                      <input
                        className="input"
                        value={cr.impactTimeline}
                        onChange={e => setChangeRequests(changeRequests.map(c => c.id === cr.id ? { ...c, impactTimeline: e.target.value } : c))}
                        placeholder="Impatto su tempi"
                      />
                      <input
                        className="input"
                        value={cr.impactCost}
                        onChange={e => setChangeRequests(changeRequests.map(c => c.id === cr.id ? { ...c, impactCost: e.target.value } : c))}
                        placeholder="Impatto su costi"
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <select
                        className="select"
                        value={cr.status}
                        onChange={e => setChangeRequests(changeRequests.map(c => c.id === cr.id ? { ...c, status: e.target.value as any } : c))}
                      >
                        <option value="Richiesta">Richiesta</option>
                        <option value="In valutazione">In valutazione</option>
                        <option value="Approvata">Approvata</option>
                        <option value="Rifiutata">Rifiutata</option>
                      </select>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setChangeRequests(changeRequests.filter(c => c.id !== cr.id))}
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ReportSection>

        {/* Decisioni e Lesson Learned */}
        <ReportSection title="10. Decisioni e Lesson Learned" defaultExpanded={false}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Decisioni
              </label>
              <textarea
                className="input"
                rows={4}
                value={decisions}
                onChange={e => setDecisions(e.target.value)}
                placeholder="Decisioni prese durante la settimana..."
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Lesson Learned
              </label>
              <textarea
                className="input"
                rows={4}
                value={lessonsLearned}
                onChange={e => setLessonsLearned(e.target.value)}
                placeholder="Lezioni apprese durante la settimana..."
              />
            </div>
          </div>
        </ReportSection>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            Annulla
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Invio in corso...' : 'Invia Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
