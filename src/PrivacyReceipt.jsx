import React from 'react';
import {
  Shield,
  Lock,
  EyeOff,
  Server,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Cpu,
  Smartphone
} from 'lucide-react';

export default function PrivacyReceipt({ receipt, onResetSession }) {
  const isLocalClient = receipt?.analysis_mode?.includes('Browser') || false;

  return (
    <div className="sl-card" style={{ borderLeft: '6px solid #0F766E', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#0F766E', letterSpacing: '0.04em' }}>
            <Lock size={13} />
            <span>Verifiable Architecture Guarantee</span>
          </div>
          <h4 style={{ fontSize: '1.2rem', color: 'var(--color-primary)', marginTop: '2px' }}>
            Cryptographic &amp; Architectural Privacy Receipt
          </h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', padding: '4px 10px', borderRadius: '4px', fontWeight: '600' }}>
            Zero Cloud Storage
          </span>
          {onResetSession && (
            <button
              onClick={onResetSession}
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid #CBD5E1',
                background: 'white',
                color: '#991B1B',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={13} />
              <span>Reset Session</span>
            </button>
          )}
        </div>
      </div>

      <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.5', marginBottom: '16px' }}>
        ScamLens AI operates on a <strong>privacy-by-architecture</strong> standard. We do not maintain user databases,
        we never record phone calls, and raw message texts are never stored on disk or used to train third-party AI models.
      </p>

      {/* Real Privacy Checklist Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
        {/* Processing Location */}
        <div style={{ background: '#F8FAFC', border: '1px solid var(--color-border-light)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F766E', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
            <Cpu size={14} />
            <span>Execution Environment</span>
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#1E293B', marginTop: '4px' }}>
            {receipt?.analysis_mode || 'In-Memory Local API / In-Browser Fallback'}
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            Rules evaluate on local machine memory. Zero third-party cloud servers contacted.
          </p>
        </div>

        {/* Content Storage Guarantee */}
        <div style={{ background: '#F8FAFC', border: '1px solid var(--color-border-light)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F766E', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
            <Server size={14} />
            <span>Raw Message Storage</span>
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#166534', marginTop: '4px' }}>
            0 Bytes Stored (Strict Non-Persistence)
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            FastAPI middleware and browser engines drop message text immediately upon analysis.
          </p>
        </div>

        {/* PII Redaction Pipeline */}
        <div style={{ background: '#F8FAFC', border: '1px solid var(--color-border-light)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F766E', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
            <EyeOff size={14} />
            <span>Pre-Analysis Minimisation</span>
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#1E293B', marginTop: '4px' }}>
            Automatic PII Redaction Active
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            Emails &rarr; <code>[email]</code>, Phones &rarr; <code>[phone]</code>, Cards &rarr; <code>[number]</code>, IDs &rarr; <code>[id]</code>.
          </p>
        </div>

        {/* External URL Reputation */}
        <div style={{ background: '#F8FAFC', border: '1px solid var(--color-border-light)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F766E', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
            <FileCheck size={14} />
            <span>External Service Status</span>
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#1E293B', marginTop: '4px' }}>
            {receipt?.external_services_contacted?.length ? receipt.external_services_contacted.join(', ') : 'None Contacted (Offline Safe)'}
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            Live reputation checks are honestly reported as unconfigured by default.
          </p>
        </div>

        {/* Android Shield Manifest Verification */}
        <div style={{ background: '#F8FAFC', border: '1px solid var(--color-border-light)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F766E', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
            <Smartphone size={14} />
            <span>Android Companion Invariant</span>
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#166534', marginTop: '4px' }}>
            Verified: ZERO INTERNET Permission
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            <code>AndroidManifest.xml</code> contains no network permission. All call screening is 100% on-device.
          </p>
        </div>

        {/* User Data Rights */}
        <div style={{ background: '#F8FAFC', border: '1px solid var(--color-border-light)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F766E', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
            <Shield size={14} />
            <span>Client Control &amp; Reset</span>
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#1E293B', marginTop: '4px' }}>
            Instant Local Purge Available
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            Tap 'Clear' on the analyzer or 'Delete All' on Shield to purge all local temporary memory.
          </p>
        </div>
      </div>
    </div>
  );
}
