import React, { useState } from 'react';
import CountryCodeSelector from './CountryCodeSelector';
import {
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Clock,
  Trash2,
  CheckCircle,
  HelpCircle,
  Radio,
  FileCheck,
  Lock,
  MessageSquare,
  Sparkles,
  Ban,
  ChevronRight
} from 'lucide-react';
import { SIMULATED_CALLS } from '../samples';

export default function ShieldSimulator() {
  const [activeScreen, setActiveScreen] = useState('simulator'); // 'simulator' | 'permissions' | 'history' | 'settings'
  const [simulatedCall, setSimulatedCall] = useState(null); // active ringing call state
  const [callStatus, setCallStatus] = useState('idle'); // 'idle' | 'ringing' | 'inspecting' | 'post_call'
  const [checklist, setChecklist] = useState({
    otp: false,
    urgency: false,
    money: false,
    official: false,
    install_app: false
  });
  const [history, setHistory] = useState([
    {
      id: 'h1',
      last4: '0100',
      time: '12 minutes ago',
      signals: ['Number not in contacts', 'Carrier unverified'],
      action: 'Dismissed'
    },
    {
      id: 'h2',
      last4: '0111',
      time: '2 hours ago',
      signals: ['Saved in contacts (Library Desk)'],
      action: 'Answered'
    }
  ]);
  const [customNumber, setCustomNumber] = useState('+1 555 0142');

  // Permissions state
  const [permissions, setPermissions] = useState({
    call_screening: true,
    contacts: true,
    notifications: true,
    sms_screening: false
  });

  const [settings, setSettings] = useState({
    silenceSuspicious: false,
    store30Days: true,
    homeCountryIso: 'IN',
    homeCountryCode: '+91'
  });

  const triggerCallSimulation = (callScenario) => {
    setSimulatedCall(callScenario);
    setCallStatus('ringing');
    setChecklist({
      otp: false,
      urgency: false,
      money: false,
      official: false,
      install_app: false
    });
  };

  const handleDismissCall = () => {
    if (simulatedCall) {
      const last4 = simulatedCall.number.slice(-4);
      setHistory(prev => [
        {
          id: `h-${Date.now()}`,
          last4: last4,
          time: 'Just now',
          signals: simulatedCall.signals,
          action: 'Dismissed'
        },
        ...prev
      ]);
    }
    setCallStatus('idle');
    setSimulatedCall(null);
  };

  const handleBlockCall = () => {
    if (simulatedCall) {
      const last4 = simulatedCall.number.slice(-4);
      setHistory(prev => [
        {
          id: `h-${Date.now()}`,
          last4: last4,
          time: 'Just now',
          signals: simulatedCall.signals,
          action: 'Blocked by user'
        },
        ...prev
      ]);
    }
    setCallStatus('idle');
    setSimulatedCall(null);
  };

  const handleAnswerAndEnd = () => {
    setCallStatus('post_call');
  };

  const submitPostCallReport = () => {
    if (simulatedCall) {
      const reportedSignals = [];
      if (checklist.otp) reportedSignals.push('User reported: Asked for OTP/PIN');
      if (checklist.urgency) reportedSignals.push('User reported: Threat or urgency');
      if (checklist.money) reportedSignals.push('User reported: Demanded money/fee');
      if (checklist.official) reportedSignals.push('User reported: Impersonated bank/police');
      if (checklist.install_app) reportedSignals.push('User reported: Demanded app install');

      const last4 = simulatedCall.number.slice(-4);
      setHistory(prev => [
        {
          id: `h-${Date.now()}`,
          last4: last4,
          time: 'Just now',
          signals: [...simulatedCall.signals, ...reportedSignals],
          action: 'Post-call checklist logged'
        },
        ...prev
      ]);
    }
    setCallStatus('idle');
    setSimulatedCall(null);
  };

  return (
    <div style={{ marginTop: '10px' }}>
      {/* Intro banner */}
      <div style={{ background: '#1F3A5F', color: 'white', borderRadius: '10px', padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
              <Lock size={12} />
              <span>100% On-Device Privacy Architecture &bull; Zero Network Permissions</span>
            </div>
            <h2 style={{ fontSize: '1.45rem', marginTop: '8px', color: 'white' }}>
              ScamLens Shield — Call &amp; SMS Protection Companion
            </h2>
            <p style={{ fontSize: '14px', color: '#CBD5E1', maxWidth: '780px', marginTop: '4px' }}>
              Unlike traditional apps that upload your contacts to cloud databases, ScamLens Shield screens calls using only device-observed facts and warns about SMS using on-device rules.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveScreen('simulator')}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: activeScreen === 'simulator' ? 'white' : 'rgba(255,255,255,0.1)',
                color: activeScreen === 'simulator' ? '#1F3A5F' : 'white',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              Interactive Simulator
            </button>
            <button
              onClick={() => setActiveScreen('permissions')}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: activeScreen === 'permissions' ? 'white' : 'rgba(255,255,255,0.1)',
                color: activeScreen === 'permissions' ? '#1F3A5F' : 'white',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              Permissions
            </button>
            <button
              onClick={() => setActiveScreen('history')}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: activeScreen === 'history' ? 'white' : 'rgba(255,255,255,0.1)',
                color: activeScreen === 'history' ? '#1F3A5F' : 'white',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              History ({history.length})
            </button>
            <button
              onClick={() => setActiveScreen('settings')}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: activeScreen === 'settings' ? 'white' : 'rgba(255,255,255,0.1)',
                color: activeScreen === 'settings' ? '#1F3A5F' : 'white',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Screen 1: Simulator */}
      {activeScreen === 'simulator' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Controls Column */}
          <div className="sl-card">
            <h3 style={{ fontSize: '16px', color: 'var(--color-primary)', marginBottom: '8px' }}>
              Simulate Device Events (Section 7 &amp; 11)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
              Test how incoming calls and SMS are handled locally on Android API 29+ (CallScreeningService).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SIMULATED_CALLS.map((call) => (
                <div
                  key={call.id}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    background: '#FAFAFA'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '14px', color: '#1E293B' }}>{call.name}</strong>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#475569' }}>{call.number}</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0 8px 0' }}>
                    {call.description}
                  </p>
                  <button
                    className="btn-primary"
                    style={{ padding: '6px 14px', minHeight: '34px', fontSize: '12.5px', width: '100%' }}
                    onClick={() => triggerCallSimulation(call)}
                  >
                    <PhoneIncoming size={14} />
                    <span>Simulate Incoming Ringing Call</span>
                  </button>
                </div>
              ))}

              {/* Custom Number Input */}
              <div style={{ border: '1px dashed var(--color-border)', borderRadius: '8px', padding: '12px 14px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Custom Emulator Call:</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <input
                    type="text"
                    value={customNumber}
                    onChange={(e) => setCustomNumber(e.target.value)}
                    style={{ flex: '1', padding: '6px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                  />
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', minHeight: '34px', fontSize: '12.5px' }}
                    onClick={() => triggerCallSimulation({
                      id: 'custom',
                      name: 'Custom Incoming Call',
                      number: customNumber,
                      signals: ['Number not in contacts', 'Carrier verification unverified', 'Unfamiliar prefix'],
                      verified: false,
                      inContacts: false
                    })}
                  >
                    Simulate
                  </button>
                </div>
              </div>
            </div>

            {/* ADB command references */}
            <div style={{ marginTop: '16px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', fontSize: '11.5px', color: '#475569' }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Real Emulator ADB Commands:</div>
              <code style={{ display: 'block', fontFamily: 'var(--font-mono)', color: '#0F766E' }}>adb emu gsm call 5550100</code>
              <code style={{ display: 'block', fontFamily: 'var(--font-mono)', color: '#0F766E', marginTop: '2px' }}>adb emu sms send 5550100 "ALERT: OTP required"</code>
            </div>
          </div>

          {/* Interactive Mobile Device Frame */}
          <div className="sl-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0F172A', color: 'white', padding: '24px 16px' }}>
            <div style={{ width: '100%', maxWidth: '340px', background: '#1E293B', borderRadius: '24px', border: '4px solid #334155', overflow: 'hidden', minHeight: '520px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              
              {/* Phone Notch & Status Bar */}
              <div style={{ background: '#0F172A', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94A3B8' }}>
                <span>12:45</span>
                <div style={{ width: '60px', height: '4px', background: '#334155', borderRadius: '4px' }}></div>
                <span>5G &bull; 92%</span>
              </div>

              {/* Screen Body */}
              <div style={{ padding: '16px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                
                {callStatus === 'idle' && (
                  <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#334155', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PhoneCall size={28} color="#94A3B8" />
                    </div>
                    <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '4px' }}>Device Ready</h4>
                    <p style={{ fontSize: '12px', lineHeight: '1.4' }}>
                      CallScreeningService is registered. Click "Simulate Incoming Call" on the left to see live heads-up screening.
                    </p>
                  </div>
                )}

                {callStatus === 'ringing' && simulatedCall && (
                  <div>
                    {/* Truecaller-style Heads-up Notification Card */}
                    <div style={{
                      background: simulatedCall.verified ? '#1E293B' : '#FEF3C7',
                      color: simulatedCall.verified ? 'white' : '#7C2D12',
                      borderRadius: '12px',
                      padding: '14px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      marginBottom: '16px',
                      border: simulatedCall.verified ? '1px solid #475569' : '1px solid #FDE68A'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <ShieldAlert size={16} color={simulatedCall.verified ? '#38BDF8' : '#7C2D12'} />
                        <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                          ScamLens Shield Alert
                        </span>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: simulatedCall.verified ? 'white' : '#7C2D12' }}>
                        {simulatedCall.inContacts ? 'Known Contact' : 'Unknown / Unverified Caller'}
                      </div>
                      <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', margin: '2px 0 6px 0' }}>
                        {simulatedCall.number}
                      </div>
                      <p style={{ fontSize: '11.5px', lineHeight: '1.3', opacity: 0.9 }}>
                        {simulatedCall.verified
                          ? 'Carrier verified caller ID. Matched in personal contacts.'
                          : 'Carrier did not verify caller ID. This is a caution, not proof.'}
                      </p>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                        <button
                          onClick={() => setCallStatus('inspecting')}
                          style={{ flex: '1', padding: '6px', background: 'white', color: '#1E293B', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}
                        >
                          Open Details
                        </button>
                        <button
                          onClick={handleBlockCall}
                          style={{ padding: '6px 10px', background: '#991B1B', color: 'white', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}
                        >
                          Block
                        </button>
                        <button
                          onClick={handleDismissCall}
                          style={{ padding: '6px 10px', background: '#E2E8F0', color: '#334155', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>

                    {/* Ringing Controls */}
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '12px' }}>
                        Incoming call ringing... (Call is NEVER blocked by default)
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                        <button
                          onClick={handleDismissCall}
                          style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                          title="Decline"
                        >
                          <PhoneOff size={24} />
                        </button>
                        <button
                          onClick={handleAnswerAndEnd}
                          style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                          title="Answer Call"
                        >
                          <PhoneCall size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {callStatus === 'inspecting' && simulatedCall && (
                  <div style={{ background: '#1E293B', padding: '14px', borderRadius: '10px', color: 'white' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>
                      Observed Device Facts:
                    </h4>
                    <ul style={{ paddingLeft: '16px', fontSize: '12.5px', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {simulatedCall.signals.map((sig, i) => (
                        <li key={i}>{sig}</li>
                      ))}
                    </ul>

                    <div style={{ marginTop: '12px', fontSize: '11px', background: '#0F172A', padding: '8px', borderRadius: '6px', color: '#94A3B8' }}>
                      Rule: Alerts rely strictly on metadata available to your device. No audio capture is permitted.
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                      <button
                        onClick={handleAnswerAndEnd}
                        style={{ flex: '1', padding: '7px', background: '#10B981', color: 'white', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}
                      >
                        Answer Call
                      </button>
                      <button
                        onClick={handleDismissCall}
                        style={{ padding: '7px 12px', background: '#475569', color: 'white', borderRadius: '4px', fontSize: '12px' }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                {callStatus === 'post_call' && (
                  <div style={{ background: '#1E293B', padding: '16px', borderRadius: '10px', color: 'white' }}>
                    <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Post-Call Safety Review
                    </div>
                    <h4 style={{ fontSize: '16px', color: '#FFFFFF', fontWeight: '700', marginTop: '4px', marginBottom: '4px' }}>
                      What did they ask?
                    </h4>
                    <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '12px', fontStyle: 'italic' }}>
                      "You can say 'I'll call back' and hang up."
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F1F5F9', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={checklist.otp}
                          onChange={(e) => setChecklist({ ...checklist, otp: e.target.checked })}
                        />
                        <span>Asked for OTP, password, or PIN</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F1F5F9', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={checklist.urgency}
                          onChange={(e) => setChecklist({ ...checklist, urgency: e.target.checked })}
                        />
                        <span>Urgent threat or arrest warning</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F1F5F9', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={checklist.money}
                          onChange={(e) => setChecklist({ ...checklist, money: e.target.checked })}
                        />
                        <span>Demanded fees, deposit, or gift cards</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F1F5F9', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={checklist.official}
                          onChange={(e) => setChecklist({ ...checklist, official: e.target.checked })}
                        />
                        <span>Claimed bank, tax, or police agent</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F1F5F9', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={checklist.install_app}
                          onChange={(e) => setChecklist({ ...checklist, install_app: e.target.checked })}
                        />
                        <span>Asked to install remote support app</span>
                      </label>
                    </div>

                    <button
                      onClick={submitPostCallReport}
                      style={{ marginTop: '14px', width: '100%', padding: '9px', background: '#0F766E', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Save Report to Local History
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 2: Permissions */}
      {activeScreen === 'permissions' && (
        <div className="sl-card">
          <h3 style={{ fontSize: '18px', color: 'var(--color-primary)', marginBottom: '8px' }}>
            Shield Opt-In Permissions &amp; Privacy Transparency
          </h3>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '20px' }}>
            Every permission is strictly optional, explained in plain words, and revocable from Android Settings in one tap.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', background: '#FAFAFA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '15px', color: '#1E293B' }}>1. Call-Screening Role (ROLE_CALL_SCREENING)</h4>
                  <p style={{ fontSize: '13px', color: '#0F766E', fontWeight: '500', marginTop: '2px' }}>
                    Enables: Receives incoming-call details (number, carrier verification status) to show caution notification.
                  </p>
                  <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                    What it NEVER does: Never records call audio. Never automatically hangs up or blocks calls without your tap.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.call_screening}
                  onChange={(e) => setPermissions({ ...permissions, call_screening: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
              </div>
            </div>

            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', background: '#FAFAFA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '15px', color: '#1E293B' }}>2. Read Contacts (READ_CONTACTS)</h4>
                  <p style={{ fontSize: '13px', color: '#0F766E', fontWeight: '500', marginTop: '2px' }}>
                    Enables: Skips alerts for friends, family, and colleagues saved in your address book.
                  </p>
                  <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                    What it NEVER does: Contacts never leave your device. The app has NO internet permission, so uploading is mathematically impossible.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.contacts}
                  onChange={(e) => setPermissions({ ...permissions, contacts: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
              </div>
            </div>

            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', background: '#FAFAFA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '15px', color: '#1E293B' }}>3. Heads-Up Notifications (POST_NOTIFICATIONS)</h4>
                  <p style={{ fontSize: '13px', color: '#0F766E', fontWeight: '500', marginTop: '2px' }}>
                    Enables: Displays the caution banner while your phone is ringing.
                  </p>
                  <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                    If denied: No ringing alert pops up; you can review events only in local in-app history.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.notifications}
                  onChange={(e) => setPermissions({ ...permissions, notifications: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
              </div>
            </div>

            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', background: '#FAFAFA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '15px', color: '#1E293B' }}>4. SMS Automatic Checks (RECEIVE_SMS - Optional)</h4>
                  <p style={{ fontSize: '13px', color: '#0F766E', fontWeight: '500', marginTop: '2px' }}>
                    Enables: Automatically runs rules on incoming SMS and alerts you if urgency or OTP requests are spotted.
                  </p>
                  <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                    Default alternative: Use Android Share Sheet (Share &rarr; ScamLens) without granting any special permission. Message bodies are NEVER stored.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.sms_screening}
                  onChange={(e) => setPermissions({ ...permissions, sms_screening: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: History */}
      {activeScreen === 'history' && (
        <div className="sl-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '18px', color: 'var(--color-primary)' }}>
                On-Device Event History (30-Day Auto-Purge)
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B' }}>
                Stored locally on your phone in SQLite/Room. Only timestamp, last 4 digits, and signal names are saved.
              </p>
            </div>

            <button
              onClick={() => setHistory([])}
              className="btn-secondary"
              style={{ color: '#991B1B', borderColor: '#FECACA', fontSize: '12.5px', minHeight: '36px' }}
            >
              <Trash2 size={14} />
              <span>Delete All Local History</span>
            </button>
          </div>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
              <Clock size={36} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
              <p>No recorded call events in local storage.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {history.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid var(--color-border-light)',
                    borderRadius: '6px',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'white'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', color: '#1E293B' }}>
                        Call from ...{item.last4}
                      </strong>
                      <span style={{ fontSize: '11px', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', color: '#475569' }}>
                        {item.action}
                      </span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                      Signals: {item.signals.join(' • ')}
                    </p>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {item.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Screen 4: Settings */}
      {activeScreen === 'settings' && (
        <div className="sl-card">
          <h3 style={{ fontSize: '18px', color: 'var(--color-primary)', marginBottom: '16px' }}>
            Shield Preferences
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '14px', color: '#1E293B', display: 'block' }}>
                  Silence Suspicious Calls
                </strong>
                <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                  Off by default per spec; unfamiliar calls will ring normally unless enabled.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.silenceSuspicious}
                onChange={(e) => setSettings({ ...settings, silenceSuspicious: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '14px', color: '#1E293B', display: 'block' }}>
                  Store 30-Day Event History
                </strong>
                <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                  Keeps minimal metadata locally. Auto-purges events after 30 days.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.store30Days}
                onChange={(e) => setSettings({ ...settings, store30Days: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
            </div>

            <div>
              <CountryCodeSelector
                id="shield-home-country"
                label="Home Country (for international prefix detection)"
                value={settings.homeCountryIso}
                onChange={(iso, code) => setSettings({ ...settings, homeCountryIso: iso, homeCountryCode: code })}
              />
              <div style={{ marginTop: '6px', fontSize: '12px', color: '#64748B' }}>
                Detected home prefix: <strong style={{ fontFamily: 'monospace', color: '#1E293B' }}>{settings.homeCountryCode}</strong> — calls from this prefix are treated as domestic.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reality Check Comparison Table */}
      <div className="sl-card" style={{ marginTop: '24px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>
          Reality Check: Traditional Caller-ID Apps vs. ScamLens Shield
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', background: '#F8FAFC' }}>
                <th style={{ padding: '10px 12px' }}>Feature / Capability</th>
                <th style={{ padding: '10px 12px' }}>Traditional Caller-ID Apps</th>
                <th style={{ padding: '10px 12px', color: 'var(--color-primary)' }}>ScamLens Shield</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: '10px 12px', fontWeight: '600' }}>Contact Privacy</td>
                <td style={{ padding: '10px 12px', color: '#991B1B' }}>Uploads phonebook to centralized cloud database</td>
                <td style={{ padding: '10px 12px', color: '#0F766E', fontWeight: '600' }}>Zero contact uploads. No INTERNET permission declared</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: '10px 12px', fontWeight: '600' }}>Call Screening Basis</td>
                <td style={{ padding: '10px 12px' }}>Crowdsourced spam flags &amp; unverified user complaints</td>
                <td style={{ padding: '10px 12px', color: '#0F766E' }}>Verifiable device facts: STIR/SHAKEN carrier ID, repetition, contacts</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: '10px 12px', fontWeight: '600' }}>Call Action Policy</td>
                <td style={{ padding: '10px 12px' }}>May auto-block or disconnect calls aggressively</td>
                <td style={{ padding: '10px 12px', color: '#0F766E' }}>Always allows calls. Never auto-blocks without user's explicit tap</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: '10px 12px', fontWeight: '600' }}>SMS Message Analysis</td>
                <td style={{ padding: '10px 12px' }}>Opaque server-side heuristics</td>
                <td style={{ padding: '10px 12px', color: '#0F766E' }}>Transparent on-device rules.json; message text never saved</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
