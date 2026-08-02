import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ProductRail } from "@/components/ProductRail";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { Reveal } from "@/components/Reveal";
import { Newsletter } from "@/components/Newsletter";
import { ShopFilters, applyFilters, type FilterState, type SortKey } from "@/components/ShopFilters";
import { fetchProducts } from "@/lib/shopify";
import { isNewProduct } from "@/lib/product";
import { useRecentlyViewedStore } from "@/stores/recentlyViewedStore";
import banner from "@/assets/lifestyle-editorial.jpg";

const productsQueryOptions = {
  queryKey: ["products"],
  queryFn: () => fetchProducts(50),
};

const DESCRIPTION =
  "Browse the full Motion Inclined collection — Drop 001 tees, outerwear and accessories. Limited runs, premium materials, designed with purpose.";

export const Route = createFileRoute("/shop")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(productsQueryOptions);
  },
  head: () => ({
    meta: [
      { title: "Shop Drop 001 — Motion Inclined" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Shop Drop 001 — Motion Inclined" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

const PAGE_SIZE = 6;

const DEFAULT_FILTERS: FilterState = {
  size: "all",
  color: "all",
  availability: "all",
  maxPrice: null,
};

function ShopPage() {
  const { data } = useSuspenseQuery(productsQueryOptions);
  const products = useMemo(() => data ?? [], [data]);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("featured");
  const [drawer, setDrawer] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const recentHandles = useRecentlyViewedStore((s) => s.handles);

  const sizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) =>
      p.node.options
        .filter((o) => o.name.toLowerCase() === "size")
        .forEach((o) => o.values.forEach((v) => set.add(v))),
    );
    return Array.from(set);
  }, [products]);

  const colors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) =>
      p.node.options
        .filter((o) => o.name.toLowerCase() === "color")
        .forEach((o) => o.values.forEach((v) => set.add(v))),
    );
    return Array.from(set);
  }, [products]);

  const visible = useMemo(() => applyFilters(products, filters, sort), [products, filters, sort]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, sort]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleCount((c) => {
          if (c >= visible.length) return c;
          setLoadingMore(true);
          window.setTimeout(() => setLoadingMore(false), 450);
          return c + PAGE_SIZE;
        });
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible.length]);

  const shown = visible.slice(0, visibleCount);
  const hasMore = visibleCount < visible.length;

  const recentlyViewed = useMemo(
    () =>
      recentHandles
        .map((h) => products.find((p) => p.node.handle === h))
        .filter((p): p is NonNullable<typeof p> => !!p),
    [recentHandles, products],
  );

  const recentlyAdded = useMemo(
    () =>
      [...products]
        .sort((a, b) => Date.parse(b.node.createdAt || "0") - Date.parse(a.node.createdAt || "0"))
        .slice(0, 6),
    [products],
  );

  const recommended = useMemo(() => {
    const seen = new Set(recentHandles);
    const rest = products.filter((p) => !seen.has(p.node.handle));
    return (rest.length ? rest : products).slice(0, 6);
  }, [products, recentHandles]);

  const newCount = products.filter(isNewProduct).length;

  return (
    <div className="flex flex-col">
      {/* Collection banner */}
      <section className="relative w-full overflow-hidden bg-muted">
        <img
          src={banner}
          alt="Motion Inclined Drop 001 collection — heavyweight cotton detail"
          width={1600}
          height={1200}
          className="h-[46vh] min-h-[320px] w-full object-cover sm:h-[62vh]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/25 to-transparent" />
        <div className="absolute inset-0 mx-auto flex w-full max-w-[1600px] flex-col justify-end px-5 pb-12 sm:px-10 sm:pb-20">
          <p className="animate-fade-up text-[9px] uppercase tracking-[0.45em] text-background/80">
            Collection 01 — Drop 001
          </p>
          <h1
            className="animate-fade-up display-hd mt-5 max-w-3xl text-[13vw] text-background sm:text-7xl"
            style={{ animationDelay: "140ms" }}
          >
            The Collection
          </h1>
          <p
            className="animate-fade-up mt-6 max-w-md text-sm leading-relaxed text-background/80"
            style={{ animationDelay: "280ms" }}
          >
            Limited runs built to outlast the season. {products.length} pieces
            {newCount > 0 ? ` · ${newCount} new` : ""}.
          </p>
        </div>
      </section>

      {/* Sticky sort bar */}
      <div className="sticky top-[calc(4rem+34px)] z-30 border-b border-border bg-background/90 backdrop-blur-xl sm:top-[calc(5rem+38px)]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 sm:px-10">
          <button
            onClick={() => setDrawer(true)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] lg:invisible"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.3} /> Filter
          </button>
          <p className="hidden text-[10px] uppercase tracking-[0.3em] text-muted-foreground lg:block">
            {visible.length} piece{visible.length === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-3">
            <label htmlFor="sort" className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full border border-border bg-background px-4 py-2 text-[10px] uppercase tracking-[0.2em] outline-none transition-colors focus:border-foreground"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title">A — Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid + sidebar */}
      <section className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-10 sm:py-28">
        <div className="flex gap-16">
          <aside className="hidden w-64 flex-none lg:block">
            <div className="sticky top-56">
              <ShopFilters
                sizes={sizes}
                colors={colors}
                state={filters}
                onChange={setFilters}
                onReset={() => setFilters(DEFAULT_FILTERS)}
                resultCount={visible.length}
              />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {shown.length === 0 ? (
              <div className="mx-auto max-w-xl border border-dashed border-border px-6 py-24 text-center">
                <h2 className="text-[11px] uppercase tracking-[0.3em]">Nothing matches</h2>
                <p className="mt-4 text-sm text-muted-foreground">
                  Try clearing a filter to see the full collection.
                </p>
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="mt-8 rounded-full bg-foreground px-8 py-3.5 text-[10px] uppercase tracking-[0.3em] text-background"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-8 gap-y-20 sm:grid-cols-2 sm:gap-y-28 xl:grid-cols-3">
                {shown.map((product, i) => (
                  <Reveal key={product.node.id} delay={(i % 3) * 90}>
                    <ProductCard product={product} index={i} priority={i < 3} />
                  </Reveal>
                ))}
                {loadingMore &&
                  Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={`s${i}`} />)}
              </div>
            )}

            <div ref={sentinel} className="h-px w-full" aria-hidden="true" />

            {hasMore && (
              <div className="mt-24 flex flex-col items-center gap-6">
                <div className="rule-line w-full" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Showing {shown.length} of {visible.length}
                </p>
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="rounded-full border border-foreground px-10 py-4 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 hover:bg-foreground hover:text-background"
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {(recentlyViewed.length > 0 || recommended.length > 0) && (
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-28 px-5 pb-28 sm:px-10 sm:gap-40 sm:pb-40">
          <ProductRail
            products={recentlyAdded}
            eyebrow="Just landed"
            title="Recently Added"
            description="The newest pieces to enter the Motion Inclined line."
          />
          {recentlyViewed.length > 0 && (
            <ProductRail products={recentlyViewed} eyebrow="Your edit" title="Recently Viewed" />
          )}
          <ProductRail
            products={recommended}
            eyebrow="Styled for you"
            title="Recommended"
            description="Pieces that complete the look."
          />
        </div>
      )}

      <Newsletter />

      {/* Mobile filter drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="animate-fade-up absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-background">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <span className="text-[10px] uppercase tracking-[0.35em]">Filter</span>
              <button aria-label="Close filters" onClick={() => setDrawer(false)}>
                <X className="h-4 w-4" strokeWidth={1.3} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-10">
              <ShopFilters
                sizes={sizes}
                colors={colors}
                state={filters}
                onChange={setFilters}
                onReset={() => setFilters(DEFAULT_FILTERS)}
                resultCount={visible.length}
              />
            </div>
            <div className="border-t border-border p-6">
              <button
                onClick={() => setDrawer(false)}
                className="w-full rounded-full bg-foreground py-4 text-[10px] uppercase tracking-[0.3em] text-background"
              >
                Show {visible.length} piece{visible.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sr-only">
        <Link to="/">Home</Link>
      </div>
    </div>
  );
}
