import React, { useState } from 'react';
import {
  Compass,
  Briefcase,
  Building2,
  Package,
  Award,
  TrendingUp,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  Search,
  AlertTriangle,
  CheckCircle2,
  Info,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

const VERIFICATION_DOMAINS = [
  {
    id: 'job',
    title: 'Job & Internship Offers',
    icon: Briefcase,
    color: '#1F3A5F',
    coreWarning: 'Legitimate employers never demand application fees, laptop deposits, or interview relocation to Telegram.',
    checklist: [
      {
        question: 'Did the offer arrive unsolicited without prior interviews?',
        guidance: 'Genuine companies require structured technical, behavioural, or HR evaluations before extending offers.'
      },
      {
        question: 'Are they asking for registration fees or security deposits?',
        guidance: 'Zero-Fee Rule: In the US, UK, and India, charging candidates recruitment fees is prohibited or a hallmark of fraud.'
      },
      {
        question: 'Does the recruiter use a public email address (@gmail, @yahoo)?',
        guidance: 'Enterprise recruiters communicate through corporate domains (@company.com). Check full email headers.'
      },
      {
        question: 'Did they ask you to message HR on Telegram or WhatsApp?',
        guidance: 'Scammers shift conversations to encrypted personal chats to avoid detection and evade corporate tracking.'
      }
    ],
    officialVerificationAction: 'Open your browser and manually type the company’s official website URL. Navigate to their "Careers" or "Job Openings" section and search for the Job Requisition ID.'
  },
  {
    id: 'banking',
    title: 'Banking, UPI & KYC Alerts',
    icon: Building2,
    color: '#0F766E',
    coreWarning: 'Banks never demand your OTP, UPI PIN, or card CVV. Account updates are never performed via random web links.',
    checklist: [
      {
        question: 'Does the message threaten account blockage within minutes/hours?',
        guidance: 'Artificial urgency is manufactured to induce panic before you can contact your local branch.'
      },
      {
        question: 'Does the message ask you to send or reply with an OTP or PIN?',
        guidance: 'OTP stands for One-Time Password. Sharing it authorizes unauthorized transactions or account takeover.'
      },
      {
        question: 'Is the link hosted on a non-bank domain or an IP address?',
        guidance: 'Official banking takes place exclusively on verified domains (e.g. sbi.co.in, hdfcbank.com, chase.com).'
      }
    ],
    officialVerificationAction: 'Turn over your physical debit or credit card and call the official 24x7 customer support number embossed on the plastic. Alternatively, log into your mobile banking app directly.'
  },
  {
    id: 'delivery',
    title: 'Courier, Delivery & Customs',
    icon: Package,
    color: '#7C2D12',
    coreWarning: 'Postal and courier services do not demand immediate address verification fees via SMS links.',
    checklist: [
      {
        question: 'Does the SMS claim a parcel is on hold due to missing address details?',
        guidance: 'Scammers blast millions of delivery hold alerts knowing many recipients have online orders pending.'
      },
      {
        question: 'Does the link lead to a bare IP or shortened link (bit.ly, tinyurl)?',
        guidance: 'National post offices (India Post, USPS, Royal Mail) host track-and-trace on their official domains only.'
      },
      {
        question: 'Are they demanding a small "redelivery fee" (e.g. ₹25, $1.99)?',
        guidance: 'The nominal fee is a pretext to capture your complete card details, CVV, and OTP.'
      }
    ],
    officialVerificationAction: 'Copy the tracking number and visit the courier’s official portal directly (e.g., indiapost.gov.in, fedex.com, dhl.com). Never pay redelivery fees through SMS links.'
  },
  {
    id: 'prize',
    title: 'Lottery, Prizes & Unsolicited Grants',
    icon: Award,
    color: '#9A3412',
    coreWarning: 'You cannot win a lottery or competition you never entered. Genuine prizes never require advance payment.',
    checklist: [
      {
        question: 'Did you actively buy a ticket or enter this specific competition?',
        guidance: 'Claims of winning KBC lucky draws, international lotteries, or shopping rewards without entry are 100% false.'
      },
      {
        question: 'Are they demanding a "tax clearance" or "processing deposit"?',
        guidance: 'In legitimate lotteries, legal taxes are deducted at source; you are never asked to wire money first.'
      }
    ],
    officialVerificationAction: 'Treat any claim of unrequested money or prizes as invalid. Never disclose bank account details or transfer "processing charges".'
  },
  {
    id: 'investment',
    title: 'Crypto & High-Return Investment Schemes',
    icon: TrendingUp,
    color: '#1F3A5F',
    coreWarning: 'Guaranteed high returns (e.g. "earn 5,000/day with part-time task") are structured ponzi or deposit theft scams.',
    checklist: [
      {
        question: 'Are returns described as "guaranteed" or "zero risk"?',
        guidance: 'All authentic financial investments carry market risk. Regulated entities are legally forbidden from promising fixed returns.'
      },
      {
        question: 'Are you asked to perform tasks (YouTube likes, Google reviews) for pay?',
        guidance: 'Task-based scams give initial small payouts to build trust before demanding large "prepaid level" deposits.'
      },
      {
        question: 'Is the platform registered with national regulators (SEBI, SEC, FCA)?',
        guidance: 'Unregulated Telegram channels and trading webapps have zero legal protections or deposit insurance.'
      }
    ],
    officialVerificationAction: 'Check the official SEBI (sebi.gov.in) or SEC (sec.gov) registry to verify if the broker or investment advisory holds a valid registration license.'
  },
  {
    id: 'impersonation',
    title: 'Government, Police & Customs Impersonation',
    icon: ShieldCheck,
    color: '#991B1B',
    coreWarning: 'Law enforcement and tax departments do not conduct investigations or arrest interrogations via WhatsApp video calls.',
    checklist: [
      {
        question: 'Is the caller claiming a parcel in your name contains illegal substances?',
        guidance: 'Known as the "Digital Arrest" scam. Police and customs never detain or interrogate citizens over Skype/WhatsApp.'
      },
      {
        question: 'Are they demanding you transfer money to a "safety escrow account"?',
        guidance: 'No police department, CBI, or court has "RBI verification accounts". This is purely an extortion tactic.'
      },
      {
        question: 'Are they demanding secrecy from your family and bank staff?',
        guidance: 'Coercing victims into isolation is a deliberate tactic to prevent third-party intervention.'
      }
    ],
    officialVerificationAction: 'Hang up immediately. Visit your local police station or contact the official department helpline directly. Report the number on cybercrime.gov.in.'
  },
  {
    id: 'account',
    title: 'Account Suspension & Password Resets',
    icon: KeyRound,
    color: '#0F766E',
    coreWarning: 'Always update credentials by visiting the official service bookmark directly—never via unsolicited reset messages.',
    checklist: [
      {
        question: 'Did you request a password reset right before receiving the message?',
        guidance: 'If you did not request a reset, the message may be an attacker attempting password reset or credential harvesting.'
      },
      {
        question: 'Does the link match the exact canonical domain of the provider?',
        guidance: 'Watch out for sneaky subdomains like google.com-security-notice.example. The actual domain is example, not Google.'
      }
    ],
    officialVerificationAction: 'Open a fresh browser window, type the service address (e.g., netflix.com, apple.com), log into your account settings, and review active security notices.'
  }
];

export default function VerificationNavigator() {
  const [selectedDomain, setSelectedDomain] = useState(VERIFICATION_DOMAINS[0]);
  const [testUrl, setTestUrl] = useState('');
  const [companySite, setCompanySite] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);

  // URL Domain Analyzer Tool
  const analyzeInputUrl = () => {
    if (!testUrl || !testUrl.trim()) return null;
    try {
      const raw = testUrl.trim();
      const withScheme = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `http://${raw}`;
      const parsed = new URL(withScheme);
      const hostname = parsed.hostname.toLowerCase();
      const labels = hostname.split('.');
      const isIp = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
      const isShortener = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'cutt.ly', 'rb.gy'].includes(hostname);
      const hasRiskyTld = ['xyz', 'top', 'work', 'buzz', 'club', 'click', 'loan'].includes(labels[labels.length - 1]);
      const hasMultipleSubdomains = labels.length >= 4;

      return {
        hostname,
        protocol: parsed.protocol,
        path: parsed.pathname,
        isIp,
        isShortener,
        hasRiskyTld,
        hasMultipleSubdomains,
        valid: true
      };
    } catch (e) {
      return { valid: false, error: 'Malformed or invalid URL syntax' };
    }
  };

  const parsedUrlData = analyzeInputUrl();

  const handleDomainComparison = (e) => {
    e.preventDefault();
    if (!companySite.trim() || !senderEmail.trim()) {
      setComparisonResult({ error: 'Please provide both the official company website and sender email/domain.' });
      return;
    }

    try {
      let compHost = companySite.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
      let senderHost = senderEmail.trim().toLowerCase();
      if (senderHost.includes('@')) {
        senderHost = senderHost.split('@')[1];
      }
      senderHost = senderHost.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');

      const isExactMatch = compHost === senderHost;
      const isSubdomainMatch = senderHost.endsWith(`.${compHost}`);
      const isPublicWebmail = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'].includes(senderHost);

      setComparisonResult({
        compHost,
        senderHost,
        isExactMatch,
        isSubdomainMatch,
        isPublicWebmail,
        match: isExactMatch || isSubdomainMatch
      });
    } catch (err) {
      setComparisonResult({ error: 'Unable to compare domains. Please check format.' });
    }
  };

  return (
    <section aria-labelledby="navigator-heading" style={{ marginTop: '10px' }}>
      {/* Navigator Header */}
      <div style={{
        background: 'white',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0F766E', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <Compass size={14} />
          <span>Independent Verification Decision Support</span>
        </div>
        <h2 id="navigator-heading" style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginTop: '4px' }}>
          Scam Verification Navigator
        </h2>
        <p style={{ fontSize: '14px', color: '#475569', maxWidth: '840px', marginTop: '6px', lineHeight: '1.5' }}>
          A decision-support toolkit guiding you to independently verify offers, alerts, and suspicious domains.
          ScamLens AI never claims a third party is verified unless verified directly through authoritative sources.
        </p>

        {/* Domain Categories Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
          {VERIFICATION_DOMAINS.map(domain => {
            const Icon = domain.icon;
            const isSelected = selectedDomain.id === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => setSelectedDomain(domain)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border-light)',
                  background: isSelected ? '#EFF6FF' : 'white',
                  color: isSelected ? 'var(--color-primary)' : '#334155',
                  fontWeight: isSelected ? '700' : '500',
                  fontSize: '12.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={14} />
                <span>{domain.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Selected Verification Guide & Interactive URL Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Left Column: Selected Domain Verification Blueprint */}
        <div className="sl-card" style={{ borderTop: `4px solid ${selectedDomain.color}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: selectedDomain.color
            }}>
              <selectedDomain.icon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', color: 'var(--color-primary)' }}>
                {selectedDomain.title} Verification
              </h3>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Independent Step-by-Step Checklist
              </span>
            </div>
          </div>

          <div style={{
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '12.5px',
            color: '#7C2D12',
            marginBottom: '16px',
            fontWeight: '500'
          }}>
            {selectedDomain.coreWarning}
          </div>

          <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em', marginBottom: '8px' }}>
            Diagnostic Questions to Ask Yourself:
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
            {selectedDomain.checklist.map((item, idx) => (
              <div key={idx} style={{ padding: '10px 12px', background: '#FAFAFA', borderRadius: '6px', border: '1px solid var(--color-border-light)' }}>
                <strong style={{ fontSize: '13px', color: '#1E293B', display: 'block' }}>
                  {idx + 1}. {item.question}
                </strong>
                <p style={{ fontSize: '12.5px', color: '#475569', marginTop: '3px', lineHeight: '1.4' }}>
                  {item.guidance}
                </p>
              </div>
            ))}
          </div>

          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px 14px', borderRadius: '6px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#0F766E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Actionable Verification Method:
            </div>
            <p style={{ fontSize: '13px', color: '#166534', marginTop: '4px', lineHeight: '1.45' }}>
              {selectedDomain.officialVerificationAction}
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Domain & URL Inspector */}
        <div className="sl-card" style={{ borderTop: '4px solid var(--color-primary)' }}>
          <h3 style={{ fontSize: '17px', color: 'var(--color-primary)', marginBottom: '4px' }}>
            Observable URL &amp; Domain Inspector
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px' }}>
            Paste any link to inspect its structure on-device. ScamLens AI never auto-opens links.
          </p>

          <div style={{ marginBottom: '14px' }}>
            <label htmlFor="url-inspector-input" style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
              Inspect URL:
            </label>
            <input
              id="url-inspector-input"
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="e.g. http://fictbank-verify.example/kyc or bit.ly/abc"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          {parsedUrlData && parsedUrlData.valid && (
            <div style={{ background: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                Extracted Hostname:
              </div>
              <div style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--color-primary)', marginTop: '2px' }}>
                {parsedUrlData.hostname}
              </div>

              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                {parsedUrlData.isIp && (
                  <div style={{ color: '#991B1B', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} />
                    <span>Observable Concern: Bare numerical IP address used instead of a domain name.</span>
                  </div>
                )}
                {parsedUrlData.isShortener && (
                  <div style={{ color: '#7C2D12', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} />
                    <span>Observable Concern: Known link shortener hiding destination server.</span>
                  </div>
                )}
                {parsedUrlData.hasRiskyTld && (
                  <div style={{ color: '#7C2D12', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} />
                    <span>Observable Concern: Uses an inexpensive / frequently abused top-level domain.</span>
                  </div>
                )}
                {parsedUrlData.hasMultipleSubdomains && (
                  <div style={{ color: '#7C2D12', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} />
                    <span>Observable Concern: 4+ subdomain levels; may be disguising true root domain.</span>
                  </div>
                )}
                {!parsedUrlData.isIp && !parsedUrlData.isShortener && !parsedUrlData.hasRiskyTld && (
                  <div style={{ color: '#0F766E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} />
                    <span>Standard domain structure. Verify ownership independently before authenticating.</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #CBD5E1', fontSize: '11.5px', color: '#64748B' }}>
                Live reputation check: <strong>Not Configured (Default)</strong>. We never fake reputation checks.
              </div>
            </div>
          )}

          {/* Recruiter Email vs Official Domain Comparison Tool */}
          <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '14px' }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '4px' }}>
              Recruiter / Organization Domain Matcher
            </h4>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '10px' }}>
              Compare an official company website against a sender's email domain (string comparison only).
            </p>

            <form onSubmit={handleDomainComparison} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <input
                  type="text"
                  value={companySite}
                  onChange={(e) => setCompanySite(e.target.value)}
                  placeholder="Official website: e.g. microsoft.com"
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="Sender email: e.g. hr@microsoft-jobs.xyz or hr@microsoft.com"
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '7px 12px', fontSize: '12px', marginTop: '2px' }}
              >
                Compare Domains
              </button>
            </form>

            {comparisonResult && (
              <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '6px', background: comparisonResult.error ? '#FEE2E2' : comparisonResult.match ? '#F0FDF4' : '#FEF3C7', border: '1px solid #CBD5E1', fontSize: '12.5px' }}>
                {comparisonResult.error ? (
                  <span style={{ color: '#991B1B' }}>{comparisonResult.error}</span>
                ) : (
                  <div>
                    <div style={{ fontWeight: '700', color: comparisonResult.match ? '#166534' : '#7C2D12' }}>
                      {comparisonResult.match ? 'Domain String Match Confirmed' : 'Domain Mismatch Detected'}
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '2px', color: '#334155' }}>
                      Official Host: <code>{comparisonResult.compHost}</code> | Sender Host: <code>{comparisonResult.senderHost}</code>
                    </div>
                    {comparisonResult.isPublicWebmail && (
                      <div style={{ color: '#991B1B', fontWeight: '600', marginTop: '4px' }}>
                        Warning: Sender is using a free public webmail address ({comparisonResult.senderHost}), not an official corporate domain.
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', fontStyle: 'italic' }}>
                      Note: String comparison checks matching domain text only. It cannot legally verify sender identity or prove legitimacy.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
