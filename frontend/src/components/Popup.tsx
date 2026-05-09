//frontend/src/components/Popup.tsx

import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

interface PopupData {
  title: string;
  message: string;
  button: string;
  secondary: string;
}

interface PopupProps {
  open: boolean;
  data: PopupData | null;
  attackType: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

const attackTypeColors: Record<string, { primary: string; glow: string }> = {
  urgency: {
    primary: "#ffaa00",
    glow: "0 0 40px rgba(255, 170, 0, 0.3)",
  },
  fear: {
    primary: "#ff0040",
    glow: "0 0 40px rgba(255, 0, 64, 0.3)",
  },
  reward: {
    primary: "#00ff88",
    glow: "0 0 40px rgba(0, 255, 136, 0.3)",
  },
};

const Popup: React.FC<PopupProps> = ({
  open,
  data,
  attackType,
  onPrimaryClick,
  onSecondaryClick,
}) => {
  if (!data) return null;

  const colors = attackTypeColors[attackType] || attackTypeColors.urgency;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 5000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <Paper
              elevation={24}
              sx={{
                p: 4,
                maxWidth: 460,
                width: "90vw",
                border: `1px solid ${colors.primary}40`,
                boxShadow: colors.glow,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Animated top accent bar */}
              <motion.div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Fake browser chrome */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 2,
                  pb: 1.5,
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#ff5f56",
                  }}
                />
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#ffbd2e",
                  }}
                />
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#27c93f",
                  }}
                />
                <Box
                  sx={{
                    ml: 2,
                    px: 2,
                    py: 0.3,
                    bgcolor: "rgba(255,255,255,0.05)",
                    borderRadius: 1,
                    flex: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.6rem",
                      color: "text.secondary",
                    }}
                  >
                    🔒 secure-alert.system.verify
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: colors.primary,
                  lineHeight: 1.3,
                }}
              >
                {data.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mb: 3,
                  color: "text.secondary",
                  lineHeight: 1.7,
                  fontSize: "0.88rem",
                }}
              >
                {data.message}
              </Typography>

              <Box sx={{ display: "flex", gap: 1.5, flexDirection: "column" }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={onPrimaryClick}
                  sx={{
                    py: 1.2,
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}cc)`,
                    color: "#000",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    boxShadow: colors.glow,
                    "&:hover": {
                      boxShadow: colors.glow.replace("0.3", "0.6"),
                    },
                  }}
                >
                  {data.button}
                </Button>
                <Button
                  variant="text"
                  fullWidth
                  onClick={onSecondaryClick}
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.78rem",
                    "&:hover": { color: "text.primary" },
                  }}
                >
                  {data.secondary}
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Popup;
