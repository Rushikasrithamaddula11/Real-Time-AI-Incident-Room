# Real-Time AI Incident Room

A real-time incident management application that allows teams to create incidents, post live updates, track status changes, and leverage AI-powered assistance for incident response.

## Overview

During production outages, support escalations, or operational incidents, teams need a central place to collaborate and communicate quickly. This application provides a lightweight incident room where team members can:

* Create and manage incidents
* Share live updates in real time
* Track incident status and priority
* Generate AI-powered incident summaries and suggested next actions
* Monitor ongoing investigations from a centralized dashboard

## Features

### Incident Dashboard

* View all incidents in one place
* Display:

  * Incident title
  * Priority
  * Status
  * Latest update
  * Created time
  * Last updated time

### Create Incident

Users can create incidents with:

* Title
* Description
* Priority (Low, Medium, High, Critical)
* Reporter Name

### Real-Time Updates

* Post updates within an incident
* Updates appear instantly without page refresh
* Powered by WebSockets for real-time communication

### AI Assistant

AI-generated support for incident management:

* Incident Summary
* Suggested Next Actions

If an AI API key is unavailable, a rule-based fallback mechanism is used.

### Status Workflow

Supported statuses:

* Open
* Investigating
* Resolved

Status changes are reflected immediately on the dashboard.

### User Experience

* Loading indicators
* Form validation
* Error handling
* Empty state screens
* Responsive interface

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS

### Backend

* FastAPI
* Python

### Real-Time Communication

* WebSockets

### Data Storage

* SQLite

### AI Integration

* Google Gemini API
* Rule-based fallback when AI service is unavailable

---

## Project Structure

```text
Real-Time-AI-Incident-Room/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   ├── database/
│   ├── requirements.txt
│   └── main.py
│
├── screenshots/
├── README.md
└── .env.example
```

## Installation

### Clone Repository

```bash
git clone https://github.com/Rushikasrithamaddula11/Real-Time-AI-Incident-Room.git
cd Real-Time-AI-Incident-Room
```

## Backend Setup

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

Start Backend:

```bash
uvicorn main:app --reload
```

Backend runs on:

```text
http://localhost:8000
```

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## AI Feature

The application supports AI-generated incident assistance.

### AI Summary

Generates a concise summary of all incident updates.

### AI Next Action Suggestions

Provides recommended actions based on incident activity and severity.

### Fallback Mode

If Gemini API is unavailable:

* A rule-based response system generates recommendations.
* The application remains fully functional.

---

## Sample Incident Workflow

1. Create a new incident.
2. Set priority and description.
3. Team members post updates.
4. Updates appear instantly for all connected users.
5. Generate AI Summary.
6. Update incident status:

   * Open → Investigating → Resolved

---

## Future Improvements

* Authentication and role-based access
* Incident assignment
* Slack/Teams integration
* Email notifications
* Audit logs
* Advanced analytics dashboard
* Persistent cloud database

---

## Author

Rushika Sritha Maddula

GitHub:
https://github.com/Rushikasrithamaddula11

---

## License

This project was developed as part of a take-home assessment focused on real-time systems, AI integration, and full-stack engineering.
