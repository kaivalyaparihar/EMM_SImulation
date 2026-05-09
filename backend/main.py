#backend\main.py

"""
EMM Backend — FastAPI server for Emotionally Manipulative Malware simulation.
Provides REST + WebSocket endpoints for emotion analysis and attack generation.
"""

import asyncio
import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from emotion_engine import EmotionEngine
from decision_engine import DecisionEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Engine Instances ──────────────────────────────────────────────
emotion_engine = EmotionEngine(buffer_size=5)
decision_engine = DecisionEngine()


# ── Lifespan ──────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 EMM Backend starting up...")
    logger.info("🧠 Emotion Engine initialized (buffer=5)")
    logger.info("🎯 Decision Engine initialized")
    yield
    logger.info("🔴 EMM Backend shutting down...")


# ── App ───────────────────────────────────────────────────────────
app = FastAPI(
    title="EMM — Emotionally Manipulative Malware Simulation",
    description="Academic simulation of emotionally adaptive cyber attacks",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request Models ────────────────────────────────────────────────
class FrameRequest(BaseModel):
    frame: str  # base64-encoded image


class AttackRequest(BaseModel):
    emotion: str
    scenario: str
    confidence: float = 0.5


# ── REST Endpoints ────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "name": "EMM Simulation Backend",
        "status": "active",
        "disclaimer": "This is a simulation for academic purposes only. No real malware.",
    }


@app.get("/api/scenarios")
async def get_scenarios():
    """Return all available attack scenarios."""
    return decision_engine.get_scenarios()


@app.post("/api/analyze-emotion")
async def analyze_emotion(req: FrameRequest):
    """Analyze a single frame for emotion detection."""
    result = emotion_engine.analyze(req.frame)
    return result


@app.post("/api/generate-attack")
async def generate_attack(req: AttackRequest):
    """Generate an attack based on emotion and scenario."""
    result = decision_engine.decide(req.emotion, req.scenario, req.confidence)
    return result


@app.post("/api/full-pipeline")
async def full_pipeline(req: FrameRequest, scenario: str = "banking"):
    """
    Full pipeline: frame → emotion → decision → attack.
    Combines emotion analysis and attack generation in one call.
    """
    emotion_result = emotion_engine.analyze(req.frame)
    attack_result = decision_engine.decide(
        emotion_result["emotion"],
        scenario,
        emotion_result["confidence"],
    )
    return {
        "emotion": emotion_result,
        "attack": attack_result,
    }


@app.post("/api/reset")
async def reset():
    """Reset engines state."""
    emotion_engine.reset()
    return {"status": "reset"}


# ── WebSocket Endpoint ────────────────────────────────────────────

@app.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    """
    WebSocket for real-time frame streaming and analysis.
    Client sends: { "frame": "<base64>", "scenario": "banking" }
    Server responds: { "emotion": {...}, "attack": {...} }
    """
    await websocket.accept()
    logger.info("🔌 WebSocket client connected")

    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                frame_b64 = payload.get("frame", "")
                scenario = payload.get("scenario", "banking")

                if not frame_b64:
                    await websocket.send_json({"error": "No frame data"})
                    continue

                # Run analysis in executor to not block event loop
                emotion_result = emotion_engine.analyze(frame_b64)
                attack_result = decision_engine.decide(
                    emotion_result["emotion"],
                    scenario,
                    emotion_result["confidence"],
                )

                await websocket.send_json({
                    "emotion": emotion_result,
                    "attack": attack_result,
                })

            except json.JSONDecodeError:
                await websocket.send_json({"error": "Invalid JSON"})

    except WebSocketDisconnect:
        logger.info("🔌 WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except Exception:
            pass


# ── Run ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
