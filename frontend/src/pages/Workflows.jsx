import { useEffect, useState } from "react";
import {
  Box, Button, Card, CardContent, Typography, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Stack, Switch, FormControlLabel, Alert,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Layout from "../components/Layout";
import api from "../api/axios";
import { colors } from "../theme/theme";

const emptyState = () => ({ label: "", isInitial: false, isFinal: false });

const Workflows = () => {
  const [workflows, setWorkflows] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    workItemType: "General",
    isDefault: false,
    states: [emptyState(), emptyState()],
  });

  const load = () => api.get("/workflows").then(({ data }) => setWorkflows(data));

  useEffect(() => {
    load();
  }, []);

  const updateState = (index, field, value) => {
    const states = [...form.states];
    states[index] = { ...states[index], [field]: value };
    setForm({ ...form, states });
  };

  const addState = () => setForm({ ...form, states: [...form.states, emptyState()] });

  const removeState = (index) => {
    if (form.states.length <= 2) return;
    setForm({ ...form, states: form.states.filter((_, i) => i !== index) });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/workflows", form);
      setForm({ name: "", workItemType: "General", isDefault: false, states: [emptyState(), emptyState()] });
      setOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create workflow");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/workflows/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete workflow");
    }
  };

  return (
    <Layout title="Workflows">
      <Typography variant="body2" sx={{ color: colors.slate, mb: 3 }}>
        Define the status chain work items move through. Each work item type can use its own workflow.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpen(true)}>
          New workflow
        </Button>
      </Box>

      <Stack spacing={2}>
        {workflows.map((wf) => (
          <Card key={wf._id}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box>
                  <Typography variant="h6">{wf.name}</Typography>
                  <Typography variant="body2" sx={{ color: colors.slate }}>{wf.workItemType}</Typography>
                </Box>
                {wf.isDefault && <Chip size="small" label="Default" sx={{ bgcolor: colors.redSoft, color: colors.red }} />}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                {wf.states.sort((a, b) => a.order - b.order).map((s, i, arr) => (
                  <Box key={s.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      size="small"
                      label={s.label}
                      sx={{
                        bgcolor: s.isFinal ? "#E7F7EE" : s.isInitial ? colors.redSoft : "#F1F1F1",
                        color: s.isFinal ? "#1E8E5A" : s.isInitial ? colors.red : colors.ink,
                        fontWeight: 600,
                      }}
                    />
                    {i < arr.length - 1 && <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: colors.slate }} />}
                  </Box>
                ))}
              </Box>

              {!wf.isDefault && (
                <Box sx={{ mt: 2 }}>
                  <IconButton size="small" onClick={() => handleDelete(wf._id)}>
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleCreate}>
          <DialogTitle>New workflow</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            <TextField label="Workflow name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required fullWidth />
            <TextField
              label="Work item type"
              placeholder="e.g. IT Request, Machine Breakdown"
              value={form.workItemType}
              onChange={(e) => setForm({ ...form, workItemType: e.target.value })}
              fullWidth
            />

            <Typography variant="subtitle2" sx={{ mt: 1 }}>Status chain</Typography>
            {form.states.map((s, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  size="small"
                  label={`State ${i + 1}`}
                  value={s.label}
                  onChange={(e) => updateState(i, "label", e.target.value)}
                  required
                  fullWidth
                />
                <FormControlLabel
                  control={<Switch size="small" checked={s.isInitial} onChange={(e) => updateState(i, "isInitial", e.target.checked)} />}
                  label="Start"
                />
                <FormControlLabel
                  control={<Switch size="small" checked={s.isFinal} onChange={(e) => updateState(i, "isFinal", e.target.checked)} />}
                  label="Final"
                />
                <IconButton size="small" onClick={() => removeState(i)} disabled={form.states.length <= 2}>
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button size="small" onClick={addState} sx={{ alignSelf: "flex-start" }}>
              + Add state
            </Button>

            <FormControlLabel
              control={<Switch checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />}
              label="Set as default workflow for new work items"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Layout>
  );
};

export default Workflows;
