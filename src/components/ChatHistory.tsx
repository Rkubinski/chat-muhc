import { Box, Typography, Avatar, Chip, Button } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import DischargeSummaryComparisonDialog from "./DischargeSummaryComparisonDialog";
import { CompareArrows, BarChart } from "@mui/icons-material";
import ChartRenderer, { ChartData } from "./ChartRenderer";

interface Message {
  text: string;
  timestamp: Date;
  isUser?: boolean;
  formattedHtml?: string;
  queryType?: string;
  patientId?: string | null;
  sql?: string;
  admissionId?: string | null;
  chartData?: ChartData;
  needsGraph?: boolean;
}

interface ChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatHistory({ messages, isLoading }: ChatHistoryProps) {
  const [showThinkingIndicator, setShowThinkingIndicator] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  console.log("Showing thinking indicator", showThinkingIndicator);

  // Function to get chip color based on query type
  const getQueryTypeColor = (type: string): string => {
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

  // Handle opening the comparison dialog
  const handleOpenComparisonDialog = (message: Message) => {
    setSelectedMessage(message);
    setComparisonDialogOpen(true);
  };

  // Handle closing the comparison dialog
  const handleCloseComparisonDialog = () => {
    setComparisonDialogOpen(false);
    setSelectedMessage(null);
  };

  // Extract admission ID from SQL query if available
  const extractAdmissionId = (sql?: string): string | undefined => {
    if (!sql) return undefined;

    // Look for admission_id or hadm_id in the SQL query
    const admissionMatch = sql.match(
      /(?:admission_id|hadm_id)\s*=\s*['"]?(\d+)['"]?/i
    );

    if (admissionMatch && admissionMatch[1]) {
      return admissionMatch[1];
    }

    return undefined;
  };

  useEffect(() => {
    console.log("isLoading", isLoading);

    // Clear any existing timeout to prevent stale updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        setShowThinkingIndicator(true);
      }, 500);
    } else {
      console.log("Setting showThinkingIndicator to false");
      setShowThinkingIndicator(false);
    }

    // Cleanup function to clear timeout when component unmounts or effect reruns
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        flexGrow: 1,
        overflowY: "hidden",
      }}
    >
      <Box
        sx={{
          width: "900px",
          maxHeight: "650px",
          margin: "0 auto",
          mb: 2,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflowY: "auto",
          pb: "50px", // Space for the chatbox
          pr: "10px",
          // Custom scrollbar styling to remove arrows
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#555",
          },
          // Hide default scrollbar buttons/arrows
          "&::-webkit-scrollbar-button": {
            display: "none",
          },
          // For Firefox
          scrollbarWidth: "thin",
          scrollbarColor: "#888 #f1f1f1",
        }}
      >
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  mb: 2,
                  gap: 2,
                  flexDirection: "row",
                  pr: "50px",
                  justifyContent: message.isUser ? "flex-end" : "flex-start",
                }}
              >
                {message.isUser ? (
                  <Avatar
                    sx={{
                      bgcolor: "#3b5ebe",
                      width: 40,
                      height: 40,
                      fontSize: "1rem",
                      order: message.isUser ? 1 : 0,
                    }}
                  >
                    A
                  </Avatar>
                ) : (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f0f5ff",
                      order: 0,
                    }}
                  >
                    <Image
                      src="/media/muhc.png"
                      alt="MUHC Logo"
                      width={26}
                      height={30}
                    />
                  </Box>
                )}
                <Box
                  sx={{
                    maxWidth: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: message.isUser ? "flex-end" : "flex-start",
                    order: message.isUser ? 0 : 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: message.isUser
                        ? "flex-end"
                        : "flex-start",
                      width: "100%",
                      mb: 0.5,
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        textAlign: message.isUser ? "right" : "left",
                      }}
                    >
                      {message.isUser ? "Administrator" : "Chat MUHC"}
                    </Typography>

                    {/* Query Type Badge */}
                    {message.queryType && (
                      <Chip
                        label={getQueryTypeLabel(message.queryType)}
                        size="small"
                        sx={{
                          backgroundColor: getQueryTypeColor(message.queryType),
                          fontSize: "0.65rem",
                          height: "20px",
                          fontWeight: "medium",
                          order: message.isUser ? 0 : 1,
                        }}
                      />
                    )}

                    {/* Graph Visualization Badge */}
                    {message.needsGraph && (
                      <Chip
                        icon={<BarChart sx={{ fontSize: 14 }} />}
                        label="Graph"
                        size="small"
                        sx={{
                          backgroundColor: "#c8e6c9",
                          color: "#2e7d32",
                          fontSize: "0.65rem",
                          height: "20px",
                          fontWeight: "medium",
                          order: message.isUser ? 0 : 1,
                        }}
                      />
                    )}
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      maxWidth: "100%",
                      width: message.isUser ? "auto" : "100%",
                      backgroundColor: message.isUser ? "#f0f5ff" : "#f5f5f5",
                      boxShadow: 1,
                      overflowX: "auto",
                      whiteSpace: message.isUser ? "pre-wrap" : "normal",
                      position: "relative",
                    }}
                  >
                    {message.isUser ? (
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: "0.95rem",
                          color: "#333",
                          lineHeight: 1.6,
                        }}
                      >
                        {message.text}
                      </Typography>
                    ) : message.formattedHtml ? (
                      <>
                        <Box
                          sx={{
                            fontSize: "0.95rem",
                            color: "#333",
                            lineHeight: 1.6,
                            width: "100%",
                            "& ul": {
                              paddingLeft: "20px",
                              margin: "10px 0",
                            },
                            "& li": {
                              marginBottom: "4px",
                            },
                            "& table": {
                              width: "100%",
                              borderCollapse: "collapse",
                              marginBottom: "10px",
                            },
                            "& th, & td": {
                              border: "1px solid #ddd",
                              padding: "8px",
                              textAlign: "left",
                            },
                            "& th": {
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                          dangerouslySetInnerHTML={{
                            __html: message.formattedHtml,
                          }}
                        />

                        {/* Render chart if available */}
                        {message.chartData && (
                          <Box sx={{ mt: 3, width: "100%" }}>
                            <ChartRenderer chartData={message.chartData} />
                          </Box>
                        )}

                        {message.queryType === "discharge_summary" &&
                          message.admissionId && (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                mt: 2,
                              }}
                            >
                              <Button
                                startIcon={<CompareArrows />}
                                size="small"
                                variant="outlined"
                                onClick={() =>
                                  handleOpenComparisonDialog(message)
                                }
                                sx={{
                                  borderColor: "#3b5ebe",
                                  color: "#3b5ebe",
                                  textTransform: "none",
                                  "&:hover": {
                                    backgroundColor: "#f0f5ff",
                                    borderColor: "#1e3a8a",
                                  },
                                }}
                              >
                                Compare to Previous
                              </Button>
                            </Box>
                          )}
                      </>
                    ) : (
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: "0.95rem",
                          color: "#333",
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {message.text}

                        {/* Render chart if available even without formatted HTML */}
                        {message.chartData && (
                          <Box sx={{ mt: 3, width: "100%" }}>
                            <ChartRenderer chartData={message.chartData} />
                          </Box>
                        )}
                      </Typography>
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#6b7280",
                      mt: 0.5,
                      ml: message.isUser ? "auto" : 0,
                      mr: message.isUser ? 0 : "auto",
                    }}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Thinking indicator */}
        <AnimatePresence>
          {showThinkingIndicator && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  mb: 2,
                  gap: 2,
                  flexDirection: "row",
                  justifyContent: "flex-start",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f0f5ff",
                    order: 0,
                  }}
                >
                  <Image
                    src="/media/muhc.png"
                    alt="MUHC Logo"
                    width={26}
                    height={30}
                  />
                </Box>

                <Box
                  sx={{
                    maxWidth: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    order: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ ml: 1, color: "#333", fontWeight: 900 }}
                  >
                    Chat MUHC
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      maxWidth: "600px",
                      backgroundColor: "#f5f5f5",
                      boxShadow: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div className="thinking-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <Typography variant="body2" sx={{ ml: 1, color: "#666" }}>
                        Thinking...
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Discharge Summary Comparison Dialog */}
      {selectedMessage && (
        <DischargeSummaryComparisonDialog
          open={comparisonDialogOpen}
          onClose={handleCloseComparisonDialog}
          patientId={selectedMessage.patientId || ""}
          admissionId={selectedMessage.admissionId || ""}
          generatedSummary={selectedMessage.formattedHtml || ""}
        />
      )}
    </motion.div>
  );
}
