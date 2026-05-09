#backend\emotion_engine.py

"""
Emotion Engine — DeepFace-based emotion detection with smoothing.
Maps raw emotions to simplified states: stressed, relaxed, neutral.
"""

from collections import deque
from typing import Optional
import numpy as np
import cv2
import base64
import logging

logger = logging.getLogger(__name__)

# Try to import DeepFace; provide fallback if unavailable
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except ImportError:
    DEEPFACE_AVAILABLE = False
    logger.warning("DeepFace not installed. Using simulated emotion detection.")


# Emotion mapping: raw DeepFace → simplified state
EMOTION_MAP = {
    "angry": "stressed",
    "fear": "stressed",
    "sad": "stressed",
    "disgust": "stressed",
    "happy": "relaxed",
    "surprise": "relaxed",
    "neutral": "neutral",
}

SIMPLIFIED_EMOTIONS = ["stressed", "relaxed", "neutral"]


class EmotionEngine:
    """Real-time emotion detection with frame smoothing."""

    def __init__(self, buffer_size: int = 5):
        self.buffer_size = buffer_size
        self._buffer: deque = deque(maxlen=buffer_size)
        self._last_result: Optional[dict] = None

    def _decode_frame(self, frame_b64: str) -> Optional[np.ndarray]:
        """Decode a base64-encoded image frame to a numpy array."""
        try:
            # Remove data URI prefix if present
            if "," in frame_b64:
                frame_b64 = frame_b64.split(",", 1)[1]

            img_bytes = base64.b64decode(frame_b64)
            img_array = np.frombuffer(img_bytes, dtype=np.uint8)
            frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            return frame
        except Exception as e:
            logger.error(f"Failed to decode frame: {e}")
            return None

    def _analyze_frame(self, frame: np.ndarray) -> Optional[dict]:
        """Run DeepFace analysis on a single frame."""
        if not DEEPFACE_AVAILABLE:
            return self._simulate_emotion()

        try:
            results = DeepFace.analyze(
                frame,
                actions=["emotion"],
                enforce_detection=False,
                silent=True,
            )

            if isinstance(results, list):
                results = results[0]

            raw_emotion = results.get("dominant_emotion", "neutral")
            emotion_scores = results.get("emotion", {})

            simplified = EMOTION_MAP.get(raw_emotion, "neutral")
            confidence = emotion_scores.get(raw_emotion, 50.0) / 100.0

            return {
                "raw_emotion": raw_emotion,
                "simplified_emotion": simplified,
                "confidence": round(confidence, 2),
                "all_scores": {k: round(v, 2) for k, v in emotion_scores.items()},
            }
        except Exception as e:
            logger.error(f"DeepFace analysis failed: {e}")
            return self._simulate_emotion()

    def _simulate_emotion(self) -> dict:
        """Fallback: simulate emotion detection when DeepFace is unavailable."""
        import random
        raw = random.choice(["happy", "neutral", "sad", "angry", "fear"])
        simplified = EMOTION_MAP.get(raw, "neutral")
        confidence = round(random.uniform(0.6, 0.95), 2)
        return {
            "raw_emotion": raw,
            "simplified_emotion": simplified,
            "confidence": confidence,
            "all_scores": {
                "angry": round(random.uniform(0, 30), 2),
                "disgust": round(random.uniform(0, 10), 2),
                "fear": round(random.uniform(0, 25), 2),
                "happy": round(random.uniform(0, 40), 2),
                "sad": round(random.uniform(0, 30), 2),
                "surprise": round(random.uniform(0, 20), 2),
                "neutral": round(random.uniform(20, 60), 2),
            },
        }

    def _smooth_results(self) -> dict:
        """Average the buffer to produce a smoothed emotion reading."""
        if not self._buffer:
            return {"emotion": "neutral", "confidence": 0.5, "raw_emotion": "neutral", "all_scores": {}}

        # Count simplified emotions
        emotion_counts: dict[str, int] = {}
        total_confidence = 0.0
        latest_scores = {}

        for entry in self._buffer:
            e = entry["simplified_emotion"]
            emotion_counts[e] = emotion_counts.get(e, 0) + 1
            total_confidence += entry["confidence"]
            latest_scores = entry.get("all_scores", {})

        # Dominant smoothed emotion
        dominant = max(emotion_counts, key=emotion_counts.get)  # type: ignore
        avg_confidence = round(total_confidence / len(self._buffer), 2)

        # Get the most recent raw emotion that maps to the dominant
        raw = self._buffer[-1]["raw_emotion"]

        return {
            "emotion": dominant,
            "confidence": avg_confidence,
            "raw_emotion": raw,
            "all_scores": latest_scores,
        }

    def analyze(self, frame_b64: str) -> dict:
        """
        Main entry point: decode frame, analyze emotion, smooth, return result.
        """
        frame = self._decode_frame(frame_b64)
        if frame is None:
            return self._last_result or {"emotion": "neutral", "confidence": 0.5, "raw_emotion": "neutral", "all_scores": {}}

        result = self._analyze_frame(frame)
        if result:
            self._buffer.append(result)

        smoothed = self._smooth_results()
        self._last_result = smoothed
        return smoothed

    def reset(self):
        """Clear the smoothing buffer."""
        self._buffer.clear()
        self._last_result = None
