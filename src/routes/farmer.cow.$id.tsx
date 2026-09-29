import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, Plus, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiskBadge } from "@/components/RiskBadge";
import { SensorTile } from "@/components/SensorTile";
import { useHerd } from "@/context/HerdContext";
import { riskColor } from "@/lib/risk";

export const Route = createFileRoute("/farmer/cow/$id")({
  head: () => ({
    meta: [
      { title: "Cow profile — HerdGuard" },
      { name: "description", content: "Sensor readings, 14-day mastitis forecast, SCC trend and recommended actions." },
      { property: "og:title", content: "Cow profile — HerdGuard" },
      { property: "og:description", content: "Everything HerdGuard knows about this cow." },
    ],
  }),
  component: CowProfile,
});

const axis = { fontSize: 10, fill: "var(--muted-foreground)" };

function CowProfile() {
  const { id } = useParams({ from: "/farmer/cow/$id" });
  const { getCow, notifyVet, addRecord } = useHerd();
  const cow = getCow(id);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ scc: "", cmt: "", treatment: "", hygiene: "" });

  if (!cow) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Cow not found.{" "}
        <Link to="/farmer/herd" className="text-primary">
          Back to herd
        </Link>
      </div>
    );
  }

  const color = riskColor(cow.riskLevel);

  const save = () => {
    addRecord(cow.id, {
      date: new Date().toISOString().slice(0, 10),
      type: form.treatment || "Farmer record",
      note: form.hygiene || "Recorded from the app",
      scc: form.scc ? Number(form.scc) : undefined,
      cmt: form.cmt || undefined,
    });
    setForm({ scc: "", cmt: "", treatment: "", hygiene: "" });
    setOpen(false);
    toast.success("Record added to history");
  };

  return (
    <div className="space-y-4 p-4">
      <Link to="/farmer/herd" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> My herd
      </Link>

      <Card className="gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">{cow.name}</h1>
            <p className="text-xs text-muted-foreground">
              {cow.tag} · {cow.breed} · {cow.age} yrs
            </p>
            <p className="text-xs text-muted-foreground">ID {cow.id}</p>
            <p className="mt-1 text-xs text-muted-foreground">{cow.lactationStage}</p>
          </div>
          <div className="text-right">
            <RiskBadge level={cow.riskLevel} />
            <p className="mt-1 text-3xl font-extrabold" style={{ color }}>
              {cow.riskScore}
            </p>
            <p className="text-[10px] text-muted-foreground">risk score</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <SensorTile label="Body temperature" value={cow.sensors.bodyTemp} unit="°C" trend={cow.trends.bodyTemp} badIsUp />
        <SensorTile label="Rumination" value={cow.sensors.rumination} unit="min/day" trend={cow.trends.rumination} badIsUp={false} />
        <SensorTile label="Activity" value={cow.sensors.activity} unit="steps" trend={cow.trends.activity} badIsUp={false} />
        <SensorTile label="Milk yield" value={cow.sensors.milkYield} unit="L/day" trend={cow.trends.milkYield} badIsUp={false} />
        <SensorTile label="Milk conductivity" value={cow.sensors.conductivity} unit="mS/cm" trend={cow.trends.conductivity} badIsUp />
      </div>

      <Card className="gap-2 p-4">
        <p className="text-sm font-semibold">14-day risk forecast</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cow.forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={axis} axisLine={false} tickLine={false} interval={2} />
              <YAxis domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} width={26} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke={color} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="gap-3 p-4">
        <p className="text-sm font-semibold">Why this risk</p>
        {cow.factors.map((f) => (
          <div key={f.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-muted-foreground">{f.label}</span>
              <span className="font-semibold">{f.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${f.percent}%`, backgroundColor: color }}
              />
            </div>
          </div>
        ))}
      </Card>

      <Card className="gap-2 p-4">
        <p className="text-sm font-semibold">Somatic cell count — 6 months</p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cow.sccTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} width={34} />
              <Tooltip />
              <Line type="monotone" dataKey="scc" stroke="var(--chart-2)" strokeWidth={2.5} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-muted-foreground">Thousand cells/ml</p>
      </Card>

      <Card className="gap-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Treatment history</p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="size-4" /> Add record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[340px] rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add record for {cow.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="scc">SCC value (thousand cells/ml)</Label>
                  <Input
                    id="scc"
                    inputMode="numeric"
                    value={form.scc}
                    onChange={(e) => setForm({ ...form, scc: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cmt">CMT result</Label>
                  <Input
                    id="cmt"
                    placeholder="Negative / Trace / +1"
                    value={form.cmt}
                    onChange={(e) => setForm({ ...form, cmt: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="treatment">Treatment</Label>
                  <Input
                    id="treatment"
                    placeholder="e.g. Intramammary antibiotic"
                    value={form.treatment}
                    onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hygiene">Hygiene note</Label>
                  <Textarea
                    id="hygiene"
                    value={form.hygiene}
                    onChange={(e) => setForm({ ...form, hygiene: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full" onClick={save}>
                  Save record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <ol className="space-y-3 border-l pl-4">
          {cow.history.map((h) => (
            <li key={h.id} className="relative">
              <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-primary" />
              <p className="text-xs font-semibold">
                {h.type} <span className="font-normal text-muted-foreground">· {h.date}</span>
              </p>
              <p className="text-xs text-muted-foreground">{h.note}</p>
              {(h.scc || h.cmt) && (
                <p className="text-[11px] text-muted-foreground">
                  {h.scc ? `SCC ${h.scc}k` : ""} {h.cmt ? `· CMT ${h.cmt}` : ""}
                </p>
              )}
            </li>
          ))}
        </ol>
      </Card>

      <Card className="gap-3 p-4">
        <p className="text-sm font-semibold">Recommended actions</p>
        {cow.recommendations.map((r) => (
          <label key={r} className="flex items-start gap-2.5 text-sm">
            <Checkbox
              checked={!!done[r]}
              onCheckedChange={(v) => setDone((p) => ({ ...p, [r]: !!v }))}
              className="mt-0.5"
            />
            <span className={done[r] ? "text-muted-foreground line-through" : ""}>{r}</span>
          </label>
        ))}
        <Button
          className="h-11 w-full"
          onClick={() => {
            notifyVet(cow);
            toast.success(`Dr. Anil Patil notified about ${cow.name}`);
          }}
        >
          <Stethoscope className="size-4" /> Notify vet
        </Button>
      </Card>
    </div>
  );
}
