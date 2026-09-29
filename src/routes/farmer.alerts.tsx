import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Info, MessageSquare, Phone, Smartphone, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHerd } from "@/context/HerdContext";
import { cn } from "@/lib/utils";
import type { Alert } from "@/data/mock";

export const Route = createFileRoute("/farmer/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — HerdGuard" },
      {
        name: "description",
        content: "Mastitis alerts by severity and channel: app, SMS and voice call.",
      },
      { property: "og:title", content: "Alerts — HerdGuard" },
      { property: "og:description", content: "Critical, warning and info alerts for your herd." },
    ],
  }),
  component: Alerts,
});

const CHANNELS = ["All", "App", "SMS", "Voice call"] as const;
const SEVERITIES = ["All", "critical", "warning", "info"] as const;

const channelIcon = { App: Smartphone, SMS: MessageSquare, "Voice call": Phone };

function severityStyle(s: Alert["severity"]) {
  if (s === "critical") return { cls: "text-risk-high bg-risk-high/10", Icon: TriangleAlert };
  if (s === "warning")
    return { cls: "text-risk-moderate bg-risk-moderate/10", Icon: AlertTriangle };
  return { cls: "text-primary bg-primary-soft", Icon: Info };
}

function Alerts() {
  const { alerts, markAlertRead, markAllRead } = useHerd();
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("All");
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>("All");
  const [preview, setPreview] = useState<"SMS" | "Voice call">("SMS");
  const [sent, setSent] = useState(false);

  const list = alerts
    .filter((a) => (channel === "All" ? true : a.channel === channel))
    .filter((a) => (severity === "All" ? true : a.severity === severity));

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Alerts</h1>
        <Button variant="ghost" size="sm" onClick={markAllRead}>
          Mark all read
        </Button>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {CHANNELS.map((c) => (
          <Chip key={c} active={channel === c} onClick={() => setChannel(c)} label={c} />
        ))}
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {SEVERITIES.map((s) => (
          <Chip
            key={s}
            active={severity === s}
            onClick={() => setSeverity(s)}
            label={s === "All" ? "All severity" : s}
          />
        ))}
      </div>

      <div className="space-y-2">
        {list.map((a) => {
          const { cls, Icon } = severityStyle(a.severity);
          const ChannelIcon = channelIcon[a.channel];
          return (
            <Card
              key={a.id}
              className={cn("gap-2 p-3", !a.read && "border-primary/40 bg-primary-soft/40")}
            >
              <div className="flex items-start gap-3">
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", cls)}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{a.message}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <Link
                      to="/farmer/cow/$id"
                      params={{ id: a.cowId }}
                      className="font-semibold text-primary"
                    >
                      {a.cowName}
                    </Link>
                    <span className="inline-flex items-center gap-1">
                      <ChannelIcon className="size-3" />
                      {a.channel}
                    </span>
                    <span>{a.time}</span>
                  </p>
                </div>
                {!a.read && (
                  <Button variant="ghost" size="sm" onClick={() => markAlertRead(a.id)}>
                    Read
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
        {list.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No alerts here.</p>
        )}
      </div>
      <Card className="mt-5 overflow-hidden p-4">
        <p className="text-sm font-semibold">If you have no internet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          HerdGuard can still reach you through a basic phone.
        </p>
        <div className="mt-3 flex rounded-lg bg-muted p-1">
          {(["SMS", "Voice call"] as const).map((tab) => (
            <button
              key={tab}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-xs font-semibold",
                preview === tab ? "bg-card shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => setPreview(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {preview === "SMS" ? (
          <div
            className={cn(
              "mx-auto mt-4 max-w-[210px] rounded-[22px] border-[6px] border-foreground bg-slate-950 p-2 text-white",
              sent && "animate-[wiggle_0.35s_ease-in-out_3]",
            )}
          >
            <div className="rounded-xl bg-slate-800 p-3">
              <p className="text-[9px] text-slate-400">HerdGuard · SMS</p>
              <p className="mt-2 text-[11px] leading-relaxed">
                {sent
                  ? "HerdGuard: गौरी गायीला कासदाहाचा उच्च धोका आहे. कृपया आजच पशुवैद्यांना भेटा."
                  : "Your offline alert will appear here."}
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-4 max-w-[210px] rounded-[22px] border-[6px] border-foreground bg-slate-950 p-5 text-center text-white">
            <Phone className="mx-auto size-8 animate-pulse text-risk-low" />
            <p className="mt-3 text-sm font-bold">Incoming call</p>
            <p className="mt-1 text-[10px] text-slate-400">HerdGuard voice alert</p>
            <div className="mt-4 flex h-8 items-center justify-center gap-1">
              {[3, 8, 14, 6, 11, 4, 16, 7].map((height, index) => (
                <span
                  key={index}
                  className="w-1 animate-pulse rounded-full bg-risk-low"
                  style={{ height }}
                />
              ))}
            </div>
          </div>
        )}
        <Button
          className="mt-4 w-full"
          onClick={() => {
            setSent(true);
            toast.success(
              preview === "SMS" ? "Test alert sent to feature phone" : "Voice call preview started",
            );
          }}
        >
          <Phone className="size-4" /> Send test alert
        </Button>
      </Card>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground",
      )}
    >
      {label}
    </button>
  );
}
