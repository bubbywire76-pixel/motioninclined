import { Link } from "@tanstack/react-router";
import type { ShopifyProduct } from "@/lib/shopify";

interface ProductCardProps {
  product: ShopifyProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const firstVariant = product.node.variants.edges[0]?.node;
  const image = product.node.images.edges[0]?.node;
  const price = firstVariant?.price || product.node.priceRange.minVariantPrice;
  const stagger = index % 2 === 1 ? "mt-10" : "";

  return (
    <Link
      to="/product/$handle"
      params={{ handle: product.node.handle }}
      className={`group block ${stagger}`}
    >
      <div className="aspect-[4/5] overflow-hidden bg-muted">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || product.node.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-widest text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="mt-4 px-0.5">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em]">
          {product.node.title}
        </p>
        <p className="mt-1 text-[10px] tracking-wide text-muted-foreground">
          {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
