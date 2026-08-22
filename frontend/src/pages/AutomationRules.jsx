import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Switch, TextField, Button, Stack } from "@mui/material";
import Layout from "../components/Layout";
import api from "../api/axios";
import { colors } from "../theme/theme";

const ruleMeta = {
  critical_unassigned_escalation: {
    title: "Auto-escalate unassigned Critical items",
    description: "If a Critical priority item sits unassigned past the threshold, it's auto-assigned to a manager.",
    field: "thresholdMinutes",
    fieldLabel: "Minutes before escalating",
  },
  sla_at_risk_notify: {
    title: "Notify when SLA is at risk",
    description: "Flags a work item as 'at risk' and notifies the org when its remaining SLA time drops below this percentage.",
    field: "slaRemainingPercent",
    fieldLabel: "% SLA remaining threshold",
  },
  resolved_feedback_request: {
    title: "Request feedback on resolution",
    description: "Automatically posts a comment asking for feedback the first time a work item reaches a final status.",
    field: null,
    fieldLabel: null,
  },
};

const AutomationRules = () => {
  const [rules, setRules] = useState({});
  const [saving, setSaving] = useState("");

  const load = () =>
    api.get("/automation-rules").then(({ data }) => {
      const map = {};
      data.forEach((r) => (map[r.type] = r));
      setRules(map);
    });

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (type, isActive) => {
    setSaving(type);
    try {
      await api.patch(`/automation-rules/${type}`, { isActive });
      load();
    } finally {
      setSaving("");
    }
  };

  const handleFieldSave = async (type, field, value) => {
    setSaving(type);
    try {
      await api.patch(`/automation-rules/${type}`, { [field]: Number(value) });
      load();
    } finally {
      setSaving("");
    }
  };

  return (
    <Layout title="Automation Rules">
      <Typography variant="body2" sx={{ color: colors.slate, mb: 3 }}>
        These run automatically in the background — checked every minute — so nothing needs a
        human to notice it first.
      </Typography>

      <Stack spacing={2}>
        {Object.entries(ruleMeta).map(([type, meta]) => {
          const rule = rules[type];
          return (
            <Card key={type}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{meta.title}</Typography>
                    <Typography variant="body2" sx={{ color: colors.slate, mb: meta.field ? 2 : 0 }}>
                      {meta.description}
                    </Typography>
                    {meta.field && (
                      <TextField
                        type="number"
                        size="small"
                        label={meta.fieldLabel}
                        value={rule?.[meta.field] ?? ""}
                        onChange={(e) => setRules({ ...rules, [type]: { ...rule, [meta.field]: e.target.value } })}
                        onBlur={(e) => handleFieldSave(type, meta.field, e.target.value)}
                        sx={{ width: 220 }}
                      />
                    )}
                  </Box>
                  <Switch
                    checked={rule?.isActive ?? false}
                    onChange={(e) => handleToggle(type, e.target.checked)}
                    disabled={saving === type}
                  />
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Layout>
  );
};

export default AutomationRules;
