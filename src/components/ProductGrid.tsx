import { ProductCard } from "./ProductCard";
import type { ShopifyProduct } from "@/lib/shopify";

interface ProductGridProps {
  products: ShopifyProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
        <h3 className="text-xl font-semibold">No products found</h3>
        <p className="mt-2 text-muted-foreground">
          Your Shopify store is connected but has no products yet. Tell me what merch you want to add and I’ll create it for you.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.node.id} product={product} />
      ))}
    </div>
  );
}
