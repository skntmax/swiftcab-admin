"use client";
import React from "react";
import { Box, Link, Stack, Typography } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function isPdfUrl(url) {
  return /\.pdf(\?|#|$)/i.test(url) || /\/raw\/upload\//i.test(url);
}

function isImageUrl(url) {
  return /\.(jpe?g|png|gif|webp|bmp|svg)(\?|#|$)/i.test(url) || /\/image\/upload\//i.test(url);
}

function fileLabel(url) {
  try {
    const path = new URL(url).pathname;
    const name = decodeURIComponent(path.split("/").pop() || "file");
    return name.length > 48 ? `${name.slice(0, 45)}…` : name;
  } catch {
    return "Stored file";
  }
}

function DocumentPreview({ url, alt = "Document preview", height = 140 }) {
  if (!isHttpUrl(url)) return null;

  if (isPdfUrl(url)) {
    return (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          mt: 1,
          p: 1.25,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1.5,
          bgcolor: "#F8FAFC",
          maxWidth: 420,
        }}
      >
        <PictureAsPdfIcon sx={{ color: "#B91C1C" }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" noWrap>
            {fileLabel(url)}
          </Typography>
          <Link href={url} target="_blank" rel="noreferrer" underline="hover">
            Open PDF
          </Link>
        </Box>
      </Stack>
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Box
        component="img"
        src={url}
        alt={alt}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
        sx={{
          width: "100%",
          maxWidth: 420,
          height,
          objectFit: "cover",
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "#F8FAFC",
          display: "block",
        }}
      />
      <Link href={url} target="_blank" rel="noreferrer" underline="hover" sx={{ display: "inline-block", mt: 0.5 }}>
        Open file
      </Link>
    </Box>
  );
}

export { isHttpUrl, isPdfUrl, isImageUrl };
export default DocumentPreview;
