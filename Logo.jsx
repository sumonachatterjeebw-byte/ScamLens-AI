import React from 'react';

export default function Logo({ size = 44, showWordmark = true, subtitle = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', userSelect: 'none' }}>
      {/* Visual Logo Mark */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(15, 118, 110, 0.35), 0 2px 6px rgba(31, 58, 95, 0.25)',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          background: '#0F172A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <img
          src="/logo.jpg"
          alt="ScamLens AI Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            // Fallback SVG if image not yet loaded
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Wordmark Typography */}
      {showWordmark && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: size >= 40 ? '1.35rem' : '1.15rem',
                fontWeight: '800',
                letterSpacing: '-0.025em',
                color: '#1F3A5F',
                lineHeight: '1.1'
              }}
            >
              Scam<span style={{
                background: 'linear-gradient(135deg, #0F766E 0%, #0284C7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Lens</span>
            </span>

            <span
              style={{
                background: 'linear-gradient(135deg, #1F3A5F 0%, #0F766E 100%)',
                color: '#38BDF8',
                fontSize: '10px',
                fontWeight: '800',
                padding: '2px 7px',
                borderRadius: '6px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              AI
            </span>
          </div>

          {subtitle && (
            <p style={{
              fontSize: '11.5px',
              color: 'var(--color-text-muted)',
              marginTop: '2px',
              fontWeight: '500',
              letterSpacing: '-0.01em'
            }}>
              Explainable Scam Signal Inspector &amp; On-Device Shield
            </p>
          )}
        </div>
      )}
    </div>
  );
}
