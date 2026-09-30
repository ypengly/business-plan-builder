import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { api, apiErrorMessage } from "../../services/api";

/**
 * Floating AI assistant. Sends the current section's text + an instruction to
 * POST /api/plans/:id/ai/improve, which runs it through AIService.improveSection
 * with the plan's business context attached server-side.
 */
export default function AIAssistantPanel({
  planId,
  sectionTitle,
  currentText,
  onApply,
}: {
  planId: string;
  sectionTitle: string;
  currentText: string;
  onApply: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickActions = [
    "Improve the writing",
    "Make it shorter",
    "Make it more professional",
    "Generate more ideas",
    "Explain this section",
    "Rewrite from scratch",
  ];

  async function runInstruction(instruction: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post(`/plans/${planId}/ai/improve`, {
        sectionTitle,
        currentText,
        instruction,
      });
      setResult(res.data.content);
    } catch (err) {
      setError(apiErrorMessage(err, "The AI assistant couldn't respond just now."));
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-forest px-4 py-3 text-sm text-paper shadow-lg hover:bg-forest-dark"
      >
        <Sparkles size={16} /> Ask AI
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-h-[70vh] w-[22rem] flex-col rounded-sm border border-ink/10 bg-paper shadow-xl dark:border-paper/10 dark:bg-ink">
      <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3 dark:border-paper/10">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Sparkles size={14} /> AI assistant
        </span>
        <button onClick={() => setOpen(false)} className="text-ink/50 hover:text-ink dark:text-paper/50">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs text-ink/50 dark:text-paper/50">Working on: {sectionTitle}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {quickActions.map((a) => (
            <button
              key={a}
              onClick={() => runInstruction(a)}
              className="rounded-full border border-ink/15 px-2.5 py-1 text-xs text-ink/70 hover:border-forest hover:text-forest dark:border-paper/20 dark:text-paper/70"
            >
              {a}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (customPrompt.trim()) runInstruction(customPrompt.trim());
          }}
          className="mt-3"
        >
          <input
            className="field-input text-xs"
            placeholder="Or ask something specific…"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
        </form>

        {loading && <p className="mt-4 text-xs text-ink/50 dark:text-paper/50">Thinking…</p>}
        {error && <p className="mt-4 text-xs text-red-600">{error}</p>}
        {result && (
          <div className="mt-4 rounded-sm border border-ink/10 bg-white/50 p-3 text-xs leading-relaxed dark:border-paper/10 dark:bg-white/5">
            <p className="whitespace-pre-wrap">{result}</p>
            <button
              onClick={() => {
                onApply(result);
                setResult(null);
              }}
              className="btn-primary mt-3 w-full !py-2 text-xs"
            >
              Use this
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
