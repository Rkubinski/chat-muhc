import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Container,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useState } from "react";
import Image from "next/image";
import ChatBox from "../components/ChatBox";
import ChatHistory from "../components/ChatHistory";
import SuggestedQueries from "../components/SuggestedQueries";
import Logo from "@/components/Logo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface Message {
  text: string;
  timestamp: Date;
  isUser?: boolean;
  sql?: string; // Add SQL query field for AI-generated queries
  formattedHtml?: string; // Add formatted HTML field for AI-enhanced responses
}

export default function Home() {
  const [role, setRole] = useState<string>("administrator");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [useAI, setUseAI] = useState<boolean>(true); // Default to using AI

  const handleRoleChange = (
    _: React.MouseEvent<HTMLElement>,
    newRole: string
  ) => {
    if (newRole !== null) {
      setRole(newRole);
    }
  };

  const handleAIToggle = () => {
    setUseAI(!useAI);
  };

  const handleQuerySelected = (query: string) => {
    // When a query chip is clicked, handle it as if the user typed and sent it
    handleSendMessage(query);
  };

  const handleSendMessage = async (message: string) => {
    console.log(`Message sent (as ${role}):`, message);

    // Set loading state to true
    setIsLoading(true);

    // Add the new message to the messages array
    const newMessage: Message = {
      text: message,
      timestamp: new Date(),
      isUser: true,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    try {
      let data;
      let sql = "";
      let responseJson: any = null;

      if (useAI) {
        // Use the AI-powered SQL query endpoint
        const response = await fetch("/api/query-with-ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: message }),
        });

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        responseJson = await response.json();
        data = responseJson.data;
        sql = responseJson.sql;

        console.log("AI-Generated SQL:", sql);
        console.log("API Response:", data);
        console.log("Formatted HTML:", responseJson.formattedHtml);
      } else {
        // Use the original direct query approach
        // Parse the message for commands
        let queryParams = "";

        if (
          message.toLowerCase().startsWith("show") ||
          message.toLowerCase().startsWith("get")
        ) {
          // Example: "show patients" or "get treatments"
          const parts = message.split(" ");
          if (parts.length >= 2) {
            const tableName = parts[1].trim().toLowerCase();
            queryParams = `?table=${tableName}`;
          }
        } else if (message.toLowerCase().includes("table")) {
          // Example: "query the patients table"
          const tableMatch = message.match(/\b(\w+)\s+table\b/i);
          if (tableMatch && tableMatch[1]) {
            queryParams = `?table=${tableMatch[1].toLowerCase()}`;
          }
        } else {
          // Default to patients table
          queryParams = "?table=patients";
        }

        // Send the message to the /api/query.js endpoint with extracted params
        const response = await fetch(`/api/query${queryParams}`);

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        data = await response.json();
        console.log("API Response:", data);
      }

      // Format the response message based on data
      let responseText = "";

      if (data.length === 0) {
        responseText = "No records found for your query.";
      } else {
        responseText = `Found ${data.length} records. Here's a sample:`;

        // Add sample data (first 3 items)
        const sample = data.slice(0, 3);
        const keys = Object.keys(sample[0]);

        // Format as a list of key-value pairs for the first few records
        sample.forEach((item: Record<string, any>, index: number) => {
          responseText += `\n\nRecord ${index + 1}:`;
          keys.forEach((key) => {
            responseText += `\n- ${key}: ${item[key]}`;
          });
        });

        if (data.length > 3) {
          responseText += "\n\n...and more records available.";
        }
      }

      // Add SQL query info if AI was used
      if (useAI && sql) {
        responseText += "\n\nSQL Query Used:\n```sql\n" + sql + "\n```";
      }

      // Add a system message with the API response
      const systemMessage: Message = {
        text: responseText,
        timestamp: new Date(),
        isUser: false,
        sql: sql, // Store the SQL query if it exists
        formattedHtml:
          useAI && responseJson?.formattedHtml
            ? responseJson.formattedHtml
            : undefined, // Include formatted HTML if available
      };

      setMessages((prevMessages) => [...prevMessages, systemMessage]);
    } catch (error) {
      console.error("Error querying API:", error);

      // Add an error message
      const errorMessage: Message = {
        text: `Error: Unable to query the database. ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        timestamp: new Date(),
        isUser: false,
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      console.log("Setting loading state to false");
      // Set loading state to false after API call completes
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Chat MUHC</title>
        <meta name="description" content="Chat with hospital data" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          }}
        >
          <AppBar
            position="static"
            elevation={0}
            sx={{
              backgroundColor: "white",
              color: "black",
              borderBottom: "1px solid #eaeaea",
            }}
          >
            <Toolbar
              sx={{
                justifyContent: "space-between",
                background: `linear-gradient(to right, #073660 20%,  #e6f2ff 80%)`,
                boxShadow: 6,
              }}
            >
              {/* Logo */}
              <Logo />
            </Toolbar>
          </AppBar>

          <Box sx={{ paddingY: 4, height: "100%" }}>
            {/* Show chat history when there are messages */}
            {messages.length > 0 && (
              <ChatHistory isLoading={isLoading} messages={messages} />
            )}

            {/* Only show SuggestedQueries when there are no messages */}
            {messages.length === 0 && (
              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  flexGrow: 1,
                  marginTop: 20,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#e6f2ff",
                    border: "1px solid #1e3a8a",
                    borderRadius: "50%",
                    width: "75px",
                    height: "75px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "45px",
                      color: "#1e3a8a",
                    }}
                  >
                    C
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  mt={2}
                  sx={{
                    fontSize: "25px",
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#444",
                  }}
                >
                  Chat MUHC
                </Typography>
                <Typography
                  sx={{ width: 400, textAlign: "center", color: "#666" }}
                >
                  I can help you manage hospital operations, analyze patient
                  data, and optimize resource allocation. Ask me anything.
                </Typography>
                <SuggestedQueries
                  role={role}
                  onQuerySelected={handleQuerySelected}
                  isLoading={isLoading}
                />
              </Box>
            )}
          </Box>

          <Box
            sx={{
              borderTop: "1px solid #eaeaea",
              backgroundColor: "#e9f2ff",
              padding: "16px 0",
              width: "100%",
            }}
          >
            <ChatBox
              onSendMessage={handleSendMessage}
              hasMessages={messages.length > 0}
              isLoading={isLoading}
            />
          </Box>
        </Box>
      </div>
    </>
  );
}
