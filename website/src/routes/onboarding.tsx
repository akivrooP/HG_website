import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ScanLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useHerd } from "@/context/HerdContext";
import { farmer } from "@/data/mock";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your farm — HerdGuard" },
      { name: "description", content: "Scan a Pashu Aadhaar tag and set up your dairy farm in HerdGuard." },
      { property: "og:title", content: "Set up your farm — HerdGuard" },
      { property: "og:description", content: "Three quick steps to start monitoring your herd." },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const { cows, setOnboarded, setRole } = useHerd();
  const [step, setStep] = useState(1);
  const [tag, setTag] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const sample = cows[0]!;

  useEffect(() => {
    if (!scanning) return;
    const t = setTimeout(() => {
      setScanning(false);
      setScanned(true);
      setTag(sample.id);
    }, 2000);
    return () => clearTimeout(t);
  }, [scanning, sample.id]);

  const finish = () => {
    setOnboarded(true);
    setRole("farmer");
    navigate({ to: "/farmer" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/60 sm:py-8">
      <PhoneFrame>
        <div className="flex h-full flex-col overflow-y-auto p-5 pt-8 sm:pt-10">
          <div className="mb-6 flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="flex flex-1 flex-col">
              <h1 className="text-2xl font-bold">Scan a cow tag</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Scan the Pashu Aadhaar QR on the ear tag, or type the 12-digit number.
              </p>

              <div className="relative mx-auto mt-8 grid h-48 w-48 place-items-center overflow-hidden rounded-3xl border-2 border-dashed border-primary/40 bg-primary-soft">
                {scanning && (
                  <div className="scan-line absolute left-0 top-2 h-0.5 w-full bg-primary shadow-[0_0_12px_var(--primary)]" />
                )}
                {scanned ? (
                  <CheckCircle2 className="size-16 text-primary" />
                ) : scanning ? (
                  <Loader2 className="size-10 animate-spin text-primary" />
                ) : (
                  <ScanLine className="size-14 text-primary/70" />
                )}
              </div>

              {scanned && (
                <Card className="mt-5 gap-1 p-4 text-sm">
                  <p className="font-semibold">{sample.name} · {sample.tag}</p>
                  <p className="text-muted-foreground">{sample.breed} · {sample.age} yrs</p>
                  <p className="text-muted-foreground">ID {sample.id}</p>
                </Card>
              )}

              <div className="mt-5 space-y-2">
                <Label htmlFor="tag">Pashu Aadhaar number</Label>
                <Input
                  id="tag"
                  inputMode="numeric"
                  placeholder="12-digit tag number"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                />
              </div>

              <div className="mt-auto space-y-2 pt-6">
                <Button
                  className="h-12 w-full text-base"
                  onClick={() => (scanned || tag ? setStep(2) : setScanning(true))}
                  disabled={scanning}
                >
                  {scanned || tag ? "Continue" : "Scan tag"}
                </Button>
                <Button variant="ghost" className="w-full" onClick={finish}>
                  Skip setup
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-1 flex-col">
              <h1 className="text-2xl font-bold">Farm details</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We prefilled this from your cooperative records.
              </p>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="farm">Farm name</Label>
                  <Input id="farm" defaultValue={farmer.farmName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="count">Number of cows</Label>
                  <Input id="count" defaultValue={farmer.cowCount} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loc">Location</Label>
                  <Input id="loc" defaultValue={farmer.district} />
                </div>
              </div>
              <div className="mt-auto space-y-2 pt-6">
                <Button className="h-12 w-full text-base" onClick={() => setStep(3)}>
                  Continue
                </Button>
                <Button variant="ghost" className="w-full" onClick={finish}>
                  Skip setup
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <CheckCircle2 className="size-20 text-primary" />
              <h1 className="mt-6 text-2xl font-bold">You're all set, Ramesh</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {farmer.cowCount} cows are being monitored. We'll warn you 7-14 days before mastitis
                shows.
              </p>
              <Button className="mt-8 h-12 w-full text-base" onClick={finish}>
                Go to home
              </Button>
            </div>
          )}
        </div>
      </PhoneFrame>
    </div>
  );
}
