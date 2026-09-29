import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AccessibilityButton, AssistButtons, SwitchRoleButton } from "@/components/TopBar";
import { cn } from "@/lib/utils";

export type ConsoleNavItem = { label: string; icon: LucideIcon };

export function ConsoleShell({
  role,
  person,
  items,
  active,
  onSelect,
  children,
}: {
  role: string;
  person: string;
  items: ConsoleNavItem[];
  active: string;
  onSelect: (label: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r bg-sidebar lg:block">
        <div className="flex h-20 items-center gap-3 border-b px-6">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="font-display text-base font-extrabold">HerdGuard</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {role} console
            </p>
          </div>
        </div>
        <nav className="space-y-1 p-4">
          {items.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                active === label
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-primary-soft p-3">
          <p className="text-xs font-semibold text-primary">{person}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Signed in for today</p>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-background/95 px-5 backdrop-blur sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {role} workspace
            </p>
            <h1 className="font-display text-xl font-extrabold">{active}</h1>
          </div>
          <div className="flex items-center gap-1">
            <AssistButtons />
            <AccessibilityButton />
            <SwitchRoleButton />
          </div>
        </header>
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

export function SectionIntro({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-extrabold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
