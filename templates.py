from typing import List, Dict, Any

SAFE_ACTIONS_MAP = {
    "urgency": "Do not rush. Take time to verify the situation through a trusted contact or official website.",
    "credential": "Do not share the OTP, password, or PIN. Open the official app or site yourself.",
    "money": "Do not send money, gift cards, or crypto. Legitimate offers and banks never demand upfront deposits.",
    "reward": "Verify unexpected job or lottery offers directly on the company's verified careers page before sharing info.",
    "url": "Do not click suspicious links. Navigate to the service manually in your browser or official app.",
    "impersonation": "Contact the organization independently using official phone numbers printed on your bank card or official portal.",
    "secrecy": "Never keep financial transactions or job processes secret from family or your bank. Secrecy is a major scam red flag."
}

DEFAULT_SAFE_ACTIONS = [
    "Never share OTPs, passwords, PINs, recovery codes, or payment credentials.",
    "Do not click a suspicious link to check it. Navigate independently to the official app or site.",
    "Contact the organisation through a phone number or address obtained independently."
]

def generate_safe_actions(categories: List[str]) -> List[str]:
    """Generates prioritized, non-generic safe next steps tailored to observed categories."""
    actions = []
    for cat in categories:
        if cat in SAFE_ACTIONS_MAP and SAFE_ACTIONS_MAP[cat] not in actions:
            actions.append(SAFE_ACTIONS_MAP[cat])
    
    # If no specific categories, provide prudent baseline advice
    if not actions:
        actions = [
            "Verify any requests through official contact methods before taking action.",
            "Inspect the true sender details and official company domain independently."
        ]
    return actions[:4]

def generate_unknowns(has_url: bool, categories: List[str], is_shortener: bool = False) -> List[str]:
    """Generates explicit list of what the tool cannot know or verify."""
    unknowns = [
        "Sender identity has not been independently verified. (Verification: Compare sender's email domain or phone number with official contact details on their website)"
    ]
    if has_url:
        if is_shortener:
            unknowns.append("Destination hidden by link shortener; target domain unknown. (Verification: Contact sender via verified channel or avoid opening shortened links)")
        unknowns.append("Link destination server safety and backend behavior have not been checked. (Verification: Manually type the organization's known official web address in your browser)")
    else:
        unknowns.append("No official contact method has been confirmed for the sender. (Verification: Look up the organization in public directories or your existing account statements)")
    
    unknowns.append("Private context, prior communications, or relationship with sender are unknown. (Verification: Check your actual message history in the official service provider app)")
    return unknowns

def generate_what_would_change(categories: List[str], has_url: bool, is_shortener: bool = False) -> List[Dict[str, str]]:
    """Explains what observable evidence would strengthen or weaken the assessment."""
    changes = []
    
    # Condition 1: Official Email / Domain Match
    changes.append({
        "condition": "The sender contacts you from an independently verified corporate domain (e.g. @company.com matching corporate registry), rather than a free webmail (@gmail.com) or lookalike domain.",
        "impact": "weakens_suspicion",
        "verification_step": "Check the full email headers or search the corporate directory to confirm employee authenticity."
    })
    
    # Condition 2: Demanding OTP, PIN, or Remote Access
    if "credential" in categories or "urgency" in categories:
        changes.append({
            "condition": "The sender insists on receiving a 6-digit OTP, UPI PIN, or asks you to install remote support software (AnyDesk, TeamViewer).",
            "impact": "strengthens_suspicion",
            "verification_step": "Immediately end communication. Genuine institutions never request one-time passcodes or remote control."
        })
    
    # Condition 3: Upfront Fees or Suspicious Payment Methods
    if "money" in categories or "reward" in categories:
        changes.append({
            "condition": "The request demands payment via cryptocurrency, gift cards, or personal UPI IDs for 'refundable registration' or 'customs release'.",
            "impact": "strengthens_suspicion",
            "verification_step": "Refuse the payment. Legitimate recruiters, delivery couriers, and banks do not use gift cards or personal wallets."
        })
    else:
        changes.append({
            "condition": "Subsequent messages demand any upfront processing fee, deposit, or wire transfer before delivering goods or services.",
            "impact": "strengthens_suspicion",
            "verification_step": "Require formal corporate invoices and independently verified merchant payment gateways."
        })
        
    # Condition 4: Authenticated In-App Confirmation
    changes.append({
        "condition": "The exact same alert, pending payment, or action item appears inside your authenticated account dashboard when logging into the official app.",
        "impact": "weakens_suspicion",
        "verification_step": "Log in via the official app (downloaded from official store) or typed bookmark—never through message links."
    })
    
    # Condition 5: Unsolicited Prize or Job without Interview
    if "reward" in categories:
        changes.append({
            "condition": "The job offer is formally confirmed after multiple rounds of technical interviews documented on the company's verified ATS/careers portal.",
            "impact": "weakens_suspicion",
            "verification_step": "Search for the Job Requisition ID on the company's official careers site."
        })

    return changes[:4]

def generate_verification_guide(categories: List[str], category_hint: Optional[str] = None) -> List[Dict[str, Any]]:
    """Guided verification steps for specific scam typologies (Section 2 & 10)."""
    # Detect primary domain
    is_job = category_hint == "job" or "reward" in categories or any(c in categories for c in ["money", "secrecy"])
    is_banking = category_hint in ["banking", "kyc"] or "credential" in categories or "urgency" in categories
    is_delivery = category_hint == "delivery" or "url" in categories
    
    guide = []
    
    if is_job:
        guide.append({
            "step_number": 1,
            "action": "Manually Visit Official Careers Portal",
            "rationale": "Never trust job offers sent via unsolicited SMS or Telegram. Navigate to the company's official domain by typing it in your browser.",
            "official_portal": "Verified Company Careers Page"
        })
        guide.append({
            "step_number": 2,
            "action": "Audit Recruiter Email Domain",
            "rationale": "Verify that emails come from the exact corporate domain (e.g. name@microsoft.com, not microsoft-careers@gmail.com or @contoso-recruitment.xyz).",
            "official_portal": "Corporate Domain Registry"
        })
        guide.append({
            "step_number": 3,
            "action": "Zero-Fee Rule for Employment",
            "rationale": "Legitimate employers never require candidates to pay registration fees, training kit charges, or refundable security deposits.",
            "official_portal": "Ministry of Labour / FTC Recruitment Guidance"
        })
    elif is_banking:
        guide.append({
            "step_number": 1,
            "action": "Check Official Bank App Directly",
            "rationale": "Open your mobile banking app or internet banking by typing the URL manually. If an account action is genuinely required, it will appear in your secured inbox.",
            "official_portal": "Official Mobile Banking App"
        })
        guide.append({
            "step_number": 2,
            "action": "Dial the Number on Your Physical Card",
            "rationale": "Do not call numbers provided in SMS or caller ID. Dial the customer care helpline printed directly on the reverse side of your debit/credit card.",
            "official_portal": "Card Reverse Helpline"
        })
        guide.append({
            "step_number": 3,
            "action": "Enforce the OTP Confidentiality Rule",
            "rationale": "Bank staff are technically barred from asking for OTPs, CVVs, or UPI PINs. Any request for your OTP is a definitive warning sign.",
            "official_portal": "RBI / FTC Consumer Defense"
        })
    else:
        guide.append({
            "step_number": 1,
            "action": "Independent URL Verification",
            "rationale": "Inspect the root domain. Scammers frequently use lookalike subdomains (e.g., bank.example-secure.com instead of bank.com) or URL shorteners to mask destinations.",
            "official_portal": "Official Organization Home Page"
        })
        guide.append({
            "step_number": 2,
            "action": "Cross-Reference Public Helplines",
            "rationale": "Look up the sender's stated department using independent search engine queries or official directories, rather than replying to the message.",
            "official_portal": "Official Government / Corporate Portal"
        })
        guide.append({
            "step_number": 3,
            "action": "Verify Before Sharing Any Credentials",
            "rationale": "Refuse demands that cite immediate deadlines or threaten account closure. Take time to consult a knowledgeable friend or colleague.",
            "official_portal": "National Cyber Crime Reporting Portal"
        })
        
    return guide

def get_limitations_list() -> List[str]:
    """Known limitations to disclose in results as required by Section 5 and 6."""
    return [
        "Only evidence directly highlighted in the text can support a warning.",
        "Scammers may deliberately obfuscate words (e.g. '0TP') or mimic legitimate templates.",
        "A lack of detected signals is not a guarantee of safety.",
        "This tool evaluates visible text patterns on-device; it does not access real-time databases."
    ]

DISCLAIMER_TEXT = "This is an educational assessment, not certainty. Do not use as sole basis for financial or legal decisions."
