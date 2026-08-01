import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Gem, Compass, Layers, Truck, ShieldCheck } from "lucide-react";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductCarousel } from "@/components/ProductCarousel";
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

function Index() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const all = products ?? [];
  const featured = all.slice(0, 3);
  const bestSellers = all.slice(0, 8);

  return (
    <div className="flex flex-col">
      <Hero />

      {/* Featured collection */}
      <section className="mx-auto w-full max-w-[1600px] px-5 py-28 sm:px-10 sm:py-40" id="shop">
        <Reveal className="mb-16 flex flex-col gap-6 sm:mb-24 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.45em] text-muted-foreground">Drop 001</p>
            <h2 className="display-hd mt-5 text-4xl sm:text-6xl">Featured Collection</h2>
          </div>
          <Link
            to="/shop"
            className="text-[10px] uppercase tracking-[0.3em] text-foreground/70 underline-offset-8 transition-opacity hover:opacity-50 hover:underline"
          >
            View all {all.length} pieces
          </Link>
        </Reveal>
        <ProductGrid products={featured} columns={3} />
      </section>

      {/* Philosophy */}
      <section className="border-y border-border bg-card px-6 py-32 sm:py-48" id="about">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="display-hd text-4xl sm:text-7xl">More Than Clothing.</h2>
          <div className="mx-auto mt-14 max-w-xl space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>Motion isn't just movement.</p>
            <p>It's choosing discipline. It's choosing progress. It's choosing growth.</p>
            <p>
              Motion Inclined was built for individuals who understand that success belongs to those
              who keep moving.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Best sellers */}
      <section className="w-full py-28 sm:py-40">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
          <Reveal className="mb-4">
            <p className="text-[9px] uppercase tracking-[0.45em] text-muted-foreground">Most wanted</p>
            <h2 className="display-hd mt-5 text-4xl sm:text-6xl">Best Sellers</h2>
          </Reveal>
          <ProductCarousel products={bestSellers} />
        </div>
      </section>

      {/* Why Motion Inclined */}
      <section className="border-t border-border px-5 py-28 sm:px-10 sm:py-40">
        <Reveal className="mx-auto mb-16 max-w-[1600px] sm:mb-24">
          <h2 className="display-hd text-4xl sm:text-6xl">Why Motion Inclined</h2>
        </Reveal>
        <div className="mx-auto grid max-w-[1600px] gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-5">
          {REASONS.map((r, i) => (
            <Reveal key={r.title} delay={i * 80}>
              <r.icon className="h-5 w-5 text-foreground" strokeWidth={1.2} />
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
          width={1600}
          height={1200}
          className="h-[70vh] min-h-[440px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/35" />
        <Reveal className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h2 className="display-hd max-w-3xl text-4xl text-background sm:text-7xl">
            Wear your ambition.
          </h2>
          <p className="mt-6 text-sm tracking-wide text-background/85">
            Every stitch represents progress.
          </p>
          <Link
            to="/shop"
            className="mt-10 rounded-full border border-background/70 px-8 py-4 text-[10px] uppercase tracking-[0.3em] text-background transition-all duration-500 hover:bg-background hover:text-foreground"
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
