import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { Reveal } from "@/components/Reveal";
import { Newsletter } from "@/components/Newsletter";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";

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
      { title: "Shop All — Motion Inclined" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Shop All — Motion Inclined" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: ShopPage,
});

type SortKey = "featured" | "price-asc" | "price-desc" | "title";

function priceOf(p: ShopifyProduct) {
  return parseFloat(p.node.priceRange.minVariantPrice.amount || "0");
}

function ShopPage() {
  const { data } = useSuspenseQuery(productsQueryOptions);
  const products = useMemo(() => data ?? [], [data]);
  const [sort, setSort] = useState<SortKey>("featured");
  const [size, setSize] = useState<string>("all");

  const sizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) =>
      p.node.options
        .filter((o) => o.name.toLowerCase() === "size")
        .forEach((o) => o.values.forEach((v) => set.add(v))),
    );
    return Array.from(set);
  }, [products]);

  const visible = useMemo(() => {
    let list = [...products];
    if (size !== "all") {
      list = list.filter((p) =>
        p.node.options.some(
          (o) => o.name.toLowerCase() === "size" && o.values.includes(size),
        ),
      );
    }
    if (sort === "price-asc") list.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "price-desc") list.sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === "title") list.sort((a, b) => a.node.title.localeCompare(b.node.title));
    return list;
  }, [products, sort, size]);

  return (
    <div className="flex flex-col">
      <section className="mx-auto w-full max-w-[1600px] px-5 pt-20 sm:px-10 sm:pt-32">
        <Reveal>
          <p className="text-[9px] uppercase tracking-[0.45em] text-muted-foreground">
            Collection 01 — Drop 001
          </p>
          <h1 className="display-hd mt-6 text-5xl sm:text-8xl">The Collection</h1>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">
            Limited runs, built to outlast the season. Every piece is made for people in motion.
          </p>
        </Reveal>

        <div className="mt-16 flex flex-col gap-5 border-y border-border py-5 sm:mt-24 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
              Size
            </span>
            {["all", ...sizes].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
                  size === s
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground"
                }`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label
              htmlFor="sort"
              className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground"
            >
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full border border-border bg-background px-4 py-2 text-[10px] uppercase tracking-[0.2em] outline-none transition-colors focus:border-foreground"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title">A — Z</option>
            </select>
          </div>
        </div>

        <p className="mt-6 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
          {visible.length} piece{visible.length === 1 ? "" : "s"}
        </p>
      </section>

      <section className="mx-auto w-full max-w-[1600px] px-5 py-16 sm:px-10 sm:py-24">
        <ProductGrid products={visible} columns={3} />
      </section>

      <Newsletter />
    </div>
  );
}
