import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Gem, Compass, Layers, Truck, ShieldCheck } from "lucide-react";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductRail } from "@/components/ProductRail";
import { TrustBar } from "@/components/TrustBar";
import { Newsletter } from "@/components/Newsletter";
import { InstagramGallery } from "@/components/InstagramGallery";
import { Reveal } from "@/components/Reveal";
import { fetchProducts } from "@/lib/shopify";
import lifestyle from "@/assets/lifestyle-editorial.jpg";

const productsQueryOptions = {
  queryKey: ["products"],
  queryFn: () => fetchProducts(50),
};

const DESCRIPTION =
  "Motion Inclined is premium streetwear for people who refuse to stand still. Move with purpose — limited collections, elevated materials, considered design.";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(productsQueryOptions);
  },
  head: () => ({
    meta: [
      { title: "Motion Inclined — Move With Purpose | Luxury Streetwear" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Motion Inclined — Move With Purpose" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Motion Inclined",
          slogan: "Move with purpose.",
          email: "bubbywire76@gmail.com",
          telephone: "+2347043602465",
        }),
      },
    ],
  }),
  component: Index,
});

const REASONS = [
  { icon: Gem, title: "Premium Materials", copy: "Heavyweight cottons and considered hardware, selected to last." },
  { icon: Compass, title: "Designed With Purpose", copy: "Every graphic carries intent. Nothing is decoration." },
  { icon: Layers, title: "Limited Collections", copy: "Small runs. Once a drop is gone, it stays gone." },
  { icon: Truck, title: "Fast Delivery", copy: "Nationwide dispatch within 48 hours of your order." },
  { icon: ShieldCheck, title: "Secure Checkout", copy: "Encrypted payments through a trusted checkout." },
];

const MARQUEE = [
  "MOVE WITH PURPOSE",
  "DROP 001",
  "LIMITED RUNS",
  "STAY INCLINED",
  "MADE FOR MOTION",
];

function Index() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const all = products ?? [];
  const featured = all.slice(0, 3);
  const bestSellers = all.slice(0, 8);

  return (
    <div className="flex flex-col">
      <Hero />

      <TrustBar />

      {/* Featured collection */}
      <section className="mx-auto w-full max-w-[1600px] px-5 py-32 sm:px-10 sm:py-48" id="shop">
        <Reveal className="mb-20 flex flex-col gap-8 sm:mb-32 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow">Drop 001</p>
            <h2 className="display-hd mt-6 text-[13vw] leading-[0.92] sm:text-7xl">
              Featured
              <br />
              <span className="font-serif-display font-light italic tracking-tight">Collection</span>
            </h2>
            <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
              Three pieces that define the season — cut from heavyweight cotton, finished by hand,
              produced in counted numbers.
            </p>
          </div>
          <Link
            to="/shop"
            className="link-underline self-start text-[10px] uppercase tracking-[0.3em] text-foreground/70 transition-colors hover:text-foreground"
          >
            View all {all.length} pieces
          </Link>
        </Reveal>
        <ProductGrid products={featured} columns={3} />
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-border py-6">
        <div className="animate-marquee flex w-max gap-14 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((word, i) => (
            <span
              key={i}
              className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground"
              aria-hidden={i > MARQUEE.length - 1}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Philosophy */}
      <section className="bg-card px-6 py-40 sm:py-60" id="about">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">The philosophy</p>
          <h2 className="display-hd mt-8 text-5xl sm:text-8xl">
            More Than
            <br />
            <span className="font-serif-display font-light italic">Clothing.</span>
          </h2>
          <div className="mx-auto mt-16 max-w-xl space-y-6 text-base leading-[1.9] text-muted-foreground sm:text-lg">
            <p>Motion isn't just movement.</p>
            <p>It's choosing discipline. It's choosing progress. It's choosing growth.</p>
            <p>
              Motion Inclined was built for individuals who understand that success belongs to those
              who keep moving.
            </p>
          </div>
          <Link
            to="/about"
            className="link-underline mt-14 inline-block text-[10px] uppercase tracking-[0.3em]"
          >
            Read our story
          </Link>
        </Reveal>
      </section>

      {/* Best sellers */}
      <section className="w-full py-32 sm:py-48">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
          <ProductRail
            products={bestSellers}
            eyebrow="Most wanted"
            title="Best Sellers"
            description="The pieces our community keeps coming back for."
          />
        </div>
      </section>

      {/* Why Motion Inclined */}
      <section className="border-t border-border px-5 py-32 sm:px-10 sm:py-48">
        <Reveal className="mx-auto mb-20 max-w-[1600px] sm:mb-32">
          <p className="eyebrow">The standard</p>
          <h2 className="display-hd mt-6 text-4xl sm:text-6xl">Why Motion Inclined</h2>
        </Reveal>
        <div className="mx-auto grid max-w-[1600px] gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-5">
          {REASONS.map((r, i) => (
            <Reveal key={r.title} delay={i * 80}>
              <span className="text-[10px] tabular-nums tracking-[0.3em] text-muted-foreground">
                0{i + 1}
              </span>
              <r.icon className="mt-6 h-5 w-5 text-foreground" strokeWidth={1.2} />
              <h3 className="mt-6 text-[11px] uppercase tracking-[0.28em]">{r.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{r.copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Lifestyle */}
      <section className="relative w-full overflow-hidden">
        <img
          src={lifestyle}
          alt="Close detail of Motion Inclined heavyweight cotton garment"
          loading="lazy"
          decoding="async"
          width={1600}
          height={1200}
          className="h-[80vh] min-h-[480px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/40" />
        <Reveal className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-[9px] uppercase tracking-[0.45em] text-background/70">Drop 001</p>
          <h2 className="display-hd mt-8 max-w-3xl text-5xl text-background sm:text-8xl">
            Wear your
            <br />
            <span className="font-serif-display font-light italic">ambition.</span>
          </h2>
          <p className="mt-8 text-sm tracking-wide text-background/85">
            Every stitch represents progress.
          </p>
          <Link
            to="/shop"
            className="mt-12 rounded-full bg-background px-10 py-4 text-[10px] uppercase tracking-[0.3em] text-foreground transition-all duration-500 hover:scale-[1.03]"
          >
            Shop the collection
          </Link>
        </Reveal>
      </section>

      <Newsletter />
      <InstagramGallery />
    </div>
  );
}
