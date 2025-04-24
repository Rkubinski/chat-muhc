import { Box, Chip, Typography } from "@mui/material";
import { motion } from "framer-motion";

interface SuggestedQueriesProps {
  role: string;
  onQuerySelected: (query: string) => void;
  isLoading: boolean;
}

export default function SuggestedQueries({
  role,
  onQuerySelected,
  isLoading,
}: SuggestedQueriesProps) {
  // Define suggested queries based on user role
  const queries = [
    // Admin queries
    "Show me the most frequently admitted patient",
    "Which ward has the most admissions?",
    "Show patient distribution by ward",
    // Doctor queries
    "Discharge summary for patient 10009628",
    "Recent labs for the oldest patient in the MED ward",
    "Show admission history for surgery's youngest patient",
  ];

  // Select queries based on role

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
          {queries.map((query, index) => (
            <Chip
              key={index}
              label={query}
              onClick={() => onQuerySelected(query)}
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
          ))}
        </Box>
      </Box>
    </motion.div>
  );
}
