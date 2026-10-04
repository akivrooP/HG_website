import { createFileRoute } from "@tanstack/react-router";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AlertTriangle, Bell, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CowCard } from "@/components/CowCard";
import { useHerd } from "@/context/HerdContext";
import { farmer } from "@/data/mock";
import { RISK_LEVELS, riskColor, type RiskLevel } from "@/lib/risk";

export const Route = createFileRoute("/farmer/")({
  head: () => ({
    meta: [
      { title: "Farm home — HerdGuard" },
      { name: "description", content: "Daily herd health snapshot: cows at risk, alerts and animals needing attention." },
      { property: "og:title", content: "Farm home — HerdGuard" },
      { property: "og:description", content: "Your herd's mastitis risk at a glance." },
    ],
  }),
  component: FarmerHome,
});

function FarmerHome() {
  const { cows, alerts } = useHerd();
  const counts = RISK_LEVELS.map((level) => ({
    name: level as RiskLevel,
    value: cows.filter((c) => c.riskLevel === level).length,
  }));
  const atRisk = cows.filter((c) => c.riskLevel !== "No risk").length;
  const attention = [...cows].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  const stats = [
    { label: "Total cows", value: cows.length, icon: Users },
    { label: "At risk", value: atRisk, icon: AlertTriangle },
    { label: "Alerts today", value: alerts.filter((a) => a.time.includes("ago") || a.time.includes("hr")).length, icon: Bell },
  ];

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-bold">Namaste, Ramesh</h1>
        <p className="text-xs text-muted-foreground">
          {farmer.farmName} · {farmer.district}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="gap-1 p-3">
            <Icon className="size-4 text-primary" />
            <p className="text-xl font-bold leading-none">{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <p className="text-sm font-semibold">Herd risk breakdown</p>
        <div className="flex items-center gap-3">
          <div className="h-36 w-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={counts}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={42}
                  outerRadius={64}
                  paddingAngle={2}
                  stroke="none"
                >
                  {counts.map((c) => (
                    <Cell key={c.name} fill={riskColor(c.name)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex-1 space-y-1.5">
            {counts.map((c) => (
              <li key={c.name} className="flex items-center gap-2 text-xs">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: riskColor(c.name) }}
                />
                <span className="flex-1 text-muted-foreground">{c.name}</span>
                <span className="font-semibold">{c.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <div>
        <p className="mb-2 text-sm font-semibold">Needs attention now</p>
        <div className="space-y-2">
          {attention.map((cow) => (
            <CowCard key={cow.id} cow={cow} />
          ))}
        </div>
      </div>
    </div>
  );
}
