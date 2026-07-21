import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";

interface ProductCardProps {
  product: ShopifyProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const firstVariant = product.node.variants.edges[0]?.node;
  const image = product.node.images.edges[0]?.node;
  const price = firstVariant?.price || product.node.priceRange.minVariantPrice;
  const stagger = index % 2 === 1 ? "mt-10" : "";

  const addItem = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState<string | null>(null);

  const sizeOption = product.node.options.find((o) => o.name.toLowerCase() === "size");
  const hasSizes = !!sizeOption && sizeOption.values.length > 1;

  const handleQuickAdd = async (e: React.MouseEvent, sizeValue?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = sizeValue
      ? product.node.variants.edges.find((v) =>
          v.node.selectedOptions.some(
            (o) => o.name.toLowerCase() === "size" && o.value === sizeValue,
          ),
        )?.node
      : firstVariant;
    if (!variant) return;
    setAdding(variant.id);
    try {
      await addItem({
        product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions,
      });
      toast.success(`Added — ${product.node.title}${sizeValue ? ` · ${sizeValue}` : ""}`);
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className={`group relative ${stagger}`}>
      <Link
        to="/product/$handle"
        params={{ handle: product.node.handle }}
        className="block"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
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

          {/* Quick add overlay */}
          <div className="pointer-events-none absolute inset-x-2 bottom-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
            {hasSizes ? (
              <div className="grid grid-cols-4 gap-1 bg-background/95 p-1.5 backdrop-blur">
                {sizeOption!.values.map((size) => {
                  const variant = product.node.variants.edges.find((v) =>
                    v.node.selectedOptions.some(
                      (o) => o.name.toLowerCase() === "size" && o.value === size,
                    ),
                  )?.node;
                  const isAdding = adding && variant && adding === variant.id;
                  const soldOut = variant && !variant.availableForSale;
                  return (
                    <button
                      key={size}
                      onClick={(e) => handleQuickAdd(e, size)}
                      disabled={!!adding || soldOut}
                      className="flex items-center justify-center border border-foreground/10 bg-background py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-foreground hover:bg-foreground hover:text-background disabled:opacity-40"
                    >
                      {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : size}
                    </button>
                  );
                })}
              </div>
            ) : (
              <button
                onClick={(e) => handleQuickAdd(e)}
                disabled={!!adding}
                className="flex w-full items-center justify-center bg-foreground py-2.5 text-[10px] uppercase tracking-[0.3em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add to cart"}
              </button>
            )}
          </div>
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
    </div>
  );
}
