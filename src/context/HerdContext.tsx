import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  alerts as seedAlerts,
  cows as seedCows,
  type Alert,
  type Cow,
  type TreatmentRecord,
} from "@/data/mock";

export type Role = "farmer" | "vet" | "coop";

type VetQueueItem = { cowId: string; cowName: string; farm: string; requestedAt: string };
type TextSize = "normal" | "large" | "extra-large";

const LIVE_ALERTS = [
  "Rumination dropped 30% for Gauri",
  "Milk conductivity rising for Ganga",
  "Body temperature elevated for Lakshmi",
  "Activity trend falling for Nandini",
];

function cloneCows() {
  return seedCows.map((cow) => ({
    ...cow,
    sensors: { ...cow.sensors },
    trends: { ...cow.trends },
    forecast: cow.forecast.map((point) => ({ ...point })),
    factors: cow.factors.map((factor) => ({ ...factor })),
    sccTrend: cow.sccTrend.map((point) => ({ ...point })),
    history: cow.history.map((record) => ({ ...record })),
    recommendations: [...cow.recommendations],
  }));
}

type HerdState = {
  cows: Cow[];
  alerts: Alert[];
  role: Role | null;
  setRole: (r: Role | null) => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  offlineMode: boolean;
  setOfflineMode: (v: boolean) => void;
  vetQueue: VetQueueItem[];
  notifyVet: (cow: Cow) => void;
  addRecord: (cowId: string, record: Omit<TreatmentRecord, "id">) => void;
  markAlertRead: (id: string) => void;
  markAllRead: () => void;
  simulationPaused: boolean;
  toggleSimulation: () => void;
  simulateSickCow: () => void;
  resetDemo: () => void;
  isSimulatingSickness: boolean;
  sicknessProgress: number;
  liveTick: number;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  textSize: TextSize;
  setTextSize: (value: TextSize) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  tourOpen: boolean;
  tourStep: number;
  startTour: () => void;
  closeTour: () => void;
  nextTourStep: () => void;
  previousTourStep: () => void;
};

const HerdContext = createContext<HerdState | null>(null);

export function HerdProvider({ children }: { children: ReactNode }) {
  const [cows, setCows] = useState<Cow[]>(cloneCows);
  const [alerts, setAlerts] = useState<Alert[]>(seedAlerts);
  const [role, setRole] = useState<Role | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [vetQueue, setVetQueue] = useState<VetQueueItem[]>([]);
  const [simulationPaused, setSimulationPaused] = useState(false);
  const [isSimulatingSickness, setIsSimulatingSickness] = useState(false);
  const [sicknessProgress, setSicknessProgress] = useState(0);
  const [liveTick, setLiveTick] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const cowsRef = useRef(cows);
  cowsRef.current = cows;

  useEffect(() => {
    if (simulationPaused) return;
    const timer = window.setInterval(() => {
      setCows((current) => {
        const indexes = new Set(
          Array.from({ length: Math.min(4, current.length) }, () =>
            Math.floor(Math.random() * current.length),
          ),
        );
        return current.map((cow, index) => {
          if (!indexes.has(index)) return cow;
          const sensorDelta = (value: number, magnitude: number) =>
            Number((value + (Math.random() * 2 - 1) * magnitude).toFixed(1));
          const sensors = {
            ...cow.sensors,
            bodyTemp: sensorDelta(cow.sensors.bodyTemp, 0.08),
            rumination: Math.max(100, Math.round(sensorDelta(cow.sensors.rumination, 5))),
            activity: Math.max(500, Math.round(sensorDelta(cow.sensors.activity, 40))),
            milkYield: Math.max(1, sensorDelta(cow.sensors.milkYield, 0.2)),
            conductivity: Math.max(1, sensorDelta(cow.sensors.conductivity, 0.08)),
          };
          return { ...cow, sensors };
        });
      });
      setLiveTick((tick) => tick + 1);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [simulationPaused]);

  useEffect(() => {
    if (simulationPaused) return;
    let index = 0;
    const timer = window.setInterval(() => {
      const cow = cowsRef.current.find((item) => item.name === "Gauri") ?? cowsRef.current[0];
      if (!cow) return;
      setAlerts((current) => [
        {
          id: `live-${Date.now()}`,
          severity: "warning",
          channel: index % 2 ? "SMS" : "App",
          cowId: cow.id,
          cowName: cow.name,
          message: LIVE_ALERTS[index++ % LIVE_ALERTS.length]!,
          time: "Just now",
          read: false,
        },
        ...current,
      ]);
      toast.info("New live herd alert received");
    }, 25000);
    return () => window.clearInterval(timer);
  }, [simulationPaused]);

  const simulateSickCow = useCallback(() => {
    if (isSimulatingSickness) return;
    const target =
      cows.find((cow) => cow.name === "Gauri" && cow.riskLevel === "Low") ??
      cows.find((cow) => cow.riskLevel === "Low");
    if (!target) return;
    setIsSimulatingSickness(true);
    setSicknessProgress(1);
    setAlerts((current) => [
      {
        id: `sick-${Date.now()}`,
        severity: "critical",
        channel: "Voice call",
        cowId: target.id,
        cowName: target.name,
        message: "Mastitis onset simulation: urgent examination recommended",
        time: "Just now",
        read: false,
      },
      ...current,
    ]);
    let stage = 1;
    const timer = window.setInterval(() => {
      stage += 1;
      setSicknessProgress(Math.min(stage, 5));
      setCows((current) =>
        current.map((cow) =>
          cow.id !== target.id
            ? cow
            : {
                ...cow,
                riskLevel: stage >= 5 ? "High" : stage >= 3 ? "Moderate" : "Low",
                riskScore: Math.min(94, cow.riskScore + 10),
                sensors: {
                  ...cow.sensors,
                  bodyTemp: Number((cow.sensors.bodyTemp + 0.22).toFixed(1)),
                  conductivity: Number((cow.sensors.conductivity + 0.22).toFixed(2)),
                  rumination: Math.max(250, cow.sensors.rumination - 18),
                },
                forecast: cow.forecast.map((point, index) => ({
                  ...point,
                  score: Math.min(98, point.score + stage * 3 + index),
                })),
                recommendations:
                  stage >= 3
                    ? [
                        "Isolate cow from the milking line today",
                        "Perform CMT on all four quarters",
                        "Call vet for clinical examination within 24 hours",
                      ]
                    : cow.recommendations,
              },
        ),
      );
      if (stage >= 3) {
        setVetQueue((queue) =>
          queue.some((item) => item.cowId === target.id)
            ? queue
            : [
                {
                  cowId: target.id,
                  cowName: target.name,
                  farm: "Jadhav Dairy Farm",
                  requestedAt: "Just now",
                },
                ...queue,
              ],
        );
      }
      if (stage >= 5) {
        window.clearInterval(timer);
        setIsSimulatingSickness(false);
        toast.error(`${target.name} is now high risk`);
      }
    }, 2000);
  }, [cows, isSimulatingSickness]);

  const resetDemo = () => {
    setCows(cloneCows());
    setAlerts(seedAlerts);
    setVetQueue([]);
    setIsSimulatingSickness(false);
    setSicknessProgress(0);
    toast.success("Demo data reset");
  };

  const value = useMemo<HerdState>(
    () => ({
      cows,
      alerts,
      role,
      setRole,
      onboarded,
      setOnboarded,
      offlineMode,
      setOfflineMode,
      vetQueue,
      getCow: (id) => cows.find((c) => c.id === id),
      notifyVet: (cow) =>
        setVetQueue((q) =>
          q.some((i) => i.cowId === cow.id)
            ? q
            : [
                ...q,
                {
                  cowId: cow.id,
                  cowName: cow.name,
                  farm: "Jadhav Dairy Farm",
                  requestedAt: "Just now",
                },
              ],
        ),
      addRecord: (cowId, record) =>
        setCows((prev) =>
          prev.map((c) =>
            c.id === cowId
              ? { ...c, history: [{ ...record, id: `h-${Date.now()}` }, ...c.history] }
              : c,
          ),
        ),
      markAlertRead: (id) =>
        setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a))),
      markAllRead: () => setAlerts((prev) => prev.map((a) => ({ ...a, read: true }))),
      simulationPaused,
      toggleSimulation: () => setSimulationPaused((paused) => !paused),
      simulateSickCow,
      resetDemo,
      isSimulatingSickness,
      sicknessProgress,
      liveTick,
      darkMode,
      setDarkMode,
      textSize,
      setTextSize,
      highContrast,
      setHighContrast,
      tourOpen,
      tourStep,
      startTour: () => {
        setTourOpen(true);
      },
      closeTour: () => setTourOpen(false),
      nextTourStep: () => setTourStep((step) => Math.min(7, step + 1)),
      previousTourStep: () => setTourStep((step) => Math.max(0, step - 1)),
    }),
    [
      cows,
      alerts,
      role,
      onboarded,
      offlineMode,
      vetQueue,
      simulationPaused,
      isSimulatingSickness,
      sicknessProgress,
      liveTick,
      darkMode,
      textSize,
      highContrast,
      tourOpen,
      tourStep,
      simulateSickCow,
    ],
  );

  return <HerdContext.Provider value={value}>{children}</HerdContext.Provider>;
}

export function useHerd() {
  const ctx = useContext(HerdContext);
  if (!ctx) throw new Error("useHerd must be used inside HerdProvider");
  return ctx;
}
