import {
  Box,
  TextField,
  IconButton,
  CircularProgress,
  Chip,
  Typography,
  Tooltip,
  Button,
} from "@mui/material";
import { Send, UserCircle, BarChart, RefreshCw } from "lucide-react";
import { useState, KeyboardEvent, ChangeEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatBoxProps {
  onSendMessage: (
    message: string,
    queryType?: string,
    needsGraph?: boolean
  ) => void;
  onNewQuery?: () => void;
  isLoading?: boolean;
  hasMessages: boolean;
  currentPatientId?: string | null;
  graphModeEnabled?: boolean;
  onGraphModeToggle?: (enabled: boolean) => void;
}

export default function ChatBox({
  onSendMessage,
  onNewQuery,
  isLoading = false,
  hasMessages = false,
  currentPatientId = null,
  graphModeEnabled = false,
  onGraphModeToggle,
}: ChatBoxProps) {
  const [message, setMessage] = useState<string>("");
  const [queryType, setQueryType] = useState<string | null>(null);
  const [needsGraph, setNeedsGraph] = useState<boolean>(false);
  const [graphToggle, setGraphToggle] = useState<boolean>(graphModeEnabled);
  const [detectingType, setDetectingType] = useState<boolean>(false);
  const [detectingGraph, setDetectingGraph] = useState<boolean>(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [detectedSubjectId, setDetectedSubjectId] = useState<string | null>(
    null
  );
  const [detectingSubjectId, setDetectingSubjectId] = useState<boolean>(false);

  // Sync with parent component's graph mode state
  useEffect(() => {
    setGraphToggle(graphModeEnabled);
  }, [graphModeEnabled]);

  // Reset query type when message changes and set up detection after typing pauses
  useEffect(() => {
    // If message is empty, reset query type and detected subject ID
    if (message.trim() === "") {
      setQueryType(null);
      setDetectedSubjectId(null);
      // Don't reset needsGraph if the toggle is on
      if (!graphToggle) {
        setNeedsGraph(false);
      }
      return;
    }

    // Clear previous timeout if it exists
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Only detect query type and subject ID if message is long enough
    if (message.trim().length >= 10) {
      const timeout = setTimeout(() => {
        // Run all detections in parallel
        detectQueryType(message);
        detectSubjectId(message);
        // Only detect graph from text if toggle is off
        if (!graphToggle) {
          detectGraphRequest(message);
        }
      }, 800); // Wait 800ms after user stops typing

      setTypingTimeout(timeout);
    }

    // Clean up timeout on unmount
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [message, graphToggle]);

  // Update needsGraph when graphToggle changes
  useEffect(() => {
    setNeedsGraph(graphToggle);
    // Notify parent component of graph mode change
    if (onGraphModeToggle) {
      onGraphModeToggle(graphToggle);
    }
  }, [graphToggle, onGraphModeToggle]);

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
    // Don't reset query type on every change - we'll handle that in the useEffect
  };

  const handleGraphToggle = () => {
    setGraphToggle(!graphToggle);
  };

  const detectQueryType = async (query: string): Promise<string | null> => {
    if (!query.trim() || query.trim().length < 15) return null;

    try {
      setDetectingType(true);
      const response = await fetch("/api/query_type_detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        console.error("Error detecting query type:", response.statusText);
        return null;
      }

      const data = await response.json();
      setQueryType(data.queryType);
      return data.queryType;
    } catch (error) {
      console.error("Error detecting query type:", error);
      return null;
    } finally {
      setDetectingType(false);
    }
  };

  // New function to detect if a query requires a graph
  const detectGraphRequest = async (query: string): Promise<boolean> => {
    if (!query.trim() || query.trim().length < 10) return false;

    // Regular expression patterns that might indicate a graph request
    const graphKeywords =
      /\b(graph|chart|plot|visualize|visualization|trend|compare|comparison|distribution|histogram|pie chart|bar chart|line chart)\b/i;

    // Check for graph keywords in the query
    if (graphKeywords.test(query)) {
      setNeedsGraph(true);
      setDetectingGraph(true);

      try {
        // Optional: You could also call an API endpoint for more sophisticated detection
        // const response = await fetch("/api/detect-graph-need", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ query }),
        // });
        //
        // if (response.ok) {
        //   const data = await response.json();
        //   setNeedsGraph(data.needsGraph);
        //   return data.needsGraph;
        // }

        return true;
      } catch (error) {
        console.error("Error detecting graph need:", error);
        return false;
      } finally {
        setDetectingGraph(false);
      }
    }

    setNeedsGraph(false);
    return false;
  };

  // New function to detect subject IDs using our API
  const detectSubjectId = async (query: string): Promise<string | null> => {
    if (!query.trim() || query.trim().length < 10) return null;

    try {
      setDetectingSubjectId(true);
      const response = await fetch("/api/detect-subject-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        console.error("Error detecting subject ID:", response.statusText);
        return null;
      }

      const data = await response.json();

      if (data.subjectId) {
        console.log("Detected subject ID:", data.subjectId);
        setDetectedSubjectId(data.subjectId);
        return data.subjectId;
      }

      return null;
    } catch (error) {
      console.error("Error detecting subject ID:", error);
      return null;
    } finally {
      setDetectingSubjectId(false);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      // First detect the query type if not already detected
      const detectedType = queryType || (await detectQueryType(message));

      // Detect if it needs a graph if not already detected and toggle is off
      if (!needsGraph && !graphToggle) {
        await detectGraphRequest(message);
      }

      // The graph toggle takes precedence over detected graph needs
      const finalNeedsGraph = graphToggle || needsGraph;

      // Then send the message with the detected query type and graph flag
      onSendMessage(message, detectedType || undefined, finalNeedsGraph);
      setMessage("");
      setQueryType(null);

      // Keep graphToggle state as is, but reset the auto-detected needsGraph if toggle is off
      if (!graphToggle) {
        setNeedsGraph(false);
      }

      // Keep the detected subject ID so it's visible for the next message
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Function to get chip color based on query type
  const getChipColor = (type: string): string => {
    switch (type) {
      case "discharge_summary":
        return "#e6b8af";
      case "lab_results":
        return "#b6d7a8";
      case "demographics":
        return "#9fc5e8";
      case "administrative":
        return "#d5a6bd";
      case "procedures":
        return "#ffe599";
      default:
        return "#d9d2e9";
    }
  };

  // Function to get display label for query type
  const getQueryTypeLabel = (type: string): string => {
    return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Box
      sx={{
        width: "40%",
        margin: "0 auto",
        borderRadius: "8px",
        overflow: "visible",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {queryType && (
            <Chip
              label={getQueryTypeLabel(queryType)}
              size="small"
              sx={{
                backgroundColor: getChipColor(queryType),
                fontWeight: "medium",
                fontSize: "0.75rem",
              }}
            />
          )}

          {/* Display graph chip if needed */}
          {(needsGraph || graphToggle) && (
            <Chip
              icon={<BarChart size={16} />}
              label={graphToggle ? "Graph Mode Enabled" : "Graph Visualization"}
              size="small"
              sx={{
                backgroundColor: graphToggle ? "#2196f3" : "#c8e6c9",
                fontWeight: "medium",
                fontSize: "0.75rem",
                color: graphToggle ? "white" : "#2e7d32",
                boxShadow: graphToggle
                  ? "0 2px 4px rgba(33, 150, 243, 0.3)"
                  : "none",
                border: graphToggle ? "none" : "1px solid #a5d6a7",
              }}
            />
          )}

          {/* Display detected subject ID if available */}
          {detectedSubjectId && detectedSubjectId !== currentPatientId && (
            <Chip
              icon={<UserCircle size={16} />}
              label={`Detected Patient: ${detectedSubjectId}`}
              size="small"
              sx={{
                backgroundColor: "#f0f4ff",
                borderColor: "#3b5ebe",
                border: "1px solid",
                fontWeight: "medium",
                fontSize: "0.75rem",
                color: "#3b5ebe",
              }}
            />
          )}

          {/* Show current patient ID context */}
          {currentPatientId && (
            <Chip
              icon={<UserCircle size={16} />}
              label={`Current Patient: ${currentPatientId}`}
              size="small"
              sx={{
                backgroundColor: "#073660",
                color: "white",
                fontWeight: "medium",
                fontSize: "0.75rem",
              }}
            />
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* New Query button - only show when there are messages */}
          {hasMessages && onNewQuery && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshCw size={16} />}
              onClick={onNewQuery}
              disabled={isLoading}
              sx={{
                borderColor: isLoading ? "#e0e0e0" : "#073660",
                color: isLoading ? "#a0a0a0" : "#073660",
                backgroundColor: "white",
                fontSize: "0.75rem",
                fontWeight: "medium",
                "&:hover": {
                  backgroundColor: "#f5f9ff",
                  borderColor: "#042f50",
                },
                height: "28px",
                textTransform: "none",
                marginRight: 1,
              }}
            >
              New Query
            </Button>
          )}

          {/* Loading indicator for subject ID detection */}
          {detectingSubjectId && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CircularProgress size={16} sx={{ color: "#3b5ebe", mr: 1 }} />
              <Typography variant="caption" sx={{ color: "#3b5ebe" }}>
                Detecting patient ID...
              </Typography>
            </Box>
          )}

          {/* Loading indicator for graph detection */}
          {detectingGraph && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CircularProgress size={16} sx={{ color: "#2e7d32", mr: 1 }} />
              <Typography variant="caption" sx={{ color: "#2e7d32" }}>
                Analyzing visualization needs...
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={
            hasMessages
              ? "Ask a follow-up question..."
              : "What would you like to know about the hospital data?"
          }
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          multiline
          maxRows={4}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "30px",
              backgroundColor: "white",
              paddingRight: "14px",
              boxShadow: "0 5px 10px 1px rgba(0, 0, 0, 0.316)",
              "& fieldset": {
                border: "1px solid transparent",
              },
              "&:hover fieldset": {
                border: "1px solid transparent",
              },
              "&.Mui-focused fieldset": {
                border: "1px solid transparent",
                borderWidth: "1px",
              },
            },
          }}
        />

        {/* Graph toggle button */}
        <Tooltip
          title={
            graphToggle
              ? "Graph visualization enabled"
              : "Enable graph visualization"
          }
        >
          <IconButton
            onClick={handleGraphToggle}
            disabled={isLoading}
            sx={{
              ml: 1,
              backgroundColor: graphToggle ? "#2196f3" : "#f5f5f5",
              color: graphToggle ? "white" : "#666",
              boxShadow: graphToggle
                ? "0 4px 8px rgba(33, 150, 243, 0.4)"
                : "0 2px 5px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: graphToggle ? "scale(1.05)" : "scale(1)",
              "&:hover": {
                backgroundColor: graphToggle ? "#1976d2" : "#e0e0e0",
                transform: "scale(1.1)",
              },
              "&.Mui-disabled": {
                backgroundColor: "#e0e0e0",
                color: "#a0a0a0",
                transform: "scale(1)",
                boxShadow: "none",
              },
              width: 42,
              height: 42,
              "&::after": graphToggle
                ? {
                    content: '""',
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    backgroundColor: "#4caf50",
                    borderRadius: "50%",
                    border: "1px solid white",
                  }
                : {},
            }}
          >
            <BarChart size={20} />
          </IconButton>
        </Tooltip>

        <IconButton
          onClick={handleSendMessage}
          disabled={!message.trim() || isLoading}
          sx={{
            ml: 1,
            backgroundColor: "#0a466d",
            color: "white",
            boxShadow: "0 5px 10px 1px rgba(0, 0, 0, 0.316)",
            "&:hover": {
              backgroundColor: "#073660",
            },
            "&.Mui-disabled": {
              backgroundColor: "#e0e0e0",
              color: "#a0a0a0",
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} sx={{ color: "inherit" }} />
          ) : (
            <Send size={20} />
          )}
        </IconButton>
      </Box>
    </Box>
  );
}
