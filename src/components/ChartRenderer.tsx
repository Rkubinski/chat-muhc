import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  PieController,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Box, Typography, Paper } from "@mui/material";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  PieController,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Blue color palette
const BLUE_PALETTE = {
  light: [
    "#e3f2fd",
    "#bbdefb",
    "#90caf9",
    "#64b5f6",
    "#42a5f5",
    "#2196f3",
    "#1e88e5",
    "#1976d2",
    "#1565c0",
    "#0d47a1",
  ],
  medium: [
    "#bbdefb",
    "#90caf9",
    "#64b5f6",
    "#42a5f5",
    "#2196f3",
    "#1e88e5",
    "#1976d2",
    "#1565c0",
    "#0d47a1",
    "#0a3880",
  ],
  dark: "#0d47a1",
  transparent: "rgba(33, 150, 243, 0.2)",
};

export interface ChartData {
  type: "line" | "bar" | "pie";
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }[];
}

interface ChartRendererProps {
  chartData: ChartData;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ chartData }) => {
  // Apply blue color palette to the chart data if colors aren't provided
  const processedChartData = {
    ...chartData,
    datasets: chartData.datasets.map((dataset, index) => {
      const updatedDataset = { ...dataset };

      // Apply appropriate colors based on chart type
      if (chartData.type === "line") {
        if (!updatedDataset.borderColor) {
          updatedDataset.borderColor = BLUE_PALETTE.dark;
        }
        if (!updatedDataset.backgroundColor) {
          updatedDataset.backgroundColor = BLUE_PALETTE.transparent;
        }
        if (!updatedDataset.borderWidth) {
          updatedDataset.borderWidth = 2;
        }
        updatedDataset.fill =
          updatedDataset.fill !== undefined ? updatedDataset.fill : true;
      } else if (chartData.type === "bar") {
        if (!updatedDataset.backgroundColor) {
          // For multiple datasets, use different colors from the palette
          updatedDataset.backgroundColor =
            chartData.datasets.length > 1
              ? BLUE_PALETTE.medium[index % BLUE_PALETTE.medium.length]
              : BLUE_PALETTE.medium;
        }
        if (!updatedDataset.borderColor) {
          updatedDataset.borderColor =
            chartData.datasets.length > 1
              ? BLUE_PALETTE.dark
              : BLUE_PALETTE.dark;
        }
      } else if (chartData.type === "pie") {
        if (!updatedDataset.backgroundColor) {
          // For pie charts, use the full palette for the segments
          updatedDataset.backgroundColor = BLUE_PALETTE.light;
        }
        if (!updatedDataset.borderColor) {
          updatedDataset.borderColor = "#fff";
        }
      }

      return updatedDataset;
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: chartData.title,
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
    },
  };

  const renderChart = () => {
    switch (chartData.type) {
      case "line":
        return <Line options={options} data={processedChartData as any} />;
      case "bar":
        return <Bar options={options} data={processedChartData as any} />;
      case "pie":
        return <Pie options={options} data={processedChartData as any} />;
      default:
        return (
          <Typography color="error">
            Unsupported chart type: {chartData.type}
          </Typography>
        );
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        padding: 2,
        marginY: 2,
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <Box sx={{ height: 400, width: "100%" }}>{renderChart()}</Box>
    </Paper>
  );
};

export default ChartRenderer;
