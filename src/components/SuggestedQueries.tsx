import { Box, Chip, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import React, { ReactElement } from "react";

// Define the query object type
interface QueryObject {
  text: string;
  icon?: ReactElement;
  description?: string;
  needsGraph?: boolean;
}

type QueryType = string | QueryObject;

interface SuggestedQueriesProps {
  role: string;
  onQuerySelected: (query: string, needsGraph?: boolean) => void;
  isLoading: boolean;
}

export default function SuggestedQueries({
  role,
  onQuerySelected,
  isLoading,
}: SuggestedQueriesProps) {
  // Define suggested queries based on user role
  const queries: QueryType[] = [
    // Admin queries
    "Which ward has the most admissions?",
    "Show patient distribution by ward",
    // Doctor queries
    "Discharge summary for patient 10009628",
    "Show admission history for surgery's youngest patient",
    {
      text: "Show me a graph of patient admissions over time",
      icon: <TrendingUp size={18} />,
      description: "Visualize admission trends",
      needsGraph: true,
    },
    {
      text: "Create a pie chart of patient admissions by ward",
      icon: <TrendingUp size={18} />,
      description: "Visualize admission distribution by ward",
      needsGraph: true,
    },
    {
      text: "Visualize lab result trends for patient 10009628",
      icon: <TrendingUp size={18} />,
      description: "Show lab results as a line chart",
      needsGraph: true,
    },
    {
      text: "Compare length of stay across different procedures",
      icon: <TrendingUp size={18} />,
      description: "Bar chart of procedure durations",
      needsGraph: true,
    },
  ];

  // Function to handle query selection
  const handleQuerySelected = (query: QueryType) => {
    if (typeof query === "string") {
      onQuerySelected(query);
    } else {
      onQuerySelected(query.text, query.needsGraph);
    }
  };

  // Function to get the label text from a query
  const getQueryLabel = (query: QueryType): string => {
    return typeof query === "string" ? query : query.text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ width: "100%" }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 3,
          borderRadius: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {queries.map((query, index) => {
            // Create a properly typed icon
            const icon =
              typeof query !== "string" && query.icon ? query.icon : undefined;

            return (
              <Chip
                key={index}
                label={getQueryLabel(query)}
                icon={icon}
                onClick={() => handleQuerySelected(query)}
                disabled={isLoading}
                sx={{
                  borderRadius: 5,
                  fontWeight: "bold",
                  cursor: "pointer",
                  backgroundColor: "#e6f2ff",
                  border: "1px solid #bdc8fd",
                  color: "#1e3a8a",
                  transition: "all 0.2s ease",
                  fontSize: "0.9rem",
                  padding: "12px 8px",
                  height: "32px",
                  width: "auto",
                  margin: 0.5,
                  marginBottom: 1,
                  "&:hover": {
                    backgroundColor: "#d1e6ff",
                    boxShadow: "0 2px 8px rgba(30, 58, 138, 0.15)",
                    transform: "translateY(-2px)",
                  },
                  "&.Mui-disabled": {
                    opacity: 0.6,
                    backgroundColor: "#f0f0f0",
                    color: "#9ca3af",
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>
    </motion.div>
  );
}
