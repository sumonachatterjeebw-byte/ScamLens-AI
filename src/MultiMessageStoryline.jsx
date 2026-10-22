import React, { useState } from 'react';
import {
  GitCommit,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { analyzeStoryline } from '../api';

const BENCHMARK_STORYLINE = [
  {
    id: 'm1',
    sender: 'Northwind Careers Team',
    timestamp: '10:05 AM',
    channel: 'SMS',
    text: 'Hello! Your resume was reviewed for our Remote Data Analyst position. We would like to offer you the role. Please confirm your acceptance.'
  },
  {
    id: 'm2',
    sender: 'HR Coordinator (Alex)',
    timestamp: '10:20 AM',
    channel: 'SMS',
    text: 'Congratulations! Your monthly compensation will be 40,000 per month with no prior interview required. Please connect with our senior HR on Telegram @Northwind_HR to receive your appointment letter.'
  },
  {
    id: 'm3',
    sender: 'Northwind Verification Desk',
    timestamp: '10:45 AM',
    channel: 'WhatsApp / Telegram',
    text: 'To issue your official offer letter and dispatch your company laptop kit, kindly submit a refundable registration fee of 2,500 via UPI within the next 60 minutes or your placement will be forfeited.'
  }
];

export default function MultiMessageStoryline() {
  const [messages, setMessages] = useState(BENCHMARK_STORYLINE);
  const [caseTitle, setCaseTitle] = useState('Internship Phishing Campaign Investigation');
  const [newMessage, setNewMessage] = useState({
    sender: '',
    timestamp: '',
    channel: 'SMS',
    text: ''
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAddMessage = (e) => {
    e.preventDefault();
    if (!newMessage.text.trim()) return;

    const msg = {
      id: `msg-${Date.now()}`,
      sender: newMessage.sender.trim() || 'Unknown Sender',
      timestamp: newMessage.timestamp.trim() || `Step #${messages.length + 1}`,
      channel: newMessage.channel,
      text: newMessage.text.trim()
    };

    setMessages([...messages, msg]);
    setNewMessage({ sender: '', timestamp: '', channel: 'SMS', text: '' });
    setAnalysisResult(null);
  };

  const handleRemoveMessage = (id) => {
    setMessages(messages.filter(m => m.id !== id));
    setAnalysisResult(null);
  };

  const handleClearCase = () => {
    setMessages([]);
    setAnalysisResult(null);
  };

  const handleLoadBenchmark = () => {
    setMessages(BENCHMARK_STORYLINE);
    setCaseTitle('Internship Phishing Campaign Investigation');
    setAnalysisResult(null);
  };

  const runStorylineAnalysis = async () => {
    if (messages.length === 0) return;
    setIsAnalyzing(true);
    try {
      const data = await analyzeStoryline(messages, caseTitle);
      setAnalysisResult(data);
    } catch (err) {
      console.error('Storyline analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section aria-labelledby="storyline-heading" style={{ marginTop: '10px' }}>
      {/* Intro Banner */}
      <div style={{
        background: 'white',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1F3A5F', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <GitCommit size={14} />
          <span>Feature 3: Phased Social Engineering Detection</span>
        </div>
        <h2 id="storyline-heading" style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginTop: '4px' }}>
          Multi-Message Scam Storyline
        </h2>
        <p style={{ fontSize: '14px', color: '#475569', maxWidth: '840px', marginTop: '6px', lineHeight: '1.5' }}>
          Scammers rarely execute fraud in a single message. Use this temporary investigation case to correlate
          sequential communications, identify escalating time-pressure, channel shifting, and emerging payment demands.
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
          <button
            onClick={handleLoadBenchmark}
            className="btn-secondary"
            style={{ fontSize: '12.5px', padding: '6px 12px' }}
          >
            Load Benchmark Case (3-Step Phishing)
          </button>
          <button
            onClick={handleClearCase}
            style={{
              padding: '6px 12px',
              fontSize: '12.5px',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              background: 'white',
              color: '#991B1B',
              cursor: 'pointer'
            }}
          >
            Clear Case Data
          </button>
          <span style={{ fontSize: '12px', color: '#64748B', alignSelf: 'center', marginLeft: '6px' }}>
            Stored in volatile temporary memory only &bull; Never written to server disk
          </span>
        </div>
      </div>

      {/* Case Management Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Left Column: Messages Timeline */}
        <div className="sl-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--color-primary)' }}>
              Case Timeline ({messages.length} Messages)
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Chronological order
            </span>
          </div>

          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
              <p style={{ fontSize: '13.5px', color: '#64748B' }}>No messages in this case yet.</p>
              <button onClick={handleLoadBenchmark} className="btn-primary" style={{ marginTop: '10px', fontSize: '12.5px' }}>
                Load Sample Scenario
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  style={{
                    border: '1px solid var(--color-border-light)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    background: '#FAFAFA',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {index + 1}
                      </span>
                      <strong style={{ fontSize: '13px', color: '#1E293B' }}>{msg.sender}</strong>
                      <span style={{ fontSize: '11px', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>
                        {msg.channel}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>{msg.timestamp}</span>
                      <button
                        onClick={() => handleRemoveMessage(msg.id)}
                        style={{ color: '#94A3B8', hover: { color: '#991B1B' } }}
                        title="Remove message"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.45', whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </p>
                </div>
              ))}

              <button
                onClick={runStorylineAnalysis}
                disabled={isAnalyzing}
                className="btn-primary"
                style={{ width: '100%', marginTop: '8px', padding: '10px', fontSize: '13.5px' }}
              >
                {isAnalyzing ? 'Correlating Messages...' : 'Run Multi-Message Correlation Analysis'}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Add New Message Form */}
        <div className="sl-card">
          <h3 style={{ fontSize: '16px', color: 'var(--color-primary)', marginBottom: '8px' }}>
            Add Message to Case
          </h3>
          <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '14px' }}>
            Paste subsequent SMS, emails, or chat transcripts to investigate progression.
          </p>

          <form onSubmit={handleAddMessage} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '3px' }}>
                Sender Name / Identifier:
              </label>
              <input
                type="text"
                value={newMessage.sender}
                onChange={(e) => setNewMessage({ ...newMessage, sender: e.target.value })}
                placeholder="e.g. HR Desk / +1 555 0199 / Recruiter"
                style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '5px', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '3px' }}>
                  Timestamp / Time:
                </label>
                <input
                  type="text"
                  value={newMessage.timestamp}
                  onChange={(e) => setNewMessage({ ...newMessage, timestamp: e.target.value })}
                  placeholder="e.g. 10:15 AM or Day 2"
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '5px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '3px' }}>
                  Channel:
                </label>
                <select
                  value={newMessage.channel}
                  onChange={(e) => setNewMessage({ ...newMessage, channel: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '5px', border: '1px solid var(--color-border)' }}
                >
                  <option value="SMS">SMS</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telegram">Telegram</option>
                  <option value="Email">Email</option>
                  <option value="Phone Call">Phone Call</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '3px' }}>
                Message Text:
              </label>
              <textarea
                rows={4}
                value={newMessage.text}
                onChange={(e) => setNewMessage({ ...newMessage, text: e.target.value })}
                placeholder="Paste message content here..."
                style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '5px', border: '1px solid var(--color-border)' }}
              />
            </div>

            <button
              type="submit"
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px' }}
            >
              <Plus size={16} />
              <span>Add to Case Timeline</span>
            </button>
          </form>
        </div>
      </div>

      {/* Storyline Analysis Result View */}
      {analysisResult && (
        <div className="sl-card" style={{ borderLeft: '6px solid var(--color-primary)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#0F766E', letterSpacing: '0.04em' }}>
                Multi-Message Forensic Synthesis
              </span>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', marginTop: '2px' }}>
                {analysisResult.case_title}
              </h3>
            </div>
            <span style={{ fontSize: '12px', background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontWeight: '600', color: '#334155' }}>
              {analysisResult.message_count} Messages Analyzed
            </span>
          </div>

          <p style={{ fontSize: '14px', color: '#1E293B', marginBottom: '16px', lineHeight: '1.5' }}>
            {analysisResult.progression_summary}
          </p>

          {/* Detected Cross-Message Patterns */}
          {analysisResult.detected_patterns && analysisResult.detected_patterns.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Detected Attack Flow Patterns ({analysisResult.detected_patterns.length}):
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {analysisResult.detected_patterns.map((p, idx) => (
                  <div key={idx} style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '12px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400E', fontWeight: '700', fontSize: '13px' }}>
                      <AlertTriangle size={15} />
                      <span>{p.pattern_type}</span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#78350F', marginTop: '4px', lineHeight: '1.4' }}>
                      {p.description}
                    </p>
                    {p.evidence && p.evidence.length > 0 && (
                      <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#92400E', fontStyle: 'italic' }}>
                        Quoted signal: "{p.evidence[0]}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmed Observations vs Inferred Relationships */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '18px' }}>
            {/* Confirmed Observations */}
            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#0F766E', letterSpacing: '0.04em', marginBottom: '6px' }}>
                Confirmed Direct Observations:
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {analysisResult.confirmed_observations.map((obs, i) => (
                  <li key={i}>{obs}</li>
                ))}
              </ul>
            </div>

            {/* Inferred Relationships & Uncertainties */}
            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.04em', marginBottom: '6px' }}>
                Inferred Hypotheses &amp; Unknowns:
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {analysisResult.inferred_relationships.map((inf, i) => (
                  <li key={i}>{inf}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Safe Next Steps */}
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '14px', borderRadius: '8px', marginBottom: '14px' }}>
            <h5 style={{ fontSize: '12.5px', fontWeight: '700', textTransform: 'uppercase', color: '#166534', marginBottom: '6px' }}>
              Recommended Next Actions for this Case:
            </h5>
            <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#14532D', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {analysisResult.safe_next_steps.map((st, i) => (
                <li key={i} style={{ fontWeight: '500' }}>{st}</li>
              ))}
            </ul>
          </div>

          <div style={{ fontSize: '11.5px', color: '#64748B', fontStyle: 'italic' }}>
            Privacy Note: {analysisResult.privacy_note}
          </div>
        </div>
      )}
    </section>
  );
}
