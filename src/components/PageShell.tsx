import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid-bg">
      <SiteHeader />
      <main className="px-3 sm:px-6 mt-8">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <section className="mx-auto max-w-7xl">
      <div className="glass-strong p-8 sm:p-12 grid gap-3">
        {eyebrow && (
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</div>
        )}
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl leading-tight">{title}</h1>
        {description && <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">{description}</p>}
      </div>
    </section>
  );
}
