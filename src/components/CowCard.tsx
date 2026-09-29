import { Link } from "@tanstack/react-router";
import { ChevronRight, Droplets } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { Card } from "@/components/ui/card";
import type { Cow } from "@/data/mock";

export function CowCard({ cow }: { cow: Cow }) {
  return (
    <Link to="/farmer/cow/$id" params={{ id: cow.id }} className="block">
      <Card className="flex-row items-center gap-3 p-3 transition-colors hover:border-primary/40">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{cow.name}</p>
            <span className="text-xs text-muted-foreground">{cow.tag}</span>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {cow.breed} · ID {cow.id}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <RiskBadge level={cow.riskLevel} score={cow.riskScore} />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Droplets className="size-3.5" />
              {cow.sensors.milkYield} L/day
            </span>
          </div>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </Card>
    </Link>
  );
}
