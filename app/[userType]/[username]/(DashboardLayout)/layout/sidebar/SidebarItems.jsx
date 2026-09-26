'use client'
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Box, List, IconButton, Tooltip, Divider } from "@mui/material";
import NavItem from "./NavItem";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolveNavIconName } from "@components/AppIcon";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppSelector } from "@app/libs/store";

const SIDEBAR_COLLAPSED = 88;
const SIDEBAR_DEFAULT = 270;

const scrollSx = {
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(196,248,42,0.28)",
    borderRadius: 8,
  },
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(196,248,42,0.28) transparent",
  scrollBehavior: "smooth",
  "@media (prefers-reduced-motion: reduce)": {
    scrollBehavior: "auto",
  },
};

const transformMenuItems = (flatMenu) => {
  const items = Array.isArray(flatMenu) ? flatMenu : [];
  const result = [];
  let currentGroup = null;

  items.forEach((item) => {
    if (item.navlabel && item.subheader) {
      currentGroup = {
        id: `group-${item.permission_id || item.subheader}`,
        title: item.subheader,
        icon: resolveNavIconName(item.icon, item.subheader),
        children: [],
      };
      result.push(currentGroup);
    } else if (currentGroup) {
      currentGroup.children.push({
        ...item,
        icon: resolveNavIconName(item.icon, item.title),
      });
    } else {
      result.push({
        ...item,
        icon: resolveNavIconName(item.icon, item.title || item.subheader),
      });
    }
  });
  return result;
};

const SidebarItems = ({ toggleMobileSidebar, onWidthChange }) => {
  const pathname = usePathname();
  const params = useSearchParams();
  const tabs = params.get("tabs")?.trim() || null;
  const navbar = useAppSelector((ele) => ele["navbar-menu"]);

  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(SIDEBAR_DEFAULT);
  const [isDragging, setIsDragging] = useState(false);

  const sidebarRef = useRef(null);
  const pathDirect = tabs ? `${pathname}?tabs=${tabs}` : pathname;
  const roleSlug = pathname.split("/").filter(Boolean)[0]?.toLowerCase() || "";
  const isDriver = roleSlug === "driver-partner";
  const homeItem = useMemo(
    () => ({
      id: "console-home",
      title: isDriver ? "On duty" : "Home",
      href: pathname,
      icon: resolveNavIconName(isDriver ? "IconMapPin" : "IconHome", isDriver ? "On duty" : "Home"),
    }),
    [isDriver, pathname],
  );
  const menuItems = useMemo(() => {
    const base = [homeItem, ...transformMenuItems(navbar?.navbar)]
    if (!isDriver) return base
    const tabHref = (tab) => `${pathname}?tabs=${tab}`
    return [
      ...base,
      {
        id: "group-earn-more",
        title: "Earn more",
        icon: resolveNavIconName("IconChartBar", "Earn more"),
        children: [
          {
            id: "plat-smart",
            title: "Demand & incentives",
            href: tabHref("driver/platform/smart-earning"),
            icon: resolveNavIconName("IconMapPin", "Demand & incentives"),
          },
          {
            id: "plat-net",
            title: "Net income",
            href: tabHref("driver/platform/net-income"),
            icon: resolveNavIconName("IconCash", "Net income"),
          },
          {
            id: "plat-ai",
            title: "Earning advisor",
            href: tabHref("driver/platform/copilot"),
            icon: resolveNavIconName("IconSteeringWheel", "Earning advisor"),
          },
        ],
      },
      {
        id: "group-work-tools",
        title: "Work tools",
        icon: resolveNavIconName("IconTool", "Work tools"),
        children: [
          {
            id: "plat-sos",
            title: "Safety & SOS",
            href: tabHref("driver/platform/protection"),
            icon: resolveNavIconName("IconShield", "Safety & SOS"),
          },
          {
            id: "plat-veh",
            title: "Vehicle health",
            href: tabHref("driver/platform/vehicle"),
            icon: resolveNavIconName("IconCar", "Vehicle health"),
          },
          {
            id: "plat-growth",
            title: "Credit & training",
            href: tabHref("driver/platform/growth"),
            icon: resolveNavIconName("IconStar", "Credit & training"),
          },
        ],
      },
    ]
  }, [homeItem, navbar?.navbar, isDriver, pathname]);
  const nextWidth = collapsed ? SIDEBAR_COLLAPSED : width;

  useEffect(() => {
    onWidthChange?.(nextWidth);
  }, [nextWidth, onWidthChange]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || collapsed) return;
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 420) {
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
  }, [isDragging, collapsed]);

  const expandSidebar = () => setCollapsed(false);

  return (
    <Box
      ref={sidebarRef}
      sx={{
        position: "relative",
        px: collapsed ? 1 : 1.5,
        width: nextWidth,
        minWidth: nextWidth,
        maxWidth: nextWidth,
        height: "100vh",
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "#0b0b0b",
        color: "#f4f4f5",
        transition: isDragging ? "none" : "width 0.25s ease, min-width 0.25s ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          py: 1.5,
          px: collapsed ? 0 : 0.5,
          flexShrink: 0,
          gap: 1,
        }}
      >
        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>
              Swift<span style={{ color: "#c4f82a" }}>Cab</span>
            </Box>
            <Box sx={{ fontSize: 11, color: "rgba(255,255,255,0.5)", mt: 0.25 }}>
              {roleSlug.replace(/-/g, " ") || "console"}
            </Box>
          </Box>
        )}
        <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <IconButton
            onClick={() => setCollapsed((value) => !value)}
            size="small"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            sx={{
              color: "#c4f82a",
              border: "1px solid rgba(196,248,42,0.25)",
              borderRadius: "10px",
              width: 36,
              height: 36,
              flexShrink: 0,
              "&:hover": { backgroundColor: "rgba(196,248,42,0.12)" },
            }}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

      <Box
        className="sidebarNav"
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          pt: 1.5,
          pb: 3,
          pr: 0.5,
          ...scrollSx,
        }}
      >
        <List disablePadding component="nav" aria-label="Main navigation">
          {menuItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              pathDirect={pathDirect}
              onClick={toggleMobileSidebar}
              collapsed={collapsed}
              onExpandSidebar={expandSidebar}
              level={1}
            />
          ))}
        </List>
      </Box>

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
            backgroundColor: isDragging ? "rgba(196,248,42,0.25)" : "transparent",
            transition: "background-color 0.2s ease",
          }}
        />
      )}
    </Box>
  );
};

export default SidebarItems;
