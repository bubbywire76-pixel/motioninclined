import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";
import type { ShopifyProduct } from "@/lib/shopify";

interface ProductRailProps {
  products: ShopifyProduct[];
  eyebrow?: string;
  title: string;
  description?: string;
}

export function ProductRail({ products, eyebrow, title, description }: ProductRailProps) {
  const ref = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 640), behavior: "smooth" });
  };

  return (
    <section className="w-full">
      <Reveal className="mb-10 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="display-hd mt-5 text-3xl sm:text-5xl">{title}</h2>
          {description && (
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            aria-label={`Scroll ${title} left`}
            onClick={() => scrollBy(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors duration-500 hover:border-foreground hover:bg-foreground hover:text-background"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.3} />
          </button>
          <button
            aria-label={`Scroll ${title} right`}
            onClick={() => scrollBy(1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors duration-500 hover:border-foreground hover:bg-foreground hover:text-background"
          >
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.3} />
          </button>
        </div>
      </Reveal>
      <div
        ref={ref}
        className="hide-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 sm:gap-10"
      >
        {products.map((product, i) => (
          <div
            key={product.node.id}
            className="w-[78vw] flex-none snap-start sm:w-[44vw] lg:w-[28vw] xl:w-[23vw]"
          >
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
