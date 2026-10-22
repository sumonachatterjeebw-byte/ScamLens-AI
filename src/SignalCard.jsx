import React from 'react';
import { Circle, Triangle, Octagon, HelpCircle } from 'lucide-react';

export default function SignalCard({ finding }) {
  const { category, severity, evidence_quote, explanation, template_id, source_type } = finding;

  const renderSeverityChip = (level) => {
    switch (level) {
      case 'low':
        return (
          <span className="severity-chip low" title="Low concern signal">
            <Circle size={10} fill="currentColor" />
            <span>Low Severity</span>
          </span>
        );
      case 'medium':
        return (
          <span className="severity-chip medium" title="Medium concern signal">
            <Triangle size={11} fill="currentColor" />
            <span>Medium Severity</span>
          </span>
        );
      case 'high':
        return (
          <span className="severity-chip high" title="High concern signal">
            <Octagon size={11} fill="currentColor" />
            <span>High Severity</span>
          </span>
        );
      default:
        return (
          <span className="severity-chip low">
            <Circle size={10} />
            <span>{level}</span>
          </span>
        );
    }
  };

  return (
    <div className="sl-card" style={{ marginBottom: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
              Signal Category
            </span>
            <span style={{ fontSize: '11px', background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
              {template_id || 'RULE'}
            </span>
          </div>
          <h4 style={{ fontSize: '16px', marginTop: '2px', textTransform: 'capitalize' }}>
            {category.replace('_', ' ')} Warning Sign
          </h4>
        </div>

        <div>
          {renderSeverityChip(severity)}
        </div>
      </div>

      <div className="evidence-quote-box">
        <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.03em', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>
          Exact Quoted Evidence:
        </div>
        &ldquo;{evidence_quote}&rdquo;
      </div>

      <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: '1.5' }}>
        {explanation}
      </p>

      {source_type && source_type !== 'rule' && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748B' }}>
          Source: <strong style={{ textTransform: 'capitalize' }}>{source_type}</strong>
        </div>
      )}
    </div>
  );
}
