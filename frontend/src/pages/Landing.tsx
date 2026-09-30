import { Link } from "react-router-dom";
import SiteHeader from "../components/layout/SiteHeader";

const STEPS = [
  { n: "1", title: "Describe your business", body: "Tell us what you're building in plain language — no jargon required." },
  { n: "2", title: "Answer guided questions", body: "A short wizard walks you through product, customers, market, and money." },
  { n: "3", title: "Generate your plan", body: "Every section is drafted for you, grounded in what you told us." },
  { n: "4", title: "Review and improve", body: "Edit anything. Ask for a shorter version, a sharper pitch, or a second opinion." },
  { n: "5", title: "Export and share", body: "Download a formatted PDF or Word file, or send a private link." },
];

const TEMPLATES = [
  "Coffee Shop", "Restaurant", "Retail Store", "SaaS Startup", "Mobile App", "Farm",
  "Real Estate", "Transportation", "Salon", "Gym", "E-commerce", "Freelancer", "Construction", "Education",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink dark:bg-ink dark:text-paper">
      <SiteHeader
        actions={
          <div className="hidden items-center gap-6 sm:flex">
            <Link to="/login" className="text-sm text-ink/70 hover:text-ink dark:text-paper/70 dark:hover:text-paper">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary">
              Create my plan
            </Link>
          </div>
        }
      />

      {/* Hero */}
      <section className="container-page grid grid-cols-1 gap-12 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-7">
          <p className="mb-6 text-sm text-forest dark:text-gold-light">For people who've never written one before</p>
          <h1 className="font-display text-[2.75rem] leading-[1.05] tracking-tight sm:text-6xl">
            A business plan that reads like you spent a week on it.
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink/70 dark:text-paper/70">
            Turn a rough idea into a clear, structured, investor-ready business plan — with guided
            questions instead of a blank page.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary">
              Create my business plan
            </Link>
            <a href="#how-it-works" className="btn-secondary">
              See how it works
            </a>
          </div>
        </div>

        {/* Hero visual: a live-looking ledger excerpt, the subject's own artifact, not a generic dashboard */}
        <div className="md:col-span-5">
          <div className="card font-sans text-sm shadow-ledger">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="font-display text-base">Urban Bean Coffee</span>
              <span className="text-xs text-ink/40 dark:text-paper/40">Draft · 72% complete</span>
            </div>
            <div className="rule mb-3" />
            {[
              ["Break-even", "412 units / month"],
              ["Gross margin", "64.9%"],
              ["Starting capital needed", "$12,800"],
              ["Est. runway", "8 months"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-ink/5 py-2.5 last:border-none dark:border-paper/5">
                <span className="text-ink/60 dark:text-paper/60">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
            <div className="mt-4 rounded-sm bg-forest/5 p-3 text-xs text-forest dark:bg-forest-light/10 dark:text-gold-light">
              AI note: your marketing budget covers 6 weeks at current spend — consider extending it before launch.
            </div>
          </div>
        </div>
      </section>

      {/* How it works — a genuine sequence, so numbering earns its place */}
      <section id="how-it-works" className="border-t border-ink/10 py-20 dark:border-paper/10">
        <div className="container-page">
          <h2 className="font-display text-3xl">How it works</h2>
          <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s) => (
              <div key={s.n}>
                <div className="mb-3 font-display text-2xl text-forest dark:text-gold-light">{s.n}</div>
                <h3 className="font-medium">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink/60 dark:text-paper/60">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features as a plain list, not a card grid — matches the ledger register style */}
      <section className="border-t border-ink/10 py-20 dark:border-paper/10">
        <div className="container-page grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl">Everything a plan needs</h2>
            <p className="mt-4 max-w-sm text-ink/60 dark:text-paper/60">
              Not a form. A working set of tools for the parts of a plan that are usually the
              hardest to start: the numbers, the competition, and the pitch.
            </p>
          </div>
          <ul className="divide-y divide-ink/10 dark:divide-paper/10">
            {[
              "AI business plan generator",
              "Financial projections & break-even calculator",
              "Market & competitor analysis",
              "SWOT analysis",
              "Marketing & sales strategy",
              "Business Model Canvas",
              "Professional PDF & Word export",
              "Plan quality scoring",
            ].map((f) => (
              <li key={f} className="flex items-center justify-between py-3.5">
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Templates */}
      <section className="border-t border-ink/10 py-20 dark:border-paper/10">
        <div className="container-page">
          <h2 className="font-display text-3xl">Start from a template</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {TEMPLATES.map((t) => (
              <span
                key={t}
                className="rounded-full border border-ink/15 px-4 py-1.5 text-sm text-ink/70 dark:border-paper/20 dark:text-paper/70"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/10 py-10 dark:border-paper/10">
        <div className="container-page flex flex-col items-center justify-between gap-4 text-sm text-ink/50 sm:flex-row dark:text-paper/50">
          <span>Ledger — business plans, written with you.</span>
          <Link to="/register" className="underline underline-offset-4">
            Get started
          </Link>
        </div>
      </footer>
    </div>
  );
}
