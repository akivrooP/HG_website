import { Link } from "@tanstack/react-router";
import { Globe, Mic, Repeat } from "lucide-react";
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
