import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BatteryMedium, RefreshCw, Router, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { devices, farmUnit } from "@/data/mock";
import { useHerd } from "@/context/HerdContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/data")({
  head: () => ({
    meta: [
      { title: "Data & sync — HerdGuard" },
      { name: "description", content: "Tag battery levels, farm unit status, last sync time and offline mode." },
      { property: "og:title", content: "Data & sync — HerdGuard" },
      { property: "og:description", content: "Keep your sensors and farm unit healthy." },
    ],
  }),
  component: DataSync;
});

function DataSync() {
  const { offlineMode, setOfflineMode } = useHerd();

  return (
    <div className="space-y-4 p-4">
      <Link to="/farmer/more" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> More
      </Link>
      <h1 className="text-xl font-bold">Data & sync</h1>

      <Card className="gap-3 p-4">
        <div className="flex items-center gap-2">
          <Router className="size-4 text-primary" />
          <p className="text-sm font-semibold">Farm Unit</p>
          <span className="ml-auto rounded-full bg-risk-none/15 px-2 py-0.5 text-[11px] font-semibold text-risk-none">
            {farmUnit.status}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-y-2 text-xs">
          <dt className="text-muted-foreground">Last sync</dt>
          <dd className="text-right font-medium">{farmUnit.lastSync}</dd>
          <dt className="text-muted-foreground">Stored readings</dt>
          <dd className="text-right font-medium">{farmUnit.storedReadings.toLocaleString("en-IN")}</dd>
          <dt className="text-muted-foreground">Network</dt>
          <dd className="text-right font-medium">{farmUnit.network}</dd>
        </dl>
      </Card>

      <Card className="gap-3 p-4">
        <div className="flex items-center gap-2">
          <BatteryMedium className="size-4 text-primary" />
          <p className="text-sm font-semibold">Device batteries</p>
        </div>
        <div className="space-y-3">
          {devices.map((d) => (
            <div key={d.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="truncate pr-2">{d.label}</span>
                <span
                  className={cn(
                    "font-semibold",
                    d.battery < 30 ? "text-risk-high" : d.battery < 60 ? "text-risk-moderate" : "text-risk-none",
                  )}
                >
                  {d.battery}%
                </span>
              </div>
              <Progress value={d.battery} className="h-1.5" />
              {!d.online && <p className="mt-1 text-[11px] text-risk-high">Offline since yesterday</p>}
            </div>
          ))}
        </div>
      </Card>

      <Card className="gap-3 p-4">
        <div className="flex items-center gap-3">
          <WifiOff className="size-4 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Offline mode</p>
            <p className="text-xs text-muted-foreground">For low-network days in the village</p>
          </div>
          <Switch
            checked={offlineMode}
            onCheckedChange={(v) => {
              setOfflineMode(v);
              if (v) toast("Data stored on SD card, will sync via GSM when network returns");
            }}
          />
        </div>
        {offlineMode && (
          <p className="flex items-start gap-2 rounded-xl bg-primary-soft p-3 text-xs text-primary">
            <RefreshCw className="mt-0.5 size-3.5 shrink-0" />
            Data stored on SD card, will sync via GSM when network returns.
          </p>
        )}
      </Card>
    </div>
  );
}
