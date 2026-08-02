import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Loader2, Star, Truck, RotateCcw, ShieldCheck, Plus, X } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { useCartStore } from "@/stores/cartStore";
import { fetchProductByHandle, fetchProducts, formatPrice } from "@/lib/shopify";

type Product = NonNullable<Awaited<ReturnType<typeof fetchProductByHandle>>>;

const productQueryOptions = (handle: string) => ({
  queryKey: ["product", handle],
  queryFn: () => fetchProductByHandle(handle),
});

export const Route = createFileRoute("/product/$handle")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productQueryOptions(params.handle));
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable — Motion Inclined" }, { name: "robots", content: "noindex" }] };
    }
    const desc = (loaderData.description || "Premium streetwear by Motion Inclined.").slice(0, 158);
    const image = loaderData.images.edges[0]?.node.url;
    return {
      meta: [
        { title: `${loaderData.title} — Motion Inclined` },
        { name: "description", content: desc },
        { property: "og:title", content: `${loaderData.title} — Motion Inclined` },
        { property: "og:description", content: desc },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: loaderData.title,
            description: desc,
            image: image ? [image] : undefined,
            brand: { "@type": "Brand", name: "Motion Inclined" },
            offers: {
              "@type": "Offer",
              priceCurrency: "NGN",
              price: loaderData.priceRange.minVariantPrice.amount,
              availability: "https://schema.org/InStock",
            },
          }),
        },
      ],
    };
  },
  component: ProductPage,
});

const SIZE_GUIDE = [
  ["S", "46", "68", "58"],
  ["M", "51", "71", "61"],
  ["L", "56", "74", "64"],
  ["XL", "61", "77", "66"],
];

const REVIEWS = [
  { name: "Tobi A.", text: "The weight of this fabric is unreal. Feels like a designer piece at a fair price.", stars: 5 },
  { name: "Amara N.", text: "Fit is perfect and the print hasn't faded after several washes.", stars: 5 },
  { name: "Kelechi O.", text: "Shipped fast and the packaging alone felt premium. Ordering again.", stars: 4 },
];

function useRecentlyViewed(handle: string) {
  const [handles, setHandles] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("mi-recently-viewed");
      const list: string[] = raw ? JSON.parse(raw) : [];
      setHandles(list.filter((h) => h !== handle));
      const next = [handle, ...list.filter((h) => h !== handle)].slice(0, 8);
      window.localStorage.setItem("mi-recently-viewed", JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, [handle]);
  return handles;
}

function ProductPage() {
  const initialProduct = Route.useLoaderData() as Product;
  const { data: untypedProduct } = useSuspenseQuery({
    ...productQueryOptions(initialProduct.handle),
    initialData: initialProduct,
  });
  const product = untypedProduct as Product;

  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const images = product.images.edges.map((e) => e.node);
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("Description");
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    product.options.forEach((o) => (defaults[o.name] = o.values[0]));
    return defaults;
  });

  useEffect(() => {
    setActiveImage(0);
    const defaults: Record<string, string> = {};
    product.options.forEach((o) => (defaults[o.name] = o.values[0]));
    setSelectedOptions(defaults);
  }, [product.handle, product.options]);

  useEffect(() => {
    const node = ctaRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting), {
      rootMargin: "0px 0px -80px 0px",
    });
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const selectedVariant = product.variants.edges.find((edge) =>
    edge.node.selectedOptions.every((o) => selectedOptions[o.name] === o.value),
  )?.node;

  const { data: allProducts } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts(50) });
  const recentHandles = useRecentlyViewed(product.handle);

  const related = useMemo(
    () => (allProducts ?? []).filter((p) => p.node.handle !== product.handle).slice(0, 3),
    [allProducts, product.handle],
  );
  const recent = useMemo(
    () =>
      (allProducts ?? []).filter(
        (p) => recentHandles.includes(p.node.handle) && p.node.handle !== product.handle,
      ),
    [allProducts, recentHandles, product.handle],
  );

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions,
    });
  };

  const sections = [
    { label: "Description", body: product.description || "A considered Motion Inclined essential." },
    {
      label: "Materials",
      body: "Heavyweight combed cotton jersey with reinforced shoulder seams and a ribbed collar built to hold its shape.",
    },
    {
      label: "Fit",
      body: "Relaxed, boxy shoulder with a straight body. Model is 6'1\" wearing size L. Prefer a closer fit? Size down one.",
    },
    {
      label: "Care Instructions",
      body: "Cold machine wash inside out with like colours. Do not bleach. Hang dry away from direct sunlight. Iron on the reverse of any print.",
    },
    {
      label: "Shipping & Returns",
      body: "Dispatched within 48 hours. Free shipping over ₦100,000. 14-day returns on unworn pieces with tags attached.",
    },
  ];

  const price = selectedVariant?.price.amount ?? product.priceRange.minVariantPrice.amount;

  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full max-w-[1600px] px-5 pt-10 sm:px-10">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-opacity hover:opacity-60"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.4} />
          Collection
        </Link>
      </div>

      <section className="mx-auto grid w-full max-w-[1600px] gap-12 px-5 py-10 sm:px-10 lg:grid-cols-[1.15fr_1fr] lg:gap-24 lg:py-16">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
            }}
            onMouseLeave={() => setZoom(null)}
          >
            {images[activeImage] ? (
              <img
                src={images[activeImage].url}
                alt={images[activeImage].altText || `${product.title} — view ${activeImage + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 ease-out"
                style={
                  zoom
                    ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                    : undefined
                }
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                No image
              </div>
            )}
            <span className="pointer-events-none absolute bottom-4 right-5 text-[9px] uppercase tracking-[0.3em] text-foreground/40">
              Hover to zoom
            </span>
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`aspect-square overflow-hidden rounded-xl bg-muted transition-all duration-300 ${
                    i === activeImage ? "ring-1 ring-foreground" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col lg:sticky lg:top-32 lg:self-start">
          <p className="text-[9px] uppercase tracking-[0.45em] text-muted-foreground">
            Motion Inclined
          </p>
          <h1 className="display-hd mt-5 text-3xl sm:text-5xl">{product.title}</h1>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-3 w-3 fill-foreground text-foreground" strokeWidth={0} />
              ))}
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {REVIEWS.length} reviews
            </span>
          </div>
          <p className="mt-6 text-lg tracking-tight">{formatPrice(price)}</p>

          <div className="mt-10 space-y-7">
            {product.options.map((option) => (
              <div key={option.name}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                    {option.name}
                  </span>
                  {option.name.toLowerCase() === "size" && (
                    <button
                      onClick={() => setGuideOpen(true)}
                      className="text-[9px] uppercase tracking-[0.2em] underline-offset-4 hover:underline"
                    >
                      Size guide
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => (
                    <button
                      key={value}
                      onClick={() =>
                        setSelectedOptions((prev) => ({ ...prev, [option.name]: value }))
                      }
                      className={`rounded-full border px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
                        selectedOptions[option.name] === value
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div ref={ctaRef} className="mt-10">
            <button
              onClick={handleAddToCart}
              disabled={isLoading || selectedVariant?.availableForSale === false}
              className="w-full rounded-full bg-foreground py-4 text-[10px] uppercase tracking-[0.3em] text-background transition-all duration-300 hover:opacity-85 disabled:opacity-40"
            >
              {isLoading ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : selectedVariant?.availableForSale === false ? (
                "Sold out"
              ) : (
                "Add to cart"
              )}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 border-y border-border py-6">
            {[
              { icon: Truck, label: "Free over ₦100k" },
              { icon: RotateCcw, label: "14-day returns" },
              { icon: ShieldCheck, label: "Secure checkout" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-2 text-center">
                <b.icon className="h-4 w-4 text-foreground" strokeWidth={1.2} />
                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  {b.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            {sections.map((s) => (
              <div key={s.label} className="border-b border-border">
                <button
                  onClick={() => setOpenSection(openSection === s.label ? null : s.label)}
                  className="flex w-full items-center justify-between py-5 text-left"
                  aria-expanded={openSection === s.label}
                >
                  <span className="text-[10px] uppercase tracking-[0.28em]">{s.label}</span>
                  <Plus
                    className={`h-3.5 w-3.5 transition-transform duration-500 ${
                      openSection === s.label ? "rotate-45" : ""
                    }`}
                    strokeWidth={1.3}
                  />
                </button>
                <div
                  className={`grid transition-all duration-500 ease-out ${
                    openSection === s.label ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <p className="overflow-hidden text-sm leading-loose text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product story */}
      <section className="border-y border-border bg-card px-6 py-24 sm:py-36">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[9px] uppercase tracking-[0.45em] text-muted-foreground">The story</p>
          <h2 className="display-hd mt-6 text-3xl sm:text-5xl">Made to keep moving.</h2>
          <p className="mt-8 text-sm leading-loose text-muted-foreground">
            {product.title} was developed in a limited run for people who treat progress as a daily
            practice. Heavyweight fabric, quiet detailing, and a graphic that means something long
            after the season ends.
          </p>
        </Reveal>
      </section>

      {/* Reviews */}
      <section className="mx-auto w-full max-w-[1600px] px-5 py-24 sm:px-10 sm:py-36">
        <Reveal className="mb-14">
          <p className="eyebrow">Community</p>
          <h2 className="display-hd mt-6 text-3xl sm:text-5xl">Customer Reviews</h2>
        </Reveal>
        <Reveal className="rounded-3xl border border-dashed border-border px-8 py-16 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em]">No reviews yet</p>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Own this piece? Share your experience with us on WhatsApp and we'll publish it here.
          </p>
          <a
            href="https://wa.me/2347043602465"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full border border-foreground px-8 py-3.5 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 hover:bg-foreground hover:text-background"
          >
            Leave a review
          </a>
        </Reveal>
      </section>


      {related.length > 0 && (
        <section className="mx-auto w-full max-w-[1600px] border-t border-border px-5 py-24 sm:px-10 sm:py-36">
          <Reveal className="mb-14">
            <h2 className="display-hd text-3xl sm:text-5xl">You may also like</h2>
          </Reveal>
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-3">
            {related.map((p, i) => (
              <ProductCard key={p.node.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mx-auto w-full max-w-[1600px] border-t border-border px-5 py-24 sm:px-10 sm:py-36">
          <Reveal className="mb-14">
            <h2 className="display-hd text-3xl sm:text-5xl">Recently viewed</h2>
          </Reveal>
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-3 lg:grid-cols-4">
            {recent.slice(0, 4).map((p, i) => (
              <ProductCard key={p.node.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky add to cart */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl transition-all duration-500 ${
          showSticky ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-3.5 sm:px-10">
          <div className="min-w-0">
            <p className="truncate text-[11px] uppercase tracking-[0.2em]">{product.title}</p>
            <p className="text-[11px] text-muted-foreground">{formatPrice(price)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isLoading || selectedVariant?.availableForSale === false}
            className="shrink-0 rounded-full bg-foreground px-8 py-3 text-[10px] uppercase tracking-[0.3em] text-background transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add to cart"}
          </button>
        </div>
      </div>

      {/* Size guide */}
      {guideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-6 backdrop-blur-sm"
          onClick={() => setGuideOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-background p-8 sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-[11px] uppercase tracking-[0.3em]">Size Guide</h3>
              <button aria-label="Close size guide" onClick={() => setGuideOpen(false)}>
                <X className="h-4 w-4" strokeWidth={1.4} />
              </button>
            </div>
            <table className="mt-8 w-full text-left text-sm">
              <thead>
                <tr className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                  <th className="pb-3">Size</th>
                  <th className="pb-3">Chest (cm)</th>
                  <th className="pb-3">Length (cm)</th>
                  <th className="pb-3">Sleeve (cm)</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {SIZE_GUIDE.map((row) => (
                  <tr key={row[0]} className="border-t border-border">
                    <td className="py-3 text-foreground">{row[0]}</td>
                    <td className="py-3">{row[1]}</td>
                    <td className="py-3">{row[2]}</td>
                    <td className="py-3">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Measurements are taken flat and may vary by up to 2cm. For a closer fit, size down.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
