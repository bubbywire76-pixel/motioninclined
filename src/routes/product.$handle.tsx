import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Truck,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
  X,
  Maximize2,
  Heart,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { PaymentIcons } from "@/components/PaymentIcons";
import { useCartStore } from "@/stores/cartStore";
import { fetchProductByHandle, fetchProducts, formatPrice } from "@/lib/shopify";
import { useRecentlyViewedStore } from "@/stores/recentlyViewedStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { DenimLaunchPage } from "@/components/DenimLaunchPage";
import { DENIM_HANDLE } from "@/lib/denim-launch";
import { isComingSoon } from "@/lib/product";

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
      return {
        meta: [{ title: "Unavailable — Motion Inclined" }, { name: "robots", content: "noindex" }],
      };
    }
    const desc = (loaderData.description || "Premium streetwear by Motion Inclined.").slice(0, 158);
    const image = loaderData.images.edges[0]?.node.url;
    return {
      meta: [
        { title: `${loaderData.title} — Motion Inclined` },
        { name: "description", content: desc },
        { property: "og:title", content: `${loaderData.title} — Motion Inclined` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image?.startsWith("https://")
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
              availability: isComingSoon({ node: loaderData }) ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
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

const SPECS: [string, string][] = [
  ["Fabric weight", "240 GSM heavyweight jersey"],
  ["Composition", "100% combed ring-spun cotton"],
  ["Construction", "Double-needle stitched hems, taped shoulders"],
  ["Collar", "1x1 ribbed, retention-treated"],
  ["Print", "Water-based screen print, hand-cured"],
  ["Origin", "Designed in Lagos · Ethically produced"],
];

const FAQ = [
  {
    q: "How does this piece fit?",
    a: "True to size with a relaxed, boxy shoulder. If you prefer a closer silhouette, take one size down.",
  },
  {
    q: "When will my order arrive?",
    a: "Orders are dispatched within 48 hours. Lagos delivers in 1–3 working days, nationwide in 3–6 working days.",
  },
  {
    q: "Can I exchange for another size?",
    a: "Yes — within 14 days, unworn and with tags attached. Message us on WhatsApp and we'll arrange it.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "All major cards, Verve, and bank transfer through our secure Paystack-backed checkout.",
  },
  {
    q: "Will this piece restock?",
    a: "Chapter 37 is a limited run. Once a size sells out it rarely returns — join the newsletter for restock alerts.",
  },
];

function deliveryWindow() {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
  const from = new Date();
  from.setDate(from.getDate() + 3);
  const to = new Date();
  to.setDate(to.getDate() + 6);
  return `${fmt(from)} – ${fmt(to)}`;
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
  const getCheckoutUrl = useCartStore((s) => s.getCheckoutUrl);
  const snapshotPendingOrder = useCartStore((s) => s.snapshotPendingOrder);
  const markCheckoutOpened = useCartStore((s) => s.markCheckoutOpened);
  const wishlisted = useWishlistStore((s) => s.handles.includes(product.handle));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const images = product.images.edges.map((e) => e.node);
  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("Description");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const eta = useMemo(deliveryWindow, []);
  const isInMotionTee = product.title.toLowerCase() === "in motion tee";

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
    setQuantity(1);
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

  const step = useCallback(
    (dir: 1 | -1) =>
      setLightbox((i) => (i === null ? i : (i + dir + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, step]);

  const selectedVariant = product.variants.edges.find((edge) =>
    edge.node.selectedOptions.every((o) => selectedOptions[o.name] === o.value),
  )?.node;

  const { data: allProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(50),
  });

  const recentHandles = useRecentlyViewedStore((s) => s.handles);
  const pushRecent = useRecentlyViewedStore((s) => s.push);
  useEffect(() => {
    pushRecent(product.handle);
  }, [product.handle, pushRecent]);

  const related = useMemo(
    () => (allProducts ?? []).filter((p) => p.node.handle !== product.handle).slice(0, 4),
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
      quantity,
      selectedOptions: selectedVariant.selectedOptions,
    });
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || soldOut) return;
    const checkoutWindow = window.open("", "_blank", "noopener,noreferrer");
    await handleAddToCart();
    const checkoutUrl = getCheckoutUrl();
    if (!checkoutUrl) {
      checkoutWindow?.close();
      return;
    }
    snapshotPendingOrder();
    markCheckoutOpened();
    if (checkoutWindow) {
      checkoutWindow.location.href = checkoutUrl;
    } else {
      window.open(checkoutUrl, "_blank");
    }
  };

  const sections = [
    {
      label: "Description",
      body: product.description || "A considered Motion Inclined essential, cut for everyday motion.",
    },
    {
      label: "Material Composition",
      body: isInMotionTee
        ? "Premium heavyweight cotton in a warm off-white ivory. Relaxed oversized silhouette with a clean crew neckline, structured sleeves and refined glass-diamond stone application."
        : "240 GSM combed ring-spun cotton jersey. Reinforced shoulder taping, 1x1 ribbed collar with retention treatment, double-needle stitched hems.",
    },
    {
      label: "Care Instructions",
      body: isInMotionTee
        ? "Cold machine wash inside out with like colours. Do not bleach. Hang dry away from direct sunlight. Iron on the reverse of the stone application."
        : "Cold machine wash inside out with like colours. Do not bleach. Hang dry away from direct sunlight. Iron on the reverse of any print.",
    },
    {
      label: "Shipping",
      body: `Available now. Dispatched within 48 hours from Lagos. Free nationwide shipping over ₦100,000. Estimated delivery ${eta}.`,
    },
    {
      label: "Returns",
      body: "14-day returns and exchanges on unworn pieces with tags attached. Message us on WhatsApp and we'll arrange the pickup.",
    },
  ];

  const price = selectedVariant?.price.amount ?? product.priceRange.minVariantPrice.amount;
  const comingSoon = ((product as { tags?: string[] }).tags || []).some((t) =>
    t.toLowerCase().replace(/-/g, " ").includes("coming soon"),
  );
  const soldOut = selectedVariant?.availableForSale === false;

  if (product.handle === DENIM_HANDLE) return <DenimLaunchPage product={product} />;

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

      <section className="mx-auto grid w-full max-w-[1600px] gap-14 px-5 py-10 sm:px-10 lg:grid-cols-[1.25fr_1fr] lg:gap-28 lg:py-16">
        {/* Massive gallery */}
        <div>
          {/* Mobile carousel */}
          <div className="lg:hidden">
            <div
              ref={railRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                setActiveImage(Math.round(el.scrollLeft / el.clientWidth));
              }}
              className="hide-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-[26px]"
            >
              {images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setLightbox(i)}
                  className="w-full flex-none snap-center"
                  aria-label={`Open image ${i + 1} full screen`}
                >
                  <img
                    src={img.url}
                    alt={img.altText || `${product.title} — view ${i + 1}`}
                    className="aspect-[4/5] w-full object-cover"
                  />
                </button>
              ))}
            </div>
            {images.length > 1 && (
              <div className="mt-5 flex justify-center gap-2">
                {images.map((img, i) => (
                  <span
                    key={img.url}
                    className={`h-[3px] w-8 rounded-full transition-colors duration-500 ${
                      i === activeImage ? "bg-foreground" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop stacked editorial gallery with hover zoom */}
          <div className="hidden gap-5 lg:grid">
            {images.map((img, i) => (
              <ZoomImage
                key={img.url}
                src={img.url}
                alt={img.altText || `${product.title} — view ${i + 1}`}
                onOpen={() => setLightbox(i)}
                priority={i === 0}
              />
            ))}
            {images.length === 0 && (
              <div className="flex aspect-[4/5] items-center justify-center rounded-[26px] bg-muted text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                No image
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">Motion Inclined</p>
          <h1 className="display-hd mt-6 text-4xl sm:text-6xl">{product.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>{isInMotionTee ? "Drop 001" : "Chapter 37"}</span>
            <span aria-hidden="true">·</span>
            <span>Limited quantity</span>
            <span aria-hidden="true">·</span>
            <span>Free shipping over ₦100,000</span>
          </div>

          <p className="mt-8 text-xl tracking-tight">{formatPrice(price)}</p>
          {isInMotionTee && (
            <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Luxury in motion.
            </p>
          )}
          <p className="mt-3 inline-flex items-center gap-2 text-[11px] text-muted-foreground">
            <Truck className="h-3.5 w-3.5" strokeWidth={1.3} />
            Estimated delivery {eta}
          </p>

          <div className="mt-10 space-y-8">
            {product.options.map((option) => (
              <div key={option.name}>
                <div className="mb-3.5 flex items-center justify-between">
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
                <div className="flex flex-wrap gap-2.5">
                  {option.values.map((value) => (
                    <button
                      key={value}
                      onClick={() =>
                        setSelectedOptions((prev) => ({ ...prev, [option.name]: value }))
                      }
                      className={`rounded-full border px-6 py-3 text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${
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

          <div className="mt-10 flex items-center justify-between border-y border-border py-4">
            <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Quantity</span>
            <div className="flex items-center gap-4 rounded-full border border-border px-3 py-2">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity === 1}
                aria-label="Decrease quantity"
                className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <Minus className="h-3 w-3" strokeWidth={1.4} />
              </button>
              <span className="w-5 text-center text-[11px] tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(10, value + 1))}
                disabled={quantity === 10}
                aria-label="Increase quantity"
                className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <Plus className="h-3 w-3" strokeWidth={1.4} />
              </button>
            </div>
          </div>

          <div ref={ctaRef} className="mt-12 flex items-center gap-3">
            {comingSoon ? (
              <div className="flex flex-1 items-center justify-center rounded-full border border-border py-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Coming soon
              </div>
            ) : (
              <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                <button
                  onClick={handleAddToCart}
                  disabled={isLoading || soldOut}
                  className="flex-1 rounded-full border border-foreground py-4 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 hover:bg-foreground hover:text-background disabled:opacity-40"
                >
                  {isLoading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : soldOut ? "Sold out" : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isLoading || soldOut}
                  className="flex-1 rounded-full bg-foreground py-4 text-[10px] uppercase tracking-[0.3em] text-background transition-all duration-500 hover:opacity-85 disabled:opacity-40"
                >
                  Buy Now
                </button>
              </div>
            )}
            <button
              onClick={() => toggleWishlist(product.handle)}
              aria-label="Save to wishlist"
              aria-pressed={wishlisted}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-border transition-colors duration-500 hover:border-foreground"
            >
              <Heart
                className={`h-4 w-4 ${wishlisted ? "fill-foreground" : ""}`}
                strokeWidth={1.3}
              />
            </button>
          </div>

          <div className="mt-9 grid grid-cols-3 gap-4 border-y border-border py-7">
            {[
              { icon: Truck, label: "Free over ₦100k" },
              { icon: RotateCcw, label: "14-day returns" },
              { icon: ShieldCheck, label: "Secure checkout" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-2.5 text-center">
                <b.icon className="h-4 w-4 text-foreground" strokeWidth={1.2} />
                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  {b.label}
                </span>
              </div>
            ))}
          </div>

          <PaymentIcons className="mt-7 justify-center" />

          <div className="mt-10">
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
                    openSection === s.label
                      ? "grid-rows-[1fr] pb-6 opacity-100"
                      : "grid-rows-[0fr] opacity-0"
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
      <section className="border-y border-border bg-card px-6 py-28 sm:py-40">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">The story</p>
          <h2 className="display-hd mt-7 text-4xl sm:text-6xl">
            Made to
            <span className="font-serif-display font-light italic"> keep moving.</span>
          </h2>
          <p className="mx-auto mt-10 max-w-xl text-sm leading-loose text-muted-foreground">
            {product.title} was developed in a limited run for people who treat progress as a daily
            practice. Heavyweight fabric, quiet detailing, and a graphic that still means something
            long after the season ends.
          </p>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-loose text-muted-foreground">
            Every piece is cut, printed and inspected in small batches — so what arrives feels
            considered rather than mass produced.
          </p>
        </Reveal>
      </section>

      {/* Specifications */}
      <section className="mx-auto w-full max-w-[1600px] px-5 py-28 sm:px-10 sm:py-40">
        <Reveal className="mb-14">
          <p className="eyebrow">Details</p>
          <h2 className="display-hd mt-6 text-3xl sm:text-5xl">Product specifications</h2>
        </Reveal>
        <Reveal className="grid gap-x-16 gap-y-0 sm:grid-cols-2">
          {SPECS.map(([k, v]) => (
            <div
              key={k}
              className="flex items-baseline justify-between gap-8 border-b border-border py-6"
            >
              <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
                {k}
              </span>
              <span className="text-right text-sm text-foreground/85">{v}</span>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Reviews */}
      <section className="mx-auto w-full max-w-[1600px] border-t border-border px-5 py-28 sm:px-10 sm:py-40">
        <Reveal className="mb-14">
          <p className="eyebrow">Community</p>
          <h2 className="display-hd mt-6 text-3xl sm:text-5xl">Customer reviews</h2>
        </Reveal>
        <Reveal className="rounded-[26px] border border-dashed border-border px-8 py-20 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em]">No reviews yet</p>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-loose text-muted-foreground">
            Own this piece? Share your experience with us on WhatsApp and we'll publish it here.
          </p>
          <a
            href="https://wa.me/2347043602465"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-block rounded-full border border-foreground px-9 py-3.5 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 hover:bg-foreground hover:text-background"
          >
            Leave a review
          </a>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-[1600px] border-t border-border px-5 py-28 sm:px-10 sm:py-40">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <Reveal>
            <p className="eyebrow">Questions</p>
            <h2 className="display-hd mt-6 text-3xl sm:text-5xl">Good to know.</h2>
          </Reveal>
          <Reveal>
            {FAQ.map((f) => (
              <div key={f.q} className="border-b border-border">
                <button
                  onClick={() => setOpenFaq(openFaq === f.q ? null : f.q)}
                  aria-expanded={openFaq === f.q}
                  className="flex w-full items-center justify-between gap-8 py-6 text-left"
                >
                  <span className="text-sm tracking-tight">{f.q}</span>
                  <Plus
                    className={`h-3.5 w-3.5 shrink-0 transition-transform duration-500 ${
                      openFaq === f.q ? "rotate-45" : ""
                    }`}
                    strokeWidth={1.3}
                  />
                </button>
                <div
                  className={`grid transition-all duration-500 ease-out ${
                    openFaq === f.q ? "grid-rows-[1fr] pb-7 opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <p className="overflow-hidden text-sm leading-loose text-muted-foreground">
                    {f.a}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto w-full max-w-[1600px] border-t border-border px-5 py-28 sm:px-10 sm:py-40">
          <Reveal className="mb-16">
            <p className="eyebrow">Styled with</p>
            <h2 className="display-hd mt-6 text-3xl sm:text-5xl">Recommended for you</h2>
          </Reveal>
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.node.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mx-auto w-full max-w-[1600px] border-t border-border px-5 py-28 sm:px-10 sm:py-40">
          <Reveal className="mb-16">
            <p className="eyebrow">Your history</p>
            <h2 className="display-hd mt-6 text-3xl sm:text-5xl">Recently viewed</h2>
          </Reveal>
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="flex min-w-0 items-center gap-4">
            {images[0] && (
              <img
                src={images[0].url}
                alt=""
                className="hidden h-12 w-10 rounded-lg object-cover sm:block"
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-[11px] uppercase tracking-[0.2em]">{product.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatPrice(price)}
                {selectedOptions["Size"] ? ` · ${selectedOptions["Size"]}` : ""}
              </p>
            </div>
          </div>
          {comingSoon ? (
            <span className="shrink-0 rounded-full border border-border px-9 py-3.5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Coming soon
            </span>
          ) : (
            <button
               onClick={handleAddToCart}
              disabled={isLoading || soldOut}
              className="shrink-0 rounded-full bg-foreground px-9 py-3.5 text-[10px] uppercase tracking-[0.3em] text-background transition-opacity hover:opacity-85 disabled:opacity-40"
            >
               {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add to Cart"}
            </button>
          )}
        </div>
      </div>

      {/* Full screen gallery */}
      {lightbox !== null && images[lightbox] && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-background">
          <div className="flex items-center justify-between px-5 py-5 sm:px-10">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {lightbox + 1} / {images.length}
            </span>
            <button aria-label="Close gallery" onClick={() => setLightbox(null)}>
              <X className="h-5 w-5" strokeWidth={1.3} />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-10">
            <img
              key={images[lightbox].url}
              src={images[lightbox].url}
              alt={images[lightbox].altText || product.title}
              className="animate-fade-up max-h-full max-w-full object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  aria-label="Previous image"
                  onClick={() => step(-1)}
                  className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur transition-colors hover:border-foreground sm:left-10"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.3} />
                </button>
                <button
                  aria-label="Next image"
                  onClick={() => step(1)}
                  className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur transition-colors hover:border-foreground sm:right-10"
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={1.3} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="hide-scrollbar flex justify-center gap-3 overflow-x-auto px-5 pb-8">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setLightbox(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`h-20 w-16 flex-none overflow-hidden rounded-lg transition-opacity duration-300 ${
                    i === lightbox ? "opacity-100 ring-1 ring-foreground" : "opacity-50"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Size guide */}
      {guideOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/40 p-6 backdrop-blur-sm"
          onClick={() => setGuideOpen(false)}
        >
          <div
            className="animate-fade-up w-full max-w-lg rounded-[26px] bg-background p-8 sm:p-10"
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
                    <td className="py-3.5 text-foreground">{row[0]}</td>
                    <td className="py-3.5">{row[1]}</td>
                    <td className="py-3.5">{row[2]}</td>
                    <td className="py-3.5">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-7 text-xs leading-relaxed text-muted-foreground">
              Measurements are taken flat and may vary by up to 2cm. For a relaxed fit, take your
              usual size; size down for a closer silhouette.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ZoomImage({
  src,
  alt,
  onOpen,
  priority,
}: {
  src: string;
  alt: string;
  onOpen: () => void;
  priority?: boolean;
}) {
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  return (
    <div
      className="group relative aspect-[4/5] overflow-hidden rounded-[26px] bg-muted"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setZoom({
          x: ((e.clientX - r.left) / r.width) * 100,
          y: ((e.clientY - r.top) / r.height) * 100,
        });
      }}
      onMouseLeave={() => setZoom(null)}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="h-full w-full object-cover transition-transform duration-700 ease-out"
        style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
      />
      <button
        onClick={onOpen}
        aria-label="Open full screen gallery"
        className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 opacity-0 backdrop-blur transition-all duration-500 group-hover:opacity-100"
      >
        <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.3} />
      </button>
      <span className="pointer-events-none absolute bottom-6 left-6 text-[9px] uppercase tracking-[0.3em] text-foreground/40 transition-opacity duration-500 group-hover:opacity-0">
        Hover to zoom
      </span>
    </div>
  );
}
