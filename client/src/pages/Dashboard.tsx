import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/MetricCard';
import { ProjectCard } from '../components/ProjectCard';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface PortfolioMetrics {
  totalProjects: number;
  activeProjects: number;
  projectsByStatus: { Green: number; Amber: number; Red: number };
  projectsByPriority: { Low: number; Medium: number; High: number };
  totalBudgetAllocated: number;
  totalBudgetSpent: number;
  totalBudgetVariance: number;
  averageProgress: number;
  highRiskProjects: number;
  criticalIssues: number;
}

interface Project {
  id: string;
  code?: string;
  name: string;
  statusRAG: 'Red' | 'Amber' | 'Green';
  percentComplete: number;
  stage: string;
  priority: 'Low' | 'Medium' | 'High';
  projectManager?: { name: string; email: string } | null;
  budgetPlanned: number;
  budgetSpent: number;
  department?: string;
  executiveSummary?: string;
  escalations?: {
    openPoints: Array<{ description: string; priority: string; openedDate: string; status: string }>;
    issues: Array<{ description: string; impact: string; detectedDate: string; status: string }>;
    risks: Array<{ description: string; riskLevel: number; identifiedDate: string; status: string }>;
    opportunities: Array<{ description: string; identifiedDate: string; status: string }>;
  };
}

export function Dashboard() {
  const { sessionId } = useAuth();
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: '',
    pmId: '',
    status: '',
    priority: '',
    search: '',
  });

  useEffect(() => {
    loadData();
  }, [filters, sessionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers: HeadersInit = sessionId ? { Authorization: `Bearer ${sessionId}` } : {};

      // Load metrics
      const metricsRes = await fetch('/api/dashboard/metrics', { headers });
      if (!metricsRes.ok) {
        throw new Error(`Failed to load metrics: ${metricsRes.statusText}`);
      }
      const metricsData = await metricsRes.json();
      setMetrics(metricsData);

      // Load projects with filters
      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      if (filters.pmId) params.append('pmId', filters.pmId);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);

      const projectsRes = await fetch(`/api/dashboard/projects?${params}`, { headers });
      if (!projectsRes.ok) {
        throw new Error(`Failed to load projects: ${projectsRes.statusText}`);
      }
      const projectsData = await projectsRes.json();
      
      // Load escalation data for each project
      const projectsWithEscalations = await Promise.all(
        projectsData.map(async (project: Project) => {
          try {
            const reportsRes = await fetch(`/api/reports/project/${project.id}`, { headers });
            if (reportsRes.ok) {
              const reports = await reportsRes.json();
              if (reports && reports.length > 0) {
                const latestReport = reports[0];
                
                // Ensure all arrays exist
                const openPoints = Array.isArray(latestReport.openPoints) ? latestReport.openPoints : [];
                const issues = Array.isArray(latestReport.issues) ? latestReport.issues : [];
                const risks = Array.isArray(latestReport.risks) ? latestReport.risks : [];
                const opportunities = Array.isArray(latestReport.opportunities) ? latestReport.opportunities : [];
                
                const escalations = {
                  openPoints: openPoints.filter((op: any) => op && op.status === 'Escalation').map((op: any) => ({
                    description: op.description || '',
                    priority: op.priority || '',
                    openedDate: op.openedDate || new Date().toISOString().split('T')[0],
                    status: op.status || 'Escalation',
                  })),
                  issues: issues.filter((i: any) => i && i.status === 'Escalation').map((i: any) => ({
                    description: i.description || '',
                    impact: i.impact || '',
                    detectedDate: i.detectedDate || new Date().toISOString().split('T')[0],
                    status: i.status || 'Escalation',
                  })),
                  risks: risks.filter((r: any) => r && r.status === 'Escalation').map((r: any) => ({
                    description: r.description || '',
                    riskLevel: r.riskLevel || 0,
                    identifiedDate: r.identifiedDate || new Date().toISOString().split('T')[0],
                    status: r.status || 'Escalation',
                  })),
                  opportunities: opportunities.filter((o: any) => o && o.status === 'Escalation').map((o: any) => ({
                    description: o.description || '',
                    identifiedDate: o.identifiedDate || new Date().toISOString().split('T')[0],
                    status: o.status || 'Escalation',
                  })),
                };
                return {
                  ...project,
                  executiveSummary: latestReport.summaryNotes || '',
                  escalations,
                };
              }
            }
          } catch (error) {
            console.error(`Error loading report for project ${project.id}:`, error);
          }
          return {
            ...project,
            executiveSummary: '',
            escalations: {
              openPoints: [],
              issues: [],
              risks: [],
              opportunities: [],
            },
          };
        })
      );
      
      setProjects(projectsWithEscalations);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Show error to user instead of blank page
      setProjects([]);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const statusChartData = metrics
    ? [
        { name: 'Green', value: metrics.projectsByStatus.Green, color: '#10b981' },
        { name: 'Amber', value: metrics.projectsByStatus.Amber, color: '#f59e0b' },
        { name: 'Red', value: metrics.projectsByStatus.Red, color: '#ef4444' },
      ]
    : [];

  const priorityChartData = metrics
    ? [
        { name: 'High', value: metrics.projectsByPriority.High },
        { name: 'Medium', value: metrics.projectsByPriority.Medium },
        { name: 'Low', value: metrics.projectsByPriority.Low },
      ]
    : [];

  const progressData = projects.slice(0, 10).map(p => ({
    name: p.name.substring(0, 15) + (p.name.length > 15 ? '...' : ''),
    progress: p.percentComplete,
  }));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#111827' }}>
          Dashboard Portfolio
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Panoramica completa dello stato dei progetti
        </p>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
          <MetricCard
            title="Progetti Attivi"
            value={metrics.activeProjects}
            color="primary"
            icon="📊"
          />
          <MetricCard
            title="Budget Allocato"
            value={`€${(metrics.totalBudgetAllocated / 1000).toFixed(0)}K`}
            color="info"
            icon="💰"
          />
          <MetricCard
            title="Progresso Medio"
            value={`${Math.round(metrics.averageProgress)}%`}
            color="success"
            icon="📈"
          />
          <MetricCard
            title="Progetti Critici"
            value={metrics.highRiskProjects}
            color="danger"
            icon="⚠️"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        {/* Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Distribuzione per Stato</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Distribuzione per Priorità</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Budget Overview</h3>
          </div>
          {metrics && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Allocato</span>
                  <span style={{ fontWeight: 600 }}>
                    €{metrics.totalBudgetAllocated.toLocaleString()}
                  </span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(100, (metrics.totalBudgetSpent / metrics.totalBudgetAllocated) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Speso</span>
                <span style={{ fontWeight: 600 }}>
                  €{metrics.totalBudgetSpent.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Varianza</span>
                <span
                  style={{
                    fontWeight: 600,
                    color: metrics.totalBudgetVariance > 0 ? '#ef4444' : '#10b981',
                  }}
                >
                  €{metrics.totalBudgetVariance.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Cerca progetti..."
          className="input"
          style={{ flex: 1, maxWidth: '300px' }}
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="select"
          style={{ width: '150px' }}
          value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Tutti gli stati</option>
          <option value="Green">Green</option>
          <option value="Amber">Amber</option>
          <option value="Red">Red</option>
        </select>
        <select
          className="select"
          style={{ width: '150px' }}
          value={filters.priority}
          onChange={e => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">Tutte le priorità</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <button
          className="btn btn-secondary"
          onClick={() => setFilters({ department: '', pmId: '', status: '', priority: '', search: '' })}
        >
          Reset
        </button>
      </div>

      {/* Escalations Table - Always show if there are projects */}
      {projects.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
            Escalations - Riepilogo Completo
          </h2>
          <div className="card">
            {(() => {
              const allEscalations = projects.flatMap(project => {
                const escalations: Array<{
                  projectId: string;
                  projectName: string;
                  projectCode: string;
                  type: string;
                  description: string;
                  escalationDate: string;
                  priority?: string;
                  impact?: string;
                  riskLevel?: number;
                  status: string;
                }> = [];

                if (!project.escalations) return escalations;

                (project.escalations.openPoints || []).forEach(op => {
                  escalations.push({
                    projectId: project.id,
                    projectName: project.name,
                    projectCode: project.code || project.name,
                    type: 'Punto Aperto',
                    description: op.description || '',
                    escalationDate: op.openedDate || new Date().toISOString().split('T')[0],
                    priority: op.priority || '',
                    status: op.status || 'Escalation',
                  });
                });

                (project.escalations.issues || []).forEach(issue => {
                  escalations.push({
                    projectId: project.id,
                    projectName: project.name,
                    projectCode: project.code || project.name,
                    type: 'Problema',
                    description: issue.description || '',
                    escalationDate: issue.detectedDate || new Date().toISOString().split('T')[0],
                    impact: issue.impact || '',
                    status: issue.status || 'Escalation',
                  });
                });

                (project.escalations.risks || []).forEach(risk => {
                  escalations.push({
                    projectId: project.id,
                    projectName: project.name,
                    projectCode: project.code || project.name,
                    type: 'Rischio',
                    description: risk.description || '',
                    escalationDate: risk.identifiedDate || new Date().toISOString().split('T')[0],
                    riskLevel: risk.riskLevel || 0,
                    status: risk.status || 'Escalation',
                  });
                });

                (project.escalations.opportunities || []).forEach(opp => {
                  escalations.push({
                    projectId: project.id,
                    projectName: project.name,
                    projectCode: project.code || project.name,
                    type: 'Opportunità',
                    description: opp.description || '',
                    escalationDate: opp.identifiedDate || new Date().toISOString().split('T')[0],
                    status: opp.status || 'Escalation',
                  });
                });

                return escalations;
              });

              if (allEscalations.length === 0) {
                return (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    <p>Nessuna escalation presente nel portfolio</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                      Le escalation vengono mostrate qui quando imposti lo stato "Escalation" su punti aperti, problemi, rischi o opportunità nei report settimanali.
                    </p>
                  </div>
                );
              }

              return (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                <thead>
                  <tr>
                    <th>Progetto</th>
                    <th>Tipo Item</th>
                    <th>Descrizione</th>
                    <th>Data Escalation</th>
                    <th>Priorità/Impatto</th>
                    <th>Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.flatMap(project => {
                    const escalations: Array<{
                      projectId: string;
                      projectName: string;
                      projectCode: string;
                      type: string;
                      description: string;
                      escalationDate: string;
                      priority?: string;
                      impact?: string;
                      riskLevel?: number;
                      status: string;
                    }> = [];

                    if (!project.escalations) return escalations;

                    // Open Points in escalation
                    (project.escalations.openPoints || []).forEach(op => {
                      escalations.push({
                        projectId: project.id,
                        projectName: project.name,
                        projectCode: project.code || project.name,
                        type: 'Punto Aperto',
                        description: op.description || '',
                        escalationDate: op.openedDate || new Date().toISOString().split('T')[0],
                        priority: op.priority || '',
                        status: op.status || 'Escalation',
                      });
                    });

                    // Issues in escalation
                    (project.escalations.issues || []).forEach(issue => {
                      escalations.push({
                        projectId: project.id,
                        projectName: project.name,
                        projectCode: project.code || project.name,
                        type: 'Problema',
                        description: issue.description || '',
                        escalationDate: issue.detectedDate || new Date().toISOString().split('T')[0],
                        impact: issue.impact || '',
                        status: issue.status || 'Escalation',
                      });
                    });

                    // Risks in escalation
                    (project.escalations.risks || []).forEach(risk => {
                      escalations.push({
                        projectId: project.id,
                        projectName: project.name,
                        projectCode: project.code || project.name,
                        type: 'Rischio',
                        description: risk.description || '',
                        escalationDate: risk.identifiedDate || new Date().toISOString().split('T')[0],
                        riskLevel: risk.riskLevel || 0,
                        status: risk.status || 'Escalation',
                      });
                    });

                    // Opportunities in escalation
                    (project.escalations.opportunities || []).forEach(opp => {
                      escalations.push({
                        projectId: project.id,
                        projectName: project.name,
                        projectCode: project.code || project.name,
                        type: 'Opportunità',
                        description: opp.description || '',
                        escalationDate: opp.identifiedDate || new Date().toISOString().split('T')[0],
                        status: opp.status || 'Escalation',
                      });
                    });

                    return escalations;
                  }).map((esc, idx) => (
                    <tr key={`${esc.projectId}-${idx}`}>
                      <td style={{ fontWeight: 600 }}>
                        {esc.projectName}
                      </td>
                      <td>
                        <span className={`badge ${
                          esc.type === 'Punto Aperto' ? 'badge-amber' :
                          esc.type === 'Problema' ? 'badge-red' :
                          esc.type === 'Rischio' ? 'badge-red' :
                          'badge-blue'
                        }`}>
                          {esc.type}
                        </span>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        {esc.description || '(Nessuna descrizione)'}
                      </td>
                      <td>
                        {esc.escalationDate ? new Date(esc.escalationDate).toLocaleDateString('it-IT') : '-'}
                      </td>
                      <td>
                        {esc.priority && (
                          <span className={`badge ${
                            esc.priority === 'High' ? 'badge-red' :
                            esc.priority === 'Medium' ? 'badge-amber' :
                            'badge-green'
                          }`}>
                            {esc.priority}
                          </span>
                        )}
                        {esc.impact && (
                          <span className={`badge ${
                            esc.impact === 'Alto' ? 'badge-red' :
                            esc.impact === 'Medio' ? 'badge-amber' :
                            'badge-green'
                          }`}>
                            {esc.impact}
                          </span>
                        )}
                        {esc.riskLevel !== undefined && esc.riskLevel > 0 && (
                          <span className={`badge ${
                            esc.riskLevel >= 15 ? 'badge-red' :
                            esc.riskLevel >= 9 ? 'badge-amber' :
                            'badge-green'
                          }`}>
                            Livello {esc.riskLevel}
                          </span>
                        )}
                        {!esc.priority && !esc.impact && esc.riskLevel === undefined && (
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>-</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-red">
                          {esc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
          Progetti ({projects.length})
        </h2>
        {projects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>Nessun progetto trovato</p>
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Progress Chart */}
      {progressData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Progresso Progetti (Top 10)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="progress" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
