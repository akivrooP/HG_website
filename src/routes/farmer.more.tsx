import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Cpu, Settings, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { farmer } from "@/data/mock";

export const Route = createFileRoute("/farmer/more")({
  head: () => ({
    meta: [
      { title: "More — HerdGuard" },
      { name: "description", content: "Device sync status, settings and consent options for your dairy farm." },
      { property: "og:title", content: "More — HerdGuard" },
      { property: "og:description", content: "Manage devices, sync and settings." },
    ],
  }),
  component: More,
});

const ITEMS = [
  { to: "/farmer/data", label: "Data & Sync", desc: "Tags, farm unit, offline mode", icon: Cpu },
  { to: "/farmer/settings", label: "Settings", desc: "Language, alerts, consent", icon: Settings },
] as const;

function More() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">More</h1>

      <Card className="flex-row items-center gap-3 p-4">
        <span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <p className="font-semibold">{farmer.name}</p>
          <p className="text-xs text-muted-foreground">
            {farmer.farmName} · {farmer.cowCount} cows
          </p>
        </div>
      </Card>

      <div className="space-y-2">
        {ITEMS.map(({ to, label, desc, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="flex-row items-center gap-3 p-4 transition-colors hover:border-primary/40">
              <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon className="size-4.5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
