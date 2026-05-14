# EMM (Emotionally Manipulative Malware) Simulation

## Overview
EMM Simulation is an academic project designed to demonstrate how cyber attacks can dynamically adapt based on a user's emotional state. It leverages real-time facial emotion recognition to tailor "malware" simulations (such as phishing, ransomware popups, or tech support scams) to the victim's current psychological context.

**Disclaimer:** This is a simulation for academic and research purposes only. It does not contain actual malware.

## Architecture
The project is split into two main components:
- **Frontend (`/frontend`)**: A React-based web application that captures user webcam feeds, displays the simulation interface, and renders the tailored attack scenarios.
- **Backend (`/backend`)**: A Python FastAPI service that processes video frames using deep learning (DeepFace/OpenCV) to detect emotions, and uses a decision engine to determine the most effective attack strategy based on the detected emotion and scenario.

## Tech Stack
### Frontend
- **Framework**: React 19 with Vite
- **Language**: TypeScript
- **Styling & UI**: Material UI (MUI), Emotion
- **Animations**: Framer Motion

### Backend
- **Framework**: FastAPI
- **Real-time Communication**: WebSockets
- **AI/CV**: DeepFace, OpenCV, tf-keras
- **Server**: Uvicorn

## Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- Python 3.10+

### 1. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
```

Create a virtual environment and activate it:
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

Install the required dependencies:
```bash
pip install -r requirements.txt
```

Run the backend server:
```bash
python main.py
# The server will start at http://localhost:8000
```

### 2. Frontend Setup
Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
```

Install the dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
# The frontend will be available at the URL provided by Vite (usually http://localhost:5173)
```

## How It Works
1. The frontend accesses the user's webcam and continuously sends frames to the backend via WebSockets (or REST).
2. The `EmotionEngine` analyzes the frame to determine the dominant emotion (e.g., stress, fear, neutral).
3. The `DecisionEngine` takes the emotion and the current simulation context (e.g., "banking") and selects the optimal manipulative tactic.
4. The frontend receives the tailored attack payload and triggers the corresponding visual scenario.

## Author

Kaivalya Parihar
