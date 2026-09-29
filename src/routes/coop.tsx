import { createFileRoute } from "@tanstack/react-router";
import { CoopConsole } from "@/components/CoopConsole";

export const Route = createFileRoute("/coop")({
  head: () => ({
    meta: [
      { title: "Co-op dashboard — HerdGuard" },
      {
        name: "description",
        content: "District cooperative view of dairy herd health across member farms.",
      },
      { property: "og:title", content: "Co-op dashboard — HerdGuard" },
      {
        property: "og:description",
        content: "District-level mastitis risk across member dairy farms.",
      },
    ],
  }),
  component: CoopConsole,
});
