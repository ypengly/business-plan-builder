import { useNavigate, useParams } from "react-router-dom";

export const WIZARD_STEPS = [
  { key: "business", label: "Business" },
  { key: "product", label: "Product" },
  { key: "customer", label: "Customer" },
  { key: "swot", label: "SWOT" },
  { key: "financials", label: "Finance" },
  { key: "review", label: "Review" },
];

export default function WizardProgress({ planId, current }: { planId: string; current: string }) {
  const navigate = useNavigate();
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center overflow-x-auto">
      {WIZARD_STEPS.map((step, i) => (
        <button
          key={step.key}
          onClick={() => navigate(`/plans/${planId}/wizard/${step.key}`)}
          className="group flex shrink-0 items-center"
        >
          <span
            className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm ${
              i === currentIndex
                ? "font-medium text-forest dark:text-gold-light"
                : i < currentIndex
                ? "text-ink/60 dark:text-paper/60"
                : "text-ink/30 dark:text-paper/30"
            }`}
          >
            <span className="font-display text-xs">{String(i + 1).padStart(2, "0")}</span>
            {step.label}
          </span>
          {i < WIZARD_STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-ink/15 dark:bg-paper/15" />}
        </button>
      ))}
    </div>
  );
}
