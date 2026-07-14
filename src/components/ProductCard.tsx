import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import type { ShopifyProduct } from "@/lib/shopify";

interface ProductCardProps {
  product: ShopifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const firstVariant = product.node.variants.edges[0]?.node;
  const image = product.node.images.edges[0]?.node;
  const price = firstVariant?.price || product.node.priceRange.minVariantPrice;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant) return;

    await addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || [],
    });
  };

  return (
    <Link to="/product/$handle" params={{ handle: product.node.handle }} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || product.node.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            No image
          </div>
        )}
        <div className="absolute bottom-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg"
            onClick={handleAddToCart}
            disabled={isLoading || !firstVariant?.availableForSale}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-base font-semibold leading-tight">{product.node.title}</h3>
        <p className="text-sm font-medium text-muted-foreground">
          {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
