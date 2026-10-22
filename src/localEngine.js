import rulesData from '../../rules/rules.json';

// PII Redaction
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{1,7}\b|\b\d{13,19}\b/g;
const ID_REGEX = /\b\d{4}[-\s]\d{4}[-\s]\d{4}\b|\b\d{12}\b/g;
const PHONE_REGEX = /(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}(?:[\s-]?\d{1,4})?/g;
const URL_REGEX = /(?:https?:\/\/[^\s<>"]+|www\.[^\s<>"]+|(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|edu|gov|xyz|top|work|io|me|ai|co|info|biz|example|cc|in)(?:\/[^\s<>"]*)?)/gi;

const SHORTENERS = new Set(["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "rb.gy", "ow.ly", "shorturl.at"]);
const KNOWN_BRANDS = ["paypal", "apple", "google", "microsoft", "amazon", "netflix", "chase", "bankofamerica", "wellsfargo", "sbi", "hdfc", "icici", "fictbank"];
const RISKY_TLDS = new Set(["xyz", "top", "work", "loan", "click", "rest", "buzz", "gq", "cf", "tk", "ml", "ga"]);

export function redactTextLocal(text) {
  // Preserve URLs with placeholders
  const urls = [];
  const textNoUrls = text.replace(URL_REGEX, (m) => {
    const idx = urls.length;
    urls.push(m);
    return `__SCAMLENS_URL_PLACEHOLDER_${idx}__`;
  });

  let masked = textNoUrls.replace(EMAIL_REGEX, '[email]');
  masked = masked.replace(CARD_REGEX, '[number]');
  masked = masked.replace(ID_REGEX, '[id]');
  masked = masked.replace(PHONE_REGEX, (m) => {
    const digits = m.replace(/\D/g, '');
    if (digits.length >= 7 && digits.length <= 15) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(m.trim())) return m;
      return '[phone]';
    }
    return m;
  });

  // Restore URLs
  urls.forEach((u, idx) => {
    masked = masked.replace(`__SCAMLENS_URL_PLACEHOLDER_${idx}__`, u);
  });

  return masked;
}

/**
 * Derives a human-readable scam taxonomy label from observed signal categories.
 * Mirrors the backend classify_scam_type() logic — kept in sync manually.
 */
function classifyScamType(categories, urlsFound, text) {
  const c = new Set(categories);
  const t = (text || '').toLowerCase();

  if (c.has('credential') && c.has('urgency') && urlsFound.length > 0)
    return ['Credential Phishing', 'Detected: OTP/password request + urgency + suspicious link — classic credential harvesting pattern.'];

  if (c.has('credential') && c.has('urgency'))
    return ['Credential Phishing (Vishing)', 'Detected: OTP/password request + urgency — caller or SMS-based credential theft pattern.'];

  if (c.has('money') && c.has('reward'))
    return ['Advance Fee Fraud', 'Detected: Upfront fee + unrealistic reward lure — textbook advance-fee / 419 fraud pattern.'];

  if (c.has('reward') && c.has('secrecy'))
    return ['Fake Recruitment Scam', 'Detected: Unsolicited job offer + channel shift to private app — fake recruitment scam pattern.'];

  if (c.has('urgency') && c.has('impersonation') && ['arrest','warrant','police','court','legal action','fine'].some(w => t.includes(w)))
    return ['Authority Impersonation Scam', 'Detected: Legal/arrest threat + institutional impersonation — government impersonation fraud pattern.'];

  if (c.has('money') && urlsFound.length > 0 && ['parcel','courier','delivery','package','shipment','customs'].some(w => t.includes(w)))
    return ['Parcel Delivery Scam', 'Detected: Delivery fee demand + suspicious link — parcel clearance fee fraud pattern.'];

  if (c.has('impersonation') && c.has('urgency'))
    return ['Institutional Impersonation', 'Detected: Claimed official identity + pressure tactic — sender cannot be verified without independent contact.'];

  if (c.has('url') && urlsFound.length > 0 && !c.has('credential') && !c.has('money') && !c.has('reward'))
    return ['Suspicious Link / Phishing Attempt', 'Detected: Anomalous URL structure — domain or link does not pass heuristic checks.'];

  return [null, null];
}

export function analyzeMessageLocal(text, optionalUrl = '') {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    throw new Error('Input cannot be empty. Please provide a message to inspect.');
  }

  const maskedText = redactTextLocal(trimmed);
  const candidates = [];

  // Extract URLs
  const urlMatches = maskedText.match(URL_REGEX) || [];
  const urlsFound = [...new Set(urlMatches.map(u => u.replace(/[.,!?;:)\]]+$/, '')))];
  if (optionalUrl && optionalUrl.trim() && !urlsFound.includes(optionalUrl.trim())) {
    urlsFound.push(optionalUrl.trim());
  }

  // 1. Text Rule checks
  const rules = rulesData.rules || [];
  rules.forEach(rule => {
    try {
      const regex = new RegExp(rule.pattern, 'gi');
      let match;
      while ((match = regex.exec(maskedText)) !== null) {
        const quote = match[0].trim();
        if (!quote) continue;

        // Check suppressors
        let isSuppressed = false;
        if (rule.suppressors && rule.suppressors.length > 0) {
          for (const sup of rule.suppressors) {
            const supRegex = new RegExp(sup, 'i');
            if (supRegex.test(maskedText)) {
              isSuppressed = true;
              break;
            }
          }
        }

        if (!isSuppressed) {
          candidates.push({
            id: rule.id,
            category: rule.category,
            severity: rule.severity,
            evidence_quote: quote,
            explanation: rule.explanation,
            template_id: rule.template_id || rule.id,
            source_type: 'rule'
          });
        }
      }
    } catch (e) {
      // safe fallback
    }
  });

  // 2. URL Heuristics
  let isShortener = false;
  urlsFound.forEach(rawUrl => {
    try {
      let host = '';
      try {
        const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : 'http://' + rawUrl);
        host = parsed.hostname.toLowerCase();
      } catch {
        host = rawUrl.toLowerCase().split('/')[0];
      }

      if (SHORTENERS.has(host)) {
        isShortener = true;
        candidates.push({
          id: 'URL_SHORT',
          category: 'url',
          severity: 'low',
          evidence_quote: rawUrl,
          explanation: 'Shortened link obscures the real destination host. Destination is unknown.',
          template_id: 'URL_SHORT',
          source_type: 'rule'
        });
      }

      if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) {
        candidates.push({
          id: 'URL_IP',
          category: 'url',
          severity: 'medium',
          evidence_quote: rawUrl,
          explanation: 'Direct numerical IP address instead of a verified domain name.',
          template_id: 'URL_IP',
          source_type: 'rule'
        });
      }

      for (const b of KNOWN_BRANDS) {
        if (host.includes(b) && !host.endsWith(`.${b}.com`) && host !== `${b}.com`) {
          candidates.push({
            id: 'URL_BRAND_MISMATCH',
            category: 'url',
            severity: 'medium',
            evidence_quote: rawUrl,
            explanation: `Domain mentions brand '${b}' but appears to be hosted on an unverified domain '${host}'.`,
            template_id: 'URL_BRAND_MISMATCH',
            source_type: 'rule'
          });
          break;
        }
      }
      // Risky TLD
      const tld = host.split('.').pop();
      if (RISKY_TLDS.has(tld)) {
        candidates.push({
          id: 'URL_TLD',
          category: 'url',
          severity: 'low',
          evidence_quote: rawUrl,
          explanation: `Uncommon/risky top-level domain (.${tld}) — these TLDs are disproportionately associated with scam infrastructure.`,
          template_id: 'URL_TLD',
          source_type: 'rule'
        });
      }

      // Suspicious path keywords on non-brand domains
      const SUSPICIOUS_PATHS = ['login', 'verify', 'update', 'kyc', 'signin', 'secure', 'confirm'];
      const pathStr = rawUrl.toLowerCase().split(host)[1] || '';
      const hasPathWord = SUSPICIOUS_PATHS.some(p => pathStr.includes(p));
      const isBrandHost = KNOWN_BRANDS.some(b => host.includes(b));
      if (hasPathWord && !isBrandHost) {
        candidates.push({
          id: 'URL_SUSPPATH',
          category: 'url',
          severity: 'low',
          evidence_quote: rawUrl,
          explanation: 'URL path contains account/verification keywords (login, kyc, verify) on an unrecognized domain.',
          template_id: 'URL_STRUCTURE',
          source_type: 'rule'
        });
      }
    } catch {}
  });

  // 3. Evidence Gate
  const hay = maskedText.toLowerCase();
  const kept = [];
  const categoryCounts = {};

  candidates.forEach(c => {
    const q = c.evidence_quote || '';
    if (!q || q.length > 120) return;
    const idx = hay.indexOf(q.toLowerCase());
    if (idx < 0) return;

    const cat = c.category;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    if (categoryCounts[cat] > 3) return;

    kept.push({
      ...c,
      id: `f${kept.length + 1}`,
      evidence_quote: maskedText.slice(idx, idx + q.length),
      start: idx,
      end: idx + q.length
    });
  });

  // 4. Scoring & Escalation
  const severityPoints = { low: 1, medium: 2, high: 3 };
  const catMax = {};
  const categories = [];

  kept.forEach(f => {
    if (!categories.includes(f.category)) categories.push(f.category);
    const pts = severityPoints[f.severity] || 1;
    catMax[f.category] = Math.max(catMax[f.category] || 0, pts);
  });

  const signalScore = Object.values(catMax).reduce((a, b) => a + b, 0);
  const escalated = signalScore >= 6 ||
    (categories.includes('credential') && categories.includes('urgency')) ||
    (categories.includes('money') && categories.includes('impersonation'));

  let summaryLabel = 'No obvious signals detected';
  let cautionLevel = 'none_detected';

  if (signalScore === 0) {
    summaryLabel = 'No obvious signals detected';
    cautionLevel = 'none_detected';
  } else if (escalated) {
    summaryLabel = 'Strong warning signs detected';
    cautionLevel = 'high';
  } else if (signalScore >= 3) {
    summaryLabel = 'Several warning signs detected';
    cautionLevel = 'moderate';
  } else {
    summaryLabel = 'A few possible warning signs';
    cautionLevel = 'low';
  }

  const wordCount = maskedText.split(/\s+/).length;
  let evidenceCoverage = 'moderate';
  if (wordCount < 25 || (kept.length === 1 && kept[0].severity === 'low' && urlsFound.length === 0)) {
    evidenceCoverage = 'limited';
  } else if (wordCount >= 25 && (urlsFound.length > 0 || categories.includes('impersonation'))) {
    evidenceCoverage = 'good';
  }

  const safeActions = [];
  if (categories.includes('credential')) safeActions.push('Do not share the OTP, password, or PIN. Open the official app or site yourself.');
  if (categories.includes('urgency')) safeActions.push('Do not rush. Take time to verify the situation through a trusted contact or official website.');
  if (categories.includes('money')) safeActions.push('Do not send money, gift cards, or crypto. Legitimate offers never demand upfront deposits.');
  if (categories.includes('url')) safeActions.push('Do not click suspicious links. Navigate to the service manually in your browser or official app.');
  if (safeActions.length === 0) {
    safeActions.push('Verify any requests through official contact methods before taking action.');
    safeActions.push('Inspect the true sender details and official company domain independently.');
  }

  const unknowns = [
    "Sender identity has not been independently verified. (Verification: Compare sender's email domain or phone number with official contact details on their website)"
  ];
  if (urlsFound.length > 0) {
    if (isShortener) unknowns.push('Destination hidden by link shortener; target domain unknown. (Verification: Avoid opening shortened links; obtain direct official URL)');
    unknowns.push('Link destination server safety and backend behavior have not been checked. (Verification: Manually type the organization’s known official web address)');
  } else {
    unknowns.push('No official contact method has been confirmed for the sender. (Verification: Look up the organization in public directories or statements)');
  }
  unknowns.push('Private context, prior communications, or relationship with sender are unknown. (Verification: Check your actual message history in the official app)');

  const whatWouldChange = [
    {
      condition: "The sender contacts you from an independently verified corporate domain (e.g. @company.com matching corporate registry), rather than a free webmail (@gmail.com) or lookalike domain.",
      impact: "weakens_suspicion",
      verification_step: "Check full email headers or search the corporate directory to confirm employee authenticity."
    }
  ];

  if (categories.includes('credential') || categories.includes('urgency')) {
    whatWouldChange.push({
      condition: "The sender insists on receiving a 6-digit OTP, UPI PIN, or asks you to install remote support software (AnyDesk, TeamViewer).",
      impact: "strengthens_suspicion",
      verification_step: "Immediately end communication. Genuine institutions never request one-time passcodes or remote control."
    });
  }

  if (categories.includes('money') || categories.includes('reward')) {
    whatWouldChange.push({
      condition: "The request demands payment via cryptocurrency, gift cards, or personal UPI IDs for 'refundable registration' or 'customs clearance'.",
      impact: "strengthens_suspicion",
      verification_step: "Refuse the payment. Legitimate recruiters, delivery couriers, and banks do not use gift cards or personal wallets."
    });
  }

  whatWouldChange.push({
    condition: "The exact same alert, pending payment, or action item appears inside your authenticated account dashboard when logging into the official app.",
    impact: "weakens_suspicion",
    verification_step: "Log in via the official app (downloaded from official store) or typed bookmark—never through message links."
  });

  const isJob = categories.includes('reward') || categories.includes('money') || categories.includes('secrecy');
  const isBanking = categories.includes('credential') || categories.includes('urgency');
  
  const verificationGuide = [];
  if (isJob) {
    verificationGuide.push(
      { step_number: 1, action: "Manually Visit Official Careers Portal", rationale: "Never trust job offers sent via unsolicited SMS or Telegram. Navigate to the company's official domain by typing it in your browser.", official_portal: "Verified Company Careers Page" },
      { step_number: 2, action: "Audit Recruiter Email Domain", rationale: "Verify that emails come from the exact corporate domain (e.g. name@microsoft.com, not @gmail.com or @contoso-careers.xyz).", official_portal: "Corporate Domain Registry" },
      { step_number: 3, action: "Zero-Fee Rule for Employment", rationale: "Legitimate employers never require candidates to pay registration fees, training kit charges, or refundable security deposits.", official_portal: "Ministry of Labour / FTC Guidance" }
    );
  } else if (isBanking) {
    verificationGuide.push(
      { step_number: 1, action: "Check Official Bank App Directly", rationale: "Open your mobile banking app or internet banking by typing the URL manually. Authentic alerts appear in your secured inbox.", official_portal: "Official Mobile Banking App" },
      { step_number: 2, action: "Dial the Number on Your Physical Card", rationale: "Do not call numbers provided in SMS or caller ID. Dial the customer care helpline printed directly on the reverse side of your card.", official_portal: "Card Reverse Helpline" },
      { step_number: 3, action: "Enforce the OTP Confidentiality Rule", rationale: "Bank staff are technically barred from asking for OTPs, CVVs, or UPI PINs. Any request for your OTP is a definitive warning sign.", official_portal: "RBI / FTC Consumer Defense" }
    );
  } else {
    verificationGuide.push(
      { step_number: 1, action: "Independent URL Verification", rationale: "Inspect the root domain. Scammers frequently use lookalike subdomains or URL shorteners to mask destinations.", official_portal: "Official Organization Home Page" },
      { step_number: 2, action: "Cross-Reference Public Helplines", rationale: "Look up the sender's stated department using independent search queries or official directories.", official_portal: "Official Government / Corporate Portal" },
      { step_number: 3, action: "Verify Before Sharing Any Credentials", rationale: "Refuse demands that cite immediate deadlines or threaten account closure.", official_portal: "National Cyber Crime Reporting Portal" }
    );
  }

  const privacyReceipt = {
    analysis_mode: "In-Browser Local JavaScript Engine (100% Client-Side)",
    text_stored: false,
    audio_captured: false,
    external_services_contacted: [],
    redaction_performed: true,
    masked_counts: {},
    user_can_clear: true,
    shield_manifest_internet_permission: false
  };

  const [scamTypeLabel, scamTypeBasis] = classifyScamType(categories, urlsFound, maskedText);

  return {
    summary_label: summaryLabel,
    caution_level: cautionLevel,
    evidence_coverage: evidenceCoverage,
    scam_type_label: scamTypeLabel,
    scam_type_basis: scamTypeBasis,
    findings: kept,
    url_check: {
      status: urlsFound.length > 0 ? 'not_configured' : 'not_requested',
      detail: urlsFound.length > 0 ? 'Live URL reputation check is not configured. Heuristic domain checks were applied.' : 'No web links detected.'
    },
    unknowns: unknowns,
    safe_actions: safeActions,
    what_would_change: whatWouldChange.slice(0, 4),
    verification_guide: verificationGuide,
    privacy_receipt: privacyReceipt,
    limitations: [
      'Only evidence directly highlighted in the text can support a warning.',
      "Scammers may deliberately obfuscate words (e.g. '0TP') or mimic legitimate templates.",
      'A lack of detected signals is not a guarantee of safety.',
      'This tool evaluates visible text patterns on-device; it does not access real-time databases.'
    ],
    disclaimer: 'This is an educational assessment, not certainty. Do not use as sole basis for financial or legal decisions.',
    masked_text: maskedText,
    character_count: trimmed.length,
    suppressed_count: 0
  };
}

export function analyzeStorylineLocal(messages = [], caseTitle = "Investigation Case") {
  if (!messages || messages.length === 0) {
    return {
      case_title: caseTitle,
      message_count: 0,
      timeline: [],
      detected_patterns: [],
      progression_summary: "No messages provided in this investigation case.",
      confirmed_observations: [],
      inferred_relationships: [],
      missing_evidence: ["Please add messages to examine multi-step communication patterns."],
      safe_next_steps: ["Do not interact or share details with unverified senders."],
      privacy_note: "Storyline cases are held in temporary session memory only and are never stored."
    };
  }

  const timelineItems = [];
  const detectedPatterns = [];
  const confirmedObs = [];
  const allQuotes = [];

  let hasTelegram = false;
  let hasUrgency = false;
  let hasMoney = false;
  let hasCredential = false;

  messages.forEach((msg, idx) => {
    try {
      const res = analyzeMessageLocal(msg.text);
      const cats = res.findings.map(f => f.category);
      const quotes = res.findings.map(f => f.evidence_quote);
      allQuotes.push(...quotes);

      if (cats.includes('secrecy') || /telegram|whatsapp/i.test(msg.text)) hasTelegram = true;
      if (cats.includes('urgency')) hasUrgency = true;
      if (cats.includes('money')) hasMoney = true;
      if (cats.includes('credential')) hasCredential = true;

      timelineItems.push({
        step: idx + 1,
        id: msg.id || `m${idx + 1}`,
        sender: msg.sender || "Unspecified Sender",
        timestamp: msg.timestamp || `Message #${idx + 1}`,
        channel: msg.channel || "SMS",
        caution_level: res.caution_level,
        summary_label: res.summary_label,
        findings_count: res.findings.length,
        key_quotes: quotes.slice(0, 3)
      });

      quotes.forEach(q => confirmedObs.push(`Direct quote in Message #${idx + 1}: '${q}'`));
    } catch {
      timelineItems.push({
        step: idx + 1,
        id: msg.id || `m${idx + 1}`,
        sender: msg.sender || "Unspecified Sender",
        timestamp: msg.timestamp || `Message #${idx + 1}`,
        channel: msg.channel || "SMS",
        caution_level: "none_detected",
        summary_label: "Analysis skipped",
        findings_count: 0,
        key_quotes: []
      });
    }
  });

  if (hasTelegram) {
    detectedPatterns.push({
      pattern_type: "Channel Relocation",
      description: "Directing the conversation to private messaging platforms (Telegram/WhatsApp) to evade corporate supervision.",
      evidence: allQuotes.filter(q => /telegram|whatsapp|chat/i.test(q)).slice(0, 3),
      is_confirmed_observation: true
    });
  }

  if (hasMoney && messages.length > 1) {
    detectedPatterns.push({
      pattern_type: "Escalating Financial Demands",
      description: "Upfront fees, refundable deposits, or gift cards requested after establishing initial contact.",
      evidence: allQuotes.filter(q => /fee|pay|deposit|crypto/i.test(q)).slice(0, 3),
      is_confirmed_observation: true
    });
  }

  if (hasUrgency) {
    detectedPatterns.push({
      pattern_type: "Artificial Time-Pressure",
      description: "Deadlines or threat of immediate penalties designed to rush decision-making.",
      evidence: allQuotes.filter(q => /minute|hour|now|immediately|block/i.test(q)).slice(0, 3),
      is_confirmed_observation: true
    });
  }

  if (hasCredential) {
    detectedPatterns.push({
      pattern_type: "Authentication Code Request",
      description: "Direct requests to share one-time passcodes, passwords, or security PINs.",
      evidence: allQuotes.filter(q => /otp|pin|password|code/i.test(q)).slice(0, 3),
      is_confirmed_observation: true
    });
  }

  const inferred = [];
  if (messages.length > 1) {
    inferred.push("Hypothesis: Messages may be part of an orchestrated multi-stage recruitment or payment scam.");
    inferred.push("Uncertainty: Messages appearing sequential or from similar labels does not prove they originate from the same entity.");
  } else {
    inferred.push("Single message provided. Additional messages are needed to trace scam evolution.");
  }

  return {
    case_title: caseTitle,
    message_count: messages.length,
    timeline: timelineItems,
    detected_patterns: detectedPatterns,
    progression_summary: `Analyzed ${messages.length} messages in sequence. Detected ${detectedPatterns.length} behavioral patterns.`,
    confirmed_observations: confirmedObs.slice(0, 6),
    inferred_relationships: inferred,
    missing_evidence: [
      "Independent verification that senders share phone carrier infrastructure or corporate email servers.",
      "Official confirmation from the impersonated entity's authenticated communications desk."
    ],
    safe_next_steps: [
      "Stop communicating on external chat apps (Telegram/WhatsApp).",
      "Refuse all registration fee demands and never disclose 2FA codes.",
      "Check the 'I Have Already Responded' Recovery Guide if any payment or credential was shared."
    ],
    privacy_note: "Storyline cases are held in temporary session memory only and are never stored."
  };
}
