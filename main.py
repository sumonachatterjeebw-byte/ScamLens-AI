import time
import logging
from collections import defaultdict
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS, SAFE_BROWSING_API_KEY, RATE_LIMIT_PER_MINUTE, REPORT_LINKS
from app.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    HealthResponse,
    ErrorResponse,
    StorylineRequest,
    StorylineAnalysisResponse
)
from app.analyzer import (
    analyze_message,
    analyze_storyline,
    EmptyInputException,
    TextTooLongException
)
from app.rules import load_rules_data

# Set up privacy-compliant logger (NEVER log request bodies or message text!)
logger = logging.getLogger("scamlens_api")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

app = FastAPI(
    title="ScamLens AI API",
    description="Privacy-conscious educational decision-support API for scam signal analysis",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory IP rate limiter: IP -> list of timestamps
ip_requests = defaultdict(list)

@app.middleware("http")
async def rate_limit_and_privacy_logging(request: Request, call_next):
    start_time = time.time()
    client_ip = request.client.host if request.client else "unknown"

    # Only rate-limit POST /api/analyze and /api/storyline/analyze
    if request.method == "POST" and ("/analyze" in request.url.path):
        now = time.time()
        # Keep timestamps from the last 60 seconds
        ip_requests[client_ip] = [ts for ts in ip_requests[client_ip] if now - ts < 60]
        if len(ip_requests[client_ip]) >= RATE_LIMIT_PER_MINUTE:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"error": {"code": "RATE_LIMITED", "message": "Too many requests. Please wait a minute before analyzing more messages."}}
            )
        ip_requests[client_ip].append(now)

    try:
        response = await call_next(request)
        duration_ms = round((time.time() - start_time) * 1000, 2)
        # Log ONLY method, path, status, and duration (never message text or body!)
        logger.info(f"{request.method} {request.url.path} - {response.status_code} ({duration_ms}ms)")
        return response
    except Exception as exc:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        logger.error(f"{request.method} {request.url.path} - Unhandled exception ({duration_ms}ms): {type(exc).__name__}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": {"code": "ANALYSIS_FAILED", "message": "An unexpected error occurred during message analysis. Please try again."}}
        )

@app.exception_handler(EmptyInputException)
async def empty_input_handler(request: Request, exc: EmptyInputException):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": {"code": exc.code, "message": exc.message}}
    )

@app.exception_handler(TextTooLongException)
async def text_too_long_handler(request: Request, exc: TextTooLongException):
    return JSONResponse(
        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
        content={"error": {"code": exc.code, "message": exc.message}}
    )

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        url_check_configured=bool(SAFE_BROWSING_API_KEY),
        version="1.0.0"
    )

@app.get("/api/rules")
async def get_rules():
    """Returns transparent, inspectable rules for educational review."""
    return load_rules_data()

@app.get("/api/recovery/guide")
async def get_recovery_guide():
    """Returns official emergency recovery guidelines and national helpline directories."""
    return {
        "status": "ok",
        "helplines": REPORT_LINKS,
        "official_portals": {
            "IN": {
                "name": "National Cyber Crime Reporting Portal",
                "portal": "https://cybercrime.gov.in",
                "helpline": "1930",
                "description": "Citizen Financial Cyber Fraud Reporting System for urgent transaction freezes"
            },
            "US": {
                "name": "FTC Report Fraud & IC3",
                "portal": "https://reportfraud.ftc.gov",
                "helpline": "1-877-382-4357",
                "description": "Federal Trade Commission & FBI Internet Crime Complaint Center"
            },
            "UK": {
                "name": "Action Fraud UK",
                "portal": "https://www.actionfraud.police.uk",
                "helpline": "0300 123 2040",
                "description": "National Fraud and Cyber Crime Reporting Centre"
            }
        }
    }

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(payload: AnalyzeRequest):
    try:
        result = analyze_message(
            text=payload.text,
            optional_url=payload.url,
            check_urls=payload.check_urls,
            sender=payload.sender,
            category_hint=payload.category,
            timestamp=payload.timestamp
        )
        return result
    except (EmptyInputException, TextTooLongException):
        raise
    except Exception as e:
        logger.error(f"Analysis failure: {type(e).__name__}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": {"code": "ANALYSIS_FAILED", "message": "Analysis failed. Please check the text and try again."}}
        )

@app.post("/api/storyline/analyze", response_model=StorylineAnalysisResponse)
async def analyze_storyline_endpoint(payload: StorylineRequest):
    try:
        return analyze_storyline(payload)
    except Exception as e:
        logger.error(f"Storyline failure: {type(e).__name__}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": {"code": "ANALYSIS_FAILED", "message": "Failed to analyze multi-message storyline."}}
        )
