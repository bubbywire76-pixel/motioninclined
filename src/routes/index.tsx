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
      { title: "Merch Co. — Premium Streetwear" },
      { name: "description", content: "Shop the latest drops from Merch Co. Limited-run streetwear, premium fabrics, and designs that speak for themselves." },
      { property: "og:title", content: "Merch Co. — Premium Streetwear" },
      { property: "og:description", content: "Shop the latest drops from Merch Co. Limited-run streetwear, premium fabrics, and designs that speak for themselves." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);

  return (
    <div className="flex flex-col">
      <Hero />
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24" id="shop">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Latest drops</h2>
            <p className="mt-2 text-muted-foreground">Fresh merch, ready to ship.</p>
          </div>
        </div>
        <ProductGrid products={products || []} />
      </section>
      <section className="border-t border-border/60 bg-secondary/30 py-16 lg:py-24" id="about">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">About Merch Co.</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We make clothing for people who care about quality, fit, and quiet confidence. Every piece is produced in limited runs so you’re not wearing what everyone else is.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
