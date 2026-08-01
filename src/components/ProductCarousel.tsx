import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { ShopifyProduct } from "@/lib/shopify";

export function ProductCarousel({ products }: { products: ShopifyProduct[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 640), behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <div className="mb-8 flex justify-end gap-2 px-1">
        <button
          aria-label="Previous products"
          onClick={() => scrollBy(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.4} />
        </button>
        <button
          aria-label="Next products"
          onClick={() => scrollBy(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground"
        >
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.4} />
        </button>
      </div>
      <div
        ref={ref}
        className="hide-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 sm:gap-8"
      >
        {products.map((product, i) => (
          <div
            key={product.node.id}
            className="w-[74vw] flex-none snap-start sm:w-[42vw] lg:w-[28vw] xl:w-[22vw]"
          >
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
