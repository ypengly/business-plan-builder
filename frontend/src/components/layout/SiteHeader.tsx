import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <header className="border-b border-ink/10 dark:border-paper/10">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-lg tracking-tight">
          Ledger
        </Link>
        <div className="flex items-center gap-3">
          {actions}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
