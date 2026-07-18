import { ProductCard } from "./ProductCard";
import type { ShopifyProduct } from "@/lib/shopify";

interface ProductGridProps {
  products: ShopifyProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <h3 className="text-sm font-medium uppercase tracking-[0.25em]">No products yet</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Your store is connected but empty. Tell me what to add.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 sm:gap-y-16 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.node.id} product={product} index={i} />
      ))}
    </div>
  );
}
