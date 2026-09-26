import React, { useEffect, useRef, useState } from "react";
import {
  ListItemIcon,
  ListItem,
  List,
  ListItemText,
  ListItemButton,
  Tooltip,
  Collapse,
} from "@mui/material";
import Link from "next/link";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import AppIcon, { resolveNavIconName } from "@components/AppIcon";

type NavItemChild = {
  id: string | number;
  title: string;
  href?: string;
  icon?: string | null;
  children?: NavItemChild[];
};

type NavItemProps = {
  item: NavItemChild;
  level?: number;
  pathDirect?: string;
  onClick?: (e: React.MouseEvent) => void;
  collapsed?: boolean;
  onExpandSidebar?: () => void;
};

const ACCENT = "#c4f82a";
const MUTED = "rgba(255,255,255,0.78)";

function normalizeNavHref(value?: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  const queryIndex = trimmed.indexOf("?");
  const path = (queryIndex >= 0 ? trimmed.slice(0, queryIndex) : trimmed).replace(/\/+$/, "");
  const query = queryIndex >= 0 ? trimmed.slice(queryIndex + 1) : "";
  const tabs = new URLSearchParams(query).get("tabs")?.trim().replace(/^\/+/, "") ?? "";
  return tabs ? `${path.toLowerCase()}?tabs=${tabs.toLowerCase()}` : path.toLowerCase();
}

function hrefMatches(pathDirect?: string, href?: string) {
  if (!pathDirect || !href) return false;
  return normalizeNavHref(pathDirect) === normalizeNavHref(href);
}

const NavItem: React.FC<NavItemProps> = ({
  item,
  level = 1,
  pathDirect,
  onClick,
  collapsed,
  onExpandSidebar,
}) => {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const hasChildren = Boolean(item.children && item.children.length > 0);

  const isChildSelected = (items: NavItemChild[] | undefined): boolean => {
    if (!items) return false;
    return items.some((child) => {
      if (hrefMatches(pathDirect, child.href)) {
        return true;
      }
      return isChildSelected(child.children);
    });
  };

  const hasSelectedChild = hasChildren && isChildSelected(item.children);
  const isExactSelected = !hasChildren && hrefMatches(pathDirect, item.href);
  const isSelected = isExactSelected || (Boolean(collapsed) && Boolean(hasSelectedChild));

  useEffect(() => {
    if (hasSelectedChild) {
      setOpen(true);
    }
  }, [hasSelectedChild]);

  useEffect(() => {
    if ((isExactSelected || hasSelectedChild) && itemRef.current) {
      itemRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isExactSelected, hasSelectedChild, collapsed]);

  const handleToggle = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      if (collapsed && onExpandSidebar) {
        onExpandSidebar();
        setOpen(true);
        return;
      }
      setOpen(!open);
    } else if (onClick) {
      onClick(e);
    }
  };

  const tooltipTitle = collapsed
    ? hasChildren
      ? `${item.title} (${item.children?.length} items)`
      : item.title
    : "";

  return (
    <List component="div" disablePadding key={item.id}>
      <ListItem disablePadding sx={{ display: "block" }}>
        <Tooltip title={tooltipTitle} placement="right">
          <ListItemButton
            ref={itemRef}
            component={hasChildren ? "div" : item.href ? Link : "button"}
            href={!hasChildren && item.href ? item.href : undefined}
            selected={isSelected}
            onClick={handleToggle}
            aria-current={isExactSelected ? "page" : undefined}
            aria-expanded={hasChildren ? open : undefined}
            sx={{
              minHeight: 44,
              mb: "4px",
              borderRadius: "10px",
              color: isSelected || hasSelectedChild ? ACCENT : MUTED,
              paddingLeft: collapsed ? "8px" : `${Math.min(level, 3) * 12 + 8}px`,
              paddingRight: "8px",
              justifyContent: collapsed ? "center" : "flex-start",
              cursor: "pointer",
              fontWeight: isSelected || hasSelectedChild ? 600 : 500,
              backgroundColor: isSelected ? "rgba(196, 248, 42, 0.14)" : "transparent",
              border: isSelected ? "1px solid rgba(196, 248, 42, 0.35)" : "1px solid transparent",
              "&:hover": {
                backgroundColor: "rgba(196, 248, 42, 0.1)",
                color: ACCENT,
              },
              "&.Mui-selected": {
                backgroundColor: "rgba(196, 248, 42, 0.14)",
                color: ACCENT,
                "&:hover": {
                  backgroundColor: "rgba(196, 248, 42, 0.2)",
                  color: ACCENT,
                },
              },
              "&:focus-visible": {
                outline: `2px solid ${ACCENT}`,
                outlineOffset: 2,
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 36,
                mr: collapsed ? 0 : 1,
                color: "inherit",
                justifyContent: "center",
                flexShrink: 0,
                "& svg": {
                  display: "block",
                  flexShrink: 0,
                  width: collapsed ? 22 : 20,
                  height: collapsed ? 22 : 20,
                  color: "currentColor",
                },
              }}
            >
              <AppIcon
                name={resolveNavIconName(item.icon, item.title)}
                stroke={1.6}
                size={collapsed ? 22 : 20}
                aria-hidden="true"
              />
            </ListItemIcon>

            {!collapsed && (
              <>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    noWrap: true,
                    fontSize: 13,
                    fontWeight: "inherit",
                  }}
                  sx={{ flexGrow: 1, m: 0 }}
                />
                {hasChildren &&
                  (open ? (
                    <IconChevronDown size={16} aria-hidden="true" />
                  ) : (
                    <IconChevronRight size={16} aria-hidden="true" />
                  ))}
              </>
            )}
          </ListItemButton>
        </Tooltip>
      </ListItem>

      {hasChildren && !collapsed && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children?.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                pathDirect={pathDirect}
                onClick={onClick}
                collapsed={collapsed}
                onExpandSidebar={onExpandSidebar}
                level={level + 1}
              />
            ))}
          </List>
        </Collapse>
      )}
    </List>
  );
};

export default NavItem;
