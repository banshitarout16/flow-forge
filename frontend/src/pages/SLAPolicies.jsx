import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Stack, Chip, Alert } from "@mui/material";
import Layout from "../components/Layout";
import api from "../api/axios";
import { colors } from "../theme/theme";

const priorityColor = {
  Critical: colors.red,
  High: "#C77700",
  Medium: "#2B6CB0",
  Low: colors.slate,
};

const priorities = ["Critical", "High", "Medium", "Low"];

const SLAPolicies = () => {
  const [policies, setPolicies] = useState({});
  const [saving, setSaving] = useState("");
  const [errors, setErrors] = useState({});

  const load = () =>
    api.get("/sla-policies").then(({ data }) => {
      const map = {};
      data.forEach((p) => (map[p.priority] = p.hours));
      setPolicies(map);
    });

  useEffect(() => {
    load();
  }, []);

  const isValid = (value) => value !== "" && Number.isFinite(Number(value)) && Number(value) > 0;

  const handleSave = async (priority) => {
    const value = policies[priority];
    if (!isValid(value)) {
      setErrors({ ...errors, [priority]: "Enter a number greater than 0" });
      return;
    }
    setErrors({ ...errors, [priority]: "" });
    setSaving(priority);
    try {
      await api.patch(`/sla-policies/${priority}`, { hours: Number(value) });
      load();
    } catch (err) {
      setErrors({ ...errors, [priority]: err.response?.data?.message || "Could not save" });
    } finally {
      setSaving("");
    }
  };

  return (
    <Layout title="SLA Policies">
      <Typography variant="body2" sx={{ color: colors.slate, mb: 3 }}>
        Set the resolution deadline for each priority level. Work items get a countdown from the
        moment they're created, and the system flags them "at risk" or "breached" automatically.
      </Typography>

      <Stack spacing={2}>
        {priorities.map((p) => (
          <Card key={p}>
            <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <Chip label={p} sx={{ bgcolor: `${priorityColor[p]}22`, color: priorityColor[p], fontWeight: 700, minWidth: 90, mt: 0.5 }} />
              <Box>
                <TextField
                  type="number"
                  size="small"
                  label="Hours to resolve"
                  value={policies[p] ?? ""}
                  onChange={(e) => setPolicies({ ...policies, [p]: e.target.value })}
                  error={Boolean(errors[p])}
                  helperText={errors[p] || ""}
                  sx={{ width: 200 }}
                />
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleSave(p)}
                disabled={saving === p || !isValid(policies[p])}
              >
                {saving === p ? "Saving..." : "Save"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Layout>
  );
};

export default SLAPolicies;
