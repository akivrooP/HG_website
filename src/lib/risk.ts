export type RiskLevel = "No risk" | "Low" | "Moderate" | "High";

export const RISK_LEVELS: RiskLevel[] = ["No risk", "Low", "Moderate", "High"];

type RiskStyle = {
  badge: string;
  dot: string;
  soft: string;
  text: string;
  chart: string;
};

const styles: Record<RiskLevel, RiskStyle> = {
  "No risk": {
    badge: "bg-risk-none/15 text-risk-none border-risk-none/30",
    dot: "bg-risk-none",
    soft: "bg-risk-none/10",
    text: "text-risk-none",
    chart: "var(--risk-none)",
  },
  Low: {
    badge: "bg-risk-low/15 text-risk-low border-risk-low/30",
    dot: "bg-risk-low",
    soft: "bg-risk-low/10",
    text: "text-risk-low",
    chart: "var(--risk-low)",
  },
  Moderate: {
    badge: "bg-risk-moderate/15 text-risk-moderate border-risk-moderate/30",
    dot: "bg-risk-moderate",
    soft: "bg-risk-moderate/10",
    text: "text-risk-moderate",
    chart: "var(--risk-moderate)",
  },
  High: {
    badge: "bg-risk-high/15 text-risk-high border-risk-high/30",
    dot: "bg-risk-high",
    soft: "bg-risk-high/10",
    text: "text-risk-high",
    chart: "var(--risk-high)",
  },
};

export function riskStyle(level: RiskLevel): RiskStyle {
  return styles[level];
}

export function riskColor(level: RiskLevel): string {
  return styles[level].chart;
}

export function riskRank(level: RiskLevel): number {
  return RISK_LEVELS.indexOf(level);
}
