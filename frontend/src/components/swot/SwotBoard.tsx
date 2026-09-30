import { useState } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { api, apiErrorMessage } from "../../services/api";
import type { SwotItem, SwotCategory } from "../../types";

const CATEGORIES: { key: SwotCategory; label: string; hint: string }[] = [
  { key: "STRENGTH", label: "Strengths", hint: "What gives you an edge" },
  { key: "WEAKNESS", label: "Weaknesses", hint: "Where you're exposed" },
  { key: "OPPORTUNITY", label: "Opportunities", hint: "What's working in your favor" },
  { key: "THREAT", label: "Threats", hint: "What could hurt you" },
];

export default function SwotBoard({ planId, items, onChange }: { planId: string; items: SwotItem[]; onChange: () => void }) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addItem(category: SwotCategory) {
    const content = drafts[category]?.trim();
    if (!content) return;
    await api.post(`/plans/${planId}/swot`, { category, content });
    setDrafts((d) => ({ ...d, [category]: "" }));
    onChange();
  }

  async function deleteItem(itemId: string) {
    await api.delete(`/plans/${planId}/swot/${itemId}`);
    onChange();
  }

  async function generateWithAI() {
    setGenerating(true);
    setError(null);
    try {
      await api.post(`/plans/${planId}/ai/swot`);
      onChange();
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't generate SWOT suggestions right now."));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl">SWOT analysis</h3>
        <button onClick={generateWithAI} disabled={generating} className="btn-secondary !px-3 !py-2 text-xs">
          <Sparkles size={14} /> {generating ? "Generating…" : "Generate SWOT with AI"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="card">
            <div className="mb-3">
              <h4 className="font-medium">{cat.label}</h4>
              <p className="text-xs text-ink/50 dark:text-paper/50">{cat.hint}</p>
            </div>
            <ul className="space-y-2">
              {items.filter((i) => i.category === cat.key).map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-2 rounded-sm bg-white/50 px-3 py-2 text-sm dark:bg-white/5">
                  <span>
                    {item.content}
                    {item.aiGenerated && <span className="ml-2 text-[10px] text-forest dark:text-gold-light">AI</span>}
                  </span>
                  <button onClick={() => deleteItem(item.id)} className="shrink-0 text-ink/30 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addItem(cat.key);
              }}
              className="mt-3 flex gap-2"
            >
              <input
                className="field-input text-sm"
                placeholder={`Add a ${cat.label.toLowerCase().slice(0, -1)}…`}
                value={drafts[cat.key] ?? ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [cat.key]: e.target.value }))}
              />
              <button type="submit" className="btn-secondary !px-3">
                <Plus size={14} />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
