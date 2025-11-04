import React, { ReactNode } from 'react';

interface ReportSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function ReportSection({ title, children, defaultExpanded = true }: ReportSectionProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div
        className="card-header"
        style={{ cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>
        <span style={{ fontSize: '1.25rem', color: '#6b7280' }}>
          {expanded ? '▼' : '▶'}
        </span>
      </div>
      {expanded && (
        <div style={{ paddingTop: '1rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}


