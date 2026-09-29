import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CowCard } from "@/components/CowCard";
import { useHerd } from "@/context/HerdContext";
import { RISK_LEVELS, riskRank, type RiskLevel } from "@/lib/risk";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/herd")({
  head: () => ({
    meta: [
      { title: "My herd — HerdGuard" },
      { name: "description", content: "Search and filter all 128 cows by mastitis risk level and milk yield." },
      { property: "og:title", content: "My herd — HerdGuard" },
      { property: "og:description", content: "Every cow, with live risk badges and yield." },
    ],
  }),
  component: MyHerd,
});

const FILTERS: ("All" | RiskLevel)[] = ["All", "High", "Moderate", "Low", "No risk"];

function MyHerd() {
  const { cows } = useHerd();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cows
      .filter((c) => (filter === "All" ? true : c.riskLevel === filter))
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.id.includes(q) ||
          c.tag.toLowerCase().includes(q),
      )
      .sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel) || b.riskScore - a.riskScore);
  }, [cows, query, filter]);

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-xl font-bold">My herd</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search name, tag or Pashu Aadhaar"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {f}
            {f !== "All" && (
              <span className="ml-1 opacity-70">
                {cows.filter((c) => c.riskLevel === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{list.length} cows</p>

      <div className="space-y-2">
        {list.map((cow) => (
          <CowCard key={cow.id} cow={cow} />
        ))}
        {list.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No cows match.</p>
        )}
      </div>
      <p className="sr-only">{RISK_LEVELS.join(", ")}</p>
    </div>
  );
}
