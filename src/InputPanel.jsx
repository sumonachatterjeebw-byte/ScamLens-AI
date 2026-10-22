import React from 'react';
import { Send, Trash2, ShieldAlert, Link as LinkIcon, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import SampleList from './SampleList';

export default function InputPanel({
  text,
  setText,
  url,
  setUrl,
  sender,
  setSender,
  category,
  setCategory,
  timestamp,
  setTimestamp,
  onAnalyze,
  onClear,
  isLoading,
  error,
  maxChars = 5000,
  onSelectSample,
}) {
  const charCount = text.length;
  const isOverLimit = charCount > maxChars;

  return (
    <section className="sl-card" aria-labelledby="inspector-heading" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <div>
          <h2 id="inspector-heading" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
            Understand suspicious messages before you act.
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Paste any suspicious SMS, email snippet, or offer to inspect visible warning indicators.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: '#FEF3C7', color: '#7C2D12', padding: '4px 10px', borderRadius: '6px' }}>
          <ShieldAlert size={14} />
          <span>Do not paste passwords, OTPs, PINs, or sensitive personal information.</span>
        </div>
      </div>

      {/* Quick Sample Selector Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px', padding: '10px 14px', background: '#F1F5F9', borderRadius: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Quick Benchmark Data:
        </span>
        <button
          className="benchmark-pill"
          onClick={() => onSelectSample({
            text: 'ALERT: Your FictBank account will be blocked in 10 minutes due to incomplete KYC. Send your OTP to confirm and avoid suspension: http://fictbank-verify.example/kyc',
            url: 'http://fictbank-verify.example/kyc'
          })}
        >
          🚨 1. Bank OTP Threat
        </button>
        <button
          className="benchmark-pill"
          onClick={() => onSelectSample({
            text: 'Congratulations! You are selected for a Data Analyst internship at Northwind Demo Ltd, earning 40,000 per month with no interview required. To receive your offer letter, pay a refundable registration fee of 2,500 today. Contact our HR on Telegram.',
            url: ''
          })}
        >
          💼 2. Fake Internship Fee
        </button>
        <button
          className="benchmark-pill"
          onClick={() => onSelectSample({
            text: 'Your courier parcel #IN-98214 is on hold due to missing address verification. Immediate action required: Pay 25 delivery clearance fee within 2 hours or package will be returned: http://192.0.2.1/track-parcel',
            url: 'http://192.0.2.1/track-parcel'
          })}
        >
          📦 3. Courier Delivery Scam
        </button>
        <button
          className="benchmark-pill"
          onClick={() => onSelectSample({
            text: 'Hi, your library book “Intro to Statistics” is due on Friday. You can renew it on the library website or at the front desk. No action is needed if you have already returned it.',
            url: ''
          })}
        >
          📚 4. Legitimate Note
        </button>
        <button
          className="benchmark-pill"
          onClick={() => onSelectSample({
            text: 'Hello, this is Priya from Contoso Campus Recruitment. We would like to schedule a short call about your application. Please confirm your availability today or tomorrow by replying to this message.',
            url: ''
          })}
        >
          🤝 5. Ambiguous Note
        </button>
      </div>

      {/* Main Textarea */}
      <div style={{ position: 'relative' }}>
        <textarea
          id="message-input"
          aria-label="Suspicious message or email snippet"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isLoading && !isOverLimit && text.trim()) {
              e.preventDefault();
              onAnalyze();
            }
          }}
          placeholder="Paste the message here. Remove private details first."
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            border: `1px solid ${isOverLimit ? '#EF4444' : 'var(--color-border)'}`,
            fontSize: '15px',
            lineHeight: '1.5',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            background: '#FAFAFA'
          }}
        />

        {/* Live Counter */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '6px',
          fontSize: '12.5px',
          color: isOverLimit ? '#DC2626' : 'var(--color-text-muted)'
        }}>
          <span>Text analysed (private details like phone &amp; email masked automatically)</span>
          <span style={{ fontWeight: isOverLimit ? '700' : '500' }}>
            {charCount.toLocaleString()} / {maxChars.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Optional URL Input */}
      <div style={{ marginTop: '16px' }}>
        <label htmlFor="url-input" style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <LinkIcon size={14} />
          <span>Optional Standalone Link / URL to inspect:</span>
        </label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            id="url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. http://fictbank-verify.example/kyc"
            style={{
              flex: '1',
              minWidth: '260px',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              fontSize: '14px',
              background: '#FAFAFA'
            }}
          />
          <div style={{ fontSize: '12px', color: '#64748B', background: '#F1F5F9', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            Live URL check: <strong>not configured</strong> (heuristic analysis active)
          </div>
        </div>
      </div>

      {/* Optional Metadata Context Fields */}
      <div style={{ marginTop: '14px', background: '#FAFAFA', border: '1px solid var(--color-border-light)', borderRadius: '6px', padding: '12px 14px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em', marginBottom: '8px' }}>
          Optional Sender &amp; Category Context (Feature 1):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11.5px', color: '#64748B', display: 'block', marginBottom: '2px' }}>
              Sender Name / Phone / Email:
            </label>
            <input
              type="text"
              value={sender || ''}
              onChange={(e) => setSender && setSender(e.target.value)}
              placeholder="e.g. HR Desk / +1 555 0100"
              style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '4px', border: '1px solid #CBD5E1', background: 'white' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11.5px', color: '#64748B', display: 'block', marginBottom: '2px' }}>
              Message Category:
            </label>
            <select
              value={category || ''}
              onChange={(e) => setCategory && setCategory(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '4px', border: '1px solid #CBD5E1', background: 'white' }}
            >
              <option value="">Auto-Detect from Text</option>
              <option value="job">Job &amp; Internship Offer</option>
              <option value="banking">Banking, UPI &amp; KYC</option>
              <option value="delivery">Courier &amp; Delivery</option>
              <option value="prize">Lottery &amp; Prize Award</option>
              <option value="impersonation">Govt / Police / Official</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', color: '#64748B', display: 'block', marginBottom: '2px' }}>
              Received Timestamp:
            </label>
            <input
              type="text"
              value={timestamp || ''}
              onChange={(e) => setTimestamp && setTimestamp(e.target.value)}
              placeholder="e.g. Today at 10:30 AM"
              style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '4px', border: '1px solid #CBD5E1', background: 'white' }}
            />
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'var(--color-high-bg)',
            color: 'var(--color-high-text)',
            borderRadius: '6px',
            border: '1px solid var(--color-high-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{error.message}</span>
          </div>
          <button
            onClick={onAnalyze}
            className="btn-secondary"
            style={{ padding: '6px 12px', minHeight: 'auto', fontSize: '12.5px', background: 'white' }}
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            id="btn-analyze"
            className="btn-primary"
            onClick={onAnalyze}
            disabled={isLoading || isOverLimit}
            aria-busy={isLoading}
            style={{ cursor: isLoading ? 'wait' : 'pointer' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span aria-live="polite">Analysing message...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Analyse Message</span>
              </>
            )}
          </button>

          <button
            id="btn-clear"
            className="btn-secondary"
            onClick={onClear}
            disabled={isLoading || (!text && !url)}
          >
            <Trash2 size={15} />
            <span>Clear</span>
          </button>
        </div>

        <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          On-device analysis &bull; Zero storage &bull; No login required &nbsp;&bull;&nbsp;
          <kbd style={{ fontSize: '11px', background: '#E2E8F0', padding: '1px 5px', borderRadius: '3px', border: '1px solid #CBD5E1', fontFamily: 'monospace' }}>Ctrl</kbd>
          +
          <kbd style={{ fontSize: '11px', background: '#E2E8F0', padding: '1px 5px', borderRadius: '3px', border: '1px solid #CBD5E1', fontFamily: 'monospace' }}>↵</kbd>
          &nbsp;to analyse
        </div>
      </div>
    </section>
  );
}
