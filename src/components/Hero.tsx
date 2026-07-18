import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section className="px-4 pt-4 pb-16 sm:px-8 sm:pt-8 sm:pb-24">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-6xl overflow-hidden bg-muted sm:aspect-[16/9]">
        <img
          src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=2000&auto=format&fit=crop"
          alt="Motion Inclined seasonal editorial"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 text-center sm:pb-14">
          <span className="mb-3 text-[9px] uppercase tracking-[0.4em] text-white/70 sm:text-[10px]">
            Collection 01 — Essentials
          </span>
          <h1 className="max-w-xl px-8 text-2xl font-light tracking-tight text-white sm:text-4xl lg:text-5xl">
            Wear your own story.
          </h1>
          <Link
            to="/"
            className="mt-8 border-b border-white/70 pb-1 text-[10px] uppercase tracking-[0.35em] text-white transition-opacity hover:opacity-70"
          >
            Shop the collection
          </Link>
        </div>
      </div>
    </section>
  );
}
