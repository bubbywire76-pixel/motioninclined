import { createHmac, timingSafeEqual } from "node:crypto";
import type { z } from "zod";
import { transferCheckoutSchema, transferReceiptSchema, TRANSFER_STATUS } from "./bank-transfer";
import { checkCheckoutReviewToken } from "./checkout-review.server";
import { SHOPIFY_STOREFRONT_URL, SHOPIFY_STOREFRONT_TOKEN } from "./shopify";

function signature(id: string, expiry: string) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Checkout is temporarily unavailable. Please try again.");
  return createHmac("sha256", key).update(`bank-transfer:${id}:${expiry}`).digest("hex");
}

export async function prepareTransfer(input: z.infer<typeof transferCheckoutSchema>) {
  const data = transferCheckoutSchema.parse(input);
  if (!await checkCheckoutReviewToken(data)) throw new Error("Review your delivery details again before payment.");
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN },
    body: JSON.stringify({ query: `query($ids: [ID!]!) { nodes(ids: $ids) { ... on ProductVariant { id title price { amount currencyCode } product { title tags } } } }`, variables: { ids: data.items.map(i => i.variantId) } }),
  });
  if (!response.ok) throw new Error("Unable to confirm product prices. Please try again.");
  const body = await response.json() as { errors?: unknown; data?: { nodes: Array<{ id: string; title: string; price: { amount: string; currencyCode: string }; product: { title: string; tags: string[] } } | null> } };
  if (body.errors || !body.data) throw new Error("Unable to confirm product prices.");
  const nodes = body.data.nodes;
  const lines = data.items.map(item => {
    const variant = nodes.find(node => node?.id === item.variantId);
    if (!variant || variant.price.currencyCode !== "NGN" || variant.product.tags.some(tag => tag.toLowerCase().replaceAll("-", " ").includes("coming soon"))) throw new Error("A cart item cannot currently be purchased.");
    const unitAmount = Number(variant.price.amount);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) throw new Error("A product price could not be confirmed.");
    return { ...item, name: variant.product.title, size: variant.title, unitAmount };
  });
  const amount = lines.reduce((sum, line) => sum + line.unitAmount * line.quantity, 0);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: order, error } = await supabaseAdmin.from("bank_transfer_orders").insert({ customer_name: data.name, customer_email: data.email, customer_phone: data.phone, delivery_address: `${data.address}, ${data.city}, ${data.state}`, items: lines, amount, currency: "NGN", ...TRANSFER_STATUS }).select("id, order_number, amount").single();
  if (error || !order?.order_number) throw new Error("We couldn't create your transfer order. Please try again.");
  const expiry = String(Date.now() + 24 * 60 * 60 * 1000);
  return { id: order.id, token: `${expiry}.${signature(order.id, expiry)}`, orderNumber: order.order_number, amount: Number(order.amount) };
}

export async function submitTransfer(input: z.infer<typeof transferReceiptSchema>) {
  const data = transferReceiptSchema.parse(input);
  const [expiry, supplied] = data.token.split(".");
  if (!expiry || !supplied || !Number.isFinite(Number(expiry)) || Number(expiry) < Date.now()) throw new Error("This checkout expired. Please start again.");
  const expected = signature(data.id, expiry);
  if (supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) throw new Error("Invalid transfer checkout.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // A shopper can submit only a pending order; never write a paid status.
  const { data: order, error } = await supabaseAdmin.from("bank_transfer_orders").update({ updated_at: new Date().toISOString() }).eq("id", data.id).eq("payment_status", "Pending Verification").select("order_number, amount, payment_method, payment_status, order_status").single();
  if (error || !order) throw new Error("Your order could not be submitted. Please contact Motion with your order number.");
  return order;
}