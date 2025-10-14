'use client'
import React, { useState, useRef, useEffect } from "react";
import { Box, List, IconButton, Tooltip, Divider } from "@mui/material";
import NavItem from "./NavItem";
import NavGroup from "./NavGroup/NavGroup";
import * as all_cons from "@tabler/icons-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppSelector } from "@app/libs/store";

// Helper to group submenus under headers
const transformMenuItems = (flatMenu) => {
  const result = [];
  let currentGroup = null;

  flatMenu.forEach((item) => {
    if (item.navlabel && item.subheader) {
      currentGroup = {
        id: `group-${item.permission_id || item.subheader}`,
        title: item.subheader,
        icon: item.icon,
        children: [],
      };
      result.push(currentGroup);
    } else if (currentGroup) {
      currentGroup.children.push(item);
    } else {
      result.push(item);
    }
  });
  return result;
};

const SidebarItems = ({ toggleMobileSidebar }) => {
  const pathname = usePathname();
  const params = useSearchParams();
  const tabs = params.get("tabs");
  const navbar = useAppSelector((ele) => ele["navbar-menu"]);

  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(300); // default sidebar width
  const [isDragging, setIsDragging] = useState(false);

  const sidebarRef = useRef(null);
  const pathDirect = `${pathname}/?tabs=${tabs}`;

  const menuWithIcons = (navbar?.navbar || []).map((ele) => ({
    ...ele,
    icon: all_cons[ele.icon] || all_cons.IconMenu2,
  }));

  const modifiedMenuItems = transformMenuItems(menuWithIcons);

  // Handle mouse drag
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newWidth = e.clientX;
      if (newWidth > 180 && newWidth < 500) {
        setWidth(newWidth);
      }
    };
    const stopDragging = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [isDragging]);

  return (
    <Box
      ref={sidebarRef}
      sx={{
        position: "relative",
        px: collapsed ? 1 : 3,
        width: collapsed ? 90 : width,
        transition: isDragging ? "none" : "width 0.3s ease",
        overflowX: "hidden",
        borderRight: "1px solid #e0e0e0",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          py: 2,
          px: collapsed ? 0 : 2,
        }}
      >
        {!collapsed && <h4 style={{ margin: 0 }}>SwiftCab Pilot</h4>}
        <Tooltip title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
          <IconButton onClick={() => setCollapsed(!collapsed)} size="small">
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      {/* Menu list */}
      <List sx={{ pt: 1, flexGrow: 1 }} className="sidebarNav" component="div">
        {modifiedMenuItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            pathDirect={pathDirect}
            onClick={toggleMobileSidebar}
            collapsed={collapsed}
            level={1}
          />
        ))}
      </List>

      {/* Resizer handle */}
      {!collapsed && (
        <Box
          onMouseDown={() => setIsDragging(true)}
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "5px",
            height: "100%",
            cursor: "ew-resize",
            backgroundColor: isDragging ? "rgba(0,0,0,0.1)" : "transparent",
            transition: "background-color 0.2s ease",
          }}
        />
      )}
    </Box>
  );
};

export default SidebarItems;
