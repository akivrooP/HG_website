import type { RiskLevel } from "@/lib/risk";

/* ---------- seeded RNG (stable across reloads) ---------- */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260929);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number, dp = 1) =>
  Number((min + rand() * (max - min)).toFixed(dp));

/* ---------- types ---------- */
export type SensorReadings = {
  bodyTemp: number; // °C
  rumination: number; // min/day
  activity: number; // steps/day
  milkYield: number; // L/day
  conductivity: number; // mS/cm
};

export type RiskFactor = { label: string; percent: number };

export type TreatmentRecord = {
  id: string;
  date: string;
  type: string;
  note: string;
  scc?: number;
  cmt?: string;
};

export type Cow = {
  id: string; // 12-digit Pashu Aadhaar style
  name: string;
  tag: string;
  breed: string;
  age: number;
  lactationStage: string;
  riskLevel: RiskLevel;
  riskScore: number;
  sensors: SensorReadings;
  trends: Record<keyof SensorReadings, number>; // % change vs 7-day baseline
  forecast: { day: string; score: number }[];
  factors: RiskFactor[];
  sccTrend: { month: string; scc: number }[];
  history: TreatmentRecord[];
  recommendations: string[];
};

export type Alert = {
  id: string;
  severity: "critical" | "warning" | "info";
  channel: "App" | "SMS" | "Voice call";
  cowId: string;
  cowName: string;
  message: string;
  time: string;
  read: boolean;
};

export type PartnerFarm = {
  id: string;
  name: string;
  village: string;
  animals: number;
  riskCounts: Record<RiskLevel, number>;
  highRiskCows: { id: string; name: string; riskScore: number; issue: string }[];
};

export type MemberFarm = {
  id: string;
  name: string;
  village: string;
  lat: number;
  lng: number;
  animals: number;
  riskLevel: RiskLevel;
};

export type DeviceStatus = {
  id: string;
  label: string;
  battery: number;
  online: boolean;
};

/* ---------- farmer ---------- */
export const farmer = {
  name: "Ramesh Jadhav",
  district: "Satara district, Maharashtra",
  farmName: "Jadhav Dairy Farm",
  cowCount: 128,
};

export const vet = {
  name: "Dr. Anil Patil",
  farms: 6,
  animals: 612,
};

export const coop = {
  name: "Satara District Dairy Cooperative",
  memberFarms: 40,
};

/* ---------- cow generation ---------- */
const NAMES = [
  "Lakshmi","Gauri","Ganga","Nandini","Kamdhenu","Shanti","Radha","Tulsi","Meera","Saraswati",
  "Kaveri","Yamuna","Savitri","Parvati","Ambika","Chandni","Rukmini","Sita","Bhavani","Anjali",
  "Durga","Jamuna","Kalpana","Manju","Nirmala","Pushpa","Rewa","Sonal","Uma","Vaishali",
];
const BREEDS = ["Holstein Friesian", "Gir", "Jersey cross"];
const STAGES = ["Early lactation", "Mid lactation", "Late lactation", "Dry period"];
const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

const RISK_SPLIT: { level: RiskLevel; count: number }[] = [
  { level: "No risk", count: 96 },
  { level: "Low", count: 18 },
  { level: "Moderate", count: 9 },
  { level: "High", count: 5 },
];

function scoreFor(level: RiskLevel) {
  switch (level) {
    case "High":
      return Math.round(between(78, 96, 0));
    case "Moderate":
      return Math.round(between(55, 74, 0));
    case "Low":
      return Math.round(between(30, 52, 0));
    default:
      return Math.round(between(4, 26, 0));
  }
}

function makeForecast(level: RiskLevel, score: number) {
  const slope = level === "High" ? 2.6 : level === "Moderate" ? 1.6 : level === "Low" ? 0.8 : 0.15;
  const start = Math.max(2, score - slope * 9);
  return Array.from({ length: 14 }, (_, i) => ({
    day: `D${i + 1}`,
    score: Math.min(99, Math.max(1, Math.round(start + slope * i + between(-3, 3, 1)))),
  }));
}

function makeFactors(level: RiskLevel): RiskFactor[] {
  const base = [
    { label: "Rumination drop", percent: 38 },
    { label: "Milk conductivity rise", percent: 27 },
    { label: "Body temperature rise", percent: 20 },
    { label: "Activity drop", percent: 15 },
  ];
  const jitter = level === "No risk" ? 4 : 8;
  const raw = base.map((f) => ({
    label: f.label,
    percent: Math.max(4, Math.round(f.percent + between(-jitter, jitter, 0))),
  }));
  const total = raw.reduce((s, f) => s + f.percent, 0);
  return raw
    .map((f) => ({ ...f, percent: Math.round((f.percent / total) * 100) }))
    .sort((a, b) => b.percent - a.percent);
}

function makeScc(level: RiskLevel) {
  const base = level === "High" ? 420 : level === "Moderate" ? 300 : level === "Low" ? 210 : 140;
  const step = level === "High" ? 90 : level === "Moderate" ? 55 : level === "Low" ? 22 : 6;
  return MONTHS.map((month, i) => ({
    month,
    scc: Math.round(base + step * i + between(-30, 30, 0)),
  }));
}

function makeRecommendations(level: RiskLevel) {
  if (level === "High")
    return [
      "Isolate cow from the milking line today",
      "Perform CMT on all four quarters",
      "Call vet for clinical examination within 24 hours",
      "Disinfect teats before and after every milking",
      "Record milk yield twice a day for 7 days",
    ];
  if (level === "Moderate")
    return [
      "Run CMT test within 48 hours",
      "Check milking machine vacuum and liners",
      "Improve bedding hygiene in her stall",
      "Monitor rumination daily for a week",
    ];
  if (level === "Low")
    return [
      "Keep post-milking teat dipping consistent",
      "Watch rumination trend for 5 days",
      "Verify feed quality and water access",
    ];
  return ["Continue routine hygiene", "No action needed — keep monitoring"];
}

function makeHistory(level: RiskLevel, idx: number): TreatmentRecord[] {
  const records: TreatmentRecord[] = [
    {
      id: `h-${idx}-1`,
      date: "2026-05-12",
      type: "Routine check",
      note: "Healthy udder, no abnormality found",
      scc: 130 + Math.round(between(-30, 40, 0)),
      cmt: "Negative",
    },
  ];
  if (level === "Moderate" || level === "High") {
    records.push({
      id: `h-${idx}-2`,
      date: "2026-07-22",
      type: "Subclinical mastitis",
      note: "Intramammary antibiotic course, 3 days",
      scc: 340 + Math.round(between(-40, 80, 0)),
      cmt: "Trace",
    });
  }
  if (level === "High") {
    records.push({
      id: `h-${idx}-3`,
      date: "2026-09-08",
      type: "Follow-up",
      note: "Conductivity still elevated in rear-left quarter",
      scc: 460 + Math.round(between(-40, 90, 0)),
      cmt: "+1",
    });
  }
  return records.reverse();
}

function makeCow(idx: number, level: RiskLevel): Cow {
  const score = scoreFor(level);
  const sick = level === "High" || level === "Moderate";
  const name = NAMES[idx % NAMES.length];
  return {
    id: String(Math.floor(100000000000 + rand() * 899999999999)),
    name: idx >= NAMES.length ? `${name} ${Math.floor(idx / NAMES.length) + 1}` : name,
    tag: `JD-${String(idx + 1).padStart(3, "0")}`,
    breed: pick(BREEDS),
    age: Number(between(2.5, 9, 1)),
    lactationStage: pick(STAGES),
    riskLevel: level,
    riskScore: score,
    sensors: {
      bodyTemp: between(sick ? 39.1 : 38.2, sick ? 40.1 : 38.9, 1),
      rumination: Math.round(between(sick ? 320 : 460, sick ? 430 : 560, 0)),
      activity: Math.round(between(sick ? 2200 : 3400, sick ? 3300 : 4800, 0)),
      milkYield: between(sick ? 6.5 : 10, sick ? 11 : 18.5, 1),
      conductivity: between(sick ? 5.6 : 4.4, sick ? 7.2 : 5.4, 2),
    },
    trends: {
      bodyTemp: Number(between(sick ? 0.8 : -0.6, sick ? 3.4 : 0.8, 1)),
      rumination: Number(between(sick ? -24 : -4, sick ? -9 : 5, 1)),
      activity: Number(between(sick ? -18 : -5, sick ? -6 : 6, 1)),
      milkYield: Number(between(sick ? -21 : -4, sick ? -7 : 6, 1)),
      conductivity: Number(between(sick ? 9 : -3, sick ? 26 : 4, 1)),
    },
    forecast: makeForecast(level, score),
    factors: makeFactors(level),
    sccTrend: makeScc(level),
    history: makeHistory(level, idx),
    recommendations: makeRecommendations(level),
  };
}

function buildHerd(): Cow[] {
  const levels: RiskLevel[] = [];
  RISK_SPLIT.forEach(({ level, count }) => {
    for (let i = 0; i < count; i++) levels.push(level);
  });
  // deterministic interleave so the list is not sorted by risk
  const ordered: RiskLevel[] = [];
  const buckets = new Map<RiskLevel, RiskLevel[]>();
  levels.forEach((l) => {
    const arr = buckets.get(l) ?? [];
    arr.push(l);
    buckets.set(l, arr);
  });
  let i = 0;
  while (ordered.length < levels.length) {
    for (const key of ["High", "No risk", "Low", "No risk", "Moderate", "No risk"] as RiskLevel[]) {
      const arr = buckets.get(key);
      if (arr && arr.length) ordered.push(arr.pop()!);
    }
    i++;
    if (i > 500) break;
  }
  return ordered.map((level, idx) => makeCow(idx, level));
}

export const cows: Cow[] = buildHerd();

/* ---------- alerts ---------- */
const ALERT_TEMPLATES: { severity: Alert["severity"]; channel: Alert["channel"]; message: string }[] = [
  { severity: "critical", channel: "Voice call", message: "High mastitis risk predicted in 8 days — isolate and test" },
  { severity: "critical", channel: "SMS", message: "Milk conductivity crossed 6.8 mS/cm in rear-left quarter" },
  { severity: "critical", channel: "App", message: "Rumination fell 24% over 3 days" },
  { severity: "warning", channel: "App", message: "Body temperature above 39.4°C for 12 hours" },
  { severity: "warning", channel: "SMS", message: "Milk yield down 18% vs weekly average" },
  { severity: "warning", channel: "App", message: "Activity drop detected — check for lameness too" },
  { severity: "warning", channel: "Voice call", message: "Moderate risk rising — CMT test recommended" },
  { severity: "info", channel: "App", message: "Weekly herd report is ready" },
  { severity: "info", channel: "App", message: "Tag battery at 22% — plan replacement" },
  { severity: "info", channel: "SMS", message: "Farm Unit synced 312 readings" },
  { severity: "info", channel: "App", message: "Bedding hygiene reminder for Shed B" },
  { severity: "warning", channel: "App", message: "Conductivity trending up for the third day" },
  { severity: "info", channel: "App", message: "Vet visit scheduled for Thursday" },
  { severity: "critical", channel: "App", message: "Two cows crossed the high-risk threshold today" },
  { severity: "info", channel: "SMS", message: "Milk collection quality grade: A" },
];

const TIMES = [
  "2 min ago","18 min ago","45 min ago","1 hr ago","2 hr ago","3 hr ago","5 hr ago","Yesterday 8:10 PM",
  "Yesterday 6:30 PM","Yesterday 1:15 PM","2 days ago","2 days ago","3 days ago","3 days ago","4 days ago",
];

const attentionCows = [...cows]
  .sort((a, b) => b.riskScore - a.riskScore)
  .slice(0, 15);

export const alerts: Alert[] = ALERT_TEMPLATES.map((t, i) => {
  const cow = attentionCows[i % attentionCows.length];
  return {
    id: `a-${i + 1}`,
    severity: t.severity,
    channel: t.channel,
    cowId: cow.id,
    cowName: cow.name,
    message: t.message,
    time: TIMES[i],
    read: i > 6,
  };
});

/* ---------- herd analytics ---------- */
export const herdRiskTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  high: Math.max(0, Math.round(3 + Math.sin(i / 4) * 1.5 + between(-0.6, 1.2, 0))),
  moderate: Math.max(0, Math.round(7 + Math.cos(i / 5) * 2 + between(-1, 1.5, 0))),
  low: Math.max(0, Math.round(16 + Math.sin(i / 6) * 3 + between(-1.5, 2, 0))),
}));

export const yieldVsRisk = cows.slice(0, 60).map((c) => ({
  riskScore: c.riskScore,
  milkYield: c.sensors.milkYield,
  level: c.riskLevel,
}));

export const devices: DeviceStatus[] = [
  { id: "d1", label: "Neck tag batch A (42 tags)", battery: 88, online: true },
  { id: "d2", label: "Neck tag batch B (44 tags)", battery: 61, online: true },
  { id: "d3", label: "Neck tag batch C (42 tags)", battery: 22, online: true },
  { id: "d4", label: "Milk conductivity sensor — parlour 1", battery: 74, online: true },
  { id: "d5", label: "Milk conductivity sensor — parlour 2", battery: 39, online: false },
];

export const farmUnit = {
  status: "Online",
  lastSync: "Today, 9:42 AM",
  storedReadings: 12480,
  network: "GSM — 4 bars",
};

/* ---------- vet ---------- */
export const partnerFarms: PartnerFarm[] = [
  {
    id: "f1",
    name: "Jadhav Dairy Farm",
    village: "Koregaon",
    animals: 128,
    riskCounts: { "No risk": 96, Low: 18, Moderate: 9, High: 5 },
    highRiskCows: attentionCows.slice(0, 3).map((c) => ({
      id: c.id,
      name: c.name,
      riskScore: c.riskScore,
      issue: "Rumination drop + conductivity rise",
    })),
  },
  {
    id: "f2",
    name: "Shivneri Dairy",
    village: "Wai",
    animals: 96,
    riskCounts: { "No risk": 74, Low: 13, Moderate: 6, High: 3 },
    highRiskCows: [
      { id: "930112447781", name: "Sarita", riskScore: 88, issue: "Quarter conductivity spike" },
      { id: "930112447782", name: "Kanchan", riskScore: 81, issue: "Fever + yield drop" },
    ],
  },
  {
    id: "f3",
    name: "Krishna Valley Farm",
    village: "Karad",
    animals: 112,
    riskCounts: { "No risk": 88, Low: 14, Moderate: 7, High: 3 },
    highRiskCows: [
      { id: "930112447783", name: "Godavari", riskScore: 84, issue: "Repeat subclinical case" },
      { id: "930112447784", name: "Rohini", riskScore: 79, issue: "Activity drop 3 days" },
    ],
  },
  {
    id: "f4",
    name: "Sahyadri Gopalan",
    village: "Patan",
    animals: 84,
    riskCounts: { "No risk": 66, Low: 11, Moderate: 5, High: 2 },
    highRiskCows: [
      { id: "930112447785", name: "Vasudha", riskScore: 90, issue: "Clinical signs expected in 9 days" },
      { id: "930112447786", name: "Sonali", riskScore: 76, issue: "Conductivity rise" },
    ],
  },
  {
    id: "f5",
    name: "Mauli Milk Producers",
    village: "Phaltan",
    animals: 102,
    riskCounts: { "No risk": 80, Low: 13, Moderate: 6, High: 3 },
    highRiskCows: [
      { id: "930112447787", name: "Jyoti", riskScore: 86, issue: "SCC trending above 400k" },
      { id: "930112447788", name: "Pallavi", riskScore: 77, issue: "Yield down 19%" },
    ],
  },
  {
    id: "f6",
    name: "Ajinkya Dairy",
    village: "Man",
    animals: 90,
    riskCounts: { "No risk": 70, Low: 12, Moderate: 5, High: 3 },
    highRiskCows: [
      { id: "930112447789", name: "Suman", riskScore: 83, issue: "Temperature rise 2 days" },
      { id: "930112447790", name: "Asha", riskScore: 75, issue: "Rumination drop" },
    ],
  },
];

/* ---------- co-op ---------- */
const VILLAGES = [
  "Koregaon","Wai","Karad","Patan","Phaltan","Man","Khatav","Jaoli","Mahabaleshwar","Satara City",
];

export const memberFarms: MemberFarm[] = Array.from({ length: 40 }, (_, i) => {
  const r = rand();
  const riskLevel: RiskLevel =
    r > 0.9 ? "High" : r > 0.75 ? "Moderate" : r > 0.5 ? "Low" : "No risk";
  return {
    id: `mf-${i + 1}`,
    name: `${VILLAGES[i % VILLAGES.length]} Dairy ${Math.floor(i / VILLAGES.length) + 1}`,
    village: VILLAGES[i % VILLAGES.length],
    lat: Number((17.68 + between(-0.35, 0.35, 3)).toFixed(3)),
    lng: Number((74.02 + between(-0.4, 0.4, 3)).toFixed(3)),
    animals: Math.round(between(45, 190, 0)),
    riskLevel,
  };
});
