import re
from urllib.parse import urlparse
from typing import List, Dict, Any, Tuple

URL_REGEX = re.compile(
    r'(?:https?://[^\s<>"]+|www\.[^\s<>"]+|(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|edu|gov|xyz|top|work|io|me|ai|co|info|biz|example|cc|in)(?:/[^\s<>"]*)?)',
    re.IGNORECASE
)

SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "rb.gy", "ow.ly", "shorturl.at"
}

KNOWN_BRANDS = [
    "paypal", "apple", "google", "microsoft", "amazon", "netflix",
    "chase", "bankofamerica", "wellsfargo", "sbi", "hdfc", "icici", "fictbank"
]

RISKY_TLDS = {
    "xyz", "top", "work", "loan", "click", "rest", "buzz", "gq", "cf", "tk", "ml", "ga"
}

IP_REGEX = re.compile(r'^(?:\d{1,3}\.){3}\d{1,3}$')

def extract_urls(text: str) -> List[str]:
    """Finds all URLs and domain-like links in the text."""
    matches = URL_REGEX.findall(text)
    cleaned = []
    for m in matches:
        # Strip trailing punctuation often caught in sentences
        cleaned_url = re.sub(r'[.,!?;:)\]]+$', '', m)
        if len(cleaned_url) > 3 and cleaned_url not in cleaned:
            cleaned.append(cleaned_url)
    return cleaned

def parse_url_components(raw_url: str) -> Tuple[str, str, str, str]:
    """Normalizes URL and extracts (scheme, host, path, full_url)."""
    full = raw_url
    if not (full.startswith("http://") or full.startswith("https://")):
        full = "http://" + raw_url
    try:
        parsed = urlparse(full)
        host = (parsed.hostname or "").lower()
        path = parsed.path or ""
        scheme = parsed.scheme.lower()
        return scheme, host, path, raw_url
    except Exception:
        return "", "", "", raw_url

def check_url_heuristics(raw_url: str) -> List[Dict[str, Any]]:
    """Evaluates heuristics against a single URL. Returns list of candidate findings."""
    findings = []
    scheme, host, path, original_url = parse_url_components(raw_url)
    if not host:
        return findings

    # 1. Shortened link
    if host in SHORTENERS or any(host.endswith("." + s) for s in SHORTENERS):
        findings.append({
            "id": f"URL_SHORT_{len(findings)+1}",
            "category": "url",
            "severity": "low",
            "evidence_quote": original_url,
            "explanation": "Shortened link obscures the real destination host. Destination is unknown.",
            "template_id": "URL_SHORT",
            "source_type": "rule",
            "unknown_note": "Destination hidden by link shortener."
        })

    # 2. IP address host or '@' in address
    has_at = "@" in raw_url.split("/", 3)[-1] if "/" in raw_url else "@" in raw_url
    is_ip = bool(IP_REGEX.match(host))
    if is_ip or "@" in raw_url:
        findings.append({
            "id": f"URL_IP_{len(findings)+1}",
            "category": "url",
            "severity": "medium",
            "evidence_quote": original_url,
            "explanation": "Direct numerical IP address or '@' user-authentication syntax in link instead of a verified domain name.",
            "template_id": "URL_IP",
            "source_type": "rule"
        })

    # 3. Punycode (xn--) or look-alike homoglyphs
    if "xn--" in host:
        findings.append({
            "id": f"URL_PUNY_{len(findings)+1}",
            "category": "url",
            "severity": "medium",
            "evidence_quote": original_url,
            "explanation": "Punycode (internationalized domain name) detected. These can be used for visually deceptive look-alike domains.",
            "template_id": "URL_LOOKALIKE",
            "source_type": "rule"
        })

    # 4. Brand in host mismatch
    # If host contains a brand name but isn't exact brand.com / brand.org
    for brand in KNOWN_BRANDS:
        if brand in host:
            # Check if it's the official brand domain e.g. paypal.com or google.com
            parts = host.split(".")
            # If host is fictbank-verify.example or paypal-login.xyz
            if len(parts) >= 2:
                # Top 2 labels: e.g. paypal.com or example.com
                reg_domain = ".".join(parts[-2:])
                official = f"{brand}."
                if not host.endswith(f".{brand}.com") and host != f"{brand}.com" and brand in host and reg_domain != f"{brand}.com":
                    findings.append({
                        "id": f"URL_BRAND_{len(findings)+1}",
                        "category": "url",
                        "severity": "medium",
                        "evidence_quote": original_url,
                        "explanation": f"The domain mentions brand '{brand}' but appears to be hosted on '{host}', which is not the verified official domain.",
                        "template_id": "URL_BRAND_MISMATCH",
                        "source_type": "rule"
                    })
                    break

    # 5. Structure oddities
    # 4+ subdomain labels, 3+ hyphens in host, risky TLD, or keywords on non-brand
    subdomain_count = len(host.split("."))
    hyphen_count = host.count("-")
    tld = host.split(".")[-1] if "." in host else ""
    suspicious_path_words = ["login", "verify", "update", "kyc", "signin", "secure"]
    has_path_words = any(w in path.lower() for w in suspicious_path_words)

    if subdomain_count >= 4 or hyphen_count >= 3 or (tld in RISKY_TLDS) or (has_path_words and not any(b in host for b in KNOWN_BRANDS)):
        reasons = []
        if subdomain_count >= 4:
            reasons.append("excessive subdomains")
        if hyphen_count >= 3:
            reasons.append("multiple hyphens")
        if tld in RISKY_TLDS:
            reasons.append(f"uncommon/risky TLD (.{tld})")
        if has_path_words:
            reasons.append("account/verification keywords in path")

        findings.append({
            "id": f"URL_STRUCT_{len(findings)+1}",
            "category": "url",
            "severity": "low",
            "evidence_quote": original_url,
            "explanation": f"Structural anomalies in URL ({', '.join(reasons)}).",
            "template_id": "URL_STRUCTURE",
            "source_type": "rule"
        })

    return findings
