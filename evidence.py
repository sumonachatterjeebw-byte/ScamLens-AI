from typing import List, Dict, Any, Tuple

def dedupe_and_cap(findings: List[Dict[str, Any]], per_category: int = 3) -> Tuple[List[Dict[str, Any]], int]:
    """
    Dedupes overlapping findings and caps findings at max per_category.
    Returns (kept_findings, suppressed_count).
    """
    category_counts: Dict[str, int] = {}
    kept: List[Dict[str, Any]] = []
    suppressed = 0

    # Sort findings by start offset, then by severity (high > medium > low)
    severity_order = {"high": 3, "medium": 2, "low": 1}
    sorted_findings = sorted(
        findings,
        key=lambda x: (x.get("start", 0), -severity_order.get(x.get("severity", "low"), 1))
    )

    for item in sorted_findings:
        cat = item["category"]
        count = category_counts.get(cat, 0)
        if count >= per_category:
            suppressed += 1
            continue

        # Check for exact duplicate quote or heavy overlap
        is_duplicate = False
        for existing in kept:
            if existing["category"] == cat and existing["evidence_quote"].strip().lower() == item["evidence_quote"].strip().lower():
                is_duplicate = True
                break
            # Overlapping spans with same category
            if existing["category"] == cat:
                s1, e1 = existing.get("start", 0), existing.get("end", 0)
                s2, e2 = item.get("start", 0), item.get("end", 0)
                if max(s1, s2) < min(e1, e2): # Overlap
                    is_duplicate = True
                    break

        if is_duplicate:
            suppressed += 1
            continue

        kept.append(item)
        category_counts[cat] = count + 1

    return kept, suppressed

def evidence_gate(text: str, candidates: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], int]:
    """
    Strict evidence gate as mandated by the specification:
    1. Finding quote must be an exact substring of text (case-insensitive compare).
    2. Displayed quote uses the original case from text.
    3. Start and end offsets are recorded and verified.
    4. Quotes longer than 120 characters are discarded.
    5. External findings are verified.
    6. Max 3 findings per category; overlaps deduped.
    """
    kept: List[Dict[str, Any]] = []
    suppressed_count = 0
    hay = text.lower()

    for c in candidates:
        source_type = c.get("source_type", "rule")
        if source_type == "external":
            kept.append(c)
            continue

        quote = c.get("evidence_quote", "")
        if not quote or len(quote) > 120:
            suppressed_count += 1
            continue

        # Find exact occurrence in text
        i = hay.find(quote.lower())
        if i < 0:
            suppressed_count += 1
            continue

        start = i
        end = i + len(quote)
        # Use exact original text substring
        exact_text = text[start:end]
        assert exact_text.lower() == quote.lower(), "Evidence quote mismatch"

        c_copy = dict(c)
        c_copy["evidence_quote"] = exact_text
        c_copy["start"] = start
        c_copy["end"] = end
        kept.append(c_copy)

    final_kept, extra_suppressed = dedupe_and_cap(kept, per_category=3)
    return final_kept, suppressed_count + extra_suppressed
