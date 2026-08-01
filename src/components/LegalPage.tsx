import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

interface LegalPageProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
}

export function LegalPage({ eyebrow = "Policy", title, intro, children }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 sm:py-40">
      <Reveal>
        <p className="text-[9px] uppercase tracking-[0.45em] text-muted-foreground">{eyebrow}</p>
        <h1 className="display-hd mt-6 text-4xl sm:text-6xl">{title}</h1>
        {intro && <p className="mt-8 text-sm leading-relaxed text-muted-foreground">{intro}</p>}
      </Reveal>
      <Reveal delay={100} className="mt-16 space-y-12">
        {children}
      </Reveal>
    </div>
  );
}

export function Clause({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[11px] uppercase tracking-[0.28em]">{heading}</h2>
      <div className="mt-4 space-y-4 text-sm leading-loose text-muted-foreground">{children}</div>
    </section>
  );
}
