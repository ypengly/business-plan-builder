import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../stores/themeStore";

export default function ThemeToggle() {
  const { dark, toggle } = useThemeStore();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="rounded-sm border border-ink/15 p-2 text-ink/70 transition-colors hover:border-ink/40 dark:border-paper/20 dark:text-paper/70 dark:hover:border-paper/50"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
