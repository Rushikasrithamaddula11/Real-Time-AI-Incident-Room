import os
import httpx
from typing import Dict, Any, List
from datetime import datetime

# Direct Gemini API Endpoint (REST) is extremely robust and fast
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

def generate_ai_analysis(incident: Dict[str, Any], updates: List[Dict[str, Any]]) -> Dict[str, Any]:
    title = incident.get("title", "")
    description = incident.get("description", "")
    priority = incident.get("priority", "")
    status = incident.get("status", "")
    reporter = incident.get("reporter_name", "")
    
    # Format current log of updates for the AI
    updates_text = ""
    if updates:
        updates_text = "\n".join([
            f"- [{u.get('created_at', '')}] {u.get('author_name', '')}: {u.get('message', '')}"
            for u in updates
        ])
    else:
        updates_text = "No updates posted yet."

    prompt = f"""You are the Lead SRE and Operations Incident Commander.
Analyze this production incident and recent live updates to generate a high-priority summary and next action items.

Incident Details:
- Title: {title}
- Description: {description}
- Priority: {priority}
- Current Status: {status}
- Reporter: {reporter}

Recent Live Updates Log:
{updates_text}

Provide your response in clean Markdown with exactly these two sections:
### 🚨 Incident Summary
[Provide a crisp, 2-3 sentence summary of the current situation, threat level, and estimated impact.]

### 🛠️ Recommended SRE Next Actions
[Provide a numbered checklist of 3-5 specific technical and operational next actions (e.g. checking logs, rolling back, running health checks). Keep it highly actionable.]
"""

    result_text = ""
    is_fallback = True

    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }]
            }
            with httpx.Client(timeout=15.0) as client:
                response = client.post(url, json=payload, headers=headers)
                if response.status_code == 200:
                    resp_json = response.json()
                    result_text = resp_json["contents"][0]["parts"][0]["text"]
                    is_fallback = False
                else:
                    print(f"Gemini API returned status code {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Error calling Gemini API: {str(e)}")

    if is_fallback:
        result_text = _generate_fallback_response(title, description, priority, status, updates)

    return {
        "incident_id": incident["id"],
        "type": "summary_and_actions",
        "result_text": result_text,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "is_fallback": is_fallback
    }

def _generate_fallback_response(title: str, description: str, priority: str, status: str, updates: List[Dict[str, Any]]) -> str:
    # Highly context-aware SRE mock engine
    title_lower = title.lower()
    desc_lower = description.lower()
    
    # 1. Determine Incident Scenario
    if "payment" in title_lower or "checkout" in title_lower or "card" in title_lower or "stripe" in title_lower or "billing" in title_lower:
        summary = f"**Payment API Interruption Detected:** {title}. Transactions are actively failing, posing an immediate impact to revenue stream. The system is showing transaction drop-offs on the main checkout funnel."
        actions = [
            "Verify Stripe/Adyen/Payment Gateway status pages for active regional outages.",
            "Inspect backend application logs for `5xx` gateway timeouts or SSL handshake errors.",
            "Trace recent changes in checkout webhook configurations or frontend payment SDK versions.",
            "Alert Customer Support to provide manual billing retry guidelines to impacted users.",
            "Set up an isolated test transaction in staging to verify credentials and card handshakes."
        ]
    elif "login" in title_lower or "auth" in title_lower or "token" in title_lower or "jwt" in title_lower or "signup" in title_lower:
        summary = f"**Authentication & Session Failure:** {title}. High rate of validation errors preventing users from logging in or registering. Core authentication systems may have misconfigured certs or high-latency database locks."
        actions = [
            "Check IDP (Auth0, Okta, Firebase Auth) console for active spikes in user authorization failures.",
            "Verify token decryption secrets and expiration timestamps on the microservice authentication headers.",
            "Inspect database memory usage to check for active deadlocks in the `users` credentials tables.",
            "Review deployment log for recent changes in routing, CORS, or middleware security updates.",
            "Draft alert notice on dashboard for users experiencing active authentication session drops."
        ]
    elif "db" in title_lower or "database" in title_lower or "postgres" in title_lower or "mongo" in title_lower or "redis" in title_lower or "slow" in title_lower or "query" in title_lower:
        summary = f"**Database Congestion / Slow Query Saturation:** {title}. Database connection pools are saturated, leading to slow query warnings and application-wide latency. High SRE risk."
        actions = [
            "Run `pg_stat_activity` to locate long-running lock queries or transaction blockages.",
            "Check CPU and RAM utilization metrics for the primary and read-replica database clusters.",
            "Temporarily scale up the connection pool limits to absorb immediate query traffic spikes.",
            "Inspect Redis cache health to verify cache-aside hits are reducing direct DB load.",
            "Prepare a rollback script if database migrations were deployed within the last 2 hours."
        ]
    elif "upload" in title_lower or "file" in title_lower or "s3" in title_lower or "storage" in title_lower or "document" in title_lower:
        summary = f"**Storage and File Upload Interruption:** {title}. Users are unable to upload documents. Core cause is likely S3 bucket permissions mismatch, storage space limits, or network timeout."
        actions = [
            "Check AWS S3/Cloud Storage status page and verify bucket write IAM permissions.",
            "Inspect file upload controller logs for upload file size exceptions or timeout alerts.",
            "Verify disk usage (`df -h`) on active load balancer node file caches.",
            "Temporarily increase maximum allowed payload sizes in the API gateway parameters if needed.",
            "Validate client-side upload signature payload expiration values."
        ]
    else:
        summary = f"**General Service Degradation:** {title}. {description}. The operations team is investigating the core components of the incident. Priority level is flagged as {priority}."
        actions = [
            "Check Sentry/Grafana alerts for correlation metrics matching the incident start timestamp.",
            "Inspect main application server CPU, memory, and heap garbage collection parameters.",
            "Verify health endpoints (`/health` / `/ping`) of all connected microservices.",
            "Notify on-call team leads and initiate a dedicated SRE debugging bridge room.",
            "Prepare communication draft for the public status page if recovery time exceeds 30 minutes."
        ]

    # Render as crisp Markdown matching SRE style
    status_emoji = "⚠️" if status == "INVESTIGATING" else "🚨" if status == "OPEN" else "✅"
    
    md_output = f"""### {status_emoji} Incident Summary
{summary}

### 🛠️ Recommended SRE Next Actions
"""
    for idx, act in enumerate(actions, 1):
        md_output += f"{idx}. **[ACTION]** {act}\n"
        
    md_output += f"\n*(AI Assist powered by SRE Fallback Engine - Local Time: {datetime.utcnow().isoformat()}Z)*"
    return md_output
