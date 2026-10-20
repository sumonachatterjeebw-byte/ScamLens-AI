import json
import re
from pathlib import Path
from typing import List, Dict, Any

RULES_PATH = Path(__file__).resolve().parent.parent.parent / "rules" / "rules.json"

def load_rules_data() -> Dict[str, Any]:
    """Loads the single source of truth rules.json file."""
    if not RULES_PATH.exists():
        # Fallback if running from a different working directory
        alt_path = Path("rules/rules.json")
        if alt_path.exists():
            with open(alt_path, "r", encoding="utf-8") as f:
                return json.load(f)
        raise FileNotFoundError(f"rules.json not found at {RULES_PATH}")
    with open(RULES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def evaluate_text_rules(text: str) -> List[Dict[str, Any]]:
    """
    Evaluates regular expression rules against the masked text.
    Respects suppressors to prevent false positives on legitimate reminders or OTP deliveries.
    """
    data = load_rules_data()
    rules = data.get("rules", [])
    candidate_findings: List[Dict[str, Any]] = []

    # Pre-split text into sentences to accurately scope suppressors
    sentences = re.split(r'(?<=[.!?\n])\s+', text)

    for rule in rules:
        rule_id = rule["id"]
        category = rule["category"]
        pattern = rule["pattern"]
        severity = rule["severity"]
        explanation = rule["explanation"]
        template_id = rule.get("template_id", rule_id)
        suppressors = rule.get("suppressors", [])

        compiled_pattern = re.compile(pattern, re.IGNORECASE)

        for match in compiled_pattern.finditer(text):
            quote = match.group(0).strip()
            if not quote:
                continue

            # Check suppressors
            match_start = match.start()
            match_end = match.end()

            # Find which sentence contains this match
            surrounding_sentence = ""
            char_count = 0
            for sent in sentences:
                sent_len = len(sent)
                if char_count <= match_start <= char_count + sent_len + 5:
                    surrounding_sentence = sent
                    break
                char_count += sent_len + 1

            if not surrounding_sentence:
                surrounding_sentence = text[max(0, match_start - 60):min(len(text), match_end + 60)]

            # Evaluate suppressors
            suppressed = False
            for sup_pat in suppressors:
                if re.search(sup_pat, surrounding_sentence, re.IGNORECASE):
                    suppressed = True
                    break
                # Also check full text for explicit "do not share" if CRD rule
                if category == "credential" and re.search(sup_pat, text, re.IGNORECASE):
                    suppressed = True
                    break

            if suppressed:
                continue

            candidate_findings.append({
                "id": f"{rule_id}_{len(candidate_findings) + 1}",
                "category": category,
                "severity": severity,
                "evidence_quote": quote,
                "start": match_start,
                "end": match_end,
                "explanation": explanation,
                "template_id": template_id,
                "source_type": "rule"
            })

    return candidate_findings
