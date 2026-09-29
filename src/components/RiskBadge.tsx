import { cn } from "@/lib/utils";
import { riskStyle, type RiskLevel } from "@/lib/risk";

export function RiskDot({ level, className }: { level: RiskLevel; className?: string }) {
  return <span className={cn("inline-block size-2.5 rounded-full", riskStyle(level).dot, className)} />;
}

export function RiskBadge({
  level,
  score,
  className,
}: {
  level: RiskLevel;
  score?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        riskStyle(level).badge,
        className,
      )}
    >
      <RiskDot level={level} className="size-2" />
      {level}
      {score !== undefined && <span className="opacity-70">· {score}</span>}
    </span>
  );
}
