import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ClipboardList,
  FileText,
  HeartPulse,
  Phone,
  Stethoscope,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RiskBadge } from "@/components/RiskBadge";
import { SensorTile } from "@/components/SensorTile";
import { ConsoleShell, SectionIntro } from "@/components/ConsoleShell";
import { useHerd } from "@/context/HerdContext";
import { alerts as seedAlerts, partnerFarms } from "@/data/mock";
import { riskColor, RISK_LEVELS, type RiskLevel } from "@/lib/risk";
import { LiveIndicator } from "@/components/DemoExperience";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const nav = [
  { label: "Today's Visits", icon: ClipboardList },
  { label: "Farms", icon: HeartPulse },
  { label: "Case Detail", icon: FileText },
  { label: "Alerts", icon: Bell },
];
const farmNames = partnerFarms.map((farm) => farm.name);
const axis = { fontSize: 10, fill: "var(--muted-foreground)" };

export function VetConsole() {
  const [active, setActive] = useState("Today's Visits");
  const [selectedId, setSelectedId] = useState<string>();
  const [callCow, setCallCow] = useState<string>();
  const [rescheduleCow, setRescheduleCow] = useState<string>();
  const { cows, alerts, vetQueue } = useHerd();
  const selectedCow = cows.find((cow) => cow.id === selectedId);
  const openCase = (id: string) => {
    setSelectedId(id);
    setActive("Case Detail");
  };
  return (
    <ConsoleShell
      role="Vet"
      person="Dr. Anil Patil"
      items={nav}
      active={active}
      onSelect={setActive}
    >
      {active === "Today's Visits" && (
        <Visits
          cows={cows}
          vetQueue={vetQueue}
          onOpen={openCase}
          onCall={setCallCow}
          onReschedule={setRescheduleCow}
        />
      )}
      {active === "Farms" && <Farms onOpen={openCase} />}
      {active === "Case Detail" && <CaseDetail cow={selectedCow ?? cows[0]} />}
      {active === "Alerts" && <Alerts alerts={alerts} />}
      <CallDialog
        cowName={cows.find((cow) => cow.id === callCow)?.name}
        open={!!callCow}
        onClose={() => setCallCow(undefined)}
      />
      <RescheduleDialog
        cowName={cows.find((cow) => cow.id === rescheduleCow)?.name}
        open={!!rescheduleCow}
        onClose={() => setRescheduleCow(undefined)}
      />
    </ConsoleShell>
  );
}

function Visits({
  cows,
  vetQueue,
  onOpen,
  onCall,
  onReschedule,
}: {
  cows: ReturnType<typeof useHerd>["cows"];
  vetQueue: ReturnType<typeof useHerd>["vetQueue"];
  onOpen: (id: string) => void;
  onCall: (id: string) => void;
  onReschedule: (id: string) => void;
}) {
  const [farm, setFarm] = useState("All farms");
  const [risk, setRisk] = useState("All risk");
  const requested = useMemo(() => new Set(vetQueue.map((item) => item.cowId)), [vetQueue]);
  const rows = useMemo(
    () =>
      [...cows]
        .filter((cow) => risk === "All risk" || cow.riskLevel === risk)
        .sort(
          (a, b) =>
            Number(requested.has(b.id)) - Number(requested.has(a.id)) || b.riskScore - a.riskScore,
        )
        .slice(0, 30),
    [cows, risk, requested],
  );
  return (
    <>
      <SectionIntro
        title="Today's visits"
        description="Triage the highest-risk animals across your six partner farms."
        action={
          <div className="flex gap-2">
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={farm}
              onChange={(e) => setFarm(e.target.value)}
            >
              <option>All farms</option>
              {farmNames.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
            >
              <option>All risk</option>
              {RISK_LEVELS.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </div>
        }
      />
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_.8fr_1.4fr_270px] gap-4 border-b bg-muted/40 px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          <span>Cow</span>
          <span>Farm</span>
          <span>Village</span>
          <span>Risk</span>
          <span>Suggested action</span>
          <span />
        </div>
        {rows.map((cow, index) => {
          const farmIndex = index % partnerFarms.length;
          const farmData = partnerFarms[farmIndex]!;
          if (farm !== "All farms" && farmData.name !== farm) return null;
          return (
            <div
              key={cow.id}
              className="grid items-center grid-cols-[1.6fr_1fr_1fr_.8fr_1.4fr_270px] gap-4 border-b px-5 py-4 last:border-0"
            >
              <div>
                <p className="font-semibold">
                  {cow.name}{" "}
                  <span className="text-xs font-normal text-muted-foreground">{cow.tag}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">ID {cow.id}</p>
                {requested.has(cow.id) && (
                  <span className="mt-1 inline-block rounded-full bg-risk-high/10 px-2 py-0.5 text-[10px] font-semibold text-risk-high">
                    Farmer requested
                  </span>
                )}
              </div>
              <span className="text-sm">{farmData.name}</span>
              <span className="text-sm text-muted-foreground">{farmData.village}</span>
              <RiskBadge level={cow.riskLevel} score={cow.riskScore} />
              <span className="text-sm text-muted-foreground">{cow.recommendations[0]}</span>
              <div className="flex gap-1">
                <Button size="sm" onClick={() => onOpen(cow.id)}>
                  Open case
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  title="Call farmer"
                  onClick={() => onCall(cow.id)}
                >
                  <Phone className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  title="Reschedule"
                  onClick={() => onReschedule(cow.id)}
                >
                  <CalendarDays className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}

function CaseDetail({ cow }: { cow: ReturnType<typeof useHerd>["cows"][number] | undefined }) {
  const { addRecord } = useHerd();
  const [form, setForm] = useState({
    diagnosis: "Subclinical mastitis",
    treatment: "",
    notes: "",
    followUp: "",
  });
  if (!cow) return <Card className="p-8">Select a cow from Today's Visits.</Card>;
  const save = () => {
    addRecord(cow.id, {
      date: new Date().toISOString().slice(0, 10),
      type: form.diagnosis,
      note: `${form.treatment || "No treatment entered"}. ${form.notes}`,
    });
    setForm({ diagnosis: "Subclinical mastitis", treatment: "", notes: "", followUp: "" });
    toast.success("Diagnosis saved to case history");
  };
  return (
    <>
      <SectionIntro
        title={`Case detail · ${cow.name}`}
        description={`${cow.tag} · ${cow.breed} · ${cow.age} years · ${cow.lactationStage}`}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => toast("Feedback saved - model will retrain with this label")}
            >
              <Check className="size-4" /> Confirm prediction
            </Button>
            <Button
              variant="outline"
              onClick={() => toast("Feedback saved - model will retrain with this label")}
            >
              <X className="size-4" /> Reject prediction
            </Button>
          </div>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Risk assessment</p>
                <p
                  className="mt-1 font-display text-4xl font-extrabold"
                  style={{ color: riskColor(cow.riskLevel) }}
                >
                  {cow.riskScore}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">/ 100</span>
                </p>
              </div>
              <RiskBadge level={cow.riskLevel} />
            </div>
            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs font-semibold">Live sensor readings</p>
              <LiveIndicator />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <SensorTile
                label="Temperature"
                value={cow.sensors.bodyTemp}
                unit="°C"
                trend={cow.trends.bodyTemp}
                badIsUp
              />
              <SensorTile
                label="Rumination"
                value={cow.sensors.rumination}
                unit="min"
                trend={cow.trends.rumination}
                badIsUp={false}
              />
              <SensorTile
                label="Activity"
                value={cow.sensors.activity}
                unit="steps"
                trend={cow.trends.activity}
                badIsUp={false}
              />
              <SensorTile
                label="Milk yield"
                value={cow.sensors.milkYield}
                unit="L"
                trend={cow.trends.milkYield}
                badIsUp={false}
              />
              <SensorTile
                label="Conductivity"
                value={cow.sensors.conductivity}
                unit="mS"
                trend={cow.trends.conductivity}
                badIsUp
              />
            </div>
          </Card>
          <ChartCard title="14-day forecast">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cow.forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={axis} axisLine={false} tickLine={false} interval={2} />
                <YAxis domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} width={28} />
                <Tooltip />
                <Line
                  dataKey="score"
                  stroke={riskColor(cow.riskLevel)}
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          <Card className="p-5">
            <p className="mb-4 font-semibold">Why this risk</p>
            {cow.factors.map((factor) => (
              <div key={factor.label} className="mb-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span>{factor.label}</span>
                  <b>{factor.percent}%</b>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${factor.percent}%`, background: riskColor(cow.riskLevel) }}
                  />
                </div>
              </div>
            ))}
          </Card>
          <ChartCard title="SCC trend · thousand cells/ml">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cow.sccTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} width={35} />
                <Tooltip />
                <Line dataKey="scc" stroke="var(--chart-2)" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="space-y-5">
          <Card className="p-5">
            <p className="mb-4 font-semibold">Past treatment</p>
            <ol className="space-y-4 border-l pl-4">
              {cow.history.map((item) => (
                <li key={item.id} className="relative">
                  <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary" />
                  <p className="text-sm font-semibold">
                    {item.type}{" "}
                    <span className="font-normal text-muted-foreground">· {item.date}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
                </li>
              ))}
            </ol>
          </Card>
          <Card className="p-5">
            <p className="mb-4 font-semibold">Add diagnosis</p>
            <div className="space-y-3">
              <Label>
                Diagnosis
                <select
                  className="mt-1 flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                >
                  <option>Subclinical mastitis</option>
                  <option>Clinical mastitis</option>
                  <option>Healthy / false positive</option>
                  <option>Other</option>
                </select>
              </Label>
              <Label>
                Treatment
                <Input
                  value={form.treatment}
                  onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                  placeholder="e.g. Intramammary antibiotic"
                />
              </Label>
              <Label>
                Notes
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Clinical findings and advice"
                />
              </Label>
              <Label>
                Follow-up date
                <Input
                  type="date"
                  value={form.followUp}
                  onChange={(e) => setForm({ ...form, followUp: e.target.value })}
                />
              </Label>
              <Button className="w-full" onClick={save}>
                Save diagnosis
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <p className="mb-3 font-semibold">{title}</p>
      <div className="h-56">{children}</div>
    </Card>
  );
}

function Farms({ onOpen }: { onOpen: (id: string) => void }) {
  const [expanded, setExpanded] = useState<string>();
  const { cows } = useHerd();
  return (
    <>
      <SectionIntro title="Partner farms" description="Six farms in the current visit rotation." />
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1fr_.7fr_.7fr_.7fr_1fr_130px] gap-4 border-b bg-muted/40 px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          <span>Farm</span>
          <span>Village</span>
          <span>Animals</span>
          <span>High</span>
          <span>Moderate</span>
          <span>Last visit</span>
          <span />
        </div>
        {partnerFarms.map((farm, i) => (
          <div key={farm.id} className="border-b last:border-0">
            <div className="grid items-center grid-cols-[1.5fr_1fr_.7fr_.7fr_.7fr_1fr_130px] gap-4 px-5 py-4">
              <span className="font-semibold">{farm.name}</span>
              <span>{farm.village}</span>
              <span>{farm.animals}</span>
              <span className="font-bold text-risk-high">{farm.riskCounts.High}</span>
              <span className="font-bold text-risk-moderate">{farm.riskCounts.Moderate}</span>
              <span className="text-sm text-muted-foreground">{i + 1} days ago</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExpanded(expanded === farm.id ? undefined : farm.id)}
              >
                {expanded === farm.id ? "Hide cows" : "View high-risk"}
              </Button>
            </div>
            {expanded === farm.id && (
              <div className="grid gap-2 bg-muted/30 px-5 pb-4 pt-1 sm:grid-cols-2">
                {farm.highRiskCows.map((cow) => (
                  <button
                    key={cow.id}
                    className="flex items-center justify-between rounded-lg border bg-background p-3 text-left hover:border-primary/50"
                    onClick={() =>
                      cows.some((item) => item.id === cow.id)
                        ? onOpen(cow.id)
                        : toast(
                            "Full sensor history is available when this cow joins the shared herd feed",
                          )
                    }
                  >
                    <span>
                      <span className="block text-sm font-semibold">{cow.name}</span>
                      <span className="text-xs text-muted-foreground">{cow.issue}</span>
                    </span>
                    <span className="font-bold text-risk-high">{cow.riskScore}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </Card>
    </>
  );
}

function Alerts({ alerts }: { alerts: typeof seedAlerts }) {
  const [channel, setChannel] = useState("All channels");
  const [severity, setSeverity] = useState("All severity");
  const rows = alerts.filter(
    (a) =>
      (channel === "All channels" || a.channel === channel) &&
      (severity === "All severity" || a.severity === severity),
  );
  return (
    <>
      <SectionIntro
        title="Alerts"
        description="Signals requiring follow-up across your partner farms."
        action={
          <div className="flex gap-2">
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option>All channels</option>
              <option>App</option>
              <option>SMS</option>
              <option>Voice call</option>
            </select>
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option>All severity</option>
              <option>critical</option>
              <option>warning</option>
              <option>info</option>
            </select>
          </div>
        }
      />
      <Card className="divide-y">
        {rows.map((alert) => (
          <div key={alert.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${alert.severity === "critical" ? "bg-risk-high" : alert.severity === "warning" ? "bg-risk-moderate" : "bg-primary"}`}
                />
                <p className="text-sm font-semibold">
                  {alert.cowName} · {alert.channel}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
            </div>
            <span className="whitespace-nowrap text-xs text-muted-foreground">{alert.time}</span>
          </div>
        ))}
      </Card>
    </>
  );
}

function CallDialog({
  cowName,
  open,
  onClose,
}: {
  cowName?: string;
  open: boolean;
  onClose: () => void;
}) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Calling Ramesh Jadhav...</DialogTitle>
        </DialogHeader>
        <div className="grid place-items-center gap-3 py-8">
          <span className="grid size-16 animate-pulse place-items-center rounded-full bg-primary-soft text-primary">
            <Phone />
          </span>
          <p className="text-2xl font-bold tabular-nums">00:{String(seconds).padStart(2, "0")}</p>
          <p className="text-sm text-muted-foreground">Connecting about {cowName}</p>
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={onClose}>
            End call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function RescheduleDialog({
  cowName,
  open,
  onClose,
}: {
  cowName?: string;
  open: boolean;
  onClose: () => void;
}) {
  const [date, setDate] = useState("");
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule visit</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Choose a new slot for {cowName}.</p>
        <Label>
          Date
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {["09:00 AM", "11:30 AM", "03:00 PM"].map((slot) => (
            <Button
              key={slot}
              variant="outline"
              onClick={() => {
                toast.success(`Visit rescheduled to ${date || "the selected date"} at ${slot}`);
                onClose();
              }}
            >
              {slot}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
