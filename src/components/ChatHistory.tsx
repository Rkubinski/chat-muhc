import { Box, Typography, Avatar } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

interface Message {
  text: string;
  timestamp: Date;
  isUser?: boolean;
  formattedHtml?: string;
}

interface ChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatHistory({ messages, isLoading }: ChatHistoryProps) {
  const [showThinkingIndicator, setShowThinkingIndicator] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  console.log("Showing thinking indicator", showThinkingIndicator);

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
          width: "1000px",
          maxHeight: "700px",
          margin: "0 auto",
          mb: 2,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflowY: "auto",
          pb: "100px", // Space for the chatbox
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
                  flexDirection: message.isUser ? "row" : "row-reverse",
                  justifyContent: message.isUser ? "flex-start" : "flex-end",
                }}
              >
                {message.isUser ? (
                  <Avatar
                    sx={{
                      bgcolor: "#3b5ebe",
                      width: 40,
                      height: 40,
                      fontSize: "1rem",
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
                    alignItems: message.isUser ? "flex-start" : "flex-end",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      textAlign: message.isUser ? "left" : "right",
                    }}
                  >
                    {message.isUser ? "Administrator" : "Chat MUHC"}
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: message.isUser ? "#e6f2ff" : "#f3f4f6",
                      borderRadius: message.isUser
                        ? "0px 12px 12px 12px"
                        : "12px 0px 12px 12px",
                      p: 2,
                      maxWidth: message.isUser ? "600px" : "500px",
                    }}
                  >
                    {message.formattedHtml ? (
                      <Typography
                        variant="body1"
                        component="div"
                        sx={{
                          "& li": {
                            marginLeft: "20px",
                          },
                        }}
                        dangerouslySetInnerHTML={{
                          __html: message.formattedHtml,
                        }}
                      />
                    ) : (
                      <Typography variant="body1">{message.text}</Typography>
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#6b7280",
                      mt: 0.5,
                      display: "block",
                      textAlign: message.isUser ? "left" : "right",
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}

          {/* Loading indicator as a chat message */}
          {showThinkingIndicator && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  mb: 2,
                  gap: 2,
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                <Box sx={{ maxWidth: "80%" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      textAlign: "right",
                    }}
                  >
                    Chat MUHC
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: "#e6ffed8b",
                      borderRadius: "12px 0px 12px 12px",
                      p: 2,
                      maxWidth: "600px",
                    }}
                  >
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                    >
                      <Typography variant="body1">Thinking...</Typography>
                    </motion.div>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#6b7280",
                      mt: 0.5,
                      display: "block",
                      textAlign: "right",
                    }}
                  >
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
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
                  }}
                >
                  <Image
                    src="/media/muhc.png"
                    alt="MUHC Logo"
                    width={60}
                    height={60}
                  />
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
}
