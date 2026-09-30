import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ArrowRight, Copy, Download, Trash2 } from "lucide-react";
import { api, apiErrorMessage } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import SiteHeader from "../components/layout/SiteHeader";
import type { BusinessPlanSummary } from "../types";

export default function Dashboard() {
  const [plans, setPlans] = useState<BusinessPlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/plans");
      setPlans(res.data.plans);
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't load your plans."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await api.post("/plans", { businessName: "Untitled Business" });
      navigate(`/plans/${res.data.plan.id}/wizard/business`);
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't create a new plan."));
      setCreating(false);
    }
  }

  async function handleDuplicate(id: string) {
    await api.post(`/plans/${id}/duplicate`);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this plan? This can't be undone.")) return;
    await api.delete(`/plans/${id}`);
    load();
  }

  async function handleExport(id: string) {
    const res = await api.post(`/plans/${id}/export/pdf`, {}, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "business-plan.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  const draftCount = plans.filter((p) => p.status === "DRAFT" || p.status === "IN_PROGRESS").length;
  const completedCount = plans.filter((p) => p.status === "COMPLETED").length;
  const lastUpdated = plans[0]?.updatedAt ? new Date(plans[0].updatedAt).toLocaleDateString() : "—";

  return (
    <div className="min-h-screen bg-paper text-ink dark:bg-ink dark:text-paper">
      <SiteHeader
        actions={
          <button onClick={logout} className="text-sm text-ink/60 hover:text-ink dark:text-paper/60 dark:hover:text-paper">
            Sign out
          </button>
        }
      />
      <div className="container-page py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl">Welcome back, {user?.name?.split(" ")[0] ?? "there"}</h1>
          <button onClick={handleCreate} disabled={creating} className="btn-primary">
            <Plus size={16} /> Create business plan
          </button>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-ink/10 sm:grid-cols-4 dark:border-paper/10">
          {[
            ["Total plans", plans.length],
            ["Draft plans", draftCount],
            ["Completed plans", completedCount],
            ["Last updated", lastUpdated],
          ].map(([label, value]) => (
            <div key={label as string} className="bg-white/40 p-5 dark:bg-white/5">
              <div className="text-xs text-ink/50 dark:text-paper/50">{label}</div>
              <div className="mt-1 font-display text-2xl">{value}</div>
            </div>
          ))}
        </div>

        <h2 className="mt-12 font-display text-xl">Recent plans</h2>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {loading ? (
          <p className="mt-6 text-sm text-ink/50 dark:text-paper/50">Loading…</p>
        ) : plans.length === 0 ? (
          <div className="mt-6 rounded-sm border border-dashed border-ink/20 p-10 text-center dark:border-paper/20">
            <p className="text-ink/60 dark:text-paper/60">No plans yet. Start with your business idea — the wizard does the rest.</p>
            <button onClick={handleCreate} className="btn-primary mt-6">
              <Plus size={16} /> Create your first plan
            </button>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-ink/10 dark:divide-paper/10">
            {plans.map((plan) => (
              <div key={plan.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <Link to={`/plans/${plan.id}/wizard/business`} className="font-medium hover:underline">
                    {plan.businessName}
                  </Link>
                  <div className="mt-1 flex items-center gap-3 text-xs text-ink/50 dark:text-paper/50">
                    <span>{plan.industry ?? "No industry set"}</span>
                    <span>·</span>
                    <span>{plan.completionScore}% complete</span>
                    <span>·</span>
                    <span>{plan.status.replace("_", " ").toLowerCase()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/plans/${plan.id}/wizard/business`} className="btn-secondary !px-3 !py-2 text-xs">
                    Continue <ArrowRight size={14} />
                  </Link>
                  <button onClick={() => handleDuplicate(plan.id)} className="rounded-sm border border-ink/15 p-2 text-ink/60 hover:text-ink dark:border-paper/20 dark:text-paper/60">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => handleExport(plan.id)} className="rounded-sm border border-ink/15 p-2 text-ink/60 hover:text-ink dark:border-paper/20 dark:text-paper/60">
                    <Download size={14} />
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="rounded-sm border border-ink/15 p-2 text-ink/60 hover:text-red-600 dark:border-paper/20 dark:text-paper/60">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
