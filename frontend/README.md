# Incident Room — Real-Time AI Ops Console

A lightweight internal operations room for real-time incident reporting, tracking, and AI-assisted response.

---

## Tech Stack

| Layer     | Choice                              |
|-----------|-------------------------------------|
| Frontend  | React 18 (Create React App)         |
| Styling   | Plain CSS + CSS custom properties   |
| Real-time | WebSocket (native browser API)      |
| AI        | Anthropic Claude API (Sonnet 4)     |
| Fallback  | Rule-based AI when API unavailable  |

---

## Project Structure

```
src/
├── components/
│   ├── Badge.jsx             # Colour-coded priority/status pill
│   ├── Ticker.jsx            # Scrolling live-incident marquee
│   ├── Header.jsx            # Top navigation + clock + WS status
│   ├── StatBar.jsx           # Summary metric counts
│   ├── FilterBar.jsx         # Search / filter / sort controls
│   ├── IncidentCard.jsx      # Dashboard grid card
│   ├── Modal.jsx             # Reusable overlay wrapper
│   ├── CreateIncidentModal.jsx  # New incident form
│   ├── IncidentDetail.jsx    # Slide-in detail + update feed
│   ├── AIPanel.jsx           # AI assist (summarize / actions / review)
│   └── Dashboard.jsx         # Grid layout + empty state
├── hooks/
│   ├── useIncidents.js       # Central state + API calls
│   └── useWebSocket.js       # WS connection + reconnect logic
├── utils/
│   └── constants.js          # Colors, seed data, helpers, AI prompts
├── styles/
│   └── global.css            # Resets, animations, form base styles
├── App.jsx                   # Root component
└── index.js                  # Entry point
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env — set REACT_APP_API_URL and REACT_APP_WS_URL to your backend

# 3. Start the dev server
npm start
# Opens at http://localhost:3000
```

The app works fully **without a backend** — it uses seeded local state and a rule-based AI fallback. Connect the FastAPI backend for persistence and true real-time multi-user sync.

---

## AI Assist

Three AI modes are available inside each incident:

| Mode           | What it does                                           |
|----------------|--------------------------------------------------------|
| Summarize      | 3-4 sentence incident summary                          |
| Next Actions   | Numbered list of concrete next steps                   |
| Priority Check | Validates whether the assigned priority is correct     |

**With API key** — set `REACT_APP_ANTHROPIC_KEY` in `.env` to call Claude Sonnet 4 directly from the browser (development only).

**Without API key** — the app automatically falls back to rule-based responses based on incident priority and status. No configuration needed.

---

## Connecting the FastAPI Backend

The frontend expects these endpoints:

```
POST   /incidents                        Create incident
GET    /incidents                        List all incidents
PATCH  /incidents/{id}/status           Update status
POST   /incidents/{id}/updates          Post update
GET    /incidents/{id}/updates          List updates
POST   /incidents/{id}/ai               Save AI result
WS     ws://localhost:8000/ws           Real-time events
```

WebSocket message format:
```json
{ "type": "incident_created", "payload": { ...incident } }
{ "type": "update_posted",    "payload": { "incidentId": "...", "update": {...} } }
{ "type": "status_changed",   "payload": { "incidentId": "...", "status": "..." } }
```

---

## Color Palette

The entire UI uses exactly five colours:

| Token   | Hex       | Used for                        |
|---------|-----------|---------------------------------|
| White   | `#f0f0f0` | Text, surfaces                  |
| Blue    | `#1d7ed8` | Investigating, AI panel, links  |
| Red     | `#e63946` | Critical, open, destructive CTA |
| Black   | `#0a0a0a` | Background, header              |
| Green   | `#2ecc71` | Resolved, low priority, live WS |

---

## Build for Production

```bash
npm run build
# Output in /build — serve with any static host or nginx
```
