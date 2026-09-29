import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Bell, BarChart3, Home, LayoutGrid, MoreHorizontal, ShieldCheck } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AssistButtons, SwitchRoleButton } from "@/components/TopBar";
import { useHerd } from "@/context/HerdContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer")({
  component: FarmerLayout,
});

const TABS = [
  { to: "/farmer", label: "Home", icon: Home, exact: true },
  { to: "/farmer/herd", label: "My Herd", icon: LayoutGrid },
  { to: "/farmer/alerts", label: "Alerts", icon: Bell },
  { to: "/farmer/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/farmer/more", label: "More", icon: MoreHorizontal },
] as const;

function FarmerLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { alerts } = useHerd();
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="flex min-h-screen justify-center bg-secondary/60 sm:py-8">
      <div className="w-full sm:w-auto">
        <PhoneFrame>
          <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b bg-card px-3 py-2.5 pt-3 sm:pt-7">
              <div className="flex items-center gap-1.5">
                <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <ShieldCheck className="size-4" />
                </span>
                <span className="text-sm font-bold">HerdGuard</span>
              </div>
              <div className="flex items-center gap-1">
                <AssistButtons />
                <SwitchRoleButton />
              </div>
            </header>

            <main className="no-scrollbar flex-1 overflow-y-auto bg-background pb-4">
              <Outlet />
            </main>

            <nav className="grid grid-cols-5 border-t bg-card">
              {TABS.map(({ to, label, icon: Icon, ...rest }) => {
                const exact = "exact" in rest && rest.exact;
                const active = exact ? pathname === to : pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                    {label}
                    {label === "Alerts" && unread > 0 && (
                      <span className="absolute right-[22%] top-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                        {unread}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
}
