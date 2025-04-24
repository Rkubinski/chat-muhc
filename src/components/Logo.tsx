import { Box, Typography } from "@mui/material";
import Image from "next/image";

export default function Logo() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mr: 4,
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "33px",
          width: "33px",
        }}
      >
        <Image
          src="/media/muhc.png"
          alt="MUHC Logo"
          width={25}
          height={25}
          style={{ marginTop: "3px" }}
        />
      </Box>
      <Typography
        variant="h6"
        component="div"
        sx={{
          position: "absolute",
          color: "white",
          left: 65,
          top: 18,
          fontWeight: "bold",
        }}
      >
        Chat MUHC
      </Typography>
    </Box>
  );
}
