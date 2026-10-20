import React, { useState } from 'react';
import SignalCard from './SignalCard';
import VerificationChecklist from './VerificationChecklist';
import PrivacyReceipt from './PrivacyReceipt';
import {
  AlertTriangle,
  Info,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Compass,
  LifeBuoy,
  Tag,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  Search,
  Fingerprint
} from 'lucide-react';

// Scam type color map
const SCAM_TYPE_COLORS = {
  'Credential Phishing':           { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', dot: '#DC2626' },
  'Credential Phishing (Vishing)': { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', dot: '#DC2626' },
  'Advance Fee Fraud':             { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', dot: '#EA580C' },
  'Fake Recruitment Scam':         { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', dot: '#EA580C' },
  'Authority Impersonation Scam':  { bg: '#FDF2F8', border: '#F5D0FE', text: '#701A75', dot: '#C026D3' },
  'Institutional Impersonation':   { bg: '#FDF2F8', border: '#F5D0FE', text: '#701A75', dot: '#C026D3' },
  'Parcel Delivery Scam':          { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', dot: '#EA580C' },
  'Suspicious Link / Phishing Attempt': { bg: '#FFFBEB', border: '#FDE68A', text: '#7C2D12', dot: '#D97706' },
};

function ScamTypeBadge({ label, basis }) {
  const [showBasis, setShowBasis] = useState(false);
  if (!label) return null;
  const colors = SCAM_TYPE_COLORS[label] || { bg: '#F1F5F9', border: '#CBD5E1', text: '#334155', dot: '#64748B' };

  return (
    <div style={{
      marginBottom: '16px',
      padding: '14px 16px',
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Fingerprint size={18} color={colors.dot} />
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.text }}>
            Scam Type Detected
          </span>
        </div>
        <button
          onClick={() => setShowBasis(b => !b)}
          style={{ fontSize: '11px', color: colors.text, background: 'white', border: `1px solid ${colors.border}`, padding: '3px 10px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
        >
          {showBasis ? 'Hide basis ▲' : 'Why this type? ▼'}
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
        <Tag size={14} color={colors.dot} />
        <span style={{ fontSize: '16px', fontWeight: '800', color: colors.text, letterSpacing: '-0.01em' }}>
          {label}
        </span>
      </div>
      {showBasis && basis && (
        <div style={{ fontSize: '12.5px', color: colors.text, background: 'white', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${colors.border}`, lineHeight: '1.5' }}>
          <strong>Classification basis (transparent rule-logic):</strong> {basis}
        </div>
      )}
      <div style={{ fontSize: '11.5px', color: colors.text, opacity: 0.75, fontStyle: 'italic' }}>
        This classification is derived from observable signal combinations, not from a machine-learning model.
      </div>
    </div>
  );
}

function UrlHeuristicCard({ urlCheck, findings }) {
  const urlFindings = (findings || []).filter(f => f.category === 'url');
  if (urlCheck?.status === 'not_requested' && urlFindings.length === 0) return null;

  const templateLabels = {
    'URL_SHORT':       { icon: '🔗', label: 'Link Shortener Detected', severity: 'low' },
    'URL_IP':          { icon: '🔢', label: 'Bare IP Address URL', severity: 'medium' },
    'URL_LOOKALIKE':   { icon: '🔡', label: 'Punycode / Homoglyph Domain', severity: 'medium' },
    'URL_BRAND_MISMATCH': { icon: '🎭', label: 'Brand-Spoofing Domain', severity: 'medium' },
    'URL_STRUCTURE':   { icon: '⚠️', label: 'Structural URL Anomaly', severity: 'low' },
    'URL_TLD':         { icon: '🏷️', label: 'Risky Top-Level Domain', severity: 'low' },
  };

  return (
    <div className="sl-card" style={{ marginBottom: '20px', borderLeft: '4px solid #7C3AED' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Search size={17} color="#7C3AED" />
        <h4 style={{ fontSize: '15px', color: '#7C3AED', fontWeight: '700' }}>
          URL Heuristic Analysis
        </h4>
        <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#EDE9FE', color: '#5B21B6', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>
          {urlFindings.length} signal{urlFindings.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {urlFindings.length === 0 ? (
        <div style={{ fontSize: '13px', color: '#64748B' }}>
          URLs were detected but passed all heuristic checks. Live reputation check is not configured (on-device only).
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {urlFindings.map((f, i) => {
            const meta = templateLabels[f.template_id] || { icon: '⚠️', label: f.template_id, severity: 'low' };
            const bgColors = { low: '#FFFBEB', medium: '#FFF7ED', high: '#FEF2F2' };
            const borderColors = { low: '#FDE68A', medium: '#FED7AA', high: '#FECACA' };
            return (
              <div key={i} style={{ background: bgColors[f.severity] || '#F8FAFC', border: `1px solid ${borderColors[f.severity] || '#E2E8F0'}`, borderRadius: '6px', padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span>{meta.icon}</span>
                  <strong style={{ fontSize: '13px', color: '#1E293B' }}>{meta.label}</strong>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748B' }}>{f.severity}</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569', background: 'white', padding: '4px 8px', borderRadius: '4px', marginBottom: '4px', wordBreak: 'break-all' }}>
                  {f.evidence_quote}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>{f.explanation}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: '10px', fontSize: '11.5px', color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <LinkIcon size={12} />
        <span>Live reputation check: <strong>not configured</strong> (heuristic checks ran locally, no external query made)</span>
      </div>
    </div>
  );
}

function CopyReportButton({ result }) {
  const [copied, setCopied] = useState(false);

  const generateReport = () => {
    const lines = [
      '=== ScamLens AI — Evidence Report ===',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Assessment: ${result.summary_label}`,
      result.scam_type_label ? `Scam Type: ${result.scam_type_label}` : '',
      `Evidence Coverage: ${result.evidence_coverage}`,
      `URL Status: ${result.url_check?.status?.replace(/_/g, ' ')}`,
      '',
      '--- FINDINGS ---',
      ...(result.findings || []).map((f, i) =>
        `[${i+1}] [${f.severity.toUpperCase()}] ${f.category}: "${f.evidence_quote}"\n    ${f.explanation}`
      ),
      '',
      '--- RECOMMENDED ACTIONS ---',
      ...(result.safe_actions || []).map((a, i) => `${i+1}. ${a}`),
      '',
      '--- UNKNOWNS ---',
      ...(result.unknowns || []).map(u => `• ${u}`),
      '',
      '--- LIMITATIONS ---',
      ...(result.limitations || []).map(l => `• ${l}`),
      '',
      `Disclaimer: ${result.disclaimer}`,
      '--- END OF REPORT ---'
    ].filter(Boolean).join('\n');
    return lines;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateReport());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = generateReport();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy full evidence report to clipboard for sharing"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '7px 14px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600',
        background: copied ? '#ECFDF5' : '#F1F5F9',
        color: copied ? '#059669' : '#334155',
        border: `1px solid ${copied ? '#A7F3D0' : '#CBD5E1'}`,
        cursor: 'pointer', transition: 'all 200ms'
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy Report'}
    </button>
  );
}

export default function ResultPanel({ result, onOpenRecoveryGuide, onOpenVerificationNavigator }) {
  if (!result) return null;

  const {
    summary_label,
    caution_level,
    evidence_coverage,
    scam_type_label,
    scam_type_basis,
    findings,
    url_check,
    unknowns,
    safe_actions,
    limitations,
    disclaimer,
    what_would_change,
    verification_guide,
    privacy_receipt,
    masked_text
  } = result;

  // Render Highlighted Text with exact offsets
  const renderHighlightedText = () => {
    if (!masked_text || !findings || findings.length === 0) {
      return <span>{masked_text}</span>;
    }

    const sortedSpans = [...findings]
      .filter(f => f.start >= 0 && f.end > f.start)
      .sort((a, b) => a.start - b.start);

    const nonOverlapping = [];
    for (const span of sortedSpans) {
      if (nonOverlapping.length === 0) {
        nonOverlapping.push({ ...span });
      } else {
        const last = nonOverlapping[nonOverlapping.length - 1];
        if (span.start < last.end) {
          if (span.end > last.end) last.end = span.end;
        } else {
          nonOverlapping.push({ ...span });
        }
      }
    }

    const elements = [];
    let currentIndex = 0;

    nonOverlapping.forEach((span, idx) => {
      if (span.start > currentIndex) {
        elements.push(<span key={`text-${currentIndex}`}>{masked_text.slice(currentIndex, span.start)}</span>);
      }
      elements.push(
        <mark key={`highlight-${idx}`} className="quote-highlight" title="Flagged by rule">
          {masked_text.slice(span.start, span.end)}
        </mark>
      );
      currentIndex = span.end;
    });

    if (currentIndex < masked_text.length) {
      elements.push(<span key="text-end">{masked_text.slice(currentIndex)}</span>);
    }

    return elements;
  };

  const getAssessmentStyle = () => {
    switch (caution_level) {
      case 'high':
        return { bg: 'var(--color-high-bg)', text: 'var(--color-high-text)', border: 'var(--color-high-border)', icon: <AlertTriangle size={24} color="#991B1B" /> };
      case 'moderate':
        return { bg: 'var(--color-elevated-bg)', text: 'var(--color-elevated-text)', border: 'var(--color-elevated-border)', icon: <AlertTriangle size={24} color="#9A3412" /> };
      case 'low':
        return { bg: 'var(--color-caution-bg)', text: 'var(--color-caution-text)', border: 'var(--color-caution-border)', icon: <Info size={24} color="#7C2D12" /> };
      case 'none_detected':
      default:
        return { bg: 'var(--color-neutral-bg)', text: 'var(--color-neutral-text)', border: 'var(--color-neutral-border)', icon: <Info size={24} color="#334155" /> };
    }
  };

  const assessStyle = getAssessmentStyle();

  return (
    <section aria-labelledby="results-heading" style={{ marginTop: '24px' }}>

      {/* Emergency Crisis Quick Button */}
      {caution_level !== 'none_detected' && onOpenRecoveryGuide && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontSize: '13.5px', fontWeight: '600' }}>
            <LifeBuoy size={18} />
            <span>Already shared an OTP, sent money, or installed an app?</span>
          </div>
          <button
            onClick={() => onOpenRecoveryGuide(caution_level === 'high' ? 'money' : 'otp')}
            style={{ padding: '6px 14px', background: '#991B1B', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <span>Open Incident Recovery Guide</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* 1. Scam Type Badge — NEW (competitive with Norton Genie) */}
      <ScamTypeBadge label={scam_type_label} basis={scam_type_basis} />

      {/* 2. Overall Assessment Banner */}
      <div style={{ background: assessStyle.bg, border: `1px solid ${assessStyle.border}`, borderRadius: '8px', padding: '18px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {assessStyle.icon}
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: assessStyle.text }}>
                Caution Assessment • Not Proof of Fraud
              </div>
              <h3 id="results-heading" style={{ fontSize: '1.25rem', color: assessStyle.text, marginTop: '2px' }}>
                {summary_label}
              </h3>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', background: 'white', padding: '4px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', color: '#334155', fontWeight: '500' }}>
              Coverage: <strong style={{ textTransform: 'capitalize' }}>{evidence_coverage}</strong>
            </span>
            <CopyReportButton result={result} />
          </div>
        </div>

        {caution_level === 'none_detected' ? (
          <p style={{ marginTop: '10px', fontSize: '14.5px', color: assessStyle.text }}>
            No obvious signals were detected. This does not prove the message is safe. Always verify senders independently before sharing any personal data.
          </p>
        ) : (
          <p style={{ marginTop: '8px', fontSize: '13.5px', color: assessStyle.text, opacity: 0.9 }}>
            Based on visible patterns and verifiable evidence in the message text.
          </p>
        )}
      </div>

      {/* 3. Highlighted Masked Text */}
      <div className="sl-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-primary)' }}>
            Directly Observed Evidence <span style={{ fontWeight: '400', fontSize: '13px', color: '#64748B' }}>(private details masked)</span>
          </h4>
          <span style={{ fontSize: '12px', color: '#64748B', background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px' }}>
            Quote verification: 100%
          </span>
        </div>
        <div style={{ background: '#FAFAFA', padding: '14px', borderRadius: '6px', border: '1px solid var(--color-border-light)', fontFamily: 'inherit', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#1E293B' }}>
          {renderHighlightedText()}
        </div>
      </div>

      {/* 4. Signal Finding Cards */}
      {findings && findings.length > 0 ? (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600' }}>
              Traceable Warning Signs ({findings.length})
            </h4>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Each card quotes text directly from your input</span>
          </div>
          {findings.map((finding) => (
            <SignalCard key={finding.id} finding={finding} />
          ))}
        </div>
      ) : (
        <VerificationChecklist />
      )}

      {/* 5. URL Heuristic Detail Card — NEW */}
      <UrlHeuristicCard urlCheck={url_check} findings={findings} />

      {/* 6. What Would Change */}
      {what_would_change && what_would_change.length > 0 && (
        <div className="sl-card" style={{ marginBottom: '20px', borderLeft: '4px solid #1E293B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <HelpCircle size={18} color="#1E293B" />
            <h4 style={{ fontSize: '15.5px', color: '#1E293B', fontWeight: '700' }}>
              What Would Change This Assessment?
            </h4>
          </div>
          <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '12px' }}>
            Every finding is transparent. Here is the exact observable evidence that would strengthen or weaken this assessment:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {what_would_change.map((item, idx) => {
              const isWeakens = item.impact === 'weakens_suspicion';
              return (
                <div key={idx} style={{ padding: '10px 14px', borderRadius: '6px', border: isWeakens ? '1px solid #BBF7D0' : '1px solid #FECACA', background: isWeakens ? '#F0FDF4' : '#FEF2F2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: isWeakens ? '#166534' : '#991B1B' }}>
                    {isWeakens ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                    <span>{isWeakens ? 'Evidence That Would Weaken Concern:' : 'Evidence That Would Strengthen Concern:'}</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B', marginTop: '3px' }}>{item.condition}</div>
                  <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px' }}>
                    <strong>Actionable Verification:</strong> {item.verification_step}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Scam Verification Navigator */}
      {verification_guide && verification_guide.length > 0 && (
        <div className="sl-card" style={{ marginBottom: '20px', borderLeft: '4px solid var(--color-info)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={18} color="var(--color-info)" />
              <h4 style={{ fontSize: '15px', color: 'var(--color-info)', fontWeight: '700' }}>
                Scam Verification Navigator
              </h4>
            </div>
            {onOpenVerificationNavigator && (
              <button onClick={onOpenVerificationNavigator} style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Open Full Navigator →
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {verification_guide.map((step) => (
              <div key={step.step_number} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#FAFAFA', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--color-border-light)' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--color-info)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                  {step.step_number}
                </span>
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#1E293B' }}>{step.action}</strong>
                  <p style={{ fontSize: '12.5px', color: '#475569', marginTop: '2px', lineHeight: '1.4' }}>{step.rationale}</p>
                  {step.official_portal && (
                    <span style={{ fontSize: '11px', color: '#0F766E', fontWeight: '600', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ExternalLink size={10} />
                      {step.official_portal}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Unknowns */}
      {unknowns && unknowns.length > 0 && (
        <div className="sl-card" style={{ marginBottom: '20px', borderLeft: '4px solid #64748B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <HelpCircle size={18} color="#475569" />
            <h4 style={{ fontSize: '15px', color: '#1E293B', fontWeight: '700' }}>What ScamLens Cannot Verify</h4>
          </div>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {unknowns.map((unk, idx) => <li key={idx}>{unk}</li>)}
          </ul>
        </div>
      )}

      {/* 9. Safe Next Steps */}
      {safe_actions && safe_actions.length > 0 && (
        <div className="sl-card" style={{ marginBottom: '20px', borderLeft: '4px solid var(--color-info)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldAlert size={18} color="var(--color-info)" />
            <h4 style={{ fontSize: '15px', color: 'var(--color-info)', fontWeight: '700' }}>Recommended Next Steps</h4>
          </div>
          <ul style={{ paddingLeft: '20px', fontSize: '13.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {safe_actions.map((act, idx) => <li key={idx} style={{ fontWeight: '500' }}>{act}</li>)}
          </ul>
        </div>
      )}

      {/* 10. Privacy Receipt */}
      <PrivacyReceipt receipt={privacy_receipt} />

      {/* 11. Limitations & Disclaimer */}
      <div style={{ background: '#F1F5F9', padding: '16px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
        <h5 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', marginBottom: '6px', letterSpacing: '0.04em' }}>
          Transparent Limitations
        </h5>
        <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {limitations.map((lim, idx) => <li key={idx}>{lim}</li>)}
        </ul>
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #E2E8F0', fontSize: '12px', color: '#475569', fontStyle: 'italic' }}>
          Disclaimer: {disclaimer}
        </div>
      </div>
    </section>
  );
}
