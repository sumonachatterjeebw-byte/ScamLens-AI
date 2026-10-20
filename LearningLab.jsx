import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  Info,
  List
} from 'lucide-react';

// ─────────────────────────────────────────
// SCENARIOS DATA  (10 fully interactive)
// ─────────────────────────────────────────
const SCENARIOS = [
  {
    id: 1,
    title: 'Remote Data Analyst Internship Offer',
    tag: 'Fake Recruitment Scam',
    category: 'job',
    categoryLabel: 'Job & Internship',
    difficulty: 'Beginner',
    type: 'scam',
    text: 'Congratulations! You are selected for a Data Analyst internship at Northwind Demo Ltd, earning 40,000 per month with no interview required. To receive your offer letter, pay a refundable registration fee of 2,500 today. Contact our HR on Telegram.',
    question: 'What is the primary warning sign in this job offer?',
    options: [
      { text: 'Offering 40,000 salary for an analyst position', correct: false, explanation: 'Salaries vary widely. Pay alone is not evidence of fraud — verify through official channels.' },
      { text: 'Requiring a refundable registration fee AND shifting HR to Telegram', correct: true, explanation: 'Genuine employers never demand recruitment fees, regardless of the amount. Moving official HR to personal Telegram handles is a textbook channel-shift red flag.' },
      { text: 'Mentioning Northwind Demo Ltd by name', correct: false, explanation: 'Scammers routinely cite real or plausible corporate names to appear credible — the company name alone proves nothing.' },
    ],
    safeStep: 'Never pay any registration, kit, or security fee for employment. Navigate directly to the company\'s official careers portal by typing the domain name manually.',
    evidenceVsUncertainty: {
      evidence: 'Direct quotes: "refundable registration fee of 2,500" and "Contact our HR on Telegram" — both are observable in the text.',
      uncertainty: 'We cannot verify whether Northwind Demo Ltd advertised this role without checking their official site independently.',
    },
    keySignals: ['Upfront fee request', 'Channel shift (Telegram)', 'No interview required'],
  },
  {
    id: 2,
    title: 'Immediate Bank Account Deactivation Warning',
    tag: 'Credential Phishing',
    category: 'phishing',
    categoryLabel: 'Phishing & OTP',
    difficulty: 'Beginner',
    type: 'scam',
    text: 'ALERT: Your FictBank account will be blocked in 10 minutes due to incomplete KYC. Send your OTP to confirm and avoid suspension: http://fictbank-verify.example/kyc',
    question: 'What is the safest immediate action to take?',
    options: [
      { text: 'Reply with the OTP quickly before the 10-minute timer expires', correct: false, explanation: 'The 10-minute timer is artificial urgency designed to stop you from verifying. Banks never ask for OTPs by SMS or message link.' },
      { text: 'Click the link to check if it looks like the real FictBank portal', correct: false, explanation: 'Phishing websites can visually mimic real bank portals. The domain "fictbank-verify.example" is not the bank\'s official domain.' },
      { text: 'Close the message and open your official mobile banking app independently', correct: true, explanation: 'Authentic banking alerts always appear inside your secured, authenticated dashboard — never via external links demanding immediate action.' },
    ],
    safeStep: 'Call the customer service number embossed on the back of your physical bank card. Do not use any number given in the message.',
    evidenceVsUncertainty: {
      evidence: 'Direct quotes: "blocked in 10 minutes", "Send your OTP", and the non-official domain "fictbank-verify.example/kyc".',
      uncertainty: 'The claim of incomplete KYC cannot be verified without logging into the official bank portal directly.',
    },
    keySignals: ['Artificial time pressure', 'OTP request', 'Suspicious domain (non-official)'],
  },
  {
    id: 3,
    title: 'University Library Book Due Date Reminder',
    tag: 'Legitimate Message',
    category: 'legitimate',
    categoryLabel: 'Legitimate Examples',
    difficulty: 'Beginner',
    type: 'legitimate',
    text: 'Hi, your library book "Intro to Statistics" is due on Friday. You can renew it on the library website or at the front desk. No action is needed if you have already returned it.',
    question: 'How should this message be categorised?',
    options: [
      { text: 'High-risk phishing scam demanding personal credentials', correct: false, explanation: 'The message contains zero threats, no fee demands, no OTP requests, and no suspicious links.' },
      { text: 'Routine legitimate reminder with neutral deadlines and zero pressure', correct: true, explanation: 'Neutral phrasing ("due on Friday", "No action is needed"), no credential demands, and no urgency cues distinguish it as a standard institutional reminder.' },
      { text: 'Suspicious because it mentions a specific due date', correct: false, explanation: 'Legitimate services legitimately mention dates. Absence of threat language, fee demands, and credential requests is what matters.' },
    ],
    safeStep: 'Verify your library account by visiting the official student portal directly if in any doubt.',
    evidenceVsUncertainty: {
      evidence: 'Zero high-risk signals: no OTP, no fee, no suspicious URL, no urgency language.',
      uncertainty: 'Absence of detected signals does not guarantee safety, but this message exhibits standard administrative communication norms.',
    },
    keySignals: ['No fee demand', 'No credential request', 'Neutral, informational language'],
  },
  {
    id: 4,
    title: 'Campus Recruiter Interview Availability Inquiry',
    tag: 'Ambiguous — Needs Verification',
    category: 'ambiguous',
    categoryLabel: 'Ambiguous Cases',
    difficulty: 'Intermediate',
    type: 'ambiguous',
    text: 'Hello, this is Priya from Contoso Campus Recruitment. We would like to schedule a short call about your application. Please confirm your availability today or tomorrow by replying to this message.',
    question: 'Why does ScamLens flag this message as needing verification?',
    options: [
      { text: 'It is definitely a fraudulent scam attempt', correct: false, explanation: 'No money is requested, no OTP demanded, and no suspicious link is included. Calling it a scam without evidence would be false.' },
      { text: 'Sender identity is unverified, but no malicious demands are present', correct: true, explanation: 'The sender claims to be from Contoso, but without an authenticated @contoso.com email domain, the identity remains unverified. That is an uncertainty, not proof of fraud.' },
      { text: 'It contains an urgent 10-minute threat', correct: false, explanation: 'The message requests availability "today or tomorrow" — that is standard professional communication, not artificial urgency.' },
    ],
    safeStep: 'Check your college placement portal to confirm if you applied to Contoso. Ask for confirmation via a verified @contoso.com email address before sharing any personal details.',
    evidenceVsUncertainty: {
      evidence: 'Polite recruiter claim with no fee request, no credential demand, and no suspicious link.',
      uncertainty: 'Sender identity cannot be confirmed solely from an SMS or a message without an authenticated domain.',
    },
    keySignals: ['Unverified sender identity', 'No malicious demand', 'Standard professional language'],
  },
  {
    id: 5,
    title: 'Parcel Delivery Hold with Shortened URL',
    tag: 'Parcel Delivery Scam',
    category: 'delivery',
    categoryLabel: 'Delivery & Payment',
    difficulty: 'Intermediate',
    type: 'scam',
    text: 'Your courier parcel #IN-98214 is on hold due to missing street address. Immediate action required: Pay 25 delivery clearance fee within 2 hours or package will be returned: https://bit.ly/track-parcel-demo',
    question: 'What makes the URL in this message suspicious?',
    options: [
      { text: 'It uses the HTTPS protocol', correct: false, explanation: 'Both phishing sites and legitimate sites use HTTPS (SSL/TLS). The padlock icon does not verify the site\'s legitimacy — only the registered domain matters.' },
      { text: 'It uses a URL shortener (bit.ly) that hides the true destination server', correct: true, explanation: 'Shortened links obscure where you are actually being sent. Legitimate delivery companies host all tracking on their official registered domains, never through shorteners.' },
      { text: 'It contains a parcel tracking number in the path', correct: false, explanation: 'Tracking numbers are standard; the URL shortener and the clearance fee demand are the observable red flags here.' },
    ],
    safeStep: 'Never pay re-delivery fees via SMS links. Navigate directly to indiapost.gov.in, fedex.com, or delhivery.com and enter the tracking ID manually.',
    evidenceVsUncertainty: {
      evidence: 'Direct quotes: "https://bit.ly/track-parcel-demo" (link shortener) and "Pay 25 delivery clearance fee".',
      uncertainty: 'We cannot verify whether you have a legitimate parcel in transit without checking your tracking number on an official courier portal.',
    },
    keySignals: ['URL shortener hides destination', 'Clearance fee demand', 'Time pressure (2 hours)'],
  },
  {
    id: 6,
    title: 'IP Address Account Login Link',
    tag: 'Technical Phishing Red Flag',
    category: 'phishing',
    categoryLabel: 'Phishing & OTP',
    difficulty: 'Intermediate',
    type: 'scam',
    text: 'Your account was flagged for unauthorized access. Review your recent activity and verify identity immediately at http://192.0.2.1/login',
    question: 'Why is http://192.0.2.1/login a severe warning sign?',
    options: [
      { text: 'Legitimate banks and web services operate on registered domain names, not bare IP addresses', correct: true, explanation: 'Direct numerical IP addresses are used by attackers hosting temporary phishing servers without registered, verifiable domain names. Any credentialled login page on a bare IP should be avoided entirely.' },
      { text: 'The link uses port 8000 to serve the page', correct: false, explanation: 'The link does not specify a port. The concern is the bare numeric IP address, not any port number.' },
      { text: 'IP addresses cannot display web pages', correct: false, explanation: 'IP addresses can and do serve web pages — that is precisely why attackers use them for transient phishing kits.' },
    ],
    safeStep: 'Never enter login credentials on any page served from a bare IP address. Log in through your usual browser bookmark or the official mobile app only.',
    evidenceVsUncertainty: {
      evidence: 'Direct quotes: "http://192.0.2.1/login" (bare IP URL) and "verify identity immediately" (urgency cue).',
      uncertainty: 'The claim of "unauthorized access" is an unverifiable pretext commonly used to create fear.',
    },
    keySignals: ['Bare IP address URL', 'Urgency language', 'Credential request implied'],
  },
  {
    id: 7,
    title: 'Unsolicited KBC Lucky Draw Jackpot Winner',
    tag: 'Lottery & Prize Scam',
    category: 'lottery',
    categoryLabel: 'Lottery & Reward',
    difficulty: 'Beginner',
    type: 'scam',
    text: 'Congratulations! Your mobile number won 25,00,000 in KBC All-India Lucky Draw 2026. To claim your cheque, pay 12,500 government clearance tax via UPI to our manager Mr. Sharma.',
    question: 'What is the Golden Rule about unexpected lottery wins?',
    options: [
      { text: 'Always pay the required tax deposit via UPI first to release winnings', correct: false, explanation: 'You will lose the deposit money and receive nothing. Advance tax demands are the core mechanism of advance-fee fraud.' },
      { text: 'You cannot win a lottery or prize you never entered or bought a ticket for', correct: true, explanation: 'Genuine prize disbursements deduct applicable statutory taxes before paying out — they never demand upfront tax payments. If you never entered, you never won.' },
      { text: 'Call Mr. Sharma to negotiate a lower clearance fee', correct: false, explanation: 'Any engagement with the scammer exposes you to further manipulation and financial loss.' },
    ],
    safeStep: 'Delete and report the message. Never send any funds to personal UPI handles claiming to be lottery officials or government agents.',
    evidenceVsUncertainty: {
      evidence: 'Direct quotes: "won 25,00,000" and "pay 12,500 government clearance tax via UPI".',
      uncertainty: 'The claim of a "KBC Lucky Draw" is completely unsubstantiated and cannot be verified.',
    },
    keySignals: ['Unsolicited prize claim', 'Upfront tax/fee demand', 'Payment to personal UPI'],
  },
  {
    id: 8,
    title: 'Remote Tech Support — AnyDesk Installation',
    tag: 'Device Takeover / Vishing',
    category: 'vishing',
    categoryLabel: 'Vishing & Impersonation',
    difficulty: 'Advanced',
    type: 'scam',
    text: 'Customer Support Notice: Malicious activity detected on your device. Please install AnyDesk from the Play Store and provide the 9-digit code to our engineer to clean your phone.',
    question: 'What happens when you share a remote access code with an unverified caller?',
    options: [
      { text: 'Your phone is automatically scanned and cleaned of malware', correct: false, explanation: 'Customer support teams do not clean personal devices via remote desktop software. This is not a service offered by any legitimate bank or telecom.' },
      { text: 'The caller gains full visual and control access to your screen and all apps, including banking apps', correct: true, explanation: 'Remote desktop applications like AnyDesk mirror your entire screen in real time, allowing attackers to see incoming OTPs, control inputs, and access any open apps including mobile banking.' },
      { text: 'It only checks your internet connection bandwidth', correct: false, explanation: 'AnyDesk and TeamViewer are full remote-control platforms. They provide complete interactive access to the device.' },
    ],
    safeStep: 'Immediately refuse to install any remote screen-sharing tool on the instructions of an unverified caller. End the call and report the number.',
    evidenceVsUncertainty: {
      evidence: 'Direct quotes: "install AnyDesk" and "provide the 9-digit code".',
      uncertainty: 'The claim that malicious activity was detected on your device is an unverified pretext.',
    },
    keySignals: ['Remote access software request', 'Impersonation (support)', 'Urgency to act immediately'],
  },
  {
    id: 9,
    title: '"Digital Arrest" Customs Narcotic Parcel Threat',
    tag: 'Authority Impersonation Scam',
    category: 'vishing',
    categoryLabel: 'Vishing & Impersonation',
    difficulty: 'Advanced',
    type: 'scam',
    text: 'This is Officer Verma from Mumbai Crime Branch. A DHL parcel with passport #IN-7821 containing illegal narcotics was seized in your name. An immediate arrest warrant is issued. Connect on WhatsApp video call now.',
    question: 'Do real law enforcement agencies issue arrest warrants via WhatsApp?',
    options: [
      { text: 'Yes, all modern police departments use WhatsApp for official communications today', correct: false, explanation: 'Law enforcement has formal statutory notice procedures. All official processes involve physical notices with court seals, not WhatsApp messages.' },
      { text: 'No. Real police and customs issue physical notices and never conduct interrogations over WhatsApp or video calls', correct: true, explanation: '"Digital Arrest" is an extortion tactic using forged departmental backdrops to intimidate victims into silence and compliance. Statutory criminal procedure requires formal physical process.' },
      { text: 'Only if the parcel was shipped internationally', correct: false, explanation: 'International or domestic — criminal procedure always requires formal physical notice regardless of shipment origin.' },
    ],
    safeStep: 'Hang up immediately. Do not engage. Report the number on cybercrime.gov.in (helpline: 1930). Contact your nearest local police station directly in person.',
    evidenceVsUncertainty: {
      evidence: 'Direct quotes: "Mumbai Crime Branch", "immediate arrest warrant", "Connect on WhatsApp video call now".',
      uncertainty: 'The claim that a parcel was seized in your name is an unverified scare tactic with no basis until a physical official notice is received.',
    },
    keySignals: ['Government authority impersonation', 'WhatsApp "interrogation"', 'Arrest threat as coercion'],
  },
  {
    id: 10,
    title: 'Guaranteed Daily Returns Task Scheme',
    tag: 'Investment Task Scam',
    category: 'investment',
    categoryLabel: 'Investment & Crypto',
    difficulty: 'Advanced',
    type: 'scam',
    text: 'Earn 3,000–8,000 daily from home! Simply like 5 YouTube videos and review products. Guaranteed daily payout in USDT crypto wallet. No experience needed. Join VIP Telegram now: t.me/vip_tasks_demo',
    question: 'Why are "guaranteed daily returns" on task-based schemes a major red flag?',
    options: [
      { text: 'YouTube does not allow video liking', correct: false, explanation: 'YouTube does allow likes, but paying users to like videos violates terms. The mechanism here is used as attractive bait.' },
      { text: 'They use small early payouts to build false trust before demanding large "prepaid deposits"', correct: true, explanation: 'Task scams initially pay small real amounts (₹150–500) to establish credibility. Once trust is built, victims are asked to "unlock" larger earnings by depositing escalating sums — which are then frozen and never returned.' },
      { text: 'USDT (Tether) is not a real cryptocurrency', correct: false, explanation: 'USDT is a real stablecoin. Its irreversibility and global reach make it a preferred tool for scammers — not because it is fake.' },
    ],
    safeStep: 'Never deposit money to "unlock" or "activate" task earnings. Exit and report the Telegram group. Any scheme guaranteeing daily income without risk is fraudulent by definition.',
    evidenceVsUncertainty: {
      evidence: 'Direct quotes: "Guaranteed daily payout in USDT", "Join VIP Telegram", and the Telegram link t.me/vip_tasks_demo.',
      uncertainty: 'Initial small payouts may be real — task scams are designed specifically to fool victims into trusting before the trap closes.',
    },
    keySignals: ['Guaranteed daily return claim', 'USDT/crypto payment', 'VIP Telegram group'],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Scenarios', count: SCENARIOS.length },
  { id: 'phishing', label: 'Phishing & OTP', count: SCENARIOS.filter(s => s.category === 'phishing').length },
  { id: 'job', label: 'Job & Internship', count: SCENARIOS.filter(s => s.category === 'job').length },
  { id: 'vishing', label: 'Vishing & Impersonation', count: SCENARIOS.filter(s => s.category === 'vishing').length },
  { id: 'delivery', label: 'Delivery & Payment', count: SCENARIOS.filter(s => s.category === 'delivery').length },
  { id: 'lottery', label: 'Lottery & Reward', count: SCENARIOS.filter(s => s.category === 'lottery').length },
  { id: 'investment', label: 'Investment & Crypto', count: SCENARIOS.filter(s => s.category === 'investment').length },
  { id: 'legitimate', label: 'Legitimate Examples', count: SCENARIOS.filter(s => s.category === 'legitimate').length },
  { id: 'ambiguous', label: 'Ambiguous Cases', count: SCENARIOS.filter(s => s.category === 'ambiguous').length },
];

const TYPE_STYLES = {
  scam:       { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', label: '⚠️ Fictional Scam Example' },
  legitimate: { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', label: '✅ Fictional Legitimate Example' },
  ambiguous:  { bg: '#FFFBEB', border: '#FDE68A', text: '#7C2D12', label: '🔍 Fictional Ambiguous Case' },
};

const DIFFICULTY_COLORS = {
  Beginner:     { bg: '#ECFDF5', text: '#065F46' },
  Intermediate: { bg: '#FFFBEB', text: '#7C2D12' },
  Advanced:     { bg: '#FEF2F2', text: '#991B1B' },
};

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────
export default function LearningLab() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [showSignals, setShowSignals] = useState(false);

  const [score, setScore] = useState(() => {
    try {
      const saved = localStorage.getItem('scamlens_lab_v2');
      return saved ? JSON.parse(saved) : { correct: 0, total: 0, streak: 0, bestStreak: 0 };
    } catch {
      return { correct: 0, total: 0, streak: 0, bestStreak: 0 };
    }
  });

  const filteredScenarios = activeCategory === 'all'
    ? SCENARIOS
    : SCENARIOS.filter(s => s.category === activeCategory);

  const safeIndex = Math.min(currentIndex, filteredScenarios.length - 1);
  const scenario = filteredScenarios[safeIndex];

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setShowSignals(false);
  };

  const handleSelectOption = (idx) => {
    if (hasAnswered) return;
    setSelectedOption(idx);
    setHasAnswered(true);
    setShowSignals(true);

    const isCorrect = scenario.options[idx].correct;
    setScore(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const updated = {
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak || 0, newStreak),
      };
      try { localStorage.setItem('scamlens_lab_v2', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleNext = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    setShowSignals(false);
    setCurrentIndex(prev => (prev + 1) % filteredScenarios.length);
  };

  const handlePrev = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    setShowSignals(false);
    setCurrentIndex(prev => (prev - 1 + filteredScenarios.length) % filteredScenarios.length);
  };

  const handleJump = (idx) => {
    setCurrentIndex(idx);
    setSelectedOption(null);
    setHasAnswered(false);
    setShowSignals(false);
    setShowNav(false);
  };

  const handleResetScore = () => {
    const fresh = { correct: 0, total: 0, streak: 0, bestStreak: 0 };
    setScore(fresh);
    try { localStorage.removeItem('scamlens_lab_v2'); } catch {}
  };

  const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : null;
  const typeStyle = TYPE_STYLES[scenario.type] || TYPE_STYLES.scam;
  const diffStyle = DIFFICULTY_COLORS[scenario.difficulty] || DIFFICULTY_COLORS.Beginner;
  const isLastScenario = safeIndex === filteredScenarios.length - 1;

  return (
    <section aria-labelledby="learning-lab-heading" style={{ marginTop: '10px' }}>

      {/* ── Header ── */}
      <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0F766E', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              <GraduationCap size={14} />
              <span>Interactive Scam-Awareness Training</span>
            </div>
            <h2 id="learning-lab-heading" style={{ fontSize: '1.7rem', color: 'var(--color-primary)', margin: 0 }}>
              ScamLens Learning Lab
            </h2>
            <p style={{ fontSize: '13.5px', color: '#475569', maxWidth: '700px', marginTop: '8px', lineHeight: '1.5' }}>
              Practice identifying real warning signs in fictional messages. Distinguish traceable evidence from unverified assumptions. Learn safer verification steps for each scam type.
            </p>
            <div style={{ marginTop: '10px', padding: '8px 12px', background: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: '6px', fontSize: '12px', color: '#7C2D12', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Info size={13} />
              <strong>All messages are fictional examples for educational purposes only. Not actual scam reports.</strong>
            </div>
          </div>

          {/* Score Panel */}
          <div style={{ background: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '14px 20px', minWidth: '160px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Score</div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--color-primary)', lineHeight: 1.1, marginTop: '4px' }}>
              {score.correct}<span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: '400' }}>/{score.total}</span>
            </div>
            {pct !== null && (
              <div style={{ fontSize: '13px', fontWeight: '700', color: pct >= 70 ? '#059669' : '#D97706', marginTop: '2px' }}>
                {pct}% correct
              </div>
            )}
            {score.streak >= 2 && (
              <div style={{ fontSize: '11px', color: '#D97706', fontWeight: '700', marginTop: '2px' }}>
                🔥 {score.streak} in a row!
              </div>
            )}
            {score.bestStreak >= 3 && (
              <div style={{ fontSize: '10px', color: '#64748B', marginTop: '1px' }}>Best: {score.bestStreak} streak</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
              <span style={{ fontSize: '10px', color: '#0F766E' }}>On-device only</span>
              <button onClick={handleResetScore} style={{ fontSize: '10px', color: '#991B1B', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}>Reset</button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginBottom: '5px' }}>
            <span>Scenario {safeIndex + 1} of {filteredScenarios.length}{activeCategory !== 'all' ? ` (${CATEGORIES.find(c=>c.id===activeCategory)?.label})` : ''}</span>
            <span>{Math.round(((safeIndex + 1) / filteredScenarios.length) * 100)}% complete</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${((safeIndex + 1) / filteredScenarios.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), #0F766E)', transition: 'width 0.4s ease', borderRadius: '999px' }} />
          </div>
        </div>
      </div>

      {/* ── Category Filter Tabs ── */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: `1px solid ${activeCategory === cat.id ? 'var(--color-primary)' : '#CBD5E1'}`,
              background: activeCategory === cat.id ? 'var(--color-primary)' : 'white',
              color: activeCategory === cat.id ? 'white' : '#334155',
              fontSize: '12.5px',
              fontWeight: activeCategory === cat.id ? '700' : '500',
              cursor: 'pointer',
              transition: 'all 150ms',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            {cat.label}
            <span style={{ fontSize: '10px', background: activeCategory === cat.id ? 'rgba(255,255,255,0.2)' : '#F1F5F9', padding: '1px 5px', borderRadius: '10px', fontWeight: '700' }}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Scenario Card ── */}
      {scenario ? (
        <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '12px', borderTop: `4px solid var(--color-primary)`, overflow: 'hidden', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>

          {/* Card Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Type badge */}
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '12px', background: typeStyle.bg, color: typeStyle.text, border: `1px solid ${typeStyle.border}` }}>
                  {typeStyle.label}
                </span>
                {/* Difficulty badge */}
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '12px', background: diffStyle.bg, color: diffStyle.text }}>
                  {scenario.difficulty}
                </span>
                {/* Category badge */}
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', padding: '3px 8px', borderRadius: '12px', background: '#F1F5F9' }}>
                  {scenario.categoryLabel}
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', margin: 0 }}>
                {scenario.tag}: {scenario.title}
              </h3>
            </div>

            {/* Jump Nav button */}
            <button
              onClick={() => setShowNav(n => !n)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#475569', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
            >
              <List size={13} />
              <span>Jump to</span>
              {showNav ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {/* Jump-to navigator */}
          {showNav && (
            <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--color-border-light)', background: '#F8FAFC', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {filteredScenarios.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => handleJump(i)}
                  title={s.title}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: `1px solid ${i === safeIndex ? 'var(--color-primary)' : '#CBD5E1'}`,
                    background: i === safeIndex ? 'var(--color-primary)' : 'white',
                    color: i === safeIndex ? 'white' : '#334155',
                    cursor: 'pointer'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {/* Message Box */}
          <div style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748B', marginBottom: '8px', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={12} />
              Fictional Message to Evaluate
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid var(--color-border-light)', borderRadius: '8px', padding: '16px 18px', fontFamily: 'inherit', fontSize: '14.5px', lineHeight: '1.65', color: '#1E293B', whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
              {scenario.text}
            </div>

            {/* Quiz Question */}
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={16} color="var(--color-primary)" />
              {scenario.question}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {scenario.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                let bg = 'white', border = '1px solid #CBD5E1', textColor = '#1E293B', iconEl = null;

                if (hasAnswered) {
                  if (option.correct) {
                    bg = '#F0FDF4'; border = '2px solid #16A34A'; textColor = '#166534';
                    iconEl = <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0 }} />;
                  } else if (isSelected && !option.correct) {
                    bg = '#FEF2F2'; border = '2px solid #DC2626'; textColor = '#991B1B';
                    iconEl = <XCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />;
                  } else {
                    bg = '#F8FAFC'; textColor = '#94A3B8';
                  }
                } else if (isSelected) {
                  bg = '#EFF6FF'; border = '2px solid var(--color-primary)'; textColor = 'var(--color-primary)';
                }

                return (
                  <button
                    key={idx}
                    id={`option-${scenario.id}-${idx}`}
                    onClick={() => handleSelectOption(idx)}
                    disabled={hasAnswered}
                    aria-pressed={isSelected}
                    style={{
                      textAlign: 'left',
                      padding: '13px 16px',
                      borderRadius: '8px',
                      border,
                      background: bg,
                      fontSize: '13.5px',
                      color: textColor,
                      cursor: hasAnswered ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      transition: 'all 200ms',
                      lineHeight: '1.4',
                      fontWeight: hasAnswered && option.correct ? '600' : '400'
                    }}
                    onMouseEnter={e => { if (!hasAnswered) e.currentTarget.style.background = '#F0F9FF'; }}
                    onMouseLeave={e => { if (!hasAnswered && !isSelected) e.currentTarget.style.background = 'white'; }}
                  >
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: hasAnswered ? 'transparent' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0, color: '#475569' }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span style={{ flex: 1 }}>{option.text}</span>
                    {iconEl}
                  </button>
                );
              })}
            </div>

            {/* Explanation reveal after answering */}
            {hasAnswered && (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px 20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Sparkles size={16} color="var(--color-primary)" />
                  <h5 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>
                    {scenario.options[selectedOption]?.correct ? '✅ Correct! Here\'s why:' : '❌ Not quite — here\'s the explanation:'}
                  </h5>
                </div>
                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.6', marginBottom: '14px' }}>
                  {scenario.options[selectedOption]?.explanation}
                </p>

                {/* Evidence vs Uncertainty */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ background: 'white', padding: '10px 12px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                    <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0F766E', display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>
                      📌 Traceable Evidence:
                    </strong>
                    <p style={{ fontSize: '12.5px', color: '#334155', margin: 0, lineHeight: '1.4' }}>
                      {scenario.evidenceVsUncertainty.evidence}
                    </p>
                  </div>
                  <div style={{ background: 'white', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                    <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: '#7C2D12', display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>
                      🔍 Remaining Uncertainty:
                    </strong>
                    <p style={{ fontSize: '12.5px', color: '#334155', margin: 0, lineHeight: '1.4' }}>
                      {scenario.evidenceVsUncertainty.uncertainty}
                    </p>
                  </div>
                </div>

                {/* Key signals */}
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: '#475569', display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>
                    Key Warning Signals Identified:
                  </strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {scenario.keySignals.map((s, i) => (
                      <span key={i} style={{ fontSize: '11.5px', background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Safe Step */}
                <div style={{ background: '#F0FDF4', padding: '10px 14px', borderRadius: '8px', border: '1px solid #BBF7D0', fontSize: '13px', color: '#166534', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <ShieldCheck size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div><strong>Safer Next Step:</strong> {scenario.safeStep}</div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--color-border-light)' }}>
              <button
                onClick={handlePrev}
                className="btn-secondary"
                style={{ fontSize: '13px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowLeft size={14} />
                Previous
              </button>

              <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>
                {safeIndex + 1} / {filteredScenarios.length}
              </span>

              <button
                onClick={handleNext}
                className="btn-primary"
                style={{ fontSize: '13px', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {isLastScenario ? (
                  <>
                    <RotateCcw size={14} />
                    Restart
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
          <AlertTriangle size={40} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '15px' }}>No scenarios in this category yet.</p>
          <button onClick={() => handleCategoryChange('all')} className="btn-secondary" style={{ marginTop: '12px' }}>
            Show All Scenarios
          </button>
        </div>
      )}

      {/* Disclaimer footer */}
      <div style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '14px 18px', fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
        <strong>Educational disclaimer:</strong> All messages above are entirely fictional and created for training purposes only. No message is a real report of fraud against any individual or organisation. ScamLens AI does not guarantee that completing these scenarios will protect you from all scams — social engineering evolves constantly. Always verify through official, independent channels before sharing personal information or transferring money.
      </div>
    </section>
  );
}
