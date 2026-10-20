# ScamLens AI — Privacy-Conscious Scam Inspector & Shield

> **One-sentence pitch:** ScamLens AI is a privacy-conscious educational assistant that helps people inspect suspicious messages and calls by showing exact warning signs, explaining why they matter, and recommending safer next steps—while clearly communicating what it cannot verify.

Compliant with **ScamLens AI Antigravity-Ready Prototype Specification (v2 - Expanded Build Edition)**.

---

## 1. What It Is and What It Is Not

| What ScamLens AI IS | What ScamLens AI IS NOT |
| :--- | :--- |
| **An educational decision-support tool** that teaches users what warning signs look like. | **A guarantee of safety** or a law-enforcement tool. |
| **Evidence-first system**: every warning highlights exact quoted text from the message. | **A black-box oracle** spitting out unverified percentage chances (e.g., "94% scam"). |
| **Transparent & uncertain**: always displays unknowns, limitations, and verification steps. | **A "safe" certification**: never shows a green "safe" badge. |
| **Privacy-by-architecture**: Shield declares **NO INTERNET** permission; zero cloud logs. | **A background surveillance app**: no contact scraping, no audio recording. |

---

## 2. Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+ (LTS) & npm
- *(Optional for native Android build)* JDK 17, Android Studio, Android SDK 29+

### A. Run Backend API (FastAPI)
```bash
# In repository root:
python -m pip install -r backend/requirements.txt
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
- API Health Check: `http://localhost:8000/api/health`
- API Rule Catalog: `http://localhost:8000/api/rules`
- Swagger Docs: `http://localhost:8000/docs`

### B. Run Web Inspector (React + Vite)
```bash
# In web/ directory:
cd web
npm install
npm run dev
```
- Open `http://localhost:5173` in your browser.
- Vite automatically proxies `/api` calls to `http://localhost:8000`.

### C. Run Native Android Shield (Optional emulator demo)
```bash
# In repository root:
./gradlew installDebug
# Simulate an incoming unknown call on the emulator:
adb emu gsm call 5550100
# Simulate an incoming SMS:
adb emu sms send 5550100 "ALERT: Your account is locked. Send OTP now: http://fictbank-verify.example/kyc"
```

---

## 3. Architecture & Repository Map

```
scamlens/
├── README.md                      # Complete system documentation
├── AGENTS-RULES.md                # Project invariants and non-negotiables
├── rules/
│   ├── rules.json                 # Single source of truth (shared by Python & Kotlin)
│   └── test_vectors.json          # Shared test matrix vectors (T1–T17)
├── backend/
│   ├── requirements.txt           # Python dependencies
│   ├── app/
│   │   ├── main.py                # FastAPI entry, rate limiting & privacy logger
│   │   ├── config.py              # Environment variables & country helplines
│   │   ├── schemas.py             # Pydantic v2 request/response models
│   │   ├── redact.py              # PII masker (emails, phones, cards, IDs)
│   │   ├── urls.py                # URL extractor & domain heuristics
│   │   ├── rules.py               # Regex rule evaluator & suppressors
│   │   ├── evidence.py            # Evidence Gate (strict substring quoting)
│   │   ├── templates.py           # Explanations, safe actions & unknowns
│   │   └── analyzer.py            # Workflow pipeline & Section 5 scoring
│   └── tests/
│       └── test_suite.py          # Pytest suite automating tests T1–T17
├── web/
│   ├── package.json               # Node dependencies
│   ├── vite.config.js             # Vite configuration with /api proxy
│   ├── index.html                 # Accessible HTML root
│   ├── src/
│   │   ├── main.jsx               # React DOM entry
│   │   ├── App.jsx                # Tabbed UI manager
│   │   ├── index.css              # Calm palette tokens (zero green result badges)
│   │   ├── api.js                 # API client with structured error handling
│   │   ├── samples.js             # Benchmark scenarios from Section 11
│   │   └── components/
│   │       ├── Header.jsx         # Sticky navigation & status badge
│   │       ├── InputPanel.jsx     # Live 5,000 char counter & sample loader
│   │       ├── ResultPanel.jsx    # Evidence cards, highlighted text & unknowns
│   │       ├── SignalCard.jsx     # Shaped severity chips & quoted evidence
│   │       ├── ShieldSimulator.jsx# Truecaller companion & device simulator
│   │       ├── VerificationChecklist.jsx # Checklist for no-signal cases
│   │       └── PortfolioOverview.jsx # Specs, rule inspector, and Q&A
│   └── tests/
│       └── app.test.js            # Vitest suite
└── android/
    ├── app/
    │   ├── build.gradle.kts       # Android build config (minSdk 29, Java 17)
    │   └── src/main/
    │       ├── AndroidManifest.xml# Zero INTERNET permission
    │       └── java/com/scamlens/shield/
    │           ├── ScreeningService.kt  # CallScreeningService (always allows calls)
    │           ├── SmsReceiver.kt       # Opt-in local SMS rule evaluator
    │           ├── ShareActivity.kt     # Share-to-ScamLens entry point
    │           ├── RuleEngine.kt        # Kotlin parser for rules.json
    │           ├── AlertNotifier.kt     # Heads-up notification builder
    │           ├── ShieldDb.kt          # 30-day auto-purge SQLite logger
    │           └── MainActivity.kt      # Jetpack Compose 4-screen UI
```

---

## 4. Detection Rules & Adding a Rule Safely

All rules live in `rules/rules.json`. To add a new rule:
1. Open `rules/rules.json` and add an entry with:
   - `id`: Unique identifier (e.g. `MON_03`)
   - `category`: `urgency`, `credential`, `money`, `reward`, `url`, `impersonation`, or `secrecy`
   - `pattern`: Clean regular expression compatible with both Python `re` and Java `java.util.regex.Pattern`
   - `severity`: `"low"`, `"medium"`, or `"high"`
   - `explanation`: Educational, non-alarmist explanation
   - `suppressors`: List of regular expressions that suppress false alarms on legitimate context
2. Add positive and negative test cases to `rules/test_vectors.json`.
3. Run `python -m pytest backend/tests/test_suite.py` to confirm parity.

---

## 5. Privacy Design & How to Verify It

1. **Pre-Analysis Minimization:** Before rules execute, personal data is redacted:
   - Email addresses $\to$ `[email]`
   - Phone numbers $\to$ `[phone]`
   - 13–19 digit cards $\to$ `[number]`
   - 12-digit national IDs $\to$ `[id]`
2. **Zero Storage & Privacy Logging:**
   - FastAPI middleware logs only HTTP method, path, response status, and duration.
   - Message bodies are never written to logs or stored in backend databases.
3. **Android Shield Zero Internet Verification:**
   - Inspect `android/app/src/main/AndroidManifest.xml`: It does **not** declare `android.permission.INTERNET`.
   - Automated test `test_t17_shield_manifest_privacy` in `backend/tests/test_suite.py` verifies this invariant.
4. **Local 30-Day Auto-Purge:**
   - Shield stores only the last 4 digits of numbers, timestamps, and signal names.
   - All events older than 30 days are automatically removed from device SQLite storage.

---

## 6. Test Commands & Minimum Test Matrix

Run all tests:
```bash
# Backend pytest suite (T1–T13, T17):
python -m pytest backend/tests/test_suite.py -v

# Frontend vitest suite:
cd web && npm test
```

### Test Coverage Table
| Test ID | Scenario | Expected Behavior | Evaluates |
| :--- | :--- | :--- | :--- |
| **T1** | Sample 1 (OTP/account threat) | Flags urgency, credential, URL; quotes exact text | Evidence linkage |
| **T2** | Sample 2 (Internship fee) | Flags reward, money; quotes "registration fee" | Job scam coverage |
| **T3** | Sample 3 (Library reminder) | Zero findings; shows verification checklist; no "safe" badge | False positive control |
| **T4** | "Verification code is 482913. Do not share" | Suppressor activates; zero credential finding | Suppressor logic |
| **T5** | Sample 4 (Ambiguous recruiter) | At most low-severity signals; sender unverified | Cautious interpretation |
| **T6** | Empty or whitespace input | Returns HTTP 422 `EMPTY_INPUT`; no server crash | Robustness |
| **T7** | 5,000 vs 5,001 character limit | 5,000 accepted; 5,001 rejected with HTTP 413 `TEXT_TOO_LONG` | Input boundary limits |
| **T8** | `http://192.0.2.1/login` | Flags bare IP; live reputation honestly reported as `not_configured` | Failure transparency |
| **T9** | `https://bit.ly/abc123` | Flags shortener; adds unknown: destination hidden | Heuristic detection |
| **T10** | Text with email, phone, credit card | Masked in displayed text; zero raw text in logs | PII redaction |
| **T11** | External provider timeout/error | Reports `check_unavailable`; returns analysis cleanly | Graceful degradation |
| **T12** | Obfuscated "0TP" | Documented known miss; listed in transparent limitations | System honesty |
| **T13** | Non-English text | No crash; language limitation notes returned | Robustness |
| **T14** | Shield: simulated unknown call | Heads-up notification within 2s; call never blocked | Shield core |
| **T15** | Shield: saved contact call | Silent; zero heads-up alarm | False alarm control |
| **T16** | Shield: SMS via share sheet | Identical categories to web backend; text never stored | Parity & privacy |
| **T17** | Shield manifest privacy check | No `INTERNET` permission in manifest; no HTTP client | Privacy guarantee |

---

## 7. Real Versus Mocked Features

To avoid misleading users or evaluators, here is what is fully functional versus what is simulated in this prototype:

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Rule-Based Message Inspection** | **REAL** | Python regex engine with suppressor logic and strict evidence gating. |
| **PII Redaction Pipeline** | **REAL** | Masks emails, phones, card runs, and IDs prior to analysis. |
| **FastAPI REST API & Rate Limiting** | **REAL** | Functional endpoints, in-memory IP rate limiter, error contracts. |
| **React Web Inspector UI** | **REAL** | Live character counter, sample loader, highlighted text with offsets. |
| **Truecaller Shield Device Simulator** | **REAL SIMULATOR**| Interactive simulation of heads-up alerts, post-call checklist, and history. |
| **Android Kotlin Codebase** | **REAL CODE** | `ScreeningService`, `SmsReceiver`, `RuleEngine`, `ShieldDb` code ready for Gradle build. |
| **Google Safe Browsing Live Check** | **HONESTLY UNSET**| Defaults to `not_configured` (never faked). Activates when API key is provided. |
| **Crowdsourced Global Caller Database**| **NOT INCLUDED** | Privacy-first choice: ScamLens never accesses or maintains an unverified crowd database. |

---

## 8. Known Limitations

- **Obfuscated Text:** Cleverly obscured text (such as `"0TP"` or `"p@ssword"`) may evade standard regex rules.
- **English-First Scope:** Current rule set focuses on English phrasing and common Indian/US scam patterns.
- **Reputation Incompleteness:** Newly registered scam domains may not yet be flagged in domain heuristics.
- **Unfamiliar Senders:** An unknown caller or unverified sender is not necessarily a scammer.

---

## 9. Future Roadmap

1. **Baseline ML Model:** TF-IDF + Logistic Regression secondary signal layer (evaluated on held-out test set).
2. **Local SLM (Small Language Model):** On-device quantized model generating natural-language explanations constrained strictly to rule-extracted findings.
3. **Multilingual Rule Sets:** Expanding regex patterns to Hindi, Spanish, and French.
4. **Opt-In Verified Helplines:** Integration with national cybercrime registries (e.g., 1930 in India, IC3 in the US).
