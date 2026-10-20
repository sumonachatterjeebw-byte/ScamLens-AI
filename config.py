import os
from typing import Dict, List

MAX_CHARS: int = int(os.getenv("MAX_CHARS", "5000"))
SAFE_BROWSING_API_KEY: str = os.getenv("SAFE_BROWSING_API_KEY", "")
RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT", "30"))

CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000"
]

REPORT_LINKS: Dict[str, Dict[str, str]] = {
    "IN": {
        "portal": "National Cyber Crime Reporting Portal",
        "url": "https://cybercrime.gov.in",
        "helpline": "1930"
    },
    "US": {
        "portal": "FTC Report Fraud & IC3",
        "url": "https://reportfraud.ftc.gov",
        "helpline": "1-877-382-4357"
    },
    "UK": {
        "portal": "Action Fraud UK",
        "url": "https://www.actionfraud.police.uk",
        "helpline": "0300 123 2040"
    },
    "GLOBAL": {
        "portal": "Anti-Phishing Working Group (APWG)",
        "url": "https://apwg.org/reportphishing/",
        "helpline": "Contact local bank / emergency services"
    }
}
