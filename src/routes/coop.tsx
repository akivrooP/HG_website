import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { AssistButtons, SwitchRoleButton } from "@/components/TopBar";
import { coop } from "@/data/mock";

export const Route = createFileRoute("/coop")({
  head: () => ({
    meta: [
      { title: "Co-op dashboard — HerdGuard" },
      { name: "description", content: "District cooperative view of dairy herd health across member farms." },
      { property: "og:title", content: "Co-op dashboard — HerdGuard" },
      { property: "og:description", content: "District-level mastitis risk across member dairy farms." },
    ],
  }),
  component: CoopPlaceholder,
});

function CoopPlaceholder() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b px-5 py-4">
        <span className="font-bold">HerdGuard · Co-op</span>
        <div className="flex items-center gap-2">
          <AssistButtons />
          <SwitchRoleButton />
        </div>
      </header>
      <main className="mx-auto grid max-w-xl place-items-center px-5 py-24 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Building2 className="size-7" />
        </span>
        <h1 className="mt-6 text-2xl font-bold">Coming next</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {coop.name} view with {coop.memberFarms} member farms and a village risk map is in progress.
        </p>
      </main>
    </div>
  );
}
