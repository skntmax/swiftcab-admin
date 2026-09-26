import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { CircularProgress, Box, Drawer, useMediaQuery } from "@mui/material";

const SidebarItems = dynamic(() => import("./SidebarItems"), {
  loading: () => (
    <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#0b0b0b" }}>
      <CircularProgress size={32} sx={{ color: "#c4f82a" }} />
    </Box>
  ),
  ssr: false,
});

const scrollbarStyles = {
  "&::-webkit-scrollbar": {
    width: "7px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(196,248,42,0.28)",
    borderRadius: "15px",
  },
};

const MSidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}) => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const [navWidth, setNavWidth] = useState(270);
  const handleWidthChange = useCallback((nextWidth) => {
    setNavWidth(nextWidth);
  }, []);

  if (lgUp) {
    return (
      <Box
        sx={{
          width: navWidth,
          flexShrink: 0,
          transition: "width 0.25s ease",
        }}
      >
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          PaperProps={{
            sx: {
              boxSizing: "border-box",
              width: navWidth,
              height: "100vh",
              maxHeight: "100vh",
              overflow: "hidden",
              backgroundColor: "#0b0b0b",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              transition: "width 0.25s ease",
              ...scrollbarStyles,
            },
          }}
        >
          <Box sx={{ height: "100vh", maxHeight: "100vh", overflow: "hidden", display: "flex" }}>
            <SidebarItems onWidthChange={handleWidthChange} />
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      PaperProps={{
        sx: {
          width: 280,
          height: "100vh",
          maxHeight: "100vh",
          overflow: "hidden",
          backgroundColor: "#0b0b0b",
          boxShadow: (theme) => theme.shadows[8],
          ...scrollbarStyles,
        },
      }}
    >
      <Box sx={{ height: "100vh", maxHeight: "100vh", overflow: "hidden", display: "flex" }}>
        <SidebarItems toggleMobileSidebar={onSidebarClose} onWidthChange={handleWidthChange} />
      </Box>
    </Drawer>
  );
};

export default MSidebar;
