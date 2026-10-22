import React from 'react';
import { SAMPLE_MESSAGES } from '../samples';
import { FileText, ArrowRight } from 'lucide-react';

export default function SampleList({ onSelectSample }) {
  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>
          Explore Verified Benchmark Scenarios
        </h4>
        <span style={{ fontSize: '12px', color: '#64748B' }}>
          Section 11 Fictional Samples
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
        {SAMPLE_MESSAGES.map((sample) => (
          <button
            key={sample.id}
            id={`btn-${sample.id}`}
            onClick={() => onSelectSample(sample)}
            style={{
              textAlign: 'left',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border-light)',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-light)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#0F766E' }}>
                  {sample.tag}
                </span>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Click to Load</span>
              </div>
              <strong style={{ fontSize: '13.5px', color: '#1E293B', display: 'block' }}>
                {sample.label}
              </strong>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {sample.text}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600', marginTop: '6px' }}>
              <span>Load into analyser</span>
              <ArrowRight size={13} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
