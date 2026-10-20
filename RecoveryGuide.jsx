import React, { useState } from 'react';
import {
  LifeBuoy,
  PhoneCall,
  Lock,
  Smartphone,
  CreditCard,
  KeyRound,
  FileText,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const INCIDENT_CATEGORIES = [
  {
    id: 'otp',
    title: 'Shared an OTP, Password, or PIN',
    icon: KeyRound,
    urgency: 'Immediate (0–15 Minutes)',
    urgencyColor: '#991B1B',
    summary: 'One-time passcodes and PINs allow direct authentication and money transfers.',
    steps: [
      {
        order: 1,
        title: 'Immediately log into your official bank or account portal',
        detail: 'Navigate directly by typing the official website URL or opening your official mobile app. Do not click links from SMS.'
      },
      {
        order: 2,
        title: 'Change your account password and security questions',
        detail: 'Set a strong, unique passphrase that is not used on any other website or application.'
      },
      {
        order: 3,
        title: 'Call your bank to freeze electronic banking or reset UPI PIN',
        detail: 'Dial the 24x7 customer helpline printed on the back of your physical debit/credit card to report credential compromise.'
      },
      {
        order: 4,
        title: 'Terminate all active login sessions',
        detail: 'Inside the app security settings, select "Log out of all other devices" or revoke active browser sessions.'
      }
    ]
  },
  {
    id: 'money',
    title: 'Sent Money or Completed UPI / Wire Transfer',
    icon: CreditCard,
    urgency: 'Golden Hour (Within 2 Hours)',
    urgencyColor: '#991B1B',
    summary: 'Financial transactions move rapidly through payment gateways; immediate reporting is essential.',
    steps: [
      {
        order: 1,
        title: 'Dial the National Cyber Financial Fraud Helpline (1930 in India)',
        detail: 'In India, call 1930 immediately or log in to cybercrime.gov.in. Provide the transaction ID, UPI reference, remitter bank, beneficiary account, and timestamp to initiate a transaction hold.'
      },
      {
        order: 2,
        title: 'Notify your bank\'s fraud investigation unit',
        detail: 'Call your bank immediately and request an urgent transaction recall and chargeback / fraud dispute.'
      },
      {
        order: 3,
        title: 'Save all payment screenshots and transaction references',
        detail: 'Record the UTR number, UPI ID, receiver phone number, and exact time of transfer for police filing.'
      },
      {
        order: 4,
        title: 'Block compromised card / UPI ID',
        detail: 'Temporarily freeze your debit/credit card or disable UPI payments through your mobile banking app.'
      }
    ]
  },
  {
    id: 'link',
    title: 'Clicked a Suspicious Link',
    icon: AlertTriangle,
    urgency: 'High Priority (Next 30 Minutes)',
    urgencyColor: '#7C2D12',
    summary: 'Links may direct to credential harvesting pages or trigger silent background downloads.',
    steps: [
      {
        order: 1,
        title: 'Close the browser tab immediately; do not enter any information',
        detail: 'If you only opened the page without submitting forms or downloading files, no credentials were submitted.'
      },
      {
        order: 2,
        title: 'Clear your browser cache, cookies, and recent download history',
        detail: 'Open browser settings and clear site data for the last 24 hours to remove malicious session cookies.'
      },
      {
        order: 3,
        title: 'Check your Downloads folder for unknown files or APKs',
        detail: 'Ensure no executable (.apk, .exe, .dmg, .bat) was downloaded. If found, delete it immediately without opening.'
      },
      {
        order: 4,
        title: 'If you typed passwords on the opened site, change them immediately',
        detail: 'Change the password on the legitimate service from an independent, clean browser window.'
      }
    ]
  },
  {
    id: 'app',
    title: 'Installed an Unknown Application or APK',
    icon: Smartphone,
    urgency: 'Immediate (Critical)',
    urgencyColor: '#991B1B',
    summary: 'Rogue APKs and screen-sharing tools can capture SMS OTPs and control device functions.',
    steps: [
      {
        order: 1,
        title: 'Turn on Airplane Mode immediately or disconnect Wi-Fi and Mobile Data',
        detail: 'Severing the internet connection prevents the rogue app from transmitting data or receiving remote commands.'
      },
      {
        order: 2,
        title: 'Boot device into Safe Mode and uninstall the suspicious application',
        detail: 'Safe Mode prevents third-party apps from running in the background while you navigate to Settings > Apps to uninstall it.'
      },
      {
        order: 3,
        title: 'Revoke Accessibility and Device Administrator permissions',
        detail: 'Check Settings > Accessibility and Settings > Security > Device Admin Apps to revoke unauthorized privileges.'
      },
      {
        order: 4,
        title: 'Run a full scan using Google Play Protect or built-in system security',
        detail: 'Open Google Play Store > Play Protect > Scan to check for lingering vulnerabilities.'
      }
    ]
  },
  {
    id: 'remote',
    title: 'Gave Remote Access (AnyDesk / TeamViewer / QuickSupport)',
    icon: Lock,
    urgency: 'Critical Emergency',
    urgencyColor: '#991B1B',
    summary: 'Remote desktop applications give the attacker complete viewing and control over your screen.',
    steps: [
      {
        order: 1,
        title: 'Immediately terminate the remote connection and turn off Wi-Fi/Mobile Data',
        detail: 'Force-close the remote software (AnyDesk, TeamViewer, RustDesk, QuickSupport) and disable all network interfaces.'
      },
      {
        order: 2,
        title: 'Uninstall the remote access software completely',
        detail: 'Delete the app from your device so no background reconnect sessions can be re-established.'
      },
      {
        order: 3,
        title: 'Check your bank accounts from a different, unaffected device',
        detail: 'Use a family member\'s computer or secondary phone to log into your bank and verify recent transaction activity.'
      },
      {
        order: 4,
        title: 'Change all primary account passwords from the secondary device',
        detail: 'Change passwords for your email, bank, and cloud backups while your primary device is offline.'
      }
    ]
  },
  {
    id: 'id_docs',
    title: 'Shared Identity Documents (Aadhaar, PAN, SSN, Passport)',
    icon: FileText,
    urgency: 'Standard Priority',
    urgencyColor: '#7C2D12',
    summary: 'Identity documents can be used to register unauthorized SIM cards or apply for fraudulent instant loans.',
    steps: [
      {
        order: 1,
        title: 'Lock biometric authentication on government portals (e.g. UIDAI mAadhaar)',
        detail: 'In India, lock your Aadhaar biometrics via the official mAadhaar app or uidai.gov.in to prevent unauthorized authentication.'
      },
      {
        order: 2,
        title: 'Check mobile numbers registered against your identity (TAFCOP Portal)',
        detail: 'In India, visit sancharsaathi.gov.in (TAFCOP) to check all mobile connections active in your name and report unknown ones.'
      },
      {
        order: 3,
        title: 'Monitor your credit bureau reports (CIBIL / Experian)',
        detail: 'Check your free annual credit report for unapproved loan inquiries or newly opened credit cards.'
      },
      {
        order: 4,
        title: 'File an informational report with the Cyber Crime portal',
        detail: 'Document the identity document leakage with an official acknowledgment slip for legal protection.'
      }
    ]
  }
];

export default function RecoveryGuide({ defaultCategory = 'money' }) {
  const [selectedIncident, setSelectedIncident] = useState(
    INCIDENT_CATEGORIES.find(c => c.id === defaultCategory) || INCIDENT_CATEGORIES[0]
  );
  const [completedSteps, setCompletedSteps] = useState({});

  const toggleStep = (stepNumber) => {
    setCompletedSteps(prev => ({
      ...prev,
      [`${selectedIncident.id}-${stepNumber}`]: !prev[`${selectedIncident.id}-${stepNumber}`]
    }));
  };

  return (
    <section aria-labelledby="recovery-heading" style={{ marginTop: '10px' }}>
      {/* Banner */}
      <div style={{
        background: '#1F3A5F',
        borderRadius: '10px',
        padding: '24px',
        color: 'white',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(254, 226, 226, 0.2)', padding: '4px 10px', borderRadius: '6px', color: '#FECACA', fontSize: '12px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <LifeBuoy size={14} />
          <span>Incident Response &amp; Crisis Recovery Hub</span>
        </div>
        <h2 id="recovery-heading" style={{ fontSize: '1.6rem', color: 'white', marginTop: '6px' }}>
          "I Have Already Responded" — Emergency Action Guide
        </h2>
        <p style={{ fontSize: '14px', color: '#CBD5E1', maxWidth: '820px', marginTop: '6px', lineHeight: '1.5' }}>
          If you shared an OTP, sent money, clicked a link, or installed software, act quickly.
          Follow the verified emergency steps below to minimize further loss.
        </p>

        {/* Official Emergency Helplines Card */}
        <div style={{
          marginTop: '16px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '700', textTransform: 'uppercase' }}>
              National Cyber Crime Reporting Portals (Official)
            </div>
            <div style={{ fontSize: '14px', marginTop: '2px', fontWeight: '600' }}>
              India Helpline: <span style={{ color: '#FCD34D', fontSize: '16px' }}>1930</span> &bull; Portal: <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>cybercrime.gov.in</a>
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
              US: <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#94A3B8', textDecoration: 'underline' }}>reportfraud.ftc.gov</a> (1-877-382-4357) &bull; UK: <a href="https://www.actionfraud.police.uk" target="_blank" rel="noopener noreferrer" style={{ color: '#94A3B8', textDecoration: 'underline' }}>actionfraud.police.uk</a> (0300 123 2040)
            </div>
          </div>

          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 16px',
              background: '#0F766E',
              color: 'white',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none'
            }}
          >
            <span>File Official Cyber Report</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Incident Category Selector Grid */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', marginBottom: '10px', letterSpacing: '0.04em' }}>
          Select What Happened:
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {INCIDENT_CATEGORIES.map(category => {
            const Icon = category.icon;
            const isSelected = selectedIncident.id === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedIncident(category)}
                style={{
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: isSelected ? '#EFF6FF' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: isSelected ? 'var(--color-primary)' : '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? 'white' : '#475569',
                  flexShrink: 0
                }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? 'var(--color-primary)' : '#1E293B' }}>
                    {category.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {category.urgency}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Incident Action Plan Card */}
      <div className="sl-card" style={{ borderLeft: `6px solid ${selectedIncident.urgencyColor}`, marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: selectedIncident.urgencyColor, textTransform: 'uppercase' }}>
              <Clock size={14} />
              <span>Recommended Window: {selectedIncident.urgency}</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginTop: '2px' }}>
              Action Plan: {selectedIncident.title}
            </h3>
            <p style={{ fontSize: '13.5px', color: '#475569', marginTop: '4px' }}>
              {selectedIncident.summary}
            </p>
          </div>
        </div>

        {/* Step-by-Step Interactive Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {selectedIncident.steps.map((step) => {
            const isDone = completedSteps[`${selectedIncident.id}-${step.order}`];
            return (
              <div
                key={step.order}
                onClick={() => toggleStep(step.order)}
                style={{
                  border: isDone ? '1px solid #0F766E' : '1px solid var(--color-border-light)',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  background: isDone ? '#F0FDF4' : '#FAFAFA',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isDone ? '#0F766E' : '#E2E8F0',
                  color: isDone ? 'white' : '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '13px',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {isDone ? <CheckCircle2 size={16} /> : step.order}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14.5px', fontWeight: '600', color: isDone ? '#0F766E' : '#1E293B', textDecoration: isDone ? 'line-through' : 'none' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '3px', lineHeight: '1.45' }}>
                    {step.detail}
                  </div>
                </div>

                <div style={{ fontSize: '12px', fontWeight: '600', color: isDone ? '#0F766E' : '#94A3B8' }}>
                  {isDone ? 'Completed' : 'Tap to mark done'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Honest Limitations & Legal Disclaimer */}
        <div style={{ marginTop: '20px', padding: '12px 16px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '6px', fontSize: '12.5px', color: '#7C2D12' }}>
          <strong>Important Recovery Disclaimer:</strong> ScamLens AI provides educational triage guidance. Following these steps cannot guarantee financial recovery or prevent identity misuse. Only your bank and authorized cybercrime police units have the authority to freeze recipient accounts or investigate perpetrators. File your report promptly.
        </div>
      </div>
    </section>
  );
}
