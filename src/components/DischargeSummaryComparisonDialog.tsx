import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Paper,
  Typography,
  Divider,
  Box,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";

interface DischargeData {
  subject_id: string;
  admission_id?: string;
  text: string;
  discharge_date?: string;
  [key: string]: any; // For other potential fields
}

interface DischargeSummaryComparisonDialogProps {
  open: boolean;
  onClose: () => void;
  generatedSummary: string;
  patientId: string | null;
  admissionId?: string;
}

export default function DischargeSummaryComparisonDialog({
  open,
  onClose,
  generatedSummary,
  patientId,
  admissionId,
}: DischargeSummaryComparisonDialogProps) {
  const [actualDischargeData, setActualDischargeData] =
    useState<DischargeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the actual discharge data when the dialog opens
  useEffect(() => {
    console.log("here");
    if (open) {
      fetchDischargeData();
    }
    // Reset state when dialog closes
    if (!open) {
      setActualDischargeData(null);
      setError(null);
    }
  }, [open, patientId, admissionId]);

  // Function to fetch discharge data from our API
  const fetchDischargeData = async () => {
    console.log("Fetching discharge data for patient", patientId);
    // if (!patientId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Build the query URL
      let url = `/api/fetch-discharge-data?subject_id=${10012552}`;
      console.log("url", url);
      // if (admissionId) {
      //   url += `&admission_id=${admissionId}`;
      //   console.log(
      //     `Fetching discharge data for patient ${patientId}, admission ${admissionId}`
      //   );
      // } else {
      //   console.log(
      //     `Fetching discharge data for patient ${patientId} (any admission)`
      //   );
      // }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        console.log("Found discharge data:", data.data[0]);
        setActualDischargeData(data.data[0]);
      } else {
        setError(
          admissionId
            ? `No discharge data found for patient ${patientId} with admission ID ${admissionId}.`
            : `No discharge data found for patient ${patientId}.`
        );
      }
    } catch (error) {
      console.error("Error fetching discharge data:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch discharge data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "80vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#073660",
          color: "white",
          fontWeight: "bold",
        }}
      >
        Discharge Summary Comparison
        {patientId && (
          <Typography variant="subtitle1" sx={{ fontWeight: "normal" }}>
            Patient ID: {patientId}
            {admissionId ? (
              <span style={{ fontWeight: "medium", color: "#8ecdf7" }}>
                {" "}
                | Admission: {admissionId}
              </span>
            ) : (
              " | Latest admission"
            )}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers sx={{ flexGrow: 1, overflow: "auto" }}>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="error">{error}</Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Only showing AI-generated summary as no actual discharge data was
              found.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ height: "100%" }}>
            {/* Generated Summary Column */}
            <Grid size={6} sx={{ height: "100%" }}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  height: "100%",
                  overflow: "auto",
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 1, color: "#073660", fontWeight: "bold" }}
                >
                  AI-Generated Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <div dangerouslySetInnerHTML={{ __html: generatedSummary }} />
              </Paper>
            </Grid>

            {/* Actual Discharge Data Column */}
            <Grid size={6} sx={{ height: "100%" }}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  height: "100%",
                  overflow: "auto",
                  backgroundColor: "#f5f9ff",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 1, color: "#073660", fontWeight: "bold" }}
                >
                  Actual Discharge Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {actualDischargeData ? (
                  <>
                    <Typography variant="body1" paragraph>
                      <strong>Date:</strong>{" "}
                      {actualDischargeData.discharge_date || "Not available"}
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {actualDischargeData.text || "No text content available"}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No actual discharge data available for comparison.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ backgroundColor: "#f5f5f5" }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: "#073660",
            "&:hover": { backgroundColor: "#052540" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
