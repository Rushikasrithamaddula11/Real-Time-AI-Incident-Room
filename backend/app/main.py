import uuid
from datetime import datetime
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.database import (
    get_incidents,
    get_incident,
    create_incident as db_create_incident,
    update_incident as db_update_incident,
    get_updates,
    add_update as db_add_update,
    get_ai_result,
    save_ai_result
)
from app.ai import generate_ai_analysis

app = FastAPI(title="Real-Time AI Incident Room API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- WebSocket Connection Manager -----------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                # Handle dead/broken connections
                print(f"Failed to send WebSocket message: {str(e)}")

manager = ConnectionManager()

# ----------------- Pydantic Models -----------------
class IncidentCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=5)
    priority: str = Field(..., pattern="^(HIGH|MEDIUM|LOW)$")
    reporter_name: str = Field(..., min_length=2, max_length=50)

class UpdateCreate(BaseModel):
    message: str = Field(..., min_length=1)
    author_name: str = Field(..., min_length=2, max_length=50)

class StatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(OPEN|INVESTIGATING|RESOLVED)$")

# ----------------- API Endpoints -----------------

@app.get("/api/incidents")
def read_incidents():
    try:
        return get_incidents()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database read failed: {str(e)}")

@app.get("/api/incidents/{incident_id}")
def read_incident(incident_id: str):
    incident = get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@app.post("/api/incidents", status_code=201)
async def create_new_incident(incident_data: IncidentCreate):
    new_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"
    
    incident = {
        "id": new_id,
        "title": incident_data.title,
        "description": incident_data.description,
        "priority": incident_data.priority,
        "status": "OPEN",
        "reporter_name": incident_data.reporter_name,
        "created_at": now,
        "updated_at": now,
        "latest_update": None
    }
    
    try:
        created = db_create_incident(incident)
        
        # Broadcast creation via WebSockets
        await manager.broadcast({
            "type": "INCIDENT_CREATED",
            "data": created
        })
        return created
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create incident: {str(e)}")

@app.get("/api/incidents/{incident_id}/updates")
def read_updates(incident_id: str):
    # Verify incident exists
    if not get_incident(incident_id):
        raise HTTPException(status_code=404, detail="Incident not found")
    return get_updates(incident_id)

@app.post("/api/incidents/{incident_id}/updates", status_code=201)
async def create_update(incident_id: str, update_data: UpdateCreate):
    # Verify incident exists
    incident = get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    new_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"
    
    update = {
        "id": new_id,
        "incident_id": incident_id,
        "message": update_data.message,
        "author_name": update_data.author_name,
        "created_at": now
    }
    
    try:
        created_update = db_add_update(update)
        
        # Broadcast new update via WebSockets
        await manager.broadcast({
            "type": "UPDATE_ADDED",
            "incident_id": incident_id,
            "data": created_update
        })
        
        # Broadcast that the parent incident was updated
        updated_incident = get_incident(incident_id)
        await manager.broadcast({
            "type": "INCIDENT_UPDATED",
            "data": updated_incident
        })
        
        return created_update
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add update: {str(e)}")

@app.patch("/api/incidents/{incident_id}/status")
async def update_status(incident_id: str, status_data: StatusUpdate):
    # Verify incident exists
    if not get_incident(incident_id):
        raise HTTPException(status_code=404, detail="Incident not found")
        
    try:
        updated = db_update_incident(incident_id, {"status": status_data.status})
        
        # Broadcast the change via WebSockets
        await manager.broadcast({
            "type": "INCIDENT_UPDATED",
            "data": updated
        })
        return updated
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")

@app.get("/api/incidents/{incident_id}/ai-assist")
def read_ai_assist(incident_id: str):
    if not get_incident(incident_id):
        raise HTTPException(status_code=404, detail="Incident not found")
    result = get_ai_result(incident_id)
    if not result:
        return {"incident_id": incident_id, "type": "summary_and_actions", "result_text": "Click 'Request AI SRE Assist' below to trigger live incident telemetry analysis.", "created_at": None, "is_empty": True}
    return result

@app.post("/api/incidents/{incident_id}/ai-assist")
async def trigger_ai_assist(incident_id: str):
    incident = get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    try:
        updates = get_updates(incident_id)
        ai_payload = generate_ai_analysis(incident, updates)
        saved = save_ai_result(ai_payload)
        
        # Broadcast AI result completion
        await manager.broadcast({
            "type": "AI_ASSIST_READY",
            "incident_id": incident_id,
            "data": saved
        })
        return saved
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Assist execution failed: {str(e)}")

# ----------------- WebSockets Route -----------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Maintain connection and listen for heartbeat ping/pongs
            data = await websocket.receive_text()
            # Respond with pong if needed
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket encounter error: {str(e)}")
        manager.disconnect(websocket)
