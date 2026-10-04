import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full sm:w-[390px]">
      <div className="relative h-[100dvh] w-full overflow-hidden bg-background sm:h-[800px] sm:rounded-[2.5rem] sm:border-8 sm:border-foreground/85 sm:shadow-2xl">
        <div className="hidden sm:flex absolute left-1/2 top-0 z-30 h-6 w-32 -translate-x-1/2 items-center justify-center rounded-b-2xl bg-foreground/85" />
        {children}
      </div>
    </div>
  );
}
