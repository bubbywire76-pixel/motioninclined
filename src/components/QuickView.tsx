import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { sizeOption } from "@/lib/product";

interface QuickViewProps {
  product: ShopifyProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickView({ product, open, onOpenChange }: QuickViewProps) {
  const addItem = useCartStore((s) => s.addItem);
  const sizes = sizeOption(product);
  const [size, setSize] = useState<string | null>(sizes?.values[0] ?? null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const image = product.node.images.edges[0]?.node;
  const variant = size
    ? product.node.variants.edges.find((v) =>
        v.node.selectedOptions.some((o) => o.name.toLowerCase() === "size" && o.value === size),
      )?.node
    : product.node.variants.edges[0]?.node;

  const handleAdd = async () => {
    if (!variant) return;
    setAdding(true);
    try {
      await addItem({
        product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions,
      });
      toast.success(`Added — ${product.node.title}${size ? ` · ${size}` : ""}`);
      onOpenChange(false);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${product.node.title} quick view`}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 animate-fade-up bg-foreground/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="animate-fade-up relative z-10 grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-[24px] bg-background shadow-2xl sm:grid-cols-2">
        <button
          onClick={() => onOpenChange(false)}
          aria-label="Close quick view"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-md"
        >
          <X className="h-4 w-4" strokeWidth={1.3} />
        </button>

        <div className="aspect-[4/5] bg-muted">
          {image && (
            <img
              src={image.url}
              alt={image.altText || product.node.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-col justify-center gap-6 p-8 sm:p-12">
          <div>
            <p className="text-[9px] uppercase tracking-[0.45em] text-muted-foreground">Chapter 37</p>
            <h2 className="display-hd mt-4 text-2xl sm:text-3xl">{product.node.title}</h2>
            <p className="mt-3 text-[13px] tabular-nums text-muted-foreground">
              {formatPrice(variant?.price.amount ?? product.node.priceRange.minVariantPrice.amount)}
            </p>
          </div>

          {product.node.description && (
            <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
              {product.node.description}
            </p>
          )}

          {sizes && sizes.values.length > 1 && (
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Size</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.values.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-full border px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
                      size === s
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleAdd}
              disabled={adding || !variant}
              className="flex w-full items-center justify-center rounded-full bg-foreground py-4 text-[10px] uppercase tracking-[0.3em] text-background transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add to cart"}
            </button>
            <Link
              to="/product/$handle"
              params={{ handle: product.node.handle }}
              onClick={() => onOpenChange(false)}
              className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground underline-offset-8 hover:underline"
            >
              View full details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
