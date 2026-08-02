import type { ShopifyProduct } from "@/lib/shopify";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export function isNewProduct(p: ShopifyProduct) {
  const created = p.node.createdAt ? Date.parse(p.node.createdAt) : NaN;
  if (Number.isNaN(created)) return false;
  return Date.now() - created < THIRTY_DAYS;
}

export function isLimited(p: ShopifyProduct) {
  const tags = (p.node.tags || []).map((t) => t.toLowerCase());
  if (tags.some((t) => t.includes("limited"))) return true;
  const variants = p.node.variants.edges;
  const inStock = variants.filter((v) => v.node.availableForSale).length;
  return variants.length > 1 && inStock > 0 && inStock <= 2;
}

export function isSoldOut(p: ShopifyProduct) {
  const variants = p.node.variants.edges;
  return variants.length > 0 && variants.every((v) => !v.node.availableForSale);
}

const COLOR_MAP: Record<string, string> = {
  black: "#141414",
  white: "#f7f6f3",
  cream: "#efe9dd",
  beige: "#e2d6c2",
  maroon: "#5c1f27",
  red: "#8c2b23",
  green: "#2f4237",
  navy: "#20293c",
  blue: "#3a5074",
  brown: "#6b4a2f",
  grey: "#9b9691",
  gray: "#9b9691",
  denim: "#4a6a8c",
};

export function colorSwatch(value: string): string {
  const key = value.trim().toLowerCase();
  return COLOR_MAP[key] ?? "#c9c3ba";
}

export function colorOptions(p: ShopifyProduct): string[] {
  return p.node.options.find((o) => o.name.toLowerCase() === "color")?.values ?? [];
}

export function sizeOption(p: ShopifyProduct) {
  return p.node.options.find((o) => o.name.toLowerCase() === "size");
}

export function priceOf(p: ShopifyProduct) {
  return parseFloat(p.node.priceRange.minVariantPrice.amount || "0");
}
