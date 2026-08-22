import { useEffect, useState } from "react";
import {
  Box, Button, Card, CardActionArea, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Grid, Chip, Alert, MenuItem, List, ListItem, ListItemText, IconButton, Divider,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import Layout from "../components/Layout";
import api from "../api/axios";
import { colors } from "../theme/theme";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [manageTeam, setManageTeam] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [manageError, setManageError] = useState("");

  const load = () => api.get("/teams").then(({ data }) => setTeams(data));
  const loadUsers = () => api.get("/users").then(({ data }) => setUsers(data));

  useEffect(() => {
    load();
    loadUsers();
  }, []);

  const handleClose = () => {
    setOpen(false);
    setError("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/teams", form);
      setForm({ name: "", description: "" });
      setOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create team");
    } finally {
      setSubmitting(false);
    }
  };

  const openManage = (team) => {
    setManageTeam(team);
    setSelectedUserId("");
    setManageError("");
  };

  const refreshManageTeam = async (teamId) => {
    const { data } = await api.get(`/teams/${teamId}`);
    setManageTeam(data);
    load();
    loadUsers();
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    setManageError("");
    try {
      await api.post(`/teams/${manageTeam._id}/members`, { userId: selectedUserId });
      setSelectedUserId("");
      refreshManageTeam(manageTeam._id);
    } catch (err) {
      setManageError(err.response?.data?.message || "Could not add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    setManageError("");
    try {
      await api.delete(`/teams/${manageTeam._id}/members/${userId}`);
      refreshManageTeam(manageTeam._id);
    } catch (err) {
      setManageError(err.response?.data?.message || "Could not remove member");
    }
  };

  const availableUsers = users.filter(
    (u) =>
      u.role !== "requester" &&
      !manageTeam?.members?.some((m) => (m._id || m.id) === (u._id || u.id))
  );

  return (
    <Layout title="Teams">
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpen(true)}>
          New team
        </Button>
      </Box>

      <Grid container spacing={2}>
        {teams.map((team) => (
          <Grid item xs={12} sm={6} md={4} key={team._id}>
            <Card>
              <CardActionArea onClick={() => openManage(team)}>
                <CardContent>
                  <Typography variant="h6">{team.name}</Typography>
                  <Typography variant="body2" sx={{ color: colors.slate, mb: 1.5 }}>
                    {team.description || "No description"}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${team.members?.length || 0} member${team.members?.length === 1 ? "" : "s"}`}
                    sx={{ bgcolor: colors.redSoft, color: colors.red }}
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
        {teams.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: colors.slate }}>
              No teams yet. Create one to start assigning work.
            </Typography>
          </Grid>
        )}
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <form onSubmit={handleCreate}>
          <DialogTitle>New team</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
            <TextField label="Team name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required fullWidth />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              minRows={2}
              fullWidth
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={Boolean(manageTeam)} onClose={() => setManageTeam(null)} fullWidth maxWidth="sm">
        <DialogTitle>{manageTeam?.name} — Members</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {manageError && <Alert severity="error" sx={{ borderRadius: 2 }}>{manageError}</Alert>}

          <List sx={{ py: 0 }}>
            {manageTeam?.members?.map((m) => (
              <ListItem
                key={m._id || m.id}
                secondaryAction={
                  <IconButton edge="end" size="small" onClick={() => handleRemoveMember(m._id || m.id)}>
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ borderRadius: 2, "&:hover": { bgcolor: colors.canvas } }}
              >
                <ListItemText
                  primary={m.name}
                  secondary={`${m.email} · ${m.role}`}
                />
              </ListItem>
            ))}
            {(!manageTeam?.members || manageTeam.members.length === 0) && (
              <Typography variant="body2" sx={{ color: colors.slate, px: 2, py: 1 }}>
                No members yet.
              </Typography>
            )}
          </List>

          <Divider />

          <Typography variant="subtitle2">Add a member</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              select
              size="small"
              fullWidth
              label="Select agent or manager"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {availableUsers.length === 0 && (
                <MenuItem disabled value="">
                  No available users — create one first, or applications may be pending approval
                </MenuItem>
              )}
              {availableUsers.map((u) => (
                <MenuItem key={u._id || u.id} value={u._id || u.id}>
                  {u.name} · {u.role}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="contained" startIcon={<PersonAddRoundedIcon />} onClick={handleAddMember} disabled={!selectedUserId}>
              Add
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setManageTeam(null)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Teams;
