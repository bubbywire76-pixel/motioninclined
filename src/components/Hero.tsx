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
        fetchPriority="high"
        decoding="async"
        className="h-[86vh] min-h-[560px] w-full object-cover object-center sm:h-[94vh]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/20" />
      <div className="absolute inset-0 mx-auto flex w-full max-w-[1600px] flex-col justify-end px-5 pb-16 sm:px-10 sm:pb-24">
        <p
          className="animate-fade-up text-[9px] uppercase tracking-[0.5em] text-white/70 sm:text-[10px]"
          style={{ animationDelay: "120ms" }}
        >
          Collection 01 — Essentials
        </p>
        <h1
          className="animate-fade-up display-hd mt-8 max-w-5xl text-[14vw] leading-[0.9] text-white sm:text-7xl lg:text-[7.5rem]"
          style={{ animationDelay: "240ms" }}
        >
          LUXURY IN
          <br />
          <span className="font-serif-display font-light italic tracking-tight">Motion.</span>
        </h1>
        <p
          className="animate-fade-up mt-8 max-w-xl text-sm leading-relaxed tracking-wide text-white/80"
          style={{ animationDelay: "380ms" }}
        >
          Motion Inclined creates timeless luxury streetwear for individuals who move with purpose.
          Every piece is designed with precision, confidence, and exceptional craftsmanship.
        </p>
        <div
          className="animate-fade-up mt-12 flex flex-col gap-3 sm:flex-row sm:gap-4"
          style={{ animationDelay: "520ms" }}
        >
          <Link
            to="/shop"
            className="w-full rounded-full bg-background px-10 py-4 text-center text-[10px] uppercase tracking-[0.3em] text-foreground transition-all duration-500 hover:scale-[1.03] hover:bg-gold hover:text-ink sm:w-auto"
          >
            Shop Collection
          </Link>
          <Link
            to="/about"
            className="w-full rounded-full border border-white/50 px-10 py-4 text-center text-[10px] uppercase tracking-[0.3em] text-white backdrop-blur-sm transition-all duration-500 hover:border-gold hover:text-gold sm:w-auto"
          >
            Discover Motion
          </Link>
        </div>
        <p
          className="animate-fade-up mt-8 text-[9px] uppercase tracking-[0.3em] text-white/55"
          style={{ animationDelay: "640ms" }}
        >
          Free shipping over ₦100,000 · 48h nationwide dispatch
        </p>
      </div>
    </section>
  );
}
