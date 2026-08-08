import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { Newsletter } from "@/components/Newsletter";
import { CHAPTER_37_COMING_SOON, CHAPTER_37_INTRO } from "@/lib/chapter37";
import denimHero from "@/assets/ch37-denim-hero.png.asset.json";

const DESCRIPTION =
  "Chapter 37 by Motion Inclined — a new angle of motion. The ∠37 Denim Set, ∠37 Tracksuit and Jersey 18, engineered around the 37° system.";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Chapter 37 — Motion Inclined" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Chapter 37 — Motion Inclined" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  return (
    <div className="flex flex-col">
      <section className="mx-auto w-full max-w-[1600px] px-5 pb-16 pt-24 sm:px-10 sm:pb-24 sm:pt-36">
        <Reveal>
          <p className="eyebrow">{CHAPTER_37_INTRO.brand}</p>
          <h1 className="display-hd mt-8 max-w-3xl text-[13vw] leading-[0.9] sm:text-7xl lg:text-[6rem]">
            {CHAPTER_37_INTRO.title}
            <br />
            <span className="font-serif-display font-light italic">
              {CHAPTER_37_INTRO.line}
            </span>
          </h1>
          <p className="mt-10 text-[10px] uppercase tracking-[0.45em] text-muted-foreground">
            {CHAPTER_37_INTRO.sign}
          </p>
        </Reveal>
      </section>

      {/* Available piece */}
      <section className="mx-auto w-full max-w-[1600px] px-5 pb-28 sm:px-10 sm:pb-40">
        <Reveal>
          <Link
            to="/product/$handle"
            params={{ handle: "custom-denim-jacket-and-pant" }}
            className="group grid items-center gap-10 md:grid-cols-2 md:gap-20"
          >
            <div className="overflow-hidden rounded-[28px] bg-muted">
              <img
                src={denimHero.url}
                alt="∠37 Denim Set — engineered denim built around the 37° system"
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
              />
            </div>
            <div>
              <p className="eyebrow">Available — limited quantity · M, L, XL</p>
              <h2 className="display-hd mt-6 text-4xl sm:text-6xl">∠37 Denim Set</h2>
              <p className="mt-7 max-w-md text-sm leading-loose text-muted-foreground">
                An engineered denim set built around the 37° system. Featuring a fitted-palazzo
                silhouette, diagonal double-stitch construction and premium stone MOTION detailing.
              </p>
              <span className="link-underline mt-9 inline-block text-[10px] uppercase tracking-[0.3em]">
                View the piece
              </span>
            </div>
          </Link>
        </Reveal>
      </section>

      {/* Coming soon */}
      <section className="mx-auto w-full max-w-[1600px] px-5 pb-28 sm:px-10 sm:pb-40">
        <Reveal className="mb-16 sm:mb-24">
          <p className="eyebrow">Next in Chapter 37</p>
          <h2 className="display-hd mt-6 text-4xl sm:text-6xl">Coming Soon</h2>
        </Reveal>
        <div className="grid gap-16 md:grid-cols-2 md:gap-12">
          {CHAPTER_37_COMING_SOON.map((piece, i) => (
            <Reveal key={piece.name} delay={i * 80}>
              <article className="group flex flex-col">
                <div className="relative overflow-hidden rounded-[24px] bg-muted">
                  <img
                    src={piece.image}
                    alt={piece.alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1.5 text-[9px] uppercase tracking-[0.25em] backdrop-blur-md">
                    Coming soon
                  </span>
                </div>
                <h3 className="display-hd mt-8 text-2xl sm:text-3xl">{piece.name}</h3>
                <p className="mt-5 max-w-md text-sm leading-loose text-muted-foreground">
                  {piece.copy}
                </p>
                <div className="mt-8 flex w-full max-w-xs items-center justify-center rounded-full border border-border py-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Coming soon
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
