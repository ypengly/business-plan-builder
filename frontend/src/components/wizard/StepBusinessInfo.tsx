import { useState } from "react";
import { api, apiErrorMessage } from "../../services/api";
import type { BusinessProfile, BusinessStage } from "../../types";

const STAGES: BusinessStage[] = ["IDEA", "PRE_LAUNCH", "OPERATING", "GROWING"];

export default function StepBusinessInfo({
  planId,
  businessName,
  profile,
  onSaved,
}: {
  planId: string;
  businessName: string;
  profile?: BusinessProfile | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState(businessName);
  const [form, setForm] = useState<BusinessProfile>(profile ?? {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await api.put(`/plans/${planId}`, { businessName: name });
      await api.put(`/plans/${planId}/profile`, form);
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't save business information."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="field-label">Business name</label>
        <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label">Business type</label>
          <input className="field-input" value={form.businessType ?? ""} onChange={(e) => setForm((f) => ({ ...f, businessType: e.target.value }))} />
        </div>
        <div>
          <label className="field-label">Stage</label>
          <select
            className="field-input"
            value={form.stage ?? "IDEA"}
            onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as BusinessStage }))}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ").toLowerCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">City</label>
          <input className="field-input" value={form.city ?? ""} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
        </div>
        <div>
          <label className="field-label">Country</label>
          <input className="field-input" value={form.country ?? ""} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="field-label">Business description</label>
        <textarea className="field-input" rows={3} value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </div>
      <div>
        <label className="field-label">Problem you solve</label>
        <textarea className="field-input" rows={2} value={form.problem ?? ""} onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))} />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label">Mission</label>
          <textarea className="field-input" rows={2} value={form.mission ?? ""} onChange={(e) => setForm((f) => ({ ...f, mission: e.target.value }))} />
        </div>
        <div>
          <label className="field-label">Vision</label>
          <textarea className="field-input" rows={2} value={form.vision ?? ""} onChange={(e) => setForm((f) => ({ ...f, vision: e.target.value }))} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={save} disabled={saving} className="btn-primary">
        {saving ? "Saving…" : "Save & continue"}
      </button>
    </div>
  );
}
