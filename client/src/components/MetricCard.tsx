import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export function MetricCard({ title, value, change, trend, icon, color = 'primary' }: MetricCardProps) {
  const colorClasses = {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  };

  const trendColors = {
    up: '#10b981',
    down: '#ef4444',
    neutral: '#6b7280',
  };

  return (
    <div
      className="card fade-in"
      style={{
        background: colorClasses[color],
        color: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
            {title}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {change !== undefined && (
            <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ color: trendColors[trend || 'neutral'] }}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {Math.abs(change)}%
              </span>
              <span style={{ opacity: 0.8 }}>vs prev. period</span>
            </div>
          )}
        </div>
        {icon && (
          <div style={{ fontSize: '2rem', opacity: 0.8 }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}


