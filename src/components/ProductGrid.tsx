import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";
import type { ShopifyProduct } from "@/lib/shopify";

interface ProductGridProps {
  products: ShopifyProduct[];
  columns?: 2 | 3 | 4;
}

export function ProductGrid({ products, columns = 3 }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border px-6 py-20 text-center">
        <h3 className="text-[11px] uppercase tracking-[0.3em]">Nothing here yet</h3>
        <p className="mt-4 text-sm text-muted-foreground">New pieces are on the way.</p>
      </div>
    );
  }

  const colClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 gap-x-6 gap-y-16 sm:gap-x-8 sm:gap-y-24 ${colClass}`}>
      {products.map((product, i) => (
        <Reveal key={product.node.id} delay={(i % 3) * 90}>
          <ProductCard product={product} index={i} priority={i < 3} />
        </Reveal>
      ))}
    </div>
  );
}
