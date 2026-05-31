import json
import os
import threading
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "db.json")
_lock = threading.Lock()

def initialize_db():
    with _lock:
        if not os.path.exists(DB_FILE):
            default_data = {
                "incidents": [],
                "updates": [],
                "ai_results": []
            }
            with open(DB_FILE, "w") as f:
                json.dump(default_data, f, indent=2)

def _read_db() -> Dict[str, Any]:
    initialize_db()
    with _lock:
        try:
            with open(DB_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {"incidents": [], "updates": [], "ai_results": []}

def _write_db(data: Dict[str, Any]):
    with _lock:
        with open(DB_FILE, "w") as f:
            json.dump(data, f, indent=2)

def get_incidents() -> List[Dict[str, Any]]:
    db = _read_db()
    # Sort by created_at descending (latest first)
    return sorted(db.get("incidents", []), key=lambda x: x.get("created_at", ""), reverse=True)

def get_incident(incident_id: str) -> Optional[Dict[str, Any]]:
    db = _read_db()
    for incident in db.get("incidents", []):
        if incident["id"] == incident_id:
            return incident
    return None

def create_incident(incident: Dict[str, Any]) -> Dict[str, Any]:
    db = _read_db()
    db["incidents"].append(incident)
    _write_db(db)
    return incident

def update_incident(incident_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    db = _read_db()
    for incident in db["incidents"]:
        if incident["id"] == incident_id:
            for k, v in updates.items():
                incident[k] = v
            incident["updated_at"] = datetime.utcnow().isoformat() + "Z"
            _write_db(db)
            return incident
    return None

def get_updates(incident_id: str) -> List[Dict[str, Any]]:
    db = _read_db()
    return [u for u in db.get("updates", []) if u["incident_id"] == incident_id]

def add_update(update: Dict[str, Any]) -> Dict[str, Any]:
    db = _read_db()
    db["updates"].append(update)
    
    # Also update the incident's latest_update and updated_at timestamp
    for incident in db["incidents"]:
        if incident["id"] == update["incident_id"]:
            incident["latest_update"] = update["message"]
            incident["updated_at"] = datetime.utcnow().isoformat() + "Z"
            
    _write_db(db)
    return update

def get_ai_result(incident_id: str) -> Optional[Dict[str, Any]]:
    db = _read_db()
    # Find latest AI Result for this incident
    results = [r for r in db.get("ai_results", []) if r["incident_id"] == incident_id]
    if results:
        # Sort by created_at descending
        results = sorted(results, key=lambda x: x.get("created_at", ""), reverse=True)
        return results[0]
    return None

def save_ai_result(ai_result: Dict[str, Any]) -> Dict[str, Any]:
    db = _read_db()
    # Remove previous AI results for this incident to save storage space and keep it clean
    db["ai_results"] = [r for r in db.get("ai_results", []) if r["incident_id"] != ai_result["incident_id"]]
    db["ai_results"].append(ai_result)
    _write_db(db)
    return ai_result
