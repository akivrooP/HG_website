import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { devices } from "@/data/mock";

export const Route = createFileRoute("/farmer/settings")({
  head: () => ({
    meta: [
      { title: "Settings — HerdGuard" },
      { name: "description", content: "Language, notification channels, DPDP consent and paired devices." },
      { property: "og:title", content: "Settings — HerdGuard" },
      { property: "og:description", content: "Control how HerdGuard reaches you." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [channels, setChannels] = useState({ App: true, SMS: true, "Voice call": false });
  const [consent, setConsent] = useState(true);

  return (
    <div className="space-y-4 p-4">
      <Link to="/farmer/more" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> More
      </Link>
      <h1 className="text-xl font-bold">Settings</h1>

      <Card className="gap-3 p-4">
        <Label className="text-sm font-semibold">Language</Label>
        <Select defaultValue="mr">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mr">मराठी (Marathi)</SelectItem>
            <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">Visual only in this prototype.</p>
      </Card>

      <Card className="gap-3 p-4">
        <p className="text-sm font-semibold">Notification channels</p>
        {(Object.keys(channels) as (keyof typeof channels)[]).map((c) => (
          <div key={c} className="flex items-center justify-between">
            <span className="text-sm">{c}</span>
            <Switch
              checked={channels[c]}
              onCheckedChange={(v) => setChannels((prev) => ({ ...prev, [c]: v }))}
            />
          </div>
        ))}
      </Card>

      <Card className="gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">DPDP consent</p>
            <p className="text-xs text-muted-foreground">
              You allow HerdGuard to process your farm and animal data to generate health
              predictions. You can withdraw consent anytime; data is then stopped from further
              processing.
            </p>
          </div>
          <Switch checked={consent} onCheckedChange={setConsent} />
        </div>
      </Card>

      <Card className="gap-3 p-4">
        <p className="text-sm font-semibold">Paired devices</p>
        {devices.map((d) => (
          <div key={d.id} className="flex items-center gap-2 text-xs">
            <Smartphone className="size-3.5 text-primary" />
            <span className="flex-1 truncate">{d.label}</span>
            <span className={d.online ? "text-risk-none" : "text-risk-high"}>
              {d.online ? "Paired" : "Offline"}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
