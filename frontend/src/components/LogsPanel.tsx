import React, { useEffect, useRef } from "react";
import { Paper, Typography, Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

export interface LogEntry {
  id: number;
  timestamp: string;
  level: "INFO" | "WARN" | "SUCCESS" | "ERROR";
  message: string;
}

interface LogsPanelProps {
  logs: LogEntry[];
  maxHeight?: number;
}

const levelColors: Record<string, string> = {
  INFO: "#00f0ff",
  WARN: "#ffaa00",
  SUCCESS: "#00ff88",
  ERROR: "#ff0040",
};

const levelIcons: Record<string, string> = {
  INFO: "ℹ",
  WARN: "⚠",
  SUCCESS: "✓",
  ERROR: "✗",
};

const LogsPanel: React.FC<LogsPanelProps> = ({ logs, maxHeight = 350 }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
          pb: 1,
          borderBottom: "1px solid rgba(0, 240, 255, 0.1)",
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "#00ff88",
            boxShadow: "0 0 8px rgba(0,255,136,0.6)",
            animation: "neonPulseGreen 2s infinite",
          }}
        />
        <Typography
          variant="subtitle2"
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "#00f0ff",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontSize: "0.75rem",
          }}
        >
          AI Activity Log
        </Typography>
        <Typography
          variant="caption"
          sx={{ ml: "auto", color: "text.secondary", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem" }}
        >
          {logs.length} entries
        </Typography>
      </Box>

      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          maxHeight,
          pr: 0.5,
        }}
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  py: 0.4,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.72rem",
                  lineHeight: 1.6,
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  "&:hover": {
                    bgcolor: "rgba(0, 240, 255, 0.03)",
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{ color: "text.secondary", minWidth: 58, flexShrink: 0, opacity: 0.6 }}
                >
                  {log.timestamp}
                </Box>
                <Box
                  component="span"
                  sx={{
                    color: levelColors[log.level],
                    minWidth: 20,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {levelIcons[log.level]}
                </Box>
                <Box
                  component="span"
                  sx={{
                    color: levelColors[log.level],
                    fontWeight: 600,
                    minWidth: 60,
                    flexShrink: 0,
                    fontSize: "0.68rem",
                  }}
                >
                  [{log.level}]
                </Box>
                <Box component="span" sx={{ color: "text.primary", opacity: 0.9 }}>
                  {log.message}
                </Box>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>
    </Paper>
  );
};

export default LogsPanel;
