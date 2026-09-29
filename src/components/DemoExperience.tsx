import { useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw, Route, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHerd } from "@/context/HerdContext";
import { cn } from "@/lib/utils";

const TOUR_STEPS = [
  "Pick a role from the role picker to enter a tailored HerdGuard workspace.",
  "Open My Herd or Today's Visits to find the animals needing attention.",
  "Open a cow profile to inspect live sensor tiles and the forecast.",
  "Scroll to Why this risk to understand which signals drive the prediction.",
  "Open Demo Controls and press Simulate a cow getting sick.",
  "Watch the cow progress from Low to Moderate to High risk.",
  "Visit the vet queue to see the simulated case rise to the top.",
  "Open the district map to see the high-risk hotspot update.",
];

export function DemoExperience({ children }: { children: ReactNode }) {
  const {
    simulationPaused,
    toggleSimulation,
    simulateSickCow,
    resetDemo,
    isSimulatingSickness,
    sicknessProgress,
    tourOpen,
    tourStep,
    startTour,
    closeTour,
    nextTourStep,
    previousTourStep,
  } = useHerd();
  const [controlsOpen, setControlsOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  return (
    <>
      {bannerVisible && (
        <div className="fixed inset-x-0 top-0 z-[60] flex min-h-9 items-center justify-center gap-2 border-b bg-foreground px-3 py-1.5 text-center text-xs text-background">
          <span className="size-1.5 animate-pulse rounded-full bg-risk-low" />
          <span>Demo mode - sample data.</span>
          <button className="font-bold underline underline-offset-2" onClick={startTour}>
            Take the guided tour
          </button>
          <button
            aria-label="Dismiss demo banner"
            className="absolute right-3 opacity-75 hover:opacity-100"
            onClick={() => setBannerVisible(false)}
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
      {children}
      <div className="fixed bottom-5 left-5 z-50">
        {controlsOpen && (
          <Card className="mb-3 w-72 space-y-3 p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Demo Controls</p>
              <button aria-label="Close demo controls" onClick={() => setControlsOpen(false)}>
                <X className="size-4" />
              </button>
            </div>
            <Button variant="outline" className="w-full justify-start" onClick={toggleSimulation}>
              {simulationPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
              {simulationPaused ? "Resume simulation" : "Pause simulation"}
            </Button>
            <Button
              className="w-full justify-start"
              onClick={simulateSickCow}
              disabled={isSimulatingSickness}
            >
              <Route className="size-4" />
              Simulate a cow getting sick
            </Button>
            {isSimulatingSickness && (
              <div className="rounded-md bg-risk-high/10 p-2 text-xs text-risk-high">
                Simulating mastitis onset... {sicknessProgress}/5
              </div>
            )}
            <Button variant="outline" className="w-full justify-start" onClick={resetDemo}>
              <RotateCcw className="size-4" />
              Reset demo
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={startTour}>
              Take the tour again
            </Button>
          </Card>
        )}
        <Button className="shadow-lg" onClick={() => setControlsOpen((open) => !open)}>
          {controlsOpen ? <X className="size-4" /> : <Route className="size-4" />} Demo Controls
        </Button>
      </div>
      {isSimulatingSickness && (
        <div className="fixed left-1/2 top-12 z-50 -translate-x-1/2 rounded-full border border-risk-high/30 bg-background px-4 py-2 text-xs font-semibold text-risk-high shadow-lg">
          Simulating mastitis onset... {sicknessProgress}/5
        </div>
      )}
      {tourOpen && (
        <div className="fixed inset-0 z-[70] bg-foreground/35">
          <div className="absolute left-1/2 top-1/2 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2">
            <Card className="space-y-5 p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    Guided tour
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Step {tourStep + 1} of {TOUR_STEPS.length}
                  </p>
                </div>
                <button aria-label="Skip tour" onClick={closeTour}>
                  <X className="size-4" />
                </button>
              </div>
              <p className="text-lg font-semibold leading-relaxed">{TOUR_STEPS[tourStep]}</p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={closeTour}>
                  Skip
                </Button>
                <Button variant="outline" onClick={previousTourStep} disabled={tourStep === 0}>
                  Back
                </Button>
                {tourStep === TOUR_STEPS.length - 1 ? (
                  <Button onClick={closeTour}>Done</Button>
                ) : (
                  <Button onClick={nextTourStep}>Next</Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

export function LiveIndicator({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-risk-high",
        className,
      )}
    >
      <span className="size-1.5 animate-pulse rounded-full bg-risk-high" />
      Live
    </span>
  );
}
