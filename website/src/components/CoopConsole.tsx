import { useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  Download,
  FileBarChart,
  LayoutDashboard,
  Map,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConsoleShell, SectionIntro } from "@/components/ConsoleShell";
import { memberFarms, partnerFarms, alerts as seedAlerts } from "@/data/mock";
import { riskColor, riskRank, type RiskLevel } from "@/lib/risk";
import { RiskBadge } from "@/components/RiskBadge";
import { useHerd } from "@/context/HerdContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const nav = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "District Map", icon: Map },
  { label: "Analytics", icon: BarChart3 },
  { label: "Member Farms", icon: Users },
  { label: "Reports", icon: FileBarChart },
];
const trend = [
  { month: "Apr", cases: 32 },
  { month: "May", cases: 28 },
  { month: "Jun", cases: 35 },
  { month: "Jul", cases: 24 },
  { month: "Aug", cases: 21 },
  { month: "Sep", cases: 17 },
];
const byStage = [
  { stage: "No risk", cases: 11 },
  { stage: "Low", cases: 24 },
  { stage: "Moderate", cases: 18 },
  { stage: "High", cases: 9 },
];
const taluka = [
  { name: "Koregaon", rate: 5.2 },
  { name: "Wai", rate: 4.7 },
  { name: "Karad", rate: 3.9 },
  { name: "Patan", rate: 3.4 },
  { name: "Phaltan", rate: 2.8 },
];
const axis = { fontSize: 10, fill: "var(--muted-foreground)" };

export function CoopConsole() {
  const [active, setActive] = useState("Overview");
  const [farmId, setFarmId] = useState<string>();
  return (
    <ConsoleShell
      role="Co-op / Authority"
      person="Satara District Dairy Cooperative"
      items={nav}
      active={active}
      onSelect={setActive}
    >
      {active === "Overview" && <Overview onMap={() => setActive("District Map")} />}
      {active === "District Map" && <DistrictMap onFarm={setFarmId} />}
      {active === "Analytics" && <Analytics />}
      {active === "Member Farms" && <MemberFarms onFarm={setFarmId} />}
      {active === "Reports" && <Reports />}
      <FarmDialog
        farm={memberFarms.find((farm) => farm.id === farmId)}
        open={!!farmId}
        onClose={() => setFarmId(undefined)}
      />
    </ConsoleShell>
  );
}

function Overview({ onMap }: { onMap: () => void }) {
  const high = memberFarms.filter((farm) => farm.riskLevel === "High").length;
  return (
    <>
      <SectionIntro
        title="District overview"
        description="A live view of member-farm health across Satara."
      />
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Member farms", "40", Building2],
          ["Animals monitored", "4,862", Users],
          ["Active high-risk cases", String(high + 8), Bell],
          ["Alerts this week", "27", FileBarChart],
        ].map(([label, value, Icon]) => (
          <Card className="p-5" key={String(label)}>
            <div className="flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary">
                {typeof Icon === "function" && <Icon className="size-4" />}
              </span>
              <span className="text-xs text-risk-high">+8%</span>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
          </Card>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="font-semibold">Risk hotspots</p>
              <p className="text-xs text-muted-foreground">Member-farm concentration preview</p>
            </div>
            <Button variant="outline" size="sm" onClick={onMap}>
              Open district map
            </Button>
          </div>
          <div className="relative h-64 bg-[radial-gradient(circle_at_46%_45%,var(--risk-high)_0_5%,transparent_6%),radial-gradient(circle_at_62%_54%,var(--risk-moderate)_0_4%,transparent_5%),linear-gradient(135deg,var(--primary-soft),var(--muted))]">
            <div className="absolute left-[40%] top-[36%] size-28 rounded-full border-2 border-risk-high/30 bg-risk-high/10" />
            <div className="absolute left-[56%] top-[47%] size-20 rounded-full border-2 border-risk-moderate/30 bg-risk-moderate/10" />
            <span className="absolute bottom-3 left-4 rounded bg-background/90 px-2 py-1 text-xs">
              Satara district · 40 farms
            </span>
          </div>
        </Card>
        <Card className="p-5">
          <p className="font-semibold">Recent alerts</p>
          <div className="mt-4 divide-y">
            {seedAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="py-3 first:pt-0">
                <div className="flex justify-between gap-3">
                  <p className="text-sm font-medium">{alert.cowName}</p>
                  <span className="text-[11px] text-muted-foreground">{alert.time}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{alert.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function DistrictMap({ onFarm }: { onFarm: (id: string) => void }) {
  const [filter, setFilter] = useState<RiskLevel | "All">("All");
  const { isSimulatingSickness } = useHerd();
  const farms = memberFarms.filter((farm) => filter === "All" || farm.riskLevel === filter);
  return (
    <>
      <SectionIntro
        title="District map"
        description="Member farms and risk concentrations around Satara."
        action={
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as RiskLevel | "All")}
          >
            <option>All</option>
            <option>High</option>
            <option>Moderate</option>
            <option>Low</option>
            <option>No risk</option>
          </select>
        }
      />
      <Card className="relative overflow-hidden p-2">
        <MapContainer
          center={[17.68, 74.02]}
          zoom={9}
          scrollWheelZoom
          className="h-[620px] w-full rounded-lg"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {farms.map((farm) => (
            <CircleMarker
              key={farm.id}
              center={[farm.lat, farm.lng]}
              radius={farm.riskLevel === "High" ? 9 : 6}
              pathOptions={{
                color: riskColor(farm.riskLevel),
                fillColor: riskColor(farm.riskLevel),
                fillOpacity: 0.85,
              }}
            >
              <Popup>
                <p className="font-semibold">{farm.name}</p>
                <p className="text-xs">
                  {farm.animals} animals · {farm.village}
                </p>
                <p className="my-2 text-xs">Risk level: {farm.riskLevel}</p>
                <button
                  className="text-xs font-semibold text-primary"
                  onClick={() => onFarm(farm.id)}
                >
                  View farm
                </button>
              </Popup>
            </CircleMarker>
          ))}
          <Circle
            center={[17.71, 74.05]}
            radius={9000}
            pathOptions={{
              color: riskColor("High"),
              fillColor: riskColor("High"),
              fillOpacity: 0.08,
            }}
          />
          <Circle
            center={[17.56, 73.9]}
            radius={7000}
            pathOptions={{
              color: riskColor("Moderate"),
              fillColor: riskColor("Moderate"),
              fillOpacity: 0.08,
            }}
          />
          {isSimulatingSickness && (
            <Circle
              center={[17.68, 74.02]}
              radius={4500}
              pathOptions={{
                color: riskColor("High"),
                fillColor: riskColor("High"),
                fillOpacity: 0.2,
              }}
            />
          )}
        </MapContainer>
        <div className="absolute bottom-6 left-6 z-[1000] rounded-lg border bg-background/95 p-3 text-xs shadow">
          <p className="mb-2 font-semibold">Risk level</p>
          {(["High", "Moderate", "Low", "No risk"] as RiskLevel[]).map((level) => (
            <div key={level} className="flex items-center gap-2 py-0.5">
              <span className="size-2.5 rounded-full" style={{ background: riskColor(level) }} />
              {level}
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function Analytics() {
  return (
    <>
      <SectionIntro
        title="District analytics"
        description="Mastitis incidence and risk-stage distribution over six months."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Chart title="Mastitis incidence trend">
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
            <YAxis tick={axis} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line dataKey="cases" stroke="var(--primary)" strokeWidth={3} />
          </LineChart>
        </Chart>
        <Chart title="Incidence by risk stage">
          <BarChart data={byStage}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="stage" tick={axis} axisLine={false} tickLine={false} />
            <YAxis tick={axis} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="cases" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </Chart>
      </div>
      <Card className="mt-5 p-5">
        <p className="mb-4 font-semibold">By-taluka comparison</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taluka} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={axis} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={axis} axisLine={false} width={80} />
              <Tooltip />
              <Bar
                dataKey="rate"
                name="Cases / 100 animals"
                fill="var(--chart-2)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
}
function Chart({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <p className="mb-3 font-semibold">{title}</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function MemberFarms({ onFarm }: { onFarm: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [sortHigh, setSortHigh] = useState(false);
  const rows = useMemo(
    () =>
      [...memberFarms]
        .filter((farm) =>
          `${farm.name} ${farm.village}`.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sortHigh ? riskRank(b.riskLevel) - riskRank(a.riskLevel) : a.name.localeCompare(b.name),
        ),
    [query, sortHigh],
  );
  return (
    <>
      <SectionIntro
        title="Member farms"
        description="Search and inspect the cooperative's registered farms."
        action={
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search farms"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setSortHigh(!sortHigh)}>
              Sort by risk
            </Button>
          </div>
        }
      />
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1fr_.8fr_1fr_130px] gap-4 border-b bg-muted/40 px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          <span>Farm</span>
          <span>Village</span>
          <span>Animals</span>
          <span>Risk</span>
          <span />
        </div>
        {rows.map((farm) => (
          <button
            key={farm.id}
            onClick={() => onFarm(farm.id)}
            className={`grid w-full items-center text-left grid-cols-[1.5fr_1fr_.8fr_1fr_130px] gap-4 border-b px-5 py-4 transition-colors hover:bg-muted/40 ${farm.riskLevel === "High" ? "bg-risk-high/5" : ""}`}
          >
            <span className="font-semibold">{farm.name}</span>
            <span>{farm.village}</span>
            <span>{farm.animals}</span>
            <RiskBadge level={farm.riskLevel} />
            <span className="text-right text-sm font-semibold text-primary">View detail →</span>
          </button>
        ))}
      </Card>
    </>
  );
}

function Reports() {
  const download = () => {
    const rows = [
      "Farm,Village,Animals,Risk level",
      ...memberFarms.map((farm) =>
        [farm.name, farm.village, farm.animals, farm.riskLevel]
          .map((value) => `"${value}"`)
          .join(","),
      ),
    ];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "herdguard-member-farms.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV report downloaded");
  };
  return (
    <>
      <SectionIntro title="Reports" description="Export member-farm data for district review." />
      <Card className="max-w-2xl p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-11 place-items-center rounded-lg bg-primary-soft text-primary">
            <Download />
          </span>
          <div>
            <p className="font-semibold">Member farms report</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Download the current searchable table as a CSV file.
            </p>
            <div className="mt-5 flex gap-2">
              <Button onClick={download}>
                <Download className="size-4" /> Export report
              </Button>
              <Button variant="outline" onClick={() => toast("PDF export in full version")}>
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}

function FarmDialog({
  farm,
  open,
  onClose,
}: {
  farm?: (typeof memberFarms)[number];
  open: boolean;
  onClose: () => void;
}) {
  const partner = partnerFarms.find((item) => item.village === farm?.village);
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{farm?.name}</DialogTitle>
        </DialogHeader>
        {farm && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Village</p>
                <p className="mt-1 font-semibold">{farm.village}</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Animals</p>
                <p className="mt-1 font-semibold">{farm.animals}</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Risk</p>
                <div className="mt-1">
                  <RiskBadge level={farm.riskLevel} />
                </div>
              </Card>
            </div>
            <div>
              <p className="mb-3 font-semibold">Top at-risk cows</p>
              {(partner?.highRiskCows ?? []).map((cow) => (
                <div
                  className="flex items-center justify-between border-b py-3 text-sm"
                  key={cow.id}
                >
                  <span className="font-medium">{cow.name}</span>
                  <span className="text-muted-foreground">{cow.issue}</span>
                  <b className="text-risk-high">{cow.riskScore}</b>
                </div>
              ))}
              {!partner && (
                <p className="text-sm text-muted-foreground">
                  No individual cow records are available for this member farm.
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
