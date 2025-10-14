import React, { useState, useEffect } from "react";
import {
  ListItemIcon,
  ListItem,
  List,
  styled,
  ListItemText,
  useTheme,
  ListItemButton,
  Tooltip,
  Collapse,
} from "@mui/material";
import Link from "next/link";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

type NavItemChild = {
  id: string | number;
  title: string;
  href?: string;
  icon?: React.ElementType;
  children?: NavItemChild[];
};

type NavItemProps = {
  item: NavItemChild;
  level?: number;
  pathDirect?: string;
  onClick?: (e: React.MouseEvent) => void;
  collapsed?: boolean;
};

const NavItem: React.FC<NavItemProps> = ({ 
  item, 
  level = 1, 
  pathDirect, 
  onClick, 
  collapsed 
}) => {
  const theme = useTheme();
  const Icon = item.icon || CircleOutlinedIcon;
  const itemIcon = <Icon stroke={1.5} size="1.3rem" />;
  const [open, setOpen] = useState(false);

  const hasChildren = item.children && item.children.length > 0;

  // Check if any child is selected (recursive)
  const isChildSelected = (items: NavItemChild[] | undefined): boolean => {
    if (!items) return false;
    return items.some(child => {
      if (pathDirect?.trim()?.toLowerCase() === child.href?.trim()?.toLowerCase()) {
        return true;
      }
      return isChildSelected(child.children);
    });
  };

  const hasSelectedChild = hasChildren && isChildSelected(item.children);
  
  // Only mark as selected if this exact item is selected AND it has no children
  const isSelected = !hasChildren && 
    pathDirect?.trim()?.toLowerCase() === item.href?.trim()?.toLowerCase();

  // Auto-expand if a child is selected
  useEffect(() => {
    if (hasSelectedChild) {
      setOpen(true);
    }
  }, [hasSelectedChild]);

  const ListItemStyled = styled(ListItem)(() => ({
    padding: 0,
    ".MuiButtonBase-root": {
      whiteSpace: "nowrap",
      marginBottom: "2px",
      borderRadius: "8px",
      color: theme.palette.text.secondary,
      paddingLeft: collapsed ? "8px" : `${level * 20 + 8}px`,
      paddingRight: "8px",
      paddingTop: "8px",
      paddingBottom: "8px",
      "&:hover": {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.main,
      },
      "&.Mui-selected": {
        // backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.main,

        "&:hover": {
          backgroundColor: theme.palette.primary.main,
          color: "white",
        },
      },
    },
  }));

  const handleToggle = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setOpen(!open);
    } else if (onClick) {
      onClick(e);
    }
  };

  // If sidebar is collapsed and has children, show tooltip with children names
  const tooltipTitle = collapsed && hasChildren
    ? `${item.title} (${item.children?.length} items)`
    : collapsed
    ? item.title
    : "";

  return (
    <>
      <List component="div" disablePadding key={item.id}>
        <ListItemStyled>
          <Tooltip title={tooltipTitle} placement="right">
            <ListItemButton
              component={hasChildren ? "div" : item.href ? Link : "button"}
              href={!hasChildren && item.href ? item.href : undefined}
              selected={isSelected}
              onClick={handleToggle}
              sx={{
                cursor: hasChildren ? "pointer" : "default",
                ...(hasSelectedChild && {
                  color: theme.palette.primary.main,
                  fontWeight: 200,
                }),
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: collapsed ? "auto" : "36px", 
                  color: "inherit",
                  justifyContent: "center"
                }}
              >
                {itemIcon}
              </ListItemIcon>

              {!collapsed && (
                <>
                  <ListItemText 
                    primary={item.title} 
                    sx={{ flexGrow: 1 }}
                  />
                  {hasChildren && (open ? <ExpandLess /> : <ExpandMore />)}
                </>
              )}
            </ListItemButton>
          </Tooltip>
        </ListItemStyled>

        {/* Collapse for child items - only show when sidebar is not collapsed */}
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
                  level={level + 1}
                />
              ))}
            </List>
          </Collapse>
        )}
      </List>
    </>
  );
};

export default NavItem;