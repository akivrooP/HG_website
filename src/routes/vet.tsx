import { createFileRoute } from "@tanstack/react-router";
import { Stethoscope } from "lucide-react";
import { AssistButtons, SwitchRoleButton } from "@/components/TopBar";
import { vet } from "@/data/mock";

export const Route = createFileRoute("/vet")({
  head: () => ({
    meta: [
      { title: "Vet console — HerdGuard" },
      { name: "description", content: "Vet triage console for mastitis risk across partner dairy farms." },
      { property: "og:title", content: "Vet console — HerdGuard" },
      { property: "og:description", content: "Triage high-risk cows across the farms you serve." },
    ],
  }),
  component: VetPlaceholder,
});

function VetPlaceholder() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b px-5 py-4">
        <span className="font-bold">HerdGuard · Vet</span>
        <div className="flex items-center gap-2">
          <AssistButtons />
          <SwitchRoleButton />
        </div>
      </header>
      <main className="mx-auto grid max-w-xl place-items-center px-5 py-24 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Stethoscope className="size-7" />
        </span>
        <h1 className="mt-6 text-2xl font-bold">Coming next</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {vet.name}'s console across {vet.farms} partner farms and about {vet.animals} animals is in
          progress.
        </p>
      </main>
    </div>
  );
}
