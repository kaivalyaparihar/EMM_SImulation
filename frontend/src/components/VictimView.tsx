//frontend/src/components/VictimView.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  CameraAlt,
  Download,
  Security,
  Wifi,
  CheckCircle,
} from "@mui/icons-material";
import { useCamera } from "../context/CameraContext";
import Popup from "./Popup";

const SCENARIOS = [
  { key: "banking", name: "Banking", icon: "🏦", color: "#00f0ff" },
  { key: "interview", name: "Interview", icon: "💼", color: "#a855f7" },
  { key: "exam", name: "Exam", icon: "📝", color: "#ffaa00" },
  { key: "work", name: "Work", icon: "🖥️", color: "#00ff88" },
  { key: "relationship", name: "Relationship", icon: "💬", color: "#ff69b4" },
];

// Fake social messages for infection simulation
const FAKE_MESSAGES = {
  banking: {
    platform: "Email",
    sender: "security@netbanking-alerts.com",
    subject: "Important: Security Certificate Update Required",
    body: "Dear Customer, your banking security certificate has expired. Download the updated certificate to continue secure transactions.",
    file: "Security_Certificate_v3.2.exe",
  },
  interview: {
    platform: "WhatsApp",
    sender: "+1 (555) 0142 — HR Recruiter",
    subject: "",
    body: "Hi! 👋 I'm from TechCorp HR. We've shortlisted you for the Senior Developer role. Please install our interview platform to proceed. Interview slot: Tomorrow 10 AM.",
    file: "TechCorp_Interview_Portal.exe",
  },
  exam: {
    platform: "Email",
    sender: "proctoring@examguard-pro.edu",
    subject: "URGENT: Install Proctor Software Before Exam",
    body: "Your exam starts in 30 minutes. The proctoring software must be installed and running. Failure to install will result in exam disqualification.",
    file: "ExamGuard_Proctor_v2.1.exe",
  },
  work: {
    platform: "Slack",
    sender: "IT-Admin (Company IT)",
    subject: "Mandatory VPN Client Update",
    body: "📢 All employees: A critical VPN vulnerability has been patched. Install the updated client immediately. Deadline: End of day.",
    file: "Corporate_VPN_Update.exe",
  },
  relationship: {
    platform: "Instagram DM",
    sender: "@photo_memories_app",
    subject: "",
    body: "Someone created a photo album with your tagged pictures! 📸 Download our app to view and manage your tagged photos before they go public.",
    file: "PhotoMemories_Setup.exe",
  },
};

type Phase = "scenario" | "message" | "downloading" | "monitoring" | "attack" | "impact";

interface EmotionData {
  emotion: string;
  confidence: number;
  raw_emotion: string;
}

interface AttackData {
  attack_type: string;
  trigger_type: string;
  urgency_level: string;
  popup: {
    title: string;
    message: string;
    button: string;
    secondary: string;
  };
  trigger_delay: number;
}

const API_URL = "http://localhost:8000";

const VictimView: React.FC = () => {
  const [phase, setPhase] = useState<Phase>("scenario");
  const [scenario, setScenario] = useState<string>("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStep, setDownloadStep] = useState(0);
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [attackData, setAttackData] = useState<AttackData | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTimerStarted, setPopupTimerStarted] = useState(false);

  const { startCamera, isActive, captureFrame, stream } = useCamera();
  const videoDisplayRef = useRef<HTMLVideoElement>(null);
  const analysisInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mirror the persistent video stream to the display element
  useEffect(() => {
    if (videoDisplayRef.current && stream) {
      videoDisplayRef.current.srcObject = stream;
    }
  }, [stream, phase]);

  // Select scenario
  const handleScenarioSelect = (key: string) => {
    setScenario(key);
    setPhase("message");
  };

  // Simulate download
  const handleDownload = () => {
    setPhase("downloading");
    setDownloadProgress(0);
    setDownloadStep(0);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    setTimeout(() => setDownloadStep(1), 1500);
    setTimeout(() => setDownloadStep(2), 3000);
    setTimeout(() => {
      setDownloadStep(3);
      clearInterval(interval);
      setDownloadProgress(100);
      setTimeout(() => {
        setPhase("monitoring");
        startCamera();
      }, 1000);
    }, 4000);
  };

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
      // Fallback simulation if backend is down
      const emotions = ["stressed", "relaxed", "neutral"];
      const rawEmotions = ["angry", "happy", "neutral", "sad", "fear"];
      setEmotionData({
        emotion: emotions[Math.floor(Math.random() * emotions.length)],
        confidence: Math.round((0.6 + Math.random() * 0.35) * 100) / 100,
        raw_emotion: rawEmotions[Math.floor(Math.random() * rawEmotions.length)],
      });
    }
  }, [captureFrame, scenario]);

  // Start frame analysis when monitoring
  useEffect(() => {
    if (phase === "monitoring" && isActive) {
      analysisInterval.current = setInterval(analyzeFrame, 2000);
      return () => {
        if (analysisInterval.current) clearInterval(analysisInterval.current);
      };
    }
  }, [phase, isActive, analyzeFrame]);

  // Trigger popup after conditions are met
  useEffect(() => {
    if (phase === "monitoring" && emotionData && attackData && !popupTimerStarted) {
      setPopupTimerStarted(true);
      const delay = (attackData.trigger_delay || 3) * 1000;
      setTimeout(() => {
        setShowPopup(true);
        setPhase("attack");
      }, delay);
    }
  }, [phase, emotionData, attackData, popupTimerStarted]);

  const handlePopupClick = () => {
    setShowPopup(false);
    setPhase("impact");
  };

  // ── Renders ──────────────────────────────────────

  // Scenario Selection
  if (phase === "scenario") {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              mb: 1,
              fontWeight: 700,
              background: "linear-gradient(135deg, #00f0ff, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Select Scenario
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "center", mb: 4, color: "text.secondary" }}>
            Choose a simulated environment to demonstrate emotionally adaptive attacks
          </Typography>

          <Grid container spacing={2} sx={{ justifyContent: "center" }}>
            {SCENARIOS.map((s, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={s.key}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Paper
                    onClick={() => handleScenarioSelect(s.key)}
                    sx={{
                      p: 3,
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        border: `1px solid ${s.color}60`,
                        boxShadow: `0 0 30px ${s.color}20`,
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: "2.5rem", mb: 1 }}>{s.icon}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: s.color }}>
                      {s.name}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>
    );
  }

  // Fake Message
  if (phase === "message") {
    const msg = FAKE_MESSAGES[scenario as keyof typeof FAKE_MESSAGES] || FAKE_MESSAGES.banking;
    return (
      <Box sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <Paper
            sx={{
              p: 0,
              overflow: "hidden",
              border: "1px solid rgba(0, 240, 255, 0.15)",
            }}
          >
            {/* Message header */}
            <Box
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: "rgba(0, 240, 255, 0.05)",
                borderBottom: "1px solid rgba(0, 240, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Chip
                label={msg.platform}
                size="small"
                sx={{
                  bgcolor: "rgba(0, 240, 255, 0.15)",
                  color: "#00f0ff",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                }}
              />
              <Wifi sx={{ fontSize: 14, color: "#00ff88" }} />
              <Security sx={{ fontSize: 14, color: "text.secondary" }} />
            </Box>

            <Box sx={{ p: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.7rem",
                }}
              >
                From: {msg.sender}
              </Typography>

              {msg.subject && (
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1, mb: 1 }}>
                  {msg.subject}
                </Typography>
              )}

              <Typography variant="body2" sx={{ color: "text.secondary", mt: 1, mb: 3, lineHeight: 1.7 }}>
                {msg.body}
              </Typography>

              {/* File attachment */}
              <Paper
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  bgcolor: "rgba(255, 0, 64, 0.05)",
                  border: "1px solid rgba(255, 0, 64, 0.15)",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: "rgba(255, 0, 64, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  📄
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.82rem" }}>
                    {msg.file}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {(Math.random() * 5 + 1).toFixed(1)} MB
                  </Typography>
                </Box>
                <Download sx={{ color: "text.secondary" }} />
              </Paper>

              <Button
                variant="contained"
                color="secondary"
                fullWidth
                startIcon={<Download />}
                onClick={handleDownload}
                sx={{ py: 1.3, fontWeight: 700 }}
              >
                Download File
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  // Download Animation
  if (phase === "downloading") {
    const steps = [
      "Downloading file...",
      "File installed (Simulation)",
      "Initializing background service...",
      "Background service started",
    ];

    return (
      <Box sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Paper sx={{ p: 4 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: "#ff0040",
                textAlign: "center",
              }}
            >
              ⚠️ INFECTION SIMULATION
            </Typography>

            <LinearProgress
              variant="determinate"
              value={downloadProgress}
              sx={{
                mb: 3,
                height: 6,
                borderRadius: 3,
                bgcolor: "rgba(255, 0, 64, 0.1)",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #ff0040, #ff0080)",
                  borderRadius: 3,
                },
              }}
            />

            <Stepper activeStep={downloadStep} orientation="vertical">
              {steps.map((label, index) => (
                <Step key={label} completed={downloadStep > index}>
                  <StepLabel
                    slotProps={{
                      stepIcon: {
                        sx: {
                          color: downloadStep >= index ? "#ff0040" : "text.secondary",
                          "&.Mui-completed": { color: "#00ff88" },
                          "&.Mui-active": { color: "#ff0040" },
                        },
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "0.8rem",
                        color: downloadStep >= index ? "text.primary" : "text.secondary",
                      }}
                    >
                      {label}
                      {downloadStep === index && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          style={{ marginLeft: 4 }}
                        >
                          █
                        </motion.span>
                      )}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  // Monitoring Phase - Camera + Emotion
  if (phase === "monitoring" || phase === "attack") {
    return (
      <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
        <Grid container spacing={3}>
          {/* Camera Feed */}
          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Paper sx={{ p: 2, position: "relative", overflow: "hidden" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <CameraAlt sx={{ fontSize: 16, color: "#ff0040" }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#ff0040",
                      fontWeight: 600,
                    }}
                  >
                    LIVE FEED — CAMERA ACTIVE
                  </Typography>
                  <motion.div
                    animate={{ opacity: [1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#ff0040",
                    }}
                  />
                </Box>

                <Box
                  className="camera-feed"
                  sx={{
                    borderRadius: 1,
                    overflow: "hidden",
                    bgcolor: "#000",
                    height: 360,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                      }}
                    />
                  ) : (
                    <Box sx={{ textAlign: "center" }}>
                      <CameraAlt sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Initializing camera...
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          {/* Emotion Display */}
          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Paper sx={{ p: 3, height: "100%" }}>
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
                  Emotion Analysis
                </Typography>

                {emotionData ? (
                  <Box>
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                      <motion.div
                        key={emotionData.emotion}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10 }}
                      >
                        <Typography sx={{ fontSize: "3.5rem", mb: 1 }}>
                          {emotionData.emotion === "stressed"
                            ? "😰"
                            : emotionData.emotion === "relaxed"
                              ? "😊"
                              : "😐"}
                        </Typography>
                      </motion.div>

                      <Chip
                        label={emotionData.emotion.toUpperCase()}
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          px: 2,
                          color:
                            emotionData.emotion === "stressed"
                              ? "#ff0040"
                              : emotionData.emotion === "relaxed"
                                ? "#00ff88"
                                : "#00f0ff",
                          borderColor:
                            emotionData.emotion === "stressed"
                              ? "#ff0040"
                              : emotionData.emotion === "relaxed"
                                ? "#00ff88"
                                : "#00f0ff",
                          bgcolor:
                            emotionData.emotion === "stressed"
                              ? "rgba(255,0,64,0.1)"
                              : emotionData.emotion === "relaxed"
                                ? "rgba(0,255,136,0.1)"
                                : "rgba(0,240,255,0.1)",
                        }}
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Confidence
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 700,
                            color: "#00f0ff",
                          }}
                        >
                          {Math.round(emotionData.confidence * 100)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={emotionData.confidence * 100}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: "rgba(0,240,255,0.1)",
                          "& .MuiLinearProgress-bar": {
                            background: "linear-gradient(90deg, #00f0ff, #a855f7)",
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "text.secondary",
                        display: "block",
                        mt: 1,
                      }}
                    >
                      Raw: {emotionData.raw_emotion}
                    </Typography>

                    {attackData && (
                      <Box
                        sx={{
                          mt: 2,
                          pt: 2,
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "text.secondary",
                            display: "block",
                            mb: 1,
                          }}
                        >
                          ⚡ Scenario: {scenario.toUpperCase()}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "#ffaa00",
                            display: "block",
                          }}
                        >
                          ⏳ Attack pending...
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Typography sx={{ fontSize: "2rem" }}>🔍</Typography>
                    </motion.div>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Analyzing facial expressions...
                    </Typography>
                  </Box>
                )}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Popup Attack */}
        <Popup
          open={showPopup}
          data={attackData?.popup || null}
          attackType={attackData?.attack_type || "urgency"}
          onPrimaryClick={handlePopupClick}
          onSecondaryClick={handlePopupClick}
        />
      </Box>
    );
  }

  // Impact Screen
  if (phase === "impact") {
    return (
      <AnimatePresence>
        <motion.div
          className="impact-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", damping: 10 }}
          >
            <Typography
              variant="h3"
              sx={{
                color: "#ff0040",
                fontWeight: 700,
                mb: 2,
                textShadow: "0 0 30px rgba(255,0,64,0.5)",
                animation: "neonPulseRed 1s infinite",
                textAlign: "center",
              }}
            >
              🚨 SYSTEM COMPROMISED
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#ffaa00",
                fontWeight: 600,
                mb: 4,
                textAlign: "center",
              }}
            >
              (SIMULATION)
            </Typography>
          </motion.div>

          <Box sx={{ maxWidth: 600, mx: "auto", px: 3 }}>
            {[
              {
                icon: "🔑",
                label: "Credentials Stolen",
                detail: "Login credentials could have been captured via phishing form",
                delay: 0.6,
              },
              {
                icon: "📁",
                label: "Files Could Be Encrypted",
                detail: "Ransomware payload could encrypt all user documents",
                delay: 0.9,
              },
              {
                icon: "📤",
                label: "Data Exfiltration Possible",
                detail: "Sensitive data could be transmitted to attacker's C2 server",
                delay: 1.2,
              },
              {
                icon: "🎥",
                label: "Camera/Mic Compromised",
                detail: "Continuous surveillance through webcam and microphone",
                delay: 1.5,
              },
            ].map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: item.delay, duration: 0.4 }}
              >
                <Paper
                  sx={{
                    p: 2,
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    border: "1px solid rgba(255, 0, 64, 0.2)",
                    bgcolor: "rgba(255, 0, 64, 0.05)",
                  }}
                >
                  <Typography sx={{ fontSize: "1.5rem" }}>{item.icon}</Typography>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: "#ff0040" }}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.detail}
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ ml: "auto", color: "#ff0040" }} />
                </Paper>
              </motion.div>
            ))}

            {/* Ransomware Simulation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
            >
              <Paper
                sx={{
                  p: 3,
                  mt: 3,
                  textAlign: "center",
                  border: "2px solid rgba(255, 0, 64, 0.3)",
                  boxShadow: "0 0 40px rgba(255, 0, 64, 0.2)",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#ff0040", mb: 1 }}
                >
                  🔒 YOUR FILES HAVE BEEN ENCRYPTED
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  (Simulation — No actual encryption occurred)
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "#ffaa00",
                    fontSize: "0.8rem",
                  }}
                >
                  Pay 2.5 BTC to: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    display: "block",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Time remaining: 23:59:47
                </Typography>
              </Paper>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  mt: 3,
                  py: 1.2,
                  borderColor: "#00f0ff",
                  color: "#00f0ff",
                }}
                onClick={() => {
                  setPhase("scenario");
                  setScenario("");
                  setEmotionData(null);
                  setAttackData(null);
                  setShowPopup(false);
                  setPopupTimerStarted(false);
                  setDownloadProgress(0);
                  setDownloadStep(0);
                }}
              >
                🔄 Reset Simulation
              </Button>
            </motion.div>
          </Box>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
};

export default VictimView;
