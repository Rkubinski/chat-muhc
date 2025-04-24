import { Box, TextField, IconButton, CircularProgress } from "@mui/material";
import { Send } from "lucide-react";
import { useState, KeyboardEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatBoxProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  hasMessages: boolean;
}

export default function ChatBox({
  onSendMessage,
  isLoading = false,
  hasMessages = false,
}: ChatBoxProps) {
  const [message, setMessage] = useState<string>("");

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
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
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <TextField
          fullWidth
          placeholder="Type your message..."
          variant="outlined"
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          multiline
          maxRows={3}
          disabled={isLoading}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "white",
              pr: 0,
              borderRadius: 4,
              boxShadow: 2,
              "& fieldset": {
                paddingRight: "56px",
                borderColor: "#e5e7eb",
              },
              "&:hover fieldset": {
                borderColor: "#e5e7eb !important",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#e5e7eb !important",
                borderWidth: "1px !important",
              },
              "&.Mui-disabled": {
                color: "rgba(0, 0, 0, 0.7)",
                backgroundColor: "#f5f5f5",
                "& fieldset": {
                  border: "none",
                },
              },
            },
            "& .MuiOutlinedInput-root.Mui-focused": {
              boxShadow: 2,
            },
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "rgba(0, 0, 0, 0.7)",
            },
          }}
          InputProps={{
            endAdornment: (
              <IconButton
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                sx={{
                  height: 48,
                  width: 48,
                  backgroundColor: "transparent !important",
                  color: message.trim() ? "#3b5ebe" : "#9ca3af",
                  "&:hover": {
                    color: message.trim() ? "#1e3a8a" : "#9ca3af",
                    transition: "color 0.3s ease",
                    backgroundColor: "transparent !important",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "transparent !important",
                    color: "#9ca3af",
                  },
                  position: "absolute",
                  right: 4,
                  borderRadius: 1.5,
                }}
              >
                {isLoading ? (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: "#3b5ebe86",
                    }}
                  />
                ) : (
                  <Send size={20} />
                )}
              </IconButton>
            ),
          }}
        />
      </Box>
    </Box>
  );
}
