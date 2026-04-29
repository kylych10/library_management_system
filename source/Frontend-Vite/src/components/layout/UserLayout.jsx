import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box, AppBar, Toolbar, IconButton, Typography, Avatar, Menu, MenuItem,
  ListItemIcon, Divider, Tooltip, useTheme, useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/features/auth/authSlice";
import UserSidebar from "./UserSidebar";
import { navigationItems } from "./navigationItems";
import NotificationBell from "../notification/NotificationBell";
import ThemeToggle from "../theme/ThemeToggle";
import ChatAssistant from "../chat/ChatAssistant";

const DRAWER_WIDTH = 280;

export default function UserLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const pageTitle = navigationItems.find((item) => {
    if (item.path === "/") return location.pathname === "/";
    return location.pathname.startsWith(item.path);
  })?.title || "Dashboard";

  const handleLogout = () => {
    setAnchorEl(null);
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml:    { md: `${DRAWER_WIDTH}px` },
          bgcolor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: "none" }, mr: 0.5 }}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            sx={{ flexGrow: 1, fontWeight: 700, fontSize: { xs: "1rem", sm: "1.1rem" } }}
          >
            {pageTitle}
          </Typography>
          <NotificationBell />
          <Box sx={{ display: { xs: "none", sm: "flex" } }}>
            <ThemeToggle />
          </Box>
          <Tooltip title="Account">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar
                src={user?.profileImage}
                sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "0.9rem", fontWeight: 700 }}
              >
                {user?.fullName?.charAt(0)}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{ sx: { mt: 1.5, minWidth: 220, borderRadius: 3, boxShadow: 6 } }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle2" fontWeight={700}>{user?.fullName}</Typography>
          <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
        </Box>
        {[
          { icon: <PersonIcon fontSize="small" />,   label: "Profile",  path: "/profile"  },
          { icon: <SettingsIcon fontSize="small" />, label: "Settings", path: "/settings" },
        ].map(({ icon, label, path }) => (
          <MenuItem key={path} onClick={() => { setAnchorEl(null); navigate(path); }} sx={{ py: 1.5 }}>
            <ListItemIcon>{icon}</ListItemIcon>
            {label}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: "error.main" }}>
          <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <UserSidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={() => setMobileOpen(false)}
        isMobile={isMobile}
        setMobileOpen={setMobileOpen}
        handleProfileMenuClose={() => setAnchorEl(null)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: "100%", md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: "100dvh",
          overflowX: "hidden",
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        <Box sx={{ px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 1.5, md: 2.5 }, pb: { xs: 4, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>

      <ChatAssistant />
    </Box>
  );
}
