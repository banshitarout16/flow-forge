import {
  AppBar, Toolbar, Typography, Box, Chip, IconButton, Menu, MenuItem, Avatar, Badge, Divider,
} from "@mui/material";
import { useState } from "react";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { colors } from "../theme/theme";

const roleLabel = {
  org_admin: "Org Admin",
  manager: "Manager",
  agent: "Agent",
  requester: "Requester",
};

const typeColor = {
  sla_breach: colors.red,
  sla_at_risk: "#C77700",
  escalation: "#2B6CB0",
};

const Topbar = ({ title }) => {
  const { user, organization, logout } = useAuth();
  const { notifications, unreadCount, markAllRead } = useSocket() || {};
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNotifClick = (n) => {
    setNotifAnchor(null);
    if (n.workItemId) navigate(`/work-items/${n.workItemId}`);
  };

  return (
    <AppBar position="fixed" elevation={0} sx={{ ml: "240px", width: "calc(100% - 240px)" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {organization && (
            <Typography variant="caption" sx={{ color: colors.slate }}>
              {organization.name} · slug: {organization.slug}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {user && <Chip size="small" label={roleLabel[user.role] || user.role} sx={{ bgcolor: colors.redSoft, color: colors.red }} />}

          <IconButton
            size="small"
            onClick={(e) => {
              setNotifAnchor(e.currentTarget);
              markAllRead?.();
            }}
          >
            <Badge badgeContent={unreadCount || 0} color="error">
              <NotificationsRoundedIcon />
            </Badge>
          </IconButton>
          <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={() => setNotifAnchor(null)} PaperProps={{ sx: { width: 340 } }}>
            <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
              Notifications
            </Typography>
            <Divider />
            {(!notifications || notifications.length === 0) && (
              <MenuItem disabled>Nothing yet — you'll see live updates here</MenuItem>
            )}
            {notifications?.map((n) => (
              <MenuItem key={n.id} onClick={() => handleNotifClick(n)} sx={{ whiteSpace: "normal" }}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: typeColor[n.type] || colors.slate }} />
                    <Typography variant="body2">{n.message}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: colors.slate, pl: 2 }}>
                    {new Date(n.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
            <Avatar sx={{ width: 32, height: 32, bgcolor: colors.ink, fontSize: 14 }}>
              {user?.name?.[0]?.toUpperCase() || "?"}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>{user?.email}</MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutRoundedIcon fontSize="small" sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
