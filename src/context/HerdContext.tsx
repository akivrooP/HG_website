import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  alerts as seedAlerts,
  cows as seedCows,
  type Alert,
  type Cow,
  type TreatmentRecord,
} from "@/data/mock";

export type Role = "farmer" | "vet" | "coop";

type VetQueueItem = { cowId: string; cowName: string; farm: string; requestedAt: string };

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
  getCow: (id: string) => Cow | undefined;
};

const HerdContext = createContext<HerdState | null>(null);

export function HerdProvider({ children }: { children: ReactNode }) {
  const [cows, setCows] = useState<Cow[]>(seedCows);
  const [alerts, setAlerts] = useState<Alert[]>(seedAlerts);
  const [role, setRole] = useState<Role | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [vetQueue, setVetQueue] = useState<VetQueueItem[]>([]);

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
    }),
    [cows, alerts, role, onboarded, offlineMode, vetQueue],
  );

  return <HerdContext.Provider value={value}>{children}</HerdContext.Provider>;
}

export function useHerd() {
  const ctx = useContext(HerdContext);
  if (!ctx) throw new Error("useHerd must be used inside HerdProvider");
  return ctx;
}
