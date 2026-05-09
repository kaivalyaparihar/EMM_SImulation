import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";

interface PipelineProps {
  activeStep: number; // 0-3
}

const STEPS = [
  {
    label: "RECON",
    icon: "🔍",
    description: "Scanning target",
    color: "#00f0ff",
  },
  {
    label: "ANALYSIS",
    icon: "🧠",
    description: "Processing emotions",
    color: "#a855f7",
  },
  {
    label: "EXPLOIT",
    icon: "⚡",
    description: "Generating payload",
    color: "#ff0040",
  },
  {
    label: "EXFILTRATE",
    icon: "📤",
    description: "Data extraction",
    color: "#00ff88",
  },
];

const Pipeline: React.FC<PipelineProps> = ({ activeStep }) => {
  return (
    <Paper sx={{ p: 2, height: "100%" }}>
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
        Attack Pipeline
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          px: 1,
        }}
      >
        {/* Connection line */}
        <Box
          sx={{
            position: "absolute",
            top: "32px",
            left: "40px",
            right: "40px",
            height: 2,
            bgcolor: "rgba(255,255,255,0.06)",
            zIndex: 0,
          }}
        >
          <motion.div
            style={{
              height: "100%",
              background:
                "linear-gradient(90deg, #00f0ff, #a855f7, #ff0040, #00ff88)",
              borderRadius: 2,
              originX: 0,
            }}
            animate={{
              scaleX: activeStep >= 0 ? (activeStep + 1) / STEPS.length : 0,
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </Box>

        {STEPS.map((step, index) => {
          const isActive = index <= activeStep;
          const isCurrent = index === activeStep;

          return (
            <Box
              key={step.label}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
                flex: 1,
              }}
            >
              <motion.div
                animate={{
                  scale: isCurrent ? [1, 1.15, 1] : 1,
                }}
                transition={{
                  duration: 1.5,
                  repeat: isCurrent ? Infinity : 0,
                  ease: "easeInOut",
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    border: `2px solid ${isActive ? step.color : "rgba(255,255,255,0.1)"}`,
                    bgcolor: isActive
                      ? `${step.color}15`
                      : "rgba(255,255,255,0.02)",
                    boxShadow: isCurrent
                      ? `0 0 20px ${step.color}40, 0 0 40px ${step.color}20`
                      : "none",
                    transition: "all 0.4s ease",
                  }}
                >
                  {step.icon}
                </Box>
              </motion.div>

              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.08em",
                  color: isActive ? step.color : "text.secondary",
                  transition: "color 0.3s",
                }}
              >
                {step.label}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.6rem",
                  color: isActive ? "text.secondary" : "rgba(255,255,255,0.2)",
                  transition: "color 0.3s",
                }}
              >
                {step.description}
              </Typography>

              {isCurrent && (
                <motion.div
                  style={{
                    position: "absolute",
                    top: 0,
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    border: `2px solid ${step.color}`,
                  }}
                  animate={{
                    scale: [1, 1.6],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default Pipeline;
