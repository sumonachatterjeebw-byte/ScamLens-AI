import sys
import os
import pytest
from starlette.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_t1_otp_account_threat():
    text = "ALERT: Your FictBank account will be blocked in 10 minutes due to incomplete KYC. Send your OTP to confirm and avoid suspension: http://fictbank-verify.example/kyc"
    res = client.post("/api/analyze", json={"text": text})
    assert res.status_code == 200
    data = res.json()
    assert data["caution_level"] in ["moderate", "high"]
    categories = [f["category"] for f in data["findings"]]
    assert "urgency" in categories
    assert "credential" in categories
    assert "url" in categories
    # Assert every finding quote is an exact substring of the analyzed text
    for f in data["findings"]:
        assert f["evidence_quote"].lower() in data["masked_text"].lower()
    # No percentage scores anywhere
    assert "%" not in data["summary_label"]
    assert len(data["safe_actions"]) > 0

def test_t2_internship_fee():
    text = "Congratulations! You are selected for a Data Analyst internship at Northwind Demo Ltd, earning 40,000 per month with no interview required. To receive your offer letter, pay a refundable registration fee of 2,500 today. Contact our HR on Telegram."
    res = client.post("/api/analyze", json={"text": text})
    assert res.status_code == 200
    data = res.json()
    categories = [f["category"] for f in data["findings"]]
    assert "reward" in categories
    assert "money" in categories
    quotes = [f["evidence_quote"].lower() for f in data["findings"]]
    assert any("registration fee" in q for q in quotes)
    assert data["caution_level"] in ["moderate", "high"]

def test_t3_legitimate_library_note():
    text = "Hi, your library book “Intro to Statistics” is due on Friday. You can renew it on the library website or at the front desk. No action is needed if you have already returned it."
    res = client.post("/api/analyze", json={"text": text})
    assert res.status_code == 200
    data = res.json()
    assert len(data["findings"]) == 0
    assert data["summary_label"] == "No obvious signals detected"
    assert data["caution_level"] == "none_detected"
    assert "safe" not in data["summary_label"].lower()
    assert len(data["limitations"]) > 0

def test_t4_suppressor_legitimate_otp():
    text = "Your verification code is 482913. Do not share this code with anyone."
    res = client.post("/api/analyze", json={"text": text})
    assert res.status_code == 200
    data = res.json()
    categories = [f["category"] for f in data["findings"]]
    assert "credential" not in categories

def test_t5_ambiguous_recruiter_note():
    text = "Hello, this is Priya from Contoso Campus Recruitment. We would like to schedule a short call about your application. Please confirm your availability today or tomorrow by replying to this message."
    res = client.post("/api/analyze", json={"text": text})
    assert res.status_code == 200
    data = res.json()
    # At most low severity signals
    for f in data["findings"]:
        assert f["severity"] in ["low", "medium"]
    assert any("sender" in u.lower() for u in data["unknowns"])

def test_t6_empty_or_whitespace():
    res1 = client.post("/api/analyze", json={"text": ""})
    assert res1.status_code == 422
    data1 = res1.json()
    assert data1["error"]["code"] == "EMPTY_INPUT"
    # Never echo input back or expose raw trace
    assert "traceback" not in data1["error"]["message"].lower()

    res2 = client.post("/api/analyze", json={"text": "   \n\t  "})
    assert res2.status_code == 422
    assert res2.json()["error"]["code"] == "EMPTY_INPUT"

def test_t7_length_limits():
    valid_text = "Safe announcement: " + "a" * 4980
    res_valid = client.post("/api/analyze", json={"text": valid_text})
    assert res_valid.status_code == 200

    too_long_text = "a" * 5001
    res_long = client.post("/api/analyze", json={"text": too_long_text})
    assert res_long.status_code == 413
    assert res_long.json()["error"]["code"] == "TEXT_TOO_LONG"

def test_t8_ip_address_url():
    text = "Access your portal directly at http://192.0.2.1/login"
    res = client.post("/api/analyze", json={"text": text})
    assert res.status_code == 200
    data = res.json()
    categories = [f["category"] for f in data["findings"]]
    assert "url" in categories
    assert data["url_check"]["status"] == "not_configured"
    assert "safe" not in data["summary_label"].lower()

def test_t9_shortened_link_heuristics():
    text = "Track here: https://bit.ly/abc123"
    res = client.post("/api/analyze", json={"text": text})
    assert res.status_code == 200
    data = res.json()
    categories = [f["category"] for f in data["findings"]]
    assert "url" in categories
    assert any("shortener" in u.lower() or "destination" in u.lower() for u in data["unknowns"])

def test_t10_pii_redaction():
    text = "Contact support at test.user@example.com or call +1 555 0100 for card 4111222233334444 account renewal."
    res = client.post("/api/analyze", json={"text": text})
    assert res.status_code == 200
    data = res.json()
    masked = data["masked_text"]
    assert "[email]" in masked
    assert "[phone]" in masked
    assert "[number]" in masked
    assert "test.user@example.com" not in masked
    assert "+1 555 0100" not in masked
    assert "4111222233334444" not in masked

def test_t11_failure_transparency():
    text = "Review security update here: https://example.com/update"
    res = client.post("/api/analyze", json={"text": text})
    assert res.status_code == 200
    data = res.json()
    # Live reputation check must be transparent
    assert data["url_check"]["status"] in ["not_configured", "check_unavailable"]

def test_t12_obfuscated_zero_tp():
    # Obfuscated text like "0TP" is a known limitation documented in the specification
    text = "Please send your 0TP immediately to prevent card closure."
    res = client.post("/api/analyze", json={"text": text})
    assert res.status_code == 200
    data = res.json()
    # Urgency rule will fire even if 0TP is obfuscated
    categories = [f["category"] for f in data["findings"]]
    assert "urgency" in categories
    # Limitation is transparently listed
    assert any("obfuscate" in l.lower() for l in data["limitations"])

def test_t13_non_english_message():
    text = "Bonjour, votre compte sera suspendu aujourd'hui. Veuillez vous connecter."
    res = client.post("/api/analyze", json={"text": text})
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data["findings"], list)
    assert len(data["limitations"]) > 0

def test_evidence_quote_validity():
    """Verify that 100% of findings have quotes that are exact substrings of the analyzed text."""
    test_cases = [
        "Your account will be blocked in 10 minutes. Send your OTP to confirm: http://test.com",
        "Congratulations! You have won lottery cash. Pay 500 registration fee now.",
        "Hi there, this is your bank customer care asking for kyc update"
    ]
    for tc in test_cases:
        res = client.post("/api/analyze", json={"text": tc})
        data = res.json()
        for f in data["findings"]:
            assert f["evidence_quote"].lower() in data["masked_text"].lower()

def test_what_would_change_and_verification_guide():
    """Verify Feature 4 ('What Would Change') and Feature 2 (Verification Guide) are provided."""
    text = "Congratulations! You are selected for Data Analyst. Pay 2500 registration fee to receive offer letter on Telegram."
    res = client.post("/api/analyze", json={"text": text, "category": "job"})
    assert res.status_code == 200
    data = res.json()
    
    assert "what_would_change" in data
    assert len(data["what_would_change"]) > 0
    for item in data["what_would_change"]:
        assert "condition" in item
        assert item["impact"] in ["weakens_suspicion", "strengthens_suspicion"]
        assert len(item["verification_step"]) > 0

    assert "verification_guide" in data
    assert len(data["verification_guide"]) > 0
    assert any("career" in v["action"].lower() or "fee" in v["action"].lower() for v in data["verification_guide"])

def test_privacy_receipt_structure():
    """Verify Feature 5 Privacy Receipt accuracy."""
    text = "Send your secret OTP to verify account now"
    res = client.post("/api/analyze", json={"text": text})
    assert res.status_code == 200
    data = res.json()
    receipt = data.get("privacy_receipt")
    assert receipt is not None
    assert receipt["text_stored"] is False
    assert receipt["audio_captured"] is False
    assert receipt["user_can_clear"] is True
    assert receipt["shield_manifest_internet_permission"] is False

def test_multi_message_storyline():
    """Verify Feature 3 Multi-Message Scam Storyline analysis."""
    payload = {
        "case_title": "Internship Phishing Campaign",
        "messages": [
            {
                "id": "m1",
                "text": "Hi, this is HR from Northwind Tech. We reviewed your resume for the developer role.",
                "sender": "+1 555 0199",
                "timestamp": "10:00 AM",
                "channel": "SMS"
            },
            {
                "id": "m2",
                "text": "Congratulations! You are selected. Pay 2,500 registration fee today on Telegram to finalize your offer.",
                "sender": "+1 555 0199",
                "timestamp": "10:15 AM",
                "channel": "SMS"
            }
        ]
    }
    res = client.post("/api/storyline/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["message_count"] == 2
    assert len(data["timeline"]) == 2
    assert len(data["detected_patterns"]) > 0
    assert any("financial" in p["pattern_type"].lower() or "channel" in p["pattern_type"].lower() for p in data["detected_patterns"])
    assert len(data["confirmed_observations"]) > 0
    assert len(data["inferred_relationships"]) > 0

def test_recovery_guide_endpoint():
    """Verify Feature 7 Recovery Guide endpoint."""
    res = client.get("/api/recovery/guide")
    assert res.status_code == 200
    data = res.json()
    assert "official_portals" in data
    assert data["official_portals"]["IN"]["helpline"] == "1930"
    assert "cybercrime.gov.in" in data["official_portals"]["IN"]["portal"]

def test_t17_shield_manifest_privacy():
    """Verify that Android Shield declares zero internet permission (privacy proof)."""
    manifest_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "android", "app", "src", "main", "AndroidManifest.xml"))
    assert os.path.exists(manifest_path), f"Manifest not found at {manifest_path}"
    with open(manifest_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "android.permission.INTERNET" not in content
    # Verify build.gradle.kts doesn't include retrofit or okhttp
    gradle_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "android", "app", "build.gradle.kts"))
    with open(gradle_path, "r", encoding="utf-8") as f:
        gradle_content = f.read()
    assert "retrofit" not in gradle_content.lower()
    assert "okhttp" not in gradle_content.lower()


