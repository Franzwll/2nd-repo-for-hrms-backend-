import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeChoice } from "@/lib/theme";

/** Persisted Light/Dark/System switch — public header, login + portal header. */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { choice, setChoice } = useThemeChoice();
  const Icon = choice === "Dark" ? Moon : choice === "Light" ? Sun : Monitor;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          aria-label={`Theme: ${choice}. Change theme`}
          className="gap-2"
        >
          <Icon className="h-4 w-4" />
          {!compact && <span className="text-xs font-medium">{choice}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(["Light", "Dark", "System"] as const).map((c) => (
          <DropdownMenuItem key={c} onClick={() => setChoice(c)}>
            {c}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
