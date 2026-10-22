import { analyzeMessageLocal, analyzeStorylineLocal } from './localEngine';
import rulesData from '../rules.json';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export async function analyzeMessage(text, url = '', checkUrls = false, sender = null, category = null, timestamp = null) {
  const payload = {
    text,
    url: (url || '').trim() || null,
    check_urls: checkUrls,
    sender: (sender || '').trim() || null,
    category: (category || '').trim() || null,
    timestamp: (timestamp || '').trim() || null,
  };

  // First attempt: API call through configured base or relative path
  try {
    const targetUrl = API_BASE ? `${API_BASE}/api/analyze` : '/api/analyze';
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Primary /api/analyze failed, trying direct localhost:8000...', err);
  }

  // Second attempt: Direct localhost:8000 (if API_BASE was not localhost)
  if (!API_BASE.includes('localhost:8000')) {
    try {
      const response2 = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response2.ok) {
        return await response2.json();
      }
    } catch (err) {
      console.warn('Direct localhost:8000 failed, using on-device local engine fallback...', err);
    }
  }

  // Guaranteed fallback: Run client-side local rule engine
  return analyzeMessageLocal(text, url);
}

export async function analyzeStoryline(messages = [], caseTitle = "Investigation Case") {
  const payload = {
    case_title: caseTitle,
    messages: messages.map(m => ({
      id: m.id,
      text: m.text,
      sender: m.sender || null,
      timestamp: m.timestamp || null,
      channel: m.channel || 'SMS'
    }))
  };

  // Attempt configured API call
  try {
    const endpoint = API_BASE ? `${API_BASE}/api/storyline/analyze` : '/api/storyline/analyze';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch {}

  // Attempt direct backend call
  if (!API_BASE.includes('localhost:8000')) {
    try {
      const res2 = await fetch('http://localhost:8000/api/storyline/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res2.ok) return await res2.json();
    } catch {}
  }

  // Local fallback in browser
  return analyzeStorylineLocal(messages, caseTitle);
}

export async function fetchRecoveryGuide() {
  try {
    const endpoint = API_BASE ? `${API_BASE}/api/recovery/guide` : '/api/recovery/guide';
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {}

  if (!API_BASE.includes('localhost:8000')) {
    try {
      const res2 = await fetch('http://localhost:8000/api/recovery/guide');
      if (res2.ok) return await res2.json();
    } catch {}
  }

  // Local fallback
  return {
    status: "ok",
    official_portals: {
      IN: {
        name: "National Cyber Crime Reporting Portal",
        portal: "https://cybercrime.gov.in",
        helpline: "1930",
        description: "Citizen Financial Cyber Fraud Reporting System for urgent transaction freezes"
      },
      US: {
        name: "FTC Report Fraud & IC3",
        portal: "https://reportfraud.ftc.gov",
        helpline: "1-877-382-4357",
        description: "Federal Trade Commission & FBI Internet Crime Complaint Center"
      },
      UK: {
        name: "Action Fraud UK",
        portal: "https://www.actionfraud.police.uk",
        helpline: "0300 123 2040",
        description: "National Fraud and Cyber Crime Reporting Centre"
      }
    }
  };
}

export async function checkServerHealth() {
  try {
    const endpoint = API_BASE ? `${API_BASE}/api/health` : '/api/health';
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {}

  if (!API_BASE.includes('localhost:8000')) {
    try {
      const res2 = await fetch('http://localhost:8000/api/health');
      if (res2.ok) return await res2.json();
    } catch {}
  }

  // Fallback state
  return { status: 'ok', url_check_configured: false, engine: 'local' };
}

export async function fetchRulesList() {
  try {
    const endpoint = API_BASE ? `${API_BASE}/api/rules` : '/api/rules';
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {}

  if (!API_BASE.includes('localhost:8000')) {
    try {
      const res2 = await fetch('http://localhost:8000/api/rules');
      if (res2.ok) return await res2.json();
    } catch {}
  }

  // Local fallback from imported JSON
  return rulesData;
}
