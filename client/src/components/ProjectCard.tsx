import React from 'react';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: {
    id: string;
    code?: string;
    name: string;
    statusRAG: 'Red' | 'Amber' | 'Green';
    percentComplete: number;
    stage: string;
    priority: 'Low' | 'Medium' | 'High';
    projectManager?: { name: string } | null;
    budgetPlanned?: number;
    budgetSpent?: number;
    executiveSummary?: string;
    escalations?: {
      openPoints: Array<{ description: string; priority: string; openedDate: string; status: string }>;
      issues: Array<{ description: string; impact: string; detectedDate: string; status: string }>;
      risks: Array<{ description: string; riskLevel: number; identifiedDate: string; status: string }>;
      opportunities: Array<{ description: string; identifiedDate: string; status: string }>;
    };
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const ragColors = {
    Green: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
    Amber: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
    Red: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
  };

  const priorityColors = {
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#10b981',
  };

  const rag = ragColors[project.statusRAG];
  const budgetVariance = project.budgetPlanned && project.budgetSpent
    ? ((project.budgetSpent / project.budgetPlanned) * 100).toFixed(1)
    : null;

  const hasEscalations = project.escalations && (
    project.escalations.openPoints.length > 0 ||
    project.escalations.issues.length > 0 ||
    project.escalations.risks.length > 0 ||
    project.escalations.opportunities.length > 0
  );

  const totalEscalations = project.escalations
    ? project.escalations.openPoints.length +
      project.escalations.issues.length +
      project.escalations.risks.length +
      project.escalations.opportunities.length
    : 0;

  return (
    <div className="card fade-in" style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {project.code && (
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>
                {project.code}
              </span>
            )}
            <span
              className="badge"
              style={{
                background: rag.bg,
                color: rag.text,
                fontSize: '0.625rem',
              }}
            >
              {project.statusRAG}
            </span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: priorityColors[project.priority],
              }}
              title={`Priority: ${project.priority}`}
            />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>
            {project.name}
          </h3>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {project.stage}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Progress</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
            {Math.round(project.percentComplete)}%
          </span>
        </div>
        <div className="progress">
          <div
            className="progress-bar"
            style={{
              width: `${project.percentComplete}%`,
              background: rag.border,
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
        <div style={{ color: '#6b7280' }}>
          PM: {project.projectManager?.name || 'Non assegnato'}
        </div>
        {budgetVariance && (
          <div style={{ color: '#6b7280' }}>
            Budget: {budgetVariance}%
          </div>
        )}
      </div>

      {/* Executive Summary */}
      {project.executiveSummary && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '4px', borderLeft: '3px solid #667eea' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem' }}>
            📋 Executive Summary
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: 1.6 }}>
            {project.executiveSummary}
          </div>
        </div>
      )}

      {/* Escalations */}
      {hasEscalations && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '4px', borderLeft: '3px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#991b1b' }}>
              ⚠️ Escalations ({totalEscalations})
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#7f1d1d', lineHeight: 1.6 }}>
            {project.escalations!.openPoints.map((op, idx) => (
              <div key={idx} style={{ marginBottom: '0.25rem' }}>
                • <strong>Punto Aperto</strong>: {op.description.substring(0, 60)}{op.description.length > 60 ? '...' : ''}
                <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '0.5rem' }}>
                  ({new Date(op.openedDate).toLocaleDateString('it-IT')})
                </span>
              </div>
            ))}
            {project.escalations!.issues.map((issue, idx) => (
              <div key={idx} style={{ marginBottom: '0.25rem' }}>
                • <strong>Problema</strong> ({issue.impact}): {issue.description.substring(0, 60)}{issue.description.length > 60 ? '...' : ''}
                <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '0.5rem' }}>
                  ({new Date(issue.detectedDate).toLocaleDateString('it-IT')})
                </span>
              </div>
            ))}
            {project.escalations!.risks.map((risk, idx) => (
              <div key={idx} style={{ marginBottom: '0.25rem' }}>
                • <strong>Rischio</strong> (Livello {risk.riskLevel}): {risk.description.substring(0, 60)}{risk.description.length > 60 ? '...' : ''}
                <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '0.5rem' }}>
                  ({new Date(risk.identifiedDate).toLocaleDateString('it-IT')})
                </span>
              </div>
            ))}
            {project.escalations!.opportunities.map((opp, idx) => (
              <div key={idx} style={{ marginBottom: '0.25rem' }}>
                • <strong>Opportunità</strong>: {opp.description.substring(0, 60)}{opp.description.length > 60 ? '...' : ''}
                <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '0.5rem' }}>
                  ({new Date(opp.identifiedDate).toLocaleDateString('it-IT')})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
        <Link
          to={`/report/${project.id}`}
          className="btn btn-primary btn-sm"
          style={{ width: '100%', textAlign: 'center', display: 'block' }}
        >
          Report Settimanale
        </Link>
      </div>
    </div>
  );
}

