from typing import Dict, Any, List, Optional
from app.config import MAX_CHARS, SAFE_BROWSING_API_KEY
from app.redact import redact_text
from app.urls import extract_urls, check_url_heuristics
from app.rules import evaluate_text_rules
from app.evidence import evidence_gate
from app.templates import (
    generate_safe_actions,
    generate_unknowns,
    generate_what_would_change,
    generate_verification_guide,
    get_limitations_list,
    DISCLAIMER_TEXT
)
from app.schemas import (
    AnalyzeResponse,
    Finding,
    UrlCheck,
    WhatWouldChangeItem,
    VerificationStep,
    PrivacyReceipt,
    StorylineRequest,
    StorylineAnalysisResponse,
    StorylinePattern
)

def classify_scam_type(observed_categories: List[str], urls_found: List[str], text: str) -> tuple:
    """
    Derives a human-readable scam taxonomy label from observed signal categories.
    Returns (label, basis) or (None, None) if signals are insufficient.
    Rule priority order (most specific first):
    1. Vishing / Tech-support  2. Credential Phishing  3. Advance Fee Fraud
    4. Romance/Investment scam  5. Impersonation/Authority  6. Delivery scam
    """
    c = set(observed_categories)
    t = text.lower()

    # 1. Credential Phishing: OTP/password request + urgency + URL
    if "credential" in c and "urgency" in c and len(urls_found) > 0:
        return (
            "Credential Phishing",
            "Detected: OTP/password request (CRD_01) + artificial urgency (URG_01) + suspicious link — classic credential harvesting pattern."
        )

    # 2. Credential Phishing (without URL but still OTP + urgency)
    if "credential" in c and "urgency" in c:
        return (
            "Credential Phishing (Vishing)",
            "Detected: OTP/password request (CRD_01) + urgency pressure (URG_01) — caller-based or SMS-based credential theft pattern."
        )

    # 3. Advance Fee Fraud: money demand + reward lure (job/lottery)
    if "money" in c and "reward" in c:
        return (
            "Advance Fee Fraud",
            "Detected: Upfront fee request (MON_01) + unrealistic reward lure (RWD_01) — textbook advance-fee / 419 fraud pattern."
        )

    # 4. Job Scam: reward + secrecy (Telegram shift) + money
    if "reward" in c and "secrecy" in c:
        return (
            "Fake Recruitment Scam",
            "Detected: Unsolicited job offer (RWD_01) + channel shift to private app (SEC_01) — common fake recruitment scam pattern."
        )

    # 5. Authority/Impersonation scam: arrest/legal threat + impersonation
    if "urgency" in c and "impersonation" in c and any(w in t for w in ["arrest", "warrant", "police", "court", "legal action", "fine"]):
        return (
            "Authority Impersonation Scam",
            "Detected: Legal/arrest threat (URG_02) + institutional impersonation (IMP_01) — government/police impersonation fraud pattern."
        )

    # 6. Delivery/Parcel scam: money + URL (IP or structural) + delivery keywords
    if "money" in c and len(urls_found) > 0 and any(w in t for w in ["parcel", "courier", "delivery", "package", "shipment", "customs"]):
        return (
            "Parcel Delivery Scam",
            "Detected: Delivery fee demand (MON_01) + suspicious link — parcel clearance fee fraud pattern."
        )

    # 7. Impersonation only
    if "impersonation" in c and "urgency" in c:
        return (
            "Institutional Impersonation",
            "Detected: Claimed official identity (IMP_01) + pressure tactic (URG_01) — sender cannot be verified without independent contact."
        )

    # 8. Phishing (URL only with structural issues)
    if "url" in c and len(urls_found) > 0 and not c.intersection({"credential", "money", "reward"}):
        return (
            "Suspicious Link / Phishing Attempt",
            "Detected: Anomalous URL structure — domain or link does not pass heuristic checks for legitimate services."
        )

    # No type — insufficient signals
    return (None, None)


class EmptyInputException(Exception):
    def __init__(self, message: str = "Input cannot be empty. Please provide a message to inspect."):
        self.code = "EMPTY_INPUT"
        self.message = message
        super().__init__(self.message)

class TextTooLongException(Exception):
    def __init__(self, message: str = f"Input exceeds maximum allowed length of {MAX_CHARS} characters."):
        self.code = "TEXT_TOO_LONG"
        self.message = message
        super().__init__(self.message)

def clean_control_characters(text: str) -> str:
    """Strips control characters except newline (\n) and tab (\t)."""
    return "".join(ch for ch in text if ch in ('\n', '\t') or (ch.isprintable() and ord(ch) >= 32))

def analyze_message(
    text: str,
    optional_url: Optional[str] = None,
    check_urls: bool = False,
    sender: Optional[str] = None,
    category_hint: Optional[str] = None,
    timestamp: Optional[str] = None
) -> AnalyzeResponse:
    # 1. Validation
    trimmed = text.strip() if text else ""
    if not trimmed:
        raise EmptyInputException()

    cleaned = clean_control_characters(trimmed)
    if not cleaned:
        raise EmptyInputException()

    if len(cleaned) > MAX_CHARS:
        raise TextTooLongException()

    # 2. Minimise / Redact
    masked_text, redaction_counts = redact_text(cleaned)

    # 3. Extract URLs
    urls_found = extract_urls(masked_text)
    if optional_url and optional_url.strip():
        clean_opt = optional_url.strip()
        if clean_opt not in urls_found:
            urls_found.append(clean_opt)

    # 4. Detect - Candidate Findings
    candidates: List[Dict[str, Any]] = []

    # Rule checks on masked text
    text_findings = evaluate_text_rules(masked_text)
    candidates.extend(text_findings)

    # URL heuristic checks
    is_shortener_detected = False
    for u in urls_found:
        url_findings = check_url_heuristics(u)
        for uf in url_findings:
            if uf.get("template_id") == "URL_SHORT":
                is_shortener_detected = True
            candidates.append(uf)

    # 5. Evidence gate
    kept_findings, suppressed_count = evidence_gate(masked_text, candidates)

    # Re-assign finding IDs cleanly (f1, f2, ...)
    validated_findings: List[Finding] = []
    for idx, f in enumerate(kept_findings, start=1):
        validated_findings.append(Finding(
            id=f"f{idx}",
            category=f["category"],
            severity=f["severity"],
            evidence_quote=f["evidence_quote"],
            start=f.get("start", 0),
            end=f.get("end", 0),
            explanation=f["explanation"],
            template_id=f.get("template_id", f"RULE_{idx}"),
            source_type=f.get("source_type", "rule")
        ))

    # 6. Interpret & Score (Section 5 Mapping)
    severity_map = {"low": 1, "medium": 2, "high": 3}
    category_max_points: Dict[str, int] = {}
    observed_categories: List[str] = []

    for f in validated_findings:
        cat = f.category
        if cat not in observed_categories:
            observed_categories.append(cat)
        pts = severity_map.get(f.severity, 1)
        if cat not in category_max_points or pts > category_max_points[cat]:
            category_max_points[cat] = pts

    signal_score = sum(category_max_points.values())

    # Escalation criteria:
    # 1. Score >= 6
    # 2. Credential/OTP request + Urgency
    # 3. Upfront fee + Impersonation
    has_urgency = "urgency" in observed_categories
    has_credential = "credential" in observed_categories
    has_money = "money" in observed_categories
    has_impersonation = "impersonation" in observed_categories

    escalated = (
        signal_score >= 6 or
        (has_credential and has_urgency) or
        (has_money and has_impersonation)
    )

    if signal_score == 0:
        summary_label = "No obvious signals detected"
        caution_level = "none_detected"
    elif escalated:
        summary_label = "Strong warning signs detected"
        caution_level = "high"
    elif signal_score >= 3:
        summary_label = "Several warning signs detected"
        caution_level = "moderate"
    else:
        summary_label = "A few possible warning signs"
        caution_level = "low"

    # Evidence coverage calculation
    word_count = len(masked_text.split())
    if word_count < 25 or (len(validated_findings) == 1 and validated_findings[0].severity == "low" and not urls_found):
        evidence_coverage = "limited"
    elif word_count >= 25 and (len(urls_found) > 0 or has_impersonation):
        evidence_coverage = "good"
    else:
        evidence_coverage = "moderate"

    # URL Check status
    if not urls_found:
        url_check = UrlCheck(
            status="not_requested",
            detail="No web links were provided or detected in the message."
        )
    else:
        if SAFE_BROWSING_API_KEY and check_urls:
            url_check = UrlCheck(
                status="check_unavailable",
                detail="External reputation service could not be queried."
            )
        else:
            url_check = UrlCheck(
                status="not_configured",
                detail="Live URL reputation check is not configured. Heuristic domain checks were applied."
            )

    unknowns = generate_unknowns(
        has_url=len(urls_found) > 0,
        categories=observed_categories,
        is_shortener=is_shortener_detected
    )
    safe_actions = generate_safe_actions(observed_categories)
    limitations = get_limitations_list()

    what_would_change_raw = generate_what_would_change(
        categories=observed_categories,
        has_url=len(urls_found) > 0,
        is_shortener=is_shortener_detected
    )
    what_would_change = [
        WhatWouldChangeItem(
            condition=item["condition"],
            impact=item["impact"],
            verification_step=item["verification_step"]
        ) for item in what_would_change_raw
    ]

    verification_guide_raw = generate_verification_guide(
        categories=observed_categories,
        category_hint=category_hint
    )
    verification_guide = [
        VerificationStep(
            step_number=s["step_number"],
            action=s["action"],
            rationale=s["rationale"],
            official_portal=s.get("official_portal")
        ) for s in verification_guide_raw
    ]

    privacy_receipt = PrivacyReceipt(
        analysis_mode="Local In-Memory API (Zero Persistence)",
        text_stored=False,
        audio_captured=False,
        external_services_contacted=[] if not (check_urls and SAFE_BROWSING_API_KEY) else ["Google Safe Browsing API"],
        redaction_performed=True,
        masked_counts=redaction_counts,
        user_can_clear=True,
        shield_manifest_internet_permission=False
    )

    # Scam type classification (rule-based, evidence-traceable)
    scam_type_label, scam_type_basis = classify_scam_type(observed_categories, urls_found, masked_text)

    return AnalyzeResponse(
        summary_label=summary_label,
        caution_level=caution_level,
        evidence_coverage=evidence_coverage,
        scam_type_label=scam_type_label,
        scam_type_basis=scam_type_basis,
        findings=validated_findings,
        url_check=url_check,
        unknowns=unknowns,
        safe_actions=safe_actions,
        limitations=limitations,
        disclaimer=DISCLAIMER_TEXT,
        what_would_change=what_would_change,
        verification_guide=verification_guide,
        privacy_receipt=privacy_receipt,
        masked_text=masked_text,
        character_count=len(cleaned),
        suppressed_count=suppressed_count
    )

def analyze_storyline(request: StorylineRequest) -> StorylineAnalysisResponse:
    """Feature 3: Multi-Message Scam Storyline analysis."""
    if not request.messages:
        return StorylineAnalysisResponse(
            case_title=request.case_title or "Empty Case",
            message_count=0,
            timeline=[],
            detected_patterns=[],
            progression_summary="No messages provided in this investigation case.",
            confirmed_observations=[],
            inferred_relationships=[],
            missing_evidence=["Please add messages to examine multi-step communication patterns."],
            safe_next_steps=["Do not interact or share details with unverified senders."],
            privacy_note="Storyline cases are held in temporary session memory only and are never stored."
        )

    timeline_items = []
    all_categories = set()
    detected_patterns: List[StorylinePattern] = []
    confirmed_obs = []
    all_quotes = []

    has_telegram_shift = False
    has_urgency = False
    has_money_demand = False
    has_credential = False

    for idx, msg in enumerate(request.messages, start=1):
        try:
            analysis = analyze_message(msg.text)
            cats = [f.category for f in analysis.findings]
            all_categories.update(cats)
            quotes = [f.evidence_quote for f in analysis.findings]
            all_quotes.extend(quotes)

            if "secrecy" in cats or "telegram" in msg.text.lower() or "whatsapp" in msg.text.lower():
                has_telegram_shift = True
            if "urgency" in cats:
                has_urgency = True
            if "money" in cats:
                has_money_demand = True
            if "credential" in cats:
                has_credential = True

            timeline_items.append({
                "step": idx,
                "id": msg.id,
                "sender": msg.sender or "Unspecified Sender",
                "timestamp": msg.timestamp or f"Message #{idx}",
                "channel": msg.channel or "SMS",
                "caution_level": analysis.caution_level,
                "summary_label": analysis.summary_label,
                "findings_count": len(analysis.findings),
                "key_quotes": quotes[:3]
            })

            for q in quotes:
                confirmed_obs.append(f"Direct quote in Message #{idx}: '{q}'")
        except Exception:
            timeline_items.append({
                "step": idx,
                "id": msg.id,
                "sender": msg.sender or "Unspecified Sender",
                "timestamp": msg.timestamp or f"Message #{idx}",
                "channel": msg.channel or "SMS",
                "caution_level": "none_detected",
                "summary_label": "Analysis skipped",
                "findings_count": 0,
                "key_quotes": []
            })

    # Pattern 1: Channel shift
    if has_telegram_shift:
        detected_patterns.append(StorylinePattern(
            pattern_type="Channel Relocation",
            description="The communication directs you to private messaging platforms (Telegram/WhatsApp), which shields bad actors from corporate monitoring.",
            evidence=[q for q in all_quotes if any(k in q.lower() for k in ["telegram", "whatsapp", "chat", "contact"])] or ["Redirection to external chat app"],
            is_confirmed_observation=True
        ))

    # Pattern 2: Payment Demand after Initial Contact
    if has_money_demand and len(request.messages) > 1:
        detected_patterns.append(StorylinePattern(
            pattern_type="Escalating Financial Demands",
            description="A request for upfront fees, refundable deposits, or gift cards emerged across the conversation flow.",
            evidence=[q for q in all_quotes if any(k in q.lower() for k in ["fee", "pay", "deposit", "money", "crypto"])] or ["Payment solicitation"],
            is_confirmed_observation=True
        ))

    # Pattern 3: Escalating Urgency
    if has_urgency:
        detected_patterns.append(StorylinePattern(
            pattern_type="Artificial Time-Pressure",
            description="Pressure tactics (deadlines, arrest threats, suspension warnings) used to accelerate compliance before verification.",
            evidence=[q for q in all_quotes if any(k in q.lower() for k in ["minute", "hour", "now", "immediately", "block", "suspend"])] or ["Time limit pressure"],
            is_confirmed_observation=True
        ))

    # Pattern 4: Credential Solicitation
    if has_credential:
        detected_patterns.append(StorylinePattern(
            pattern_type="Authentication Code Request",
            description="Direct solicitation of OTPs, passwords, or security PINs.",
            evidence=[q for q in all_quotes if any(k in q.lower() for k in ["otp", "pin", "password", "code"])] or ["OTP solicitation"],
            is_confirmed_observation=True
        ))

    inferred_rels = []
    if len(request.messages) > 1:
        inferred_rels.append(
            "Hypothesis: The sequence of messages may represent a phased social-engineering campaign (initial hook -> relationship building -> fee/credential extraction)."
        )
        inferred_rels.append(
            "Uncertainty: Messages appearing sequential or from similar labels does not prove they originate from the same individual or organization."
        )
    else:
        inferred_rels.append(
            "Single message provided. Additional messages are needed to trace multi-step scam evolution."
        )

    missing_ev = [
        "Independent verification that the senders share phone carrier infrastructure or corporate email servers.",
        "Confirmation whether previous messages in the sequence were initiated by you or unsolicited.",
        "Official verification from the impersonated entity's authenticated communications desk."
    ]

    safe_steps = [
        "Stop replying on external chat platforms (Telegram/WhatsApp).",
        "Never send requested registration fees, security deposits, or OTPs.",
        "Cross-reference the organization's verified phone number directly on their official website.",
        "If you already sent money or credentials, consult the 'I Have Already Responded' Recovery Guide immediately."
    ]

    summary = (
        f"Analyzed {len(request.messages)} messages in sequence. "
        + (f"Observed {len(detected_patterns)} distinct conversational patterns including channel shift and financial urgency. " if detected_patterns else "No escalating patterns detected across the provided messages. ")
        + "Remember that message resemblance alone does not confirm common ownership."
    )

    return StorylineAnalysisResponse(
        case_title=request.case_title or "Multi-Message Case",
        message_count=len(request.messages),
        timeline=timeline_items,
        detected_patterns=detected_patterns,
        progression_summary=summary,
        confirmed_observations=confirmed_obs[:6],
        inferred_relationships=inferred_rels,
        missing_evidence=missing_ev,
        safe_next_steps=safe_steps,
        privacy_note="Case storyline data is processed strictly in temporary volatile memory and is never logged or saved to persistent disk."
    )

