import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api, apiErrorMessage } from "../../services/api";
import type { FinancialProfile, FinancialSummary } from "../../types";

const STARTUP_COST_KEYS = ["equipment", "rent_deposit", "renovation", "initial_inventory", "licenses", "marketing", "software"];

export default function FinancialDashboard({ planId, initial }: { planId: string; initial?: FinancialProfile | null }) {
  const [form, setForm] = useState<FinancialProfile>(
    initial ?? {
      startupCosts: {},
      fixedMonthlyCosts: 0,
      variableCostPerUnit: 0,
      sellingPricePerUnit: 0,
      monthlyGrowthRate: 0,
      startingCash: 0,
    }
  );
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadSummary() {
    try {
      const res = await api.get(`/plans/${planId}/financials`);
      setSummary(res.data.summary);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await api.put(`/plans/${planId}/financial-profile`, form);
      await loadSummary();
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't save your financial assumptions."));
    } finally {
      setSaving(false);
    }
  }

  const totalStartupCosts = Object.values(form.startupCosts).reduce((a, b) => a + (b || 0), 0);
  const contributionMargin = form.sellingPricePerUnit - form.variableCostPerUnit;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-xl">Startup costs</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {STARTUP_COST_KEYS.map((key) => (
            <div key={key}>
              <label className="field-label capitalize">{key.replace(/_/g, " ")}</label>
              <input
                type="number"
                className="field-input"
                value={form.startupCosts[key] ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startupCosts: { ...f.startupCosts, [key]: Number(e.target.value) } }))
                }
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink/60 dark:text-paper/60">
          Total startup cost: <span className="font-medium">${totalStartupCosts.toLocaleString()}</span>
        </p>
      </div>

      <div>
        <h3 className="font-display text-xl">Pricing & break-even</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="field-label">Selling price per unit ($)</label>
            <input
              type="number"
              className="field-input"
              value={form.sellingPricePerUnit}
              onChange={(e) => setForm((f) => ({ ...f, sellingPricePerUnit: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="field-label">Variable cost per unit ($)</label>
            <input
              type="number"
              className="field-input"
              value={form.variableCostPerUnit}
              onChange={(e) => setForm((f) => ({ ...f, variableCostPerUnit: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="field-label">Fixed monthly costs ($)</label>
            <input
              type="number"
              className="field-input"
              value={form.fixedMonthlyCosts}
              onChange={(e) => setForm((f) => ({ ...f, fixedMonthlyCosts: Number(e.target.value) }))}
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="field-label">Starting cash ($)</label>
            <input
              type="number"
              className="field-input"
              value={form.startingCash}
              onChange={(e) => setForm((f) => ({ ...f, startingCash: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="field-label">Monthly growth rate (%)</label>
            <input
              type="number"
              className="field-input"
              value={form.monthlyGrowthRate * 100}
              onChange={(e) => setForm((f) => ({ ...f, monthlyGrowthRate: Number(e.target.value) / 100 }))}
            />
          </div>
        </div>

        {contributionMargin <= 0 && form.sellingPricePerUnit > 0 && (
          <p className="mt-3 text-sm text-red-600">
            Your selling price doesn't cover the variable cost per unit — this business can't break even as priced.
          </p>
        )}

        <button onClick={save} disabled={saving} className="btn-primary mt-6">
          {saving ? "Saving…" : "Save & recalculate"}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {summary && (
        <div>
          <h3 className="font-display text-xl">Projections</h3>
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-ink/10 sm:grid-cols-4 dark:border-paper/10">
            {[
              ["Break-even units/mo", summary.breakEvenUnits === -1 ? "N/A" : summary.breakEvenUnits],
              ["Break-even revenue/mo", summary.breakEvenRevenue === -1 ? "N/A" : `$${summary.breakEvenRevenue.toLocaleString()}`],
              ["Gross margin", `${summary.grossMarginPct}%`],
              ["Est. runway", summary.estimatedRunwayMonths ? `${summary.estimatedRunwayMonths} mo` : "Cash-flow positive"],
            ].map(([label, value]) => (
              <div key={label as string} className="bg-white/40 p-4 dark:bg-white/5">
                <div className="text-xs text-ink/50 dark:text-paper/50">{label}</div>
                <div className="mt-1 font-display text-xl">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 h-72 rounded-sm border border-ink/10 p-4 dark:border-paper/10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.monthlyProjection}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} label={{ value: "Month", position: "insideBottom", offset: -5, fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#2F5D50" name="Revenue" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="netProfit" stroke="#C98A3E" name="Net profit" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="cumulativeCash" stroke="#12172B" name="Cumulative cash" dot={false} strokeWidth={1.5} strokeDasharray="4 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {summary.yearTotals.map((y) => (
              <div key={y.year} className="card">
                <div className="text-sm font-medium">Year {y.year}</div>
                <div className="mt-2 space-y-1 text-sm text-ink/60 dark:text-paper/60">
                  <div className="flex justify-between"><span>Revenue</span><span>${y.revenue.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Expenses</span><span>${y.expenses.toLocaleString()}</span></div>
                  <div className="flex justify-between font-medium text-ink dark:text-paper"><span>Net profit</span><span>${y.netProfit.toLocaleString()}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
