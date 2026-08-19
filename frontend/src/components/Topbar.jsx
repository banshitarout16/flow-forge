import { AppBar, Toolbar, Typography, Box, Chip, IconButton, Menu, MenuItem, Avatar } from "@mui/material";
import { useState } from "react";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { colors } from "../theme/theme";

const roleLabel = {
  org_admin: "Org Admin",
  manager: "Manager",
  agent: "Agent",
  requester: "Requester",
};

const Topbar = ({ title }) => {
  const { user, organization, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
              {organization.name}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {user && <Chip size="small" label={roleLabel[user.role] || user.role} sx={{ bgcolor: colors.redSoft, color: colors.red }} />}
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
