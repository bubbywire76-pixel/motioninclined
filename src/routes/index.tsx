import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { fetchProducts } from "@/lib/shopify";

const productsQueryOptions = {
  queryKey: ["products"],
  queryFn: () => fetchProducts(50),
};

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(productsQueryOptions);
  },
  head: () => ({
    meta: [
      { title: "Motion Inclined — Premium Streetwear" },
      { name: "description", content: "Shop the latest drops from Motion Inclined Limited-run streetwear, premium fabrics, and designs that speak for themselves." },
      { property: "og:title", content: "Motion Inclined — Premium Streetwear" },
      { property: "og:description", content: "Shop the latest drops from Motion Inclined Limited-run streetwear, premium fabrics, and designs that speak for themselves." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);

  return (
    <div className="flex flex-col">
      <Hero />
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-8" id="shop">
        <div className="mb-10 flex items-baseline justify-between px-1">
          <div>
            <p className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Drop 001</p>
            <h2 className="mt-2 text-[10px] font-semibold uppercase tracking-[0.4em]">
              Shop the Collection
            </h2>
          </div>
          <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            {products?.length ?? 0} pieces
          </span>
        </div>
        <ProductGrid products={products || []} />
      </section>
      <section className="border-t border-border/60 bg-card px-6 py-32 text-center" id="about">
        <div className="mx-auto max-w-md">
          <h4 className="mb-10 text-[9px] uppercase tracking-[0.5em] text-muted-foreground">
            The Philosophy
          </h4>
          <p className="font-serif-display text-xl font-light italic leading-relaxed text-foreground/80 sm:text-2xl">
            “The beauty of movement lies in its restraint. We design for the quiet space between performance and leisure.”
          </p>
          <div className="mx-auto mt-12 h-px w-8 bg-foreground/20" />
          <p className="mt-12 text-[10px] uppercase leading-loose tracking-[0.25em] text-muted-foreground">
            Architecture for the body.
            <br />
            Refinement for the soul.
          </p>
        </div>
      </section>
    </div>
  );
}
