import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";

const checkoutSchema = z.object({
  email: z.string().trim().email().max(254),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/),
  address: z.string().trim().min(8).max(240),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  items: z.array(z.object({
    variantId: z.string().regex(/^gid:\/\/shopify\/ProductVariant\/\d+$/),
    quantity: z.number().int().min(1).max(10),
  })).min(1).max(25),
});

const verifySchema = z.object({ reference: z.string().regex(/^[A-Za-z0-9._=-]{8,100}$/) });

type ShopifyNode = {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  product: { title: string };
};

async function priceCart(items: z.infer<typeof checkoutSchema>["items"]) {
  const domain = "my-merch-shop-hsh8y.myshopify.com";
  const token = process.env["SHOPIFY_STOREFRONT_ACCESS_TOKEN"];
  if (!token) throw new Error("Store checkout is temporarily unavailable.");

  const response = await fetch(`https://${domain}/api/2025-07/graphql.json`, {
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
  const lines = items.map((item) => {
    const variant = variants.get(item.variantId);
    if (!variant || variant.price.currencyCode !== "NGN") throw new Error("A cart item is unavailable in NGN.");
    const unitAmount = Number(variant.price.amount);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) throw new Error("A cart item has an invalid price.");
    return { ...item, name: variant.product.title, size: variant.title, unitAmount };
  });
  return { lines, total: lines.reduce((sum, line) => sum + line.unitAmount * line.quantity, 0) };
}

export const initializePaystackCheckout = createServerFn({ method: "POST" })
  .inputValidator((input) => checkoutSchema.parse(input))
  .handler(async ({ data }) => {
    const secretKey = process.env["PAYSTACK_SECRET_KEY"];
    if (!secretKey) return { ok: false as const, error: "Nigerian checkout is not configured yet." };

    try {
      const priced = await priceCart(data.items);
      const requestOrigin = new URL(getRequestUrl()).origin;
      const reference = `MI-${Date.now()}-${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          amount: Math.round(priced.total * 100),
          currency: "NGN",
          reference,
          callback_url: `${requestOrigin}/order-confirmed`,
          channels: ["card", "bank", "ussd", "bank_transfer"],
          metadata: {
            customer_name: data.name,
            phone: data.phone,
            delivery_address: `${data.address}, ${data.city}, ${data.state}`,
            cart: priced.lines.map((line) => ({
              variant_id: line.variantId,
              product: line.name,
              size: line.size,
              quantity: line.quantity,
              unit_amount: line.unitAmount,
            })),
          },
        }),
      });
      const body = await response.json() as {
        status?: boolean;
        message?: string;
        data?: { authorization_url?: string; reference?: string };
      };
      if (!response.ok || !body.status || !body.data?.authorization_url) {
        console.error("Paystack initialization failed", response.status, body.message);
        return { ok: false as const, error: "Payment could not be started. Please try again." };
      }
      return {
        ok: true as const,
        authorizationUrl: body.data.authorization_url,
        reference: body.data.reference ?? reference,
        amount: priced.total,
      };
    } catch (error) {
      console.error("Paystack checkout error", error);
      return { ok: false as const, error: error instanceof Error ? error.message : "Payment could not be started." };
    }
  });

export const verifyPaystackPayment = createServerFn({ method: "GET" })
  .inputValidator((input) => verifySchema.parse(input))
  .handler(async ({ data }) => {
    const secretKey = process.env["PAYSTACK_SECRET_KEY"];
    if (!secretKey) return { ok: false as const, error: "Payment verification is unavailable." };
    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`,
        { headers: { Authorization: `Bearer ${secretKey}` } },
      );
      const body = await response.json() as {
        status?: boolean;
        data?: { status?: string; reference?: string; amount?: number; currency?: string; paid_at?: string };
      };
      const payment = body.data;
      if (!response.ok || !body.status || payment?.status !== "success" || payment.currency !== "NGN") {
        return { ok: false as const, error: "This payment has not been completed." };
      }
      return {
        ok: true as const,
        reference: payment.reference ?? data.reference,
        amount: (payment.amount ?? 0) / 100,
        paidAt: payment.paid_at ?? new Date().toISOString(),
      };
    } catch (error) {
      console.error("Paystack verification error", error);
      return { ok: false as const, error: "We could not verify this payment. Please try again." };
    }
  });