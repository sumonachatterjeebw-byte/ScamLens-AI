from typing import List, Optional, Literal
from pydantic import BaseModel, Field

CautionLevel = Literal["none_detected", "low", "moderate", "high"]
EvidenceCoverage = Literal["limited", "moderate", "good"]
Severity = Literal["low", "medium", "high"]
SourceType = Literal["rule", "classifier", "external", "device", "user_report"]
UrlCheckStatus = Literal["not_configured", "check_unavailable", "completed", "not_requested"]

class AnalyzeRequest(BaseModel):
    text: str = Field(..., description="Message text or email snippet to analyze")
    url: Optional[str] = Field(default=None, description="Optional standalone URL to inspect")
    check_urls: bool = Field(default=False, description="Whether live URL check was requested")
    sender: Optional[str] = Field(default=None, description="Optional sender name, email, or number")
    category: Optional[str] = Field(default=None, description="Optional message category hint (e.g. job, banking, delivery)")
    timestamp: Optional[str] = Field(default=None, description="Optional timestamp of the message")

class Finding(BaseModel):
    id: str
    category: str
    severity: Severity
    evidence_quote: str
    start: int
    end: int
    explanation: str
    template_id: str
    source_type: SourceType = "rule"

class UrlCheck(BaseModel):
    status: UrlCheckStatus
    detail: str

class WhatWouldChangeItem(BaseModel):
    condition: str
    impact: Literal["weakens_suspicion", "strengthens_suspicion"]
    verification_step: str

class VerificationStep(BaseModel):
    step_number: int
    action: str
    rationale: str
    official_portal: Optional[str] = None

class PrivacyReceipt(BaseModel):
    analysis_mode: str
    text_stored: bool = False
    audio_captured: bool = False
    external_services_contacted: List[str] = []
    redaction_performed: bool = True
    masked_counts: dict = {}
    user_can_clear: bool = True
    shield_manifest_internet_permission: bool = False

class AnalyzeResponse(BaseModel):
    summary_label: str
    caution_level: CautionLevel
    evidence_coverage: EvidenceCoverage
    scam_type_label: Optional[str] = None          # e.g. "Credential Phishing", "Advance Fee Fraud"
    scam_type_basis: Optional[str] = None          # one-line explanation of the classification basis
    findings: List[Finding]
    url_check: UrlCheck
    unknowns: List[str]
    safe_actions: List[str]
    limitations: List[str]
    disclaimer: str
    what_would_change: List[WhatWouldChangeItem] = []
    verification_guide: List[VerificationStep] = []
    privacy_receipt: Optional[PrivacyReceipt] = None
    masked_text: Optional[str] = None
    character_count: int = 0
    suppressed_count: int = 0

# Multi-Message Storyline Schemas
class StorylineMessage(BaseModel):
    id: str
    text: str
    sender: Optional[str] = None
    timestamp: Optional[str] = None
    channel: Optional[str] = "SMS"

class StorylineRequest(BaseModel):
    case_title: Optional[str] = "Temporary Investigation Case"
    messages: List[StorylineMessage]

class StorylinePattern(BaseModel):
    pattern_type: str
    description: str
    evidence: List[str]
    is_confirmed_observation: bool = True

class StorylineAnalysisResponse(BaseModel):
    case_title: str
    message_count: int
    timeline: List[dict]
    detected_patterns: List[StorylinePattern]
    progression_summary: str
    confirmed_observations: List[str]
    inferred_relationships: List[str]
    missing_evidence: List[str]
    safe_next_steps: List[str]
    privacy_note: str

class ErrorDetail(BaseModel):
    code: str
    message: str

class ErrorResponse(BaseModel):
    error: ErrorDetail

class HealthResponse(BaseModel):
    status: str
    url_check_configured: bool
    version: str = "1.0.0"
