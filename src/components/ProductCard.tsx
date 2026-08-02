import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { colorOptions, colorSwatch, isLimited, isNewProduct, isSoldOut, sizeOption } from "@/lib/product";
import { QuickView } from "./QuickView";

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
  const wishlist = useWishlistStore((s) => s.handles);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const wished = wishlist.includes(product.node.handle);

  const [adding, setAdding] = useState<string | null>(null);
  const [quickView, setQuickView] = useState(false);

  const sizes = sizeOption(product);
  const hasSizes = !!sizes && sizes.values.length > 1;
  const colors = colorOptions(product);
  const soldOut = isSoldOut(product);

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
      <div className="relative">
        <Link
          to="/product/$handle"
          params={{ handle: product.node.handle }}
          className="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-4"
          aria-label={`View ${product.node.title}`}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-muted">
            {image ? (
              <>
                <img
                  src={image.url}
                  alt={image.altText || `${product.node.title} — Motion Inclined`}
                  loading={priority && index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  className={`h-full w-full object-cover transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] ${
                    hoverImage ? "group-hover:opacity-0" : ""
                  }`}
                />
                {hoverImage && (
                  <img
                    src={hoverImage.url}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full scale-[1.05] object-cover opacity-0 transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-100"
                  />
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                No image
              </div>
            )}

            <div className="pointer-events-none absolute left-4 top-4 flex flex-col items-start gap-2">
              {soldOut ? (
                <Badge label="Sold out" muted />
              ) : (
                <>
                  {isNewProduct(product) && <Badge label="New" />}
                  {isLimited(product) && <Badge label="Limited" muted />}
                </>
              )}
            </div>
          </div>
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.node.handle);
          }}
          aria-label={wished ? `Remove ${product.node.title} from wishlist` : `Save ${product.node.title} to wishlist`}
          aria-pressed={wished}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-md transition-all duration-500 hover:bg-background"
        >
          <Heart
            className={`h-[15px] w-[15px] transition-colors ${wished ? "fill-foreground text-foreground" : "text-foreground/70"}`}
            strokeWidth={1.3}
          />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            setQuickView(true);
          }}
          className="absolute inset-x-4 bottom-4 hidden translate-y-2 items-center justify-center gap-2 rounded-full bg-background/90 py-3 text-[10px] uppercase tracking-[0.3em] opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 lg:flex"
        >
          <Eye className="h-3.5 w-3.5" strokeWidth={1.3} /> Quick view
        </button>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <Link to="/product/$handle" params={{ handle: product.node.handle }} className="min-w-0">
          <h3 className="truncate text-[13px] font-medium tracking-tight text-foreground">
            {product.node.title}
          </h3>
          <p className="mt-1.5 text-[12px] tabular-nums text-muted-foreground">
            {formatPrice(price.amount)}
          </p>
        </Link>
        {colors.length > 0 && (
          <div className="flex flex-shrink-0 items-center gap-1.5 pt-1" aria-label={`${colors.length} colours`}>
            {colors.slice(0, 4).map((c) => (
              <span
                key={c}
                title={c}
                className="h-2.5 w-2.5 rounded-full ring-1 ring-border"
                style={{ backgroundColor: colorSwatch(c) }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        {soldOut ? (
          <div className="flex w-full items-center justify-center rounded-full border border-border py-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Sold out
          </div>
        ) : hasSizes ? (
          <div className="grid grid-cols-4 gap-1.5">
            {sizes!.values.map((size) => {
              const variant = product.node.variants.edges.find((v) =>
                v.node.selectedOptions.some(
                  (o) => o.name.toLowerCase() === "size" && o.value === size,
                ),
              )?.node;
              const isAdding = !!adding && !!variant && adding === variant.id;
              const unavailable = variant ? !variant.availableForSale : false;
              return (
                <button
                  key={size}
                  onClick={(e) => handleQuickAdd(e, size)}
                  disabled={!!adding || unavailable}
                  aria-label={`Add ${product.node.title} size ${size} to cart`}
                  className="flex items-center justify-center rounded-full border border-border py-2.5 text-[10px] uppercase tracking-[0.15em] transition-all duration-300 hover:border-foreground hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-30"
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

      <QuickView product={product} open={quickView} onOpenChange={setQuickView} />
    </article>
  );
}

function Badge({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[9px] uppercase tracking-[0.25em] backdrop-blur-md ${
        muted ? "bg-background/85 text-foreground" : "bg-foreground/90 text-background"
      }`}
    >
      {label}
    </span>
  );
}
