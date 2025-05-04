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
import { ChartData } from "@/components/ChartRenderer";

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
  queryType?: string; // Add query type field
  patientId?: string | null; // Add patient ID field, can be null
  admissionId?: string | null; // Add admission ID field
  chartData?: ChartData; // Add chart data field for visualization
  needsGraph?: boolean; // Flag to indicate if the query requires a graph
}

export default function Home() {
  const [role, setRole] = useState<string>("administrator");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [useAI, setUseAI] = useState<boolean>(true); // Default to using AI
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [graphModeEnabled, setGraphModeEnabled] = useState<boolean>(false);

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

  const handleQuerySelected = (query: string, needsGraph?: boolean) => {
    // If needsGraph is explicitly provided, use it, otherwise use the current app state
    const useGraph = needsGraph !== undefined ? needsGraph : graphModeEnabled;

    // When a query chip is clicked, handle it as if the user typed and sent it
    handleSendMessage(query, undefined, useGraph);
  };

  const handleGraphModeToggle = (enabled: boolean) => {
    setGraphModeEnabled(enabled);
  };

  const handleNewQuery = () => {
    // Reset the conversation
    setMessages([]);
    // Reset patient ID
    setCurrentPatientId(null);
    // Keep other settings like graph mode and role the same
  };

  const handleSendMessage = async (
    message: string,
    queryType?: string,
    needsGraph?: boolean
  ) => {
    console.log(`Message sent (as ${role}):`, message);
    console.log(`Query type detected:`, queryType || "unknown");
    console.log(`Needs graph:`, needsGraph || false);

    // Set loading state to true
    setIsLoading(true);

    // Detect query type if not provided (for suggested queries)
    let detectedQueryType = queryType;
    if (!detectedQueryType && message.trim().length >= 15) {
      try {
        const typeResponse = await fetch("/api/query_type_detection", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: message }),
        });

        if (typeResponse.ok) {
          const typeData = await typeResponse.json();
          detectedQueryType = typeData.queryType;
          console.log(
            "Query type detected for suggested query:",
            detectedQueryType
          );
        }
      } catch (error) {
        console.error("Error detecting query type for suggested query:", error);
        // Continue with the query even if query type detection fails
      }
    }

    // First, try to detect subject ID directly from the message
    try {
      const subjectIdResponse = await fetch("/api/detect-subject-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: message }),
      });

      if (subjectIdResponse.ok) {
        const subjectIdData = await subjectIdResponse.json();
        if (subjectIdData.subjectId) {
          console.log(
            "Subject ID detected from message:",
            subjectIdData.subjectId
          );
          setCurrentPatientId(subjectIdData.subjectId);
        }
      }
    } catch (error) {
      console.error("Error detecting subject ID from message:", error);
      // Continue with the query even if subject ID detection fails
    }

    // Add the new message to the messages array
    const newMessage: Message = {
      text: message,
      timestamp: new Date(),
      isUser: true,
      queryType: detectedQueryType, // Store the detected query type
      patientId: currentPatientId, // Add current patient ID for context
      needsGraph: needsGraph, // Store whether the query needs a graph
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
          body: JSON.stringify({
            query: message,
            queryType: detectedQueryType, // Pass the detected query type to the API
            currentPatientId: currentPatientId, // Pass the current patient ID to the API
            needsGraph: needsGraph, // Pass whether the query needs a graph to the API
          }),
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
        console.log("Chart Data:", responseJson.chartData);

        // If this is a discharge summary and extractedSubjectId is available, update currentPatientId
        if (
          detectedQueryType === "discharge_summary" &&
          responseJson.extractedSubjectId
        ) {
          console.log(
            "Updating current patient ID for discharge summary:",
            responseJson.extractedSubjectId
          );
          setCurrentPatientId(responseJson.extractedSubjectId);
        }
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

      // Add a system message with the API response
      const systemMessage: Message = {
        text: needsGraph
          ? "Here is your graph: "
          : "Here is your information: ",
        timestamp: new Date(),
        isUser: false,
        sql: sql, // Store the SQL query if it exists
        formattedHtml:
          useAI && responseJson?.formattedHtml
            ? responseJson.formattedHtml
            : undefined, // Include formatted HTML if available
        queryType: detectedQueryType, // Store the detected query type for context in responses
        patientId: currentPatientId, // Add current patient ID for context
        admissionId: responseJson?.extractedAdmissionId || null, // Add admission ID if available
        chartData: responseJson?.chartData || undefined, // Include chart data if available
        needsGraph: needsGraph, // Store whether the query needs a graph
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
        queryType: detectedQueryType, // Store the detected query type for context
        patientId: currentPatientId, // Add current patient ID for context
        admissionId: null, // No admission ID for error messages
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
              position: "relative",
            }}
          >
            <ChatBox
              onSendMessage={handleSendMessage}
              onNewQuery={handleNewQuery}
              hasMessages={messages.length > 0}
              isLoading={isLoading}
              currentPatientId={currentPatientId}
              graphModeEnabled={graphModeEnabled}
              onGraphModeToggle={handleGraphModeToggle}
            />
          </Box>
        </Box>
      </div>
    </>
  );
}
