import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Grid, Chip } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Layout from "../components/Layout";
import api from "../api/axios";
import { colors } from "../theme/theme";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const load = () => api.get("/teams").then(({ data }) => setTeams(data));

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post("/teams", form);
    setForm({ name: "", description: "" });
    setOpen(false);
    load();
  };

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
              <CardContent>
                <Typography variant="h6">{team.name}</Typography>
                <Typography variant="body2" sx={{ color: colors.slate, mb: 1.5 }}>
                  {team.description || "No description"}
                </Typography>
                <Chip size="small" label={`${team.members?.length || 0} members`} sx={{ bgcolor: colors.redSoft, color: colors.red }} />
              </CardContent>
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

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleCreate}>
          <DialogTitle>New team</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
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
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Layout>
  );
};

export default Teams;
