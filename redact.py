import re
from typing import Tuple, Dict

# Regex to preserve URLs during redaction so phone or card patterns don't mangle URLs
URL_PATTERN = re.compile(
    r'(https?://[^\s<>"]+|www\.[^\s<>"]+)',
    re.IGNORECASE
)

# Email pattern
EMAIL_PATTERN = re.compile(
    r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
)

# 13-19 digit card runs (separated by spaces or dashes or contiguous)
CARD_PATTERN = re.compile(
    r'\b(?:\d{4}[-\s]?){3}\d{1,7}\b|\b\d{13,19}\b'
)

# 12-digit national ID runs (e.g. Aadhaar 4-4-4 or 12 digits)
ID_PATTERN = re.compile(
    r'\b\d{4}[-\s]\d{4}[-\s]\d{4}\b|\b\d{12}\b'
)

# Phone numbers (optional +, 7-15 digits with spaces/dashes/parentheses)
# We must avoid matching 4-8 digit standalone numbers (which could be OTP codes)
PHONE_PATTERN = re.compile(
    r'(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}(?:[\s-]?\d{1,4})?'
)

def redact_text(text: str) -> Tuple[str, Dict[str, int]]:
    """
    Redacts sensitive personal information before analysis.
    Preserves URLs and short 4-8 digit numbers (OTPs).
    Returns (masked_text, redaction_counts).
    """
    counts = {"email": 0, "phone": 0, "number": 0, "id": 0}

    # Step 1: Extract and placeholder URLs so they are not corrupted by card/phone regex
    urls = []
    def save_url(match):
        idx = len(urls)
        urls.append(match.group(0))
        return f"__SCAMLENS_URL_PLACEHOLDER_{idx}__"

    text_no_urls = URL_PATTERN.sub(save_url, text)

    # Step 2: Redact Emails -> [email]
    def replace_email(match):
        counts["email"] += 1
        return "[email]"
    masked = EMAIL_PATTERN.sub(replace_email, text_no_urls)

    # Step 3: Redact 13-19 digit card numbers -> [number]
    def replace_card(match):
        counts["number"] += 1
        return "[number]"
    masked = CARD_PATTERN.sub(replace_card, masked)

    # Step 4: Redact 12-digit national ID numbers -> [id]
    def replace_id(match):
        counts["id"] += 1
        return "[id]"
    masked = ID_PATTERN.sub(replace_id, masked)

    # Step 5: Redact phone numbers -> [phone]
    # Phone must have at least 7 digits in total, and avoid matching placeholder or single numbers
    def replace_phone(match):
        s = match.group(0)
        digits = [c for c in s if c.isdigit()]
        if 7 <= len(digits) <= 15:
            # Check if this could just be a standalone date or year like 2026-10-18
            if re.match(r'^\d{4}-\d{2}-\d{2}$', s.strip()):
                return s
            counts["phone"] += 1
            return "[phone]"
        return s

    masked = PHONE_PATTERN.sub(replace_phone, masked)

    # Step 6: Restore URLs
    for idx, url in enumerate(urls):
        placeholder = f"__SCAMLENS_URL_PLACEHOLDER_{idx}__"
        masked = masked.replace(placeholder, url)

    return masked, counts
