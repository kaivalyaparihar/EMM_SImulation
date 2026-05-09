//frontend/src/components/AttackerView.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, Paper, Grid, Chip, LinearProgress } from "@mui/material";
import { motion } from "framer-motion";
import {
  CameraAlt,
  Mic,
  Keyboard,
  FiberManualRecord,
  Shield,
} from "@mui/icons-material";
import { useCamera } from "../context/CameraContext";
import LogsPanel from "./LogsPanel";
import type { LogEntry } from "./LogsPanel";
import Pipeline from "./Pipeline";

const API_URL = "http://localhost:8000";

interface EmotionData {
  emotion: string;
  confidence: number;
  raw_emotion: string;
  all_scores?: Record<string, number>;
}

interface AttackData {
  attack_type: string;
  trigger_type: string;
  urgency_level: string;
  scenario: string;
  confidence: number;
  popup?: {
    title: string;
    message: string;
    button: string;
    secondary: string;
  };
}

// Simulated log message sequences
const LOG_SEQUENCES = [
  { level: "INFO" as const, message: "Initializing AI surveillance module..." },
  { level: "INFO" as const, message: "Camera feed captured — resolution: 640x480" },
  { level: "INFO" as const, message: "Running facial landmark detection..." },
  { level: "INFO" as const, message: "DeepFace engine analyzing micro-expressions..." },
  { level: "SUCCESS" as const, message: "Emotion vector extracted successfully" },
  { level: "INFO" as const, message: "Mapping emotion to behavioral profile..." },
  { level: "INFO" as const, message: "Cross-referencing with scenario context..." },
  { level: "INFO" as const, message: "Decision engine computing optimal attack vector..." },
  { level: "WARN" as const, message: "Target vulnerability score: HIGH" },
  { level: "INFO" as const, message: "Generating polymorphic payload template..." },
  { level: "INFO" as const, message: "Applying social engineering parameters..." },
  { level: "SUCCESS" as const, message: "Attack payload assembled — awaiting deployment window" },
  { level: "INFO" as const, message: "Monitoring target stress indicators..." },
  { level: "INFO" as const, message: "Keystroke pattern analysis: ELEVATED anxiety detected" },
  { level: "WARN" as const, message: "Optimal attack window identified" },
  { level: "SUCCESS" as const, message: "Payload deployed — attack vector: PHISHING" },
  { level: "INFO" as const, message: "Monitoring target response..." },
  { level: "INFO" as const, message: "Real-time adaptation algorithm active" },
  { level: "INFO" as const, message: "Exfiltration channel established (simulated)" },
  { level: "SUCCESS" as const, message: "Data extraction complete — C2 callback successful" },
];

const AttackerView: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [attackData, setAttackData] = useState<AttackData | null>(null);
  const [scenario] = useState("banking");

  const { startCamera, isActive, captureFrame, stream } = useCamera();
  const videoDisplayRef = useRef<HTMLVideoElement>(null);
  const logIdRef = useRef(0);
  const logIndexRef = useRef(0);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (videoDisplayRef.current && stream) {
      videoDisplayRef.current.srcObject = stream;
    }
  }, [stream]);

  // Generate logs on interval
  useEffect(() => {
    const getTimestamp = () => {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    };

    const interval = setInterval(() => {
      const seq = LOG_SEQUENCES[logIndexRef.current % LOG_SEQUENCES.length];
      logIdRef.current += 1;

      setLogs((prev) => [
        ...prev.slice(-50), // Keep last 50 logs
        {
          id: logIdRef.current,
          timestamp: getTimestamp(),
          level: seq.level,
          message: seq.message,
        },
      ]);

      logIndexRef.current += 1;
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Update pipeline step based on emotion data
  useEffect(() => {
    if (!isActive) {
      setPipelineStep(-1);
      return;
    }

    // Cycle through pipeline steps
    const interval = setInterval(() => {
      setPipelineStep((prev) => {
        if (prev >= 3) return 0;
        return prev + 1;
      });
    }, 4000);

    setPipelineStep(0);
    return () => clearInterval(interval);
  }, [isActive]);

  // Analyze frames
  const analyzeFrame = useCallback(async () => {
    const frame = captureFrame();
    if (!frame) return;

    try {
      const res = await fetch(`${API_URL}/api/full-pipeline?scenario=${scenario}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame }),
      });
      const data = await res.json();
      setEmotionData(data.emotion);
      setAttackData(data.attack);
    } catch {
      // Fallback
      const emotions = ["stressed", "relaxed", "neutral"];
      const rawEmotions = ["angry", "happy", "neutral", "sad", "fear"];
      const emotionIndex = Math.floor(Math.random() * emotions.length);
      setEmotionData({
        emotion: emotions[emotionIndex],
        confidence: Math.round((0.6 + Math.random() * 0.35) * 100) / 100,
        raw_emotion: rawEmotions[Math.floor(Math.random() * rawEmotions.length)],
        all_scores: {
          angry: Math.round(Math.random() * 30 * 100) / 100,
          disgust: Math.round(Math.random() * 10 * 100) / 100,
          fear: Math.round(Math.random() * 25 * 100) / 100,
          happy: Math.round(Math.random() * 40 * 100) / 100,
          sad: Math.round(Math.random() * 30 * 100) / 100,
          surprise: Math.round(Math.random() * 20 * 100) / 100,
          neutral: Math.round((20 + Math.random() * 40) * 100) / 100,
        },
      });

      const attackTypes = ["urgency", "fear", "reward"];
      setAttackData({
        attack_type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
        trigger_type: "time_pressure",
        urgency_level: emotions[emotionIndex] === "stressed" ? "critical" : emotions[emotionIndex] === "neutral" ? "medium" : "low",
        scenario,
        confidence: Math.round((0.6 + Math.random() * 0.35) * 100) / 100,
      });
    }
  }, [captureFrame, scenario]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(analyzeFrame, 2500);
      return () => clearInterval(interval);
    }
  }, [isActive, analyzeFrame]);

  const EmotionColor = (e: string) => {
    switch (e) {
      case "stressed": return "#ff0040";
      case "relaxed": return "#00ff88";
      default: return "#00f0ff";
    }
  };

  return (
    <Box sx={{ p: 2, height: "calc(100vh - 120px)" }}>
      <Grid container spacing={2} sx={{ height: "100%" }}>
        {/* LEFT COLUMN: Logs + Pipeline */}
        <Grid size={{ xs: 12, md: 5 }} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Logs Panel */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <LogsPanel logs={logs} maxHeight={300} />
          </Box>

          {/* Pipeline */}
          <Box>
            <Pipeline activeStep={pipelineStep} />
          </Box>
        </Grid>

        {/* RIGHT COLUMN: Decision Panel + Camera + Capabilities */}
        <Grid size={{ xs: 12, md: 7 }} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* AI Decision Panel */}
          <Paper sx={{ p: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "#00f0ff",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontSize: "0.75rem",
                mb: 2,
              }}
            >
              AI Decision Matrix
            </Typography>

            {emotionData && attackData ? (
              <Grid container spacing={2}>
                {/* Emotion */}
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: `${EmotionColor(emotionData.emotion)}08`,
                      border: `1px solid ${EmotionColor(emotionData.emotion)}30`,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", mb: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>
                      EMOTION
                    </Typography>
                    <motion.div key={emotionData.emotion} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                      <Chip
                        label={emotionData.emotion.toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          color: EmotionColor(emotionData.emotion),
                          borderColor: EmotionColor(emotionData.emotion),
                          fontSize: "0.75rem",
                        }}
                        variant="outlined"
                      />
                    </motion.div>
                  </Box>
                </Grid>

                {/* Scenario */}
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: "rgba(168, 85, 247, 0.05)",
                      border: "1px solid rgba(168, 85, 247, 0.2)",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", mb: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>
                      SCENARIO
                    </Typography>
                    <Chip
                      label={attackData.scenario.toUpperCase()}
                      size="small"
                      sx={{ fontWeight: 700, color: "#a855f7", borderColor: "#a855f7", fontSize: "0.75rem" }}
                      variant="outlined"
                    />
                  </Box>
                </Grid>

                {/* Attack Type */}
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: "rgba(255, 170, 0, 0.05)",
                      border: "1px solid rgba(255, 170, 0, 0.2)",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", mb: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>
                      ATTACK TYPE
                    </Typography>
                    <Chip
                      label={attackData.attack_type.toUpperCase()}
                      size="small"
                      sx={{ fontWeight: 700, color: "#ffaa00", borderColor: "#ffaa00", fontSize: "0.75rem" }}
                      variant="outlined"
                    />
                  </Box>
                </Grid>

                {/* Trigger */}
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: "rgba(255, 0, 64, 0.05)",
                      border: "1px solid rgba(255, 0, 64, 0.2)",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", mb: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>
                      TRIGGER
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "#ff0040",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                      }}
                    >
                      {attackData.trigger_type.replace(/_/g, " ").toUpperCase()}
                    </Typography>
                  </Box>
                </Grid>

                {/* Urgency */}
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: "rgba(0, 255, 136, 0.05)",
                      border: "1px solid rgba(0, 255, 136, 0.2)",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", mb: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>
                      URGENCY
                    </Typography>
                    <Chip
                      label={attackData.urgency_level.toUpperCase()}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        color: attackData.urgency_level === "critical" ? "#ff0040" : attackData.urgency_level === "medium" ? "#ffaa00" : "#00ff88",
                        borderColor: attackData.urgency_level === "critical" ? "#ff0040" : attackData.urgency_level === "medium" ? "#ffaa00" : "#00ff88",
                      }}
                      variant="outlined"
                    />
                  </Box>
                </Grid>

                {/* Confidence */}
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: "rgba(0, 240, 255, 0.05)",
                      border: "1px solid rgba(0, 240, 255, 0.2)",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", mb: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>
                      CONFIDENCE
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        color: "#00f0ff",
                        fontSize: "1.1rem",
                      }}
                    >
                      {Math.round(attackData.confidence * 100)}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Shield sx={{ fontSize: 32, color: "text.secondary" }} />
                </motion.div>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Awaiting target data...
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Camera + System Capabilities */}
          <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
            {/* Small Camera Feed */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper sx={{ p: 1.5, height: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <CameraAlt sx={{ fontSize: 14, color: "#ff0040" }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#ff0040",
                      fontWeight: 600,
                      fontSize: "0.65rem",
                    }}
                  >
                    TARGET FEED
                  </Typography>
                  <motion.div
                    animate={{ opacity: [1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ marginLeft: "auto" }}
                  >
                    <FiberManualRecord sx={{ fontSize: 10, color: "#ff0040" }} />
                  </motion.div>
                </Box>

                <Box
                  sx={{
                    borderRadius: 1,
                    overflow: "hidden",
                    bgcolor: "#000",
                    height: 180,
                    position: "relative",
                  }}
                >
                  {isActive ? (
                    <video
                      ref={videoDisplayRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: "scaleX(-1)",
                        filter: "contrast(1.1) saturate(0.8)",
                      }}
                    />
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography variant="caption" color="text.secondary">
                        No feed
                      </Typography>
                    </Box>
                  )}

                  {/* Overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      border: "1px solid rgba(255, 0, 64, 0.3)",
                      borderRadius: 1,
                      pointerEvents: "none",
                    }}
                  >
                    {/* Corner brackets */}
                    {[
                      { top: 4, left: 4 },
                      { top: 4, right: 4 },
                      { bottom: 4, left: 4 },
                      { bottom: 4, right: 4 },
                    ].map((pos, i) => (
                      <Box
                        key={i}
                        sx={{
                          position: "absolute",
                          ...pos,
                          width: 16,
                          height: 16,
                          borderColor: "#ff0040",
                          borderStyle: "solid",
                          borderWidth: 0,
                          ...(i === 0 && { borderTopWidth: 2, borderLeftWidth: 2 }),
                          ...(i === 1 && { borderTopWidth: 2, borderRightWidth: 2 }),
                          ...(i === 2 && { borderBottomWidth: 2, borderLeftWidth: 2 }),
                          ...(i === 3 && { borderBottomWidth: 2, borderRightWidth: 2 }),
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* System Capabilities */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "#00f0ff",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontSize: "0.7rem",
                    mb: 2,
                  }}
                >
                  System Capabilities
                </Typography>

                {[
                  {
                    icon: <CameraAlt sx={{ fontSize: 16 }} />,
                    label: "Camera Access",
                    status: "ACTIVE",
                    color: "#00ff88",
                    active: true,
                  },
                  {
                    icon: <Mic sx={{ fontSize: 16 }} />,
                    label: "Microphone",
                    status: "SIMULATED",
                    color: "#ffaa00",
                    active: false,
                  },
                  {
                    icon: <Keyboard sx={{ fontSize: 16 }} />,
                    label: "Keystroke Capture",
                    status: "SIMULATED",
                    color: "#ffaa00",
                    active: false,
                  },
                ].map((cap) => (
                  <Box
                    key={cap.label}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      py: 1,
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <Box sx={{ color: cap.color }}>{cap.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                        {cap.label}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      {cap.active && (
                        <motion.div
                          animate={{ opacity: [1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <FiberManualRecord sx={{ fontSize: 8, color: cap.color }} />
                        </motion.div>
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: cap.color,
                          fontWeight: 700,
                          fontSize: "0.65rem",
                        }}
                      >
                        {cap.status}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                {/* Emotion Breakdown if available */}
                {emotionData?.all_scores && (
                  <Box sx={{ mt: 2, pt: 1, borderTop: "1px solid rgba(0,240,255,0.1)" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "text.secondary",
                        fontSize: "0.6rem",
                        mb: 1,
                        display: "block",
                      }}
                    >
                      EMOTION BREAKDOWN
                    </Typography>
                    {Object.entries(emotionData.all_scores)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 4)
                      .map(([emotion, score]) => (
                        <Box key={emotion} sx={{ mb: 0.5 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.2 }}>
                            <Typography variant="caption" sx={{ fontSize: "0.6rem", textTransform: "capitalize" }}>
                              {emotion}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: "0.6rem", fontFamily: "'JetBrains Mono', monospace" }}>
                              {typeof score === 'number' ? score.toFixed(1) : score}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(typeof score === 'number' ? score : 0, 100)}
                            sx={{
                              height: 2,
                              borderRadius: 1,
                              bgcolor: "rgba(255,255,255,0.05)",
                              "& .MuiLinearProgress-bar": {
                                bgcolor: "#00f0ff",
                                borderRadius: 1,
                              },
                            }}
                          />
                        </Box>
                      ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttackerView;
