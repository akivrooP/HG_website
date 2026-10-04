import { Link } from "@tanstack/react-router";
import { Accessibility, Globe, Mic, Repeat } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useHerd } from "@/context/HerdContext";

const COMING = "Multilingual & voice support (Bhashini) — coming in full version";

export function AssistButtons() {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Language"
        onClick={() => toast(COMING)}
        className="rounded-full"
      >
        <Globe className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Voice assistant"
        onClick={() => toast(COMING)}
        className="rounded-full"
      >
        <Mic className="size-5" />
      </Button>
    </div>
  );
}

export function SwitchRoleButton() {
  const { setRole } = useHerd();
  return (
    <Button asChild variant="outline" size="sm" className="rounded-full">
      <Link to="/" onClick={() => setRole(null)}>
        <Repeat className="size-4" />
        Switch role
      </Link>
    </Button>
  );
}

export function AccessibilityButton() {
  const { darkMode, setDarkMode, textSize, setTextSize, highContrast, setHighContrast } = useHerd();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Accessibility settings"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full"
      >
        <Accessibility className="size-5" />
      </Button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-64 space-y-3 rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl">
          <p className="text-sm font-semibold">Accessibility</p>
          <label className="flex items-center justify-between gap-3 text-xs">
            <span>Dark mode</span>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(event) => setDarkMode(event.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-xs">
            <span>High contrast</span>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(event) => setHighContrast(event.target.checked)}
            />
          </label>
          <label className="block text-xs">
            <span>Text size</span>
            <select
              className="mt-1 h-8 w-full rounded-md border bg-background px-2"
              value={textSize}
              onChange={(event) => setTextSize(event.target.value as typeof textSize)}
            >
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra large</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
