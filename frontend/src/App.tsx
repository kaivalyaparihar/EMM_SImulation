import React, { useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, BugReport, Info } from "@mui/icons-material";
import theme from "./theme";
import { CameraProvider } from "./context/CameraContext";
import VictimView from "./components/VictimView";
import AttackerView from "./components/AttackerView";

type POV = "victim" | "attacker";

const App: React.FC = () => {
  const [pov, setPov] = useState<POV>("victim");
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CameraProvider>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
          }}
        >
          {/* Disclaimer Banner */}
          {showDisclaimer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <Box className="disclaimer-banner" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                <Shield sx={{ fontSize: 14 }} />
                <span>
                  ⚠ ACADEMIC SIMULATION ONLY — No real malware, keylogging, or unauthorized surveillance. All attacks are simulated.
                </span>
                <IconButton
                  size="small"
                  onClick={() => setShowDisclaimer(false)}
                  sx={{ color: "inherit", ml: 1, p: 0.5 }}
                >
                  ✕
                </IconButton>
              </Box>
            </motion.div>
          )}

          {/* Top Navigation Bar */}
          <Box
            sx={{
              px: 3,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(0, 240, 255, 0.08)",
              bgcolor: "rgba(10, 14, 23, 0.9)",
              backdropFilter: "blur(12px)",
              position: "sticky",
              top: 0,
              zIndex: 100,
            }}
          >
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <BugReport
                  sx={{
                    fontSize: 28,
                    color: "#ff0040",
                    filter: "drop-shadow(0 0 8px rgba(255, 0, 64, 0.5))",
                  }}
                />
              </motion.div>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    letterSpacing: "0.08em",
                    background: "linear-gradient(135deg, #ff0040, #ff0080)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1,
                  }}
                >
                  EMM
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.6rem",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.12em",
                  }}
                >
                  EMOTIONALLY MANIPULATIVE MALWARE
                </Typography>
              </Box>
            </Box>

            {/* POV Toggle */}
            <Box
              sx={{
                position: "relative",
                display: "flex",
                borderRadius: "999px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                bgcolor: "rgba(255, 255, 255, 0.03)",
              }}
            >
              {/* Animated background slider */}
              <motion.div
                style={{
                  position: "absolute",
                  top: 2,
                  bottom: 2,
                  width: "calc(50% - 2px)",
                  borderRadius: "999px",
                  zIndex: 0,
                }}
                animate={{
                  left: pov === "victim" ? 2 : "calc(50%)",
                  background:
                    pov === "victim"
                      ? "linear-gradient(135deg, #0066ff, #00bbff)"
                      : "linear-gradient(135deg, #ff0040, #ff0080)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />

              <Box
                component="button"
                onClick={() => setPov("victim")}
                sx={{
                  position: "relative",
                  zIndex: 1,
                  px: 3,
                  py: 1,
                  background: "none",
                  border: "none",
                  color: pov === "victim" ? "#fff" : "text.secondary",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  transition: "color 0.3s",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                }}
              >
                🔵 Victim
              </Box>

              <Box
                component="button"
                onClick={() => setPov("attacker")}
                sx={{
                  position: "relative",
                  zIndex: 1,
                  px: 3,
                  py: 1,
                  background: "none",
                  border: "none",
                  color: pov === "attacker" ? "#fff" : "text.secondary",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  transition: "color 0.3s",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                }}
              >
                🔴 Attacker
              </Box>
            </Box>

            {/* Info */}
            <Tooltip title="Academic project — Simulation only" arrow>
              <IconButton size="small" sx={{ color: "text.secondary" }}>
                <Info />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <AnimatePresence mode="wait">
              {pov === "victim" ? (
                <motion.div
                  key="victim"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.3 }}
                  style={{ height: "100%" }}
                >
                  <VictimView />
                </motion.div>
              ) : (
                <motion.div
                  key="attacker"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  style={{ height: "100%" }}
                >
                  <AttackerView />
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </CameraProvider>
    </ThemeProvider>
  );
};

export default App;
