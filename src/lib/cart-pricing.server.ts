import { z } from "zod";
import { SHOPIFY_STOREFRONT_TOKEN, SHOPIFY_STOREFRONT_URL } from "./shopify";

export const cartItemSchema = z.object({
  variantId: z.string().regex(/^gid:\/\/shopify\/ProductVariant\/\d+$/),
  quantity: z.number().int().min(1).max(10),
});

type ShopifyNode = {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  product: { title: string };
};

type PricedLine = z.infer<typeof cartItemSchema> & {
  name: string;
  size: string;
  unitAmount: number;
};

export async function priceCart(items: Array<z.infer<typeof cartItemSchema>>) {
  // The Storefront token is public (it ships in the browser bundle), so fall back to it when no server override is set.
  const token = process.env["SHOPIFY_STOREFRONT_ACCESS_TOKEN"] || SHOPIFY_STOREFRONT_TOKEN;

  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
    body: JSON.stringify({
      query: `query PriceCart($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on ProductVariant { id title price { amount currencyCode } product { title } }
        }
      }`,
      variables: { ids: items.map((item) => item.variantId) },
    }),
  });
  if (!response.ok) throw new Error("Unable to confirm product prices.");
  const body = await response.json() as { data?: { nodes?: Array<ShopifyNode | null> }; errors?: unknown };
  if (body.errors || !body.data?.nodes) throw new Error("Unable to confirm product prices.");

  const variants = new Map(
    body.data.nodes.filter((node): node is ShopifyNode => node !== null).map((node) => [node.id, node]),
  );
  const lines: PricedLine[] = items.map((item) => {
    const variant = variants.get(item.variantId);
    if (!variant || variant.price.currencyCode !== "NGN") throw new Error("A cart item is unavailable in NGN.");
    const unitAmount = Number(variant.price.amount);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) throw new Error("A cart item has an invalid price.");
    return { ...item, name: variant.product.title, size: variant.title, unitAmount };
  });
  return { lines, total: lines.reduce((sum, line) => sum + line.unitAmount * line.quantity, 0) };
}
