import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api, apiErrorMessage } from "../services/api";
import SiteHeader from "../components/layout/SiteHeader";
import WizardProgress, { WIZARD_STEPS } from "../components/wizard/WizardProgress";
import StepBusinessInfo from "../components/wizard/StepBusinessInfo";
import StepProduct from "../components/wizard/StepProduct";
import StepCustomer from "../components/wizard/StepCustomer";
import SwotBoard from "../components/swot/SwotBoard";
import FinancialDashboard from "../components/financial/FinancialDashboard";
import AIAssistantPanel from "../components/ai/AIAssistantPanel";
import type { BusinessPlanFull, QualityReport } from "../types";

export default function PlanWizard() {
  const { id, step = "business" } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<BusinessPlanFull | null>(null);
  const [quality, setQuality] = useState<QualityReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/plans/${id}`);
      setPlan(res.data.plan);
      setQuality(res.data.quality);
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't load this plan."));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!id) return null;

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === step);
  const next = WIZARD_STEPS[stepIndex + 1];
  const prev = WIZARD_STEPS[stepIndex - 1];

  return (
    <div className="min-h-screen bg-paper text-ink dark:bg-ink dark:text-paper">
      <SiteHeader
        actions={
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink dark:text-paper/60">
            <ArrowLeft size={14} /> Dashboard
          </button>
        }
      />
      <div className="border-b border-ink/10 dark:border-paper/10">
        <div className="container-page py-3">
          <WizardProgress planId={id} current={step} />
        </div>
      </div>

      <div className="container-page py-10">
        {error && <p className="mb-6 text-sm text-red-600">{error}</p>}
        {!plan ? (
          <p className="text-sm text-ink/50 dark:text-paper/50">Loading…</p>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl">{plan.businessName}</h1>
                {quality && (
                  <p className="mt-1 text-sm text-ink/50 dark:text-paper/50">
                    {quality.overallPct}% complete
                    {quality.missing.length > 0 && ` · Missing: ${quality.missing.slice(0, 2).join(", ")}`}
                  </p>
                )}
              </div>
            </div>

            {step === "business" && (
              <StepBusinessInfo planId={id} businessName={plan.businessName} profile={plan.profile} onSaved={load} />
            )}
            {step === "product" && <StepProduct planId={id} products={plan.products} onChange={load} />}
            {step === "customer" && <StepCustomer planId={id} personas={plan.personas} onChange={load} />}
            {step === "swot" && <SwotBoard planId={id} items={plan.swotItems} onChange={load} />}
            {step === "financials" && <FinancialDashboard planId={id} initial={plan.financialProfile} />}
            {step === "review" && (
              <div className="space-y-4">
                <p className="text-ink/70 dark:text-paper/70">
                  Your plan is {quality?.overallPct ?? 0}% complete. Head to the document view to generate the
                  full write-up and export it.
                </p>
                <button onClick={() => navigate(`/plans/${id}/document`)} className="btn-primary">
                  Open document view
                </button>
              </div>
            )}

            <div className="mt-10 flex justify-between border-t border-ink/10 pt-6 dark:border-paper/10">
              {prev ? (
                <button onClick={() => navigate(`/plans/${id}/wizard/${prev.key}`)} className="btn-secondary">
                  Back
                </button>
              ) : (
                <span />
              )}
              {next && (
                <button onClick={() => navigate(`/plans/${id}/wizard/${next.key}`)} className="btn-primary">
                  Next: {next.label}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {plan && (
        <AIAssistantPanel
          planId={id}
          sectionTitle={WIZARD_STEPS[stepIndex]?.label ?? "Plan"}
          currentText={plan.profile?.description ?? ""}
          onApply={() => load()}
        />
      )}
    </div>
  );
}
