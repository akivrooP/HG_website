import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { useHerd } from "@/context/HerdContext";
import { herdRiskTrend, yieldVsRisk } from "@/data/mock";
import { riskColor } from "@/lib/risk";

export const Route = createFileRoute("/farmer/analytics")({
  head: () => ({
    meta: [
      { title: "Herd analytics — HerdGuard" },
      { name: "description", content: "30-day herd risk trend, top risk factors and milk yield against risk score." },
      { property: "og:title", content: "Herd analytics — HerdGuard" },
      { property: "og:description", content: "Trends behind your herd's mastitis risk." },
    ],
  }),
  component: Analytics,
});

const axis = { fontSize: 10, fill: "var(--muted-foreground)" };

function Analytics() {
  const { cows } = useHerd();

  const factorTotals = new Map<string, number>();
  cows.forEach((c) =>
    c.factors.forEach((f) => factorTotals.set(f.label, (factorTotals.get(f.label) ?? 0) + f.percent)),
  );
  const topFactors = [...factorTotals.entries()]
    .map(([label, total]) => ({ label, percent: Math.round(total / cows.length) }))
    .sort((a, b) => b.percent - a.percent);

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Analytics</h1>

      <Card className="gap-2 p-4">
        <p className="text-sm font-semibold">Herd risk — last 30 days</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={herdRiskTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={axis} interval={6} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} width={24} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="low"
                stackId="1"
                stroke={riskColor("Low")}
                fill={riskColor("Low")}
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="moderate"
                stackId="1"
                stroke={riskColor("Moderate")}
                fill={riskColor("Moderate")}
                fillOpacity={0.35}
              />
              <Area
                type="monotone"
                dataKey="high"
                stackId="1"
                stroke={riskColor("High")}
                fill={riskColor("High")}
                fillOpacity={0.4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="gap-2 p-4">
        <p className="text-sm font-semibold">Top risk factors across the herd</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topFactors} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ ...axis, fontSize: 9 }}
                width={100}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Bar dataKey="percent" fill="var(--primary)" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="gap-2 p-4">
        <p className="text-sm font-semibold">Milk yield vs risk score</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                dataKey="riskScore"
                name="Risk score"
                tick={axis}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="milkYield"
                name="Milk L/day"
                tick={axis}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={yieldVsRisk}>
                {yieldVsRisk.map((d, i) => (
                  <Cell key={i} fill={riskColor(d.level)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Higher risk scores cluster with lower daily yield — the loss starts before symptoms.
        </p>
      </Card>
    </div>
  );
}
