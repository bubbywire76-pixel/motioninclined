import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";

interface ProductCardProps {
  product: ShopifyProduct;
  index?: number;
  priority?: boolean;
}

export function ProductCard({ product, index = 0, priority = false }: ProductCardProps) {
  const firstVariant = product.node.variants.edges[0]?.node;
  const images = product.node.images.edges;
  const image = images[0]?.node;
  const hoverImage = images[1]?.node;
  const price = firstVariant?.price || product.node.priceRange.minVariantPrice;

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
    <article className="group relative flex flex-col">
      <Link to="/product/$handle" params={{ handle: product.node.handle }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
          {image ? (
            <>
              <img
                src={image.url}
                alt={image.altText || `${product.node.title} — Motion Inclined`}
                loading={priority && index < 2 ? "eager" : "lazy"}
                className={`h-full w-full object-cover transition-all duration-[1200ms] ease-out group-hover:scale-[1.06] ${
                  hoverImage ? "group-hover:opacity-0" : ""
                }`}
              />
              {hoverImage && (
                <img
                  src={hoverImage.url}
                  alt={hoverImage.altText || `${product.node.title} alternate view`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-[1200ms] ease-out group-hover:scale-[1.06] group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              No image
            </div>
          )}
        </div>
      </Link>

      <div className="mt-5 flex items-start justify-between gap-4">
        <Link to="/product/$handle" params={{ handle: product.node.handle }}>
          <h3 className="text-[13px] font-medium tracking-tight text-foreground">
            {product.node.title}
          </h3>
          <p className="mt-1.5 text-[12px] text-muted-foreground">{formatPrice(price.amount)}</p>
        </Link>
      </div>

      <div className="mt-4">
        {hasSizes ? (
          <div className="grid grid-cols-4 gap-1.5">
            {sizeOption!.values.map((size) => {
              const variant = product.node.variants.edges.find((v) =>
                v.node.selectedOptions.some(
                  (o) => o.name.toLowerCase() === "size" && o.value === size,
                ),
              )?.node;
              const isAdding = !!adding && !!variant && adding === variant.id;
              return (
                <button
                  key={size}
                  onClick={(e) => handleQuickAdd(e, size)}
                  disabled={!!adding}
                  aria-label={`Add ${product.node.title} size ${size} to cart`}
                  className="flex items-center justify-center rounded-full border border-border py-2.5 text-[10px] uppercase tracking-[0.15em] transition-all duration-300 hover:border-foreground hover:bg-foreground hover:text-background disabled:opacity-40"
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
            className="flex w-full items-center justify-center rounded-full bg-foreground py-3 text-[10px] uppercase tracking-[0.3em] text-background transition-all duration-300 hover:opacity-85 disabled:opacity-50"
          >
            {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add to cart"}
          </button>
        )}
      </div>
    </article>
  );
}
