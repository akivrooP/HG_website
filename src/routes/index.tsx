import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Stethoscope, Tractor, Building2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AssistButtons } from "@/components/TopBar";
import { useHerd, type Role } from "@/context/HerdContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HerdGuard — Mastitis early warning for dairy herds" },
      {
        name: "description",
        content:
          "Pick your role — farmer, vet or cooperative — and see mastitis risk forecast 7-14 days ahead.",
      },
      { property: "og:title", content: "HerdGuard — Mastitis early warning for dairy herds" },
      {
        property: "og:description",
        content: "IoT + AI dashboard forecasting mastitis in dairy cows before symptoms appear.",
      },
    ],
  }),
  component: RolePicker,
});

const ROLES: {
  role: Role;
  title: string;
  blurb: string;
  icon: typeof Tractor;
  to: string;
}[] = [
  {
    role: "farmer",
    title: "Continue as Farmer",
    blurb: "Track every cow, get early alerts and act before milk loss.",
    icon: Tractor,
    to: "/onboarding",
  },
  {
    role: "vet",
    title: "Continue as Vet",
    blurb: "Triage high-risk animals across all the farms you serve.",
    icon: Stethoscope,
    to: "/vet",
  },
  {
    role: "coop",
    title: "Continue as Co-op / Authority",
    blurb: "See district-level herd health and plan interventions.",
    icon: Building2,
    to: "/coop",
  },
];

function RolePicker() {
  const { setRole, onboarded } = useHerd();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <span className="text-lg font-bold">HerdGuard</span>
        </div>
        <AssistButtons />
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20">
        <section className="py-10 text-center sm:py-16">
          <p className="mx-auto mb-4 w-fit rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            Smart India Hackathon · PS 26109
          </p>
          <h1 className="text-balance text-4xl font-extrabold sm:text-5xl">
            Mastitis, spotted 7-14 days early
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-muted-foreground">
            Mastitis costs Indian dairy farmers about ₹7,165 crore every year. Today detection is
            late and reactive — HerdGuard uses wearable sensors and AI to warn before the first
            visible symptom.
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          {ROLES.map(({ role, title, blurb, icon: Icon, to }) => (
            <Card
              key={role}
              role="button"
              tabIndex={0}
              onClick={() => {
                setRole(role);
                navigate({
                  to: role === "farmer" && onboarded ? "/farmer" : to,
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setRole(role);
                  navigate({ to: role === "farmer" && onboarded ? "/farmer" : to });
                }
              }}
              className="group cursor-pointer p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="size-6" />
              </span>
              <h2 className="mt-5 text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{blurb}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Enter <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Prototype — no login, demo data only.
        </p>
      </main>
    </div>
  );
}
