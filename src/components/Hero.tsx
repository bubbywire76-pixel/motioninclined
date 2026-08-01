import { Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero-lifestyle.jpg";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-muted">
      <img
        src={heroImage}
        alt="Motion Inclined campaign — model walking across an open concrete plaza in premium streetwear"
        width={1920}
        height={1280}
        className="h-[78vh] min-h-[520px] w-full object-cover sm:h-[88vh]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/10" />
      <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-16 text-center sm:pb-24">
        <p
          className="animate-fade-up text-[9px] uppercase tracking-[0.45em] text-white/75 sm:text-[10px]"
          style={{ animationDelay: "120ms" }}
        >
          Collection 01 — Essentials
        </p>
        <h1
          className="animate-fade-up display-hd mt-6 max-w-4xl text-[13vw] text-white sm:text-6xl lg:text-8xl"
          style={{ animationDelay: "240ms" }}
        >
          MOVE WITH PURPOSE.
        </h1>
        <p
          className="animate-fade-up mt-6 max-w-md text-sm leading-relaxed text-white/80"
          style={{ animationDelay: "380ms" }}
        >
          Premium streetwear created for those who refuse to stand still.
        </p>
        <div
          className="animate-fade-up mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
          style={{ animationDelay: "520ms" }}
        >
          <Link
            to="/shop"
            className="w-56 rounded-full bg-background px-8 py-4 text-[10px] uppercase tracking-[0.3em] text-foreground transition-all duration-500 hover:scale-[1.03] sm:w-auto"
          >
            Shop Collection
          </Link>
          <Link
            to="/about"
            className="w-56 rounded-full border border-white/60 px-8 py-4 text-[10px] uppercase tracking-[0.3em] text-white transition-all duration-500 hover:bg-white hover:text-foreground sm:w-auto"
          >
            Explore Motion
          </Link>
        </div>
      </div>
    </section>
  );
}
