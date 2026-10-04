import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SensorTile({
  label,
  value,
  unit,
  trend,
  badIsUp,
}: {
  label: string;
  value: number | string;
  unit: string;
  trend: number;
  badIsUp: boolean;
}) {
  const flat = Math.abs(trend) < 0.5;
  const bad = badIsUp ? trend > 0.5 : trend < -0.5;
  const Icon = flat ? Minus : trend > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="gap-1 p-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="text-lg font-bold leading-tight">
        {value}
        <span className="ml-1 text-[11px] font-medium text-muted-foreground">{unit}</span>
      </p>
      <p
        className={cn(
          "flex items-center gap-0.5 text-[11px] font-semibold",
          flat ? "text-muted-foreground" : bad ? "text-risk-high" : "text-risk-none",
        )}
      >
        <Icon className="size-3.5" />
        {trend > 0 ? "+" : ""}
        {trend}% vs baseline
      </p>
    </Card>
  );
}
