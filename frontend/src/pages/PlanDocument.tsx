import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, FileDown, FileText, Link as LinkIcon } from "lucide-react";
import { api, apiErrorMessage } from "../services/api";
import SiteHeader from "../components/layout/SiteHeader";

const NAV_SECTIONS = [
  "Executive Summary", "Company Description", "Product", "Market", "Competition",
  "Marketing", "Operations", "Management", "Financials", "SWOT", "Risks", "Growth",
];

export default function PlanDocument() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!id) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post(`/plans/${id}/generate`);
      setContent(res.data.content);
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't generate the plan right now."));
    } finally {
      setGenerating(false);
    }
  }

  async function handleExport(type: "pdf" | "docx") {
    if (!id) return;
    setExporting(type);
    try {
      const res = await api.post(`/plans/${id}/export/${type}`, {}, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `business-plan.${type}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(apiErrorMessage(err, "Export failed. Please try again."));
    } finally {
      setExporting(null);
    }
  }

  async function handleShare() {
    if (!id) return;
    const res = await api.post(`/plans/${id}/share`);
    setShareUrl(res.data.shareUrl);
  }

  return (
    <div className="min-h-screen bg-paper text-ink dark:bg-ink dark:text-paper">
      <SiteHeader
        actions={
          <button onClick={() => navigate(`/plans/${id}/wizard/review`)} className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink dark:text-paper/60">
            <ArrowLeft size={14} /> Back to wizard
          </button>
        }
      />

      <div className="container-page grid grid-cols-1 gap-8 py-10 lg:grid-cols-[200px_1fr]">
        <nav className="hidden lg:block">
          <ul className="sticky top-10 space-y-1 text-sm">
            {NAV_SECTIONS.map((s) => (
              <li key={s}>
                <a href={`#${s.replace(/\s+/g, "-").toLowerCase()}`} className="block py-1 text-ink/60 hover:text-forest dark:text-paper/60 dark:hover:text-gold-light">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-2xl">Business plan document</h1>
            <div className="flex flex-wrap gap-2">
              <button onClick={generate} disabled={generating} className="btn-primary !py-2 text-sm">
                <Sparkles size={14} /> {generating ? "Generating…" : "Generate business plan"}
              </button>
              <button onClick={() => handleExport("pdf")} disabled={exporting !== null} className="btn-secondary !py-2 text-sm">
                <FileDown size={14} /> {exporting === "pdf" ? "Exporting…" : "Export PDF"}
              </button>
              <button onClick={() => handleExport("docx")} disabled={exporting !== null} className="btn-secondary !py-2 text-sm">
                <FileText size={14} /> {exporting === "docx" ? "Exporting…" : "Export DOCX"}
              </button>
              <button onClick={handleShare} className="btn-secondary !py-2 text-sm">
                <LinkIcon size={14} /> Share link
              </button>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {shareUrl && (
            <p className="mt-3 rounded-sm bg-forest/5 px-3 py-2 text-sm text-forest dark:bg-forest-light/10 dark:text-gold-light">
              Shareable link created: <span className="underline">{shareUrl}</span>
            </p>
          )}

          <div className="card mt-6 min-h-[24rem]">
            {content ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{content}</div>
            ) : (
              <p className="text-sm text-ink/50 dark:text-paper/50">
                Nothing generated yet. Click "Generate business plan" to draft every section from what you've
                entered so far — you can edit anything afterward.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
