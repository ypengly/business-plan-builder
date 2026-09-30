import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../../services/api";
import type { Persona } from "../../types";

export default function StepCustomer({ planId, personas, onChange }: { planId: string; personas: Persona[]; onChange: () => void }) {
  const [draft, setDraft] = useState({ name: "", ageRange: "", location: "", incomeRange: "", occupation: "", problems: "" });

  async function addPersona() {
    if (!draft.name.trim()) return;
    await api.post(`/plans/${planId}/personas`, draft);
    setDraft({ name: "", ageRange: "", location: "", incomeRange: "", occupation: "", problems: "" });
    onChange();
  }

  async function deletePersona(id: string) {
    await api.delete(`/plans/${planId}/personas/${id}`);
    onChange();
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {personas.map((p, i) => (
          <div key={p.id} className="card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink/40 dark:text-paper/40">Persona {i + 1}</span>
              <button onClick={() => deletePersona(p.id)} className="text-ink/30 hover:text-red-600">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="mt-1 font-medium">{p.name}</div>
            <div className="mt-2 space-y-1 text-sm text-ink/60 dark:text-paper/60">
              <div>Age: {p.ageRange || "—"}</div>
              <div>Location: {p.location || "—"}</div>
              <div>Income: {p.incomeRange || "—"}</div>
              <div>Needs: {p.problems || "—"}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-4">
        <h4 className="font-medium">Add a customer persona</h4>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="field-label">Persona name</label>
            <input className="field-input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          </div>
          <div>
            <label className="field-label">Age range</label>
            <input className="field-input" placeholder="22-35" value={draft.ageRange} onChange={(e) => setDraft((d) => ({ ...d, ageRange: e.target.value }))} />
          </div>
          <div>
            <label className="field-label">Location</label>
            <input className="field-input" value={draft.location} onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))} />
          </div>
          <div>
            <label className="field-label">Income range</label>
            <input className="field-input" value={draft.incomeRange} onChange={(e) => setDraft((d) => ({ ...d, incomeRange: e.target.value }))} />
          </div>
          <div>
            <label className="field-label">Occupation</label>
            <input className="field-input" value={draft.occupation} onChange={(e) => setDraft((d) => ({ ...d, occupation: e.target.value }))} />
          </div>
          <div className="sm:col-span-3">
            <label className="field-label">Needs / problems</label>
            <input className="field-input" value={draft.problems} onChange={(e) => setDraft((d) => ({ ...d, problems: e.target.value }))} />
          </div>
        </div>
        <button onClick={addPersona} className="btn-secondary mt-4">
          <Plus size={14} /> Add persona
        </button>
      </div>
    </div>
  );
}
