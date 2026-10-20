# ScamLens AI — Project Rules & Invariants

These non-negotiable rules govern all design, code, and test decisions in the ScamLens AI project. They derive directly from the specification (`ScamLens_AI_Antigravity_Prototype_Specification_v2.pdf`).

## 1. Ground Truth & Honesty
- **Source of truth:** The specification PDF is the single authority.
- **No Hallucinated Evidence:** Every finding MUST carry an exact quoted substring from the analysed input (or an authentic device-observed fact / user-reported checklist item). If no exact quote exists, suppress the finding.
- **Never Fake Capabilities:** Never invent a URL reputation result or claim a third-party database check succeeded when it was not configured or timed out. Use `not_configured`, `check_unavailable`, or `not_requested` honestly.
- **Real vs. Mock Transparency:** Maintain clear separation between working functionality and simulated emulator demos. Never present a mock as a functional backend.

## 2. No Green Badges, Probabilities, or Guarantees
- **No "Safe" Badges:** The UI must never display a green badge or state that a message is definitely safe.
- **No Calibrated Percentages:** Do not generate unvalidated probability scores (e.g. "94% scam"). Use qualitative caution levels (`none_detected`, `low`, `moderate`, `high`).
- **No-Signal Wording:** When zero signals are found, explicitly state: *"No obvious signals were detected. This does not prove the message is safe."* and provide the independent verification checklist.

## 3. Privacy-by-Architecture
- **Zero Storage of Content:** Raw message bodies, email snippets, and call audio are NEVER logged, stored in persistent databases, or transmitted over networks.
- **Pre-Analysis Redaction:** Emails are masked to `[email]`, phone numbers to `[phone]`, 13–19 digit cards to `[number]`, and 12-digit national IDs to `[id]` prior to analysis.
- **Zero Internet Permission on Shield:** The Android companion declares NO `android.permission.INTERNET` in its manifest. All screening rules run 100% on-device.
- **Shield Storage Caps:** Shield SQLite/Room stores only timestamps, the last 4 digits of numbers, and signal IDs with mandatory 30-day auto-purging.

## 4. Call & SMS Companion Ethics
- **Strictly Opt-In:** All device permissions are optional, explained in plain language, and revocable.
- **Always Allow Calls:** The `CallScreeningService` always responds with `disallow = false` and `reject = false`. Calls are never auto-blocked or dropped.
- **Cautious Alert Phrasing:** Heads-up notifications state: *"Unknown number. Carrier did not verify caller ID. This is a caution, not proof."* Never label someone a "scam caller".
- **Zero Call-Audio Recording:** No microphone capture or conversation listening. Post-call safety is captured strictly via the voluntary *"What did they ask?"* checklist.
