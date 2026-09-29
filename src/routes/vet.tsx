import { createFileRoute } from "@tanstack/react-router";
import { VetConsole } from "@/components/VetConsole";

export const Route = createFileRoute("/vet")({
  head: () => ({
    meta: [
      { title: "Vet console — HerdGuard" },
      {
        name: "description",
        content: "Vet triage console for mastitis risk across partner dairy farms.",
      },
      { property: "og:title", content: "Vet console — HerdGuard" },
      { property: "og:description", content: "Triage high-risk cows across the farms you serve." },
    ],
  }),
  component: VetConsole,
});
