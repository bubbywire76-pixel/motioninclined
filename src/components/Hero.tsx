import { Link } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">New drop available</p>
          <h1 className="mt-4 text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Wear your
            <br />
            own story.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Premium streetwear built for everyday confidence. Limited runs, quality fabrics, and designs that speak for themselves.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Shop the collection
            </Link>
            <a
              href="#about"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Learn more <ArrowDown className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted lg:aspect-auto lg:h-full lg:min-h-[480px]">
          <img
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1000&auto=format&fit=crop"
            alt="Streetwear collection flatlay"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
