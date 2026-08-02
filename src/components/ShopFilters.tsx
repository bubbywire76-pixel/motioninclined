import type { ShopifyProduct } from "@/lib/shopify";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "title";

export interface FilterState {
  size: string;
  color: string;
  availability: "all" | "in-stock";
  maxPrice: number | null;
}

interface ShopFiltersProps {
  sizes: string[];
  colors: string[];
  state: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
  resultCount: number;
}

export function ShopFilters({
  sizes,
  colors,
  state,
  onChange,
  onReset,
  resultCount,
}: ShopFiltersProps) {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <p className="eyebrow">Refine</p>
        <p className="mt-4 text-[12px] text-muted-foreground">
          {resultCount} piece{resultCount === 1 ? "" : "s"}
        </p>
      </div>

      <FilterGroup label="Size">
        <div className="flex flex-wrap gap-2">
          {["all", ...sizes].map((s) => (
            <Chip
              key={s}
              active={state.size === s}
              onClick={() => onChange({ ...state, size: s })}
              label={s === "all" ? "All" : s}
            />
          ))}
        </div>
      </FilterGroup>

      {colors.length > 0 && (
        <FilterGroup label="Colour">
          <div className="flex flex-wrap gap-2">
            {["all", ...colors].map((c) => (
              <Chip
                key={c}
                active={state.color === c}
                onClick={() => onChange({ ...state, color: c })}
                label={c === "all" ? "All" : c}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup label="Availability">
        <div className="flex flex-wrap gap-2">
          <Chip
            active={state.availability === "all"}
            onClick={() => onChange({ ...state, availability: "all" })}
            label="All"
          />
          <Chip
            active={state.availability === "in-stock"}
            onClick={() => onChange({ ...state, availability: "in-stock" })}
            label="In stock"
          />
        </div>
      </FilterGroup>

      <FilterGroup label="Price">
        <div className="flex flex-wrap gap-2">
          {[null, 35000, 45000, 100000].map((p) => (
            <Chip
              key={String(p)}
              active={state.maxPrice === p}
              onClick={() => onChange({ ...state, maxPrice: p })}
              label={p === null ? "Any" : `Under ₦${(p / 1000).toFixed(0)}k`}
            />
          ))}
        </div>
      </FilterGroup>

      <button
        onClick={onReset}
        className="self-start text-[10px] uppercase tracking-[0.3em] text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-[0.3em] text-foreground">{label}</h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export function applyFilters(
  products: ShopifyProduct[],
  state: FilterState,
  sort: SortKey,
): ShopifyProduct[] {
  let list = products.filter((p) => {
    if (state.size !== "all") {
      const ok = p.node.options.some(
        (o) => o.name.toLowerCase() === "size" && o.values.includes(state.size),
      );
      if (!ok) return false;
    }
    if (state.color !== "all") {
      const ok = p.node.options.some(
        (o) => o.name.toLowerCase() === "color" && o.values.includes(state.color),
      );
      if (!ok) return false;
    }
    if (state.availability === "in-stock") {
      const ok = p.node.variants.edges.some((v) => v.node.availableForSale);
      if (!ok) return false;
    }
    if (state.maxPrice !== null) {
      if (parseFloat(p.node.priceRange.minVariantPrice.amount || "0") > state.maxPrice) return false;
    }
    return true;
  });

  const price = (p: ShopifyProduct) => parseFloat(p.node.priceRange.minVariantPrice.amount || "0");
  list = [...list];
  if (sort === "price-asc") list.sort((a, b) => price(a) - price(b));
  if (sort === "price-desc") list.sort((a, b) => price(b) - price(a));
  if (sort === "title") list.sort((a, b) => a.node.title.localeCompare(b.node.title));
  if (sort === "newest")
    list.sort(
      (a, b) => Date.parse(b.node.createdAt || "0") - Date.parse(a.node.createdAt || "0"),
    );
  return list;
}
