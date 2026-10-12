import { getDatabase } from "@netlify/database";
import { z } from "zod";
import { cartItemSchema, priceCart } from "./cart-pricing.server";

export const bankTransferOrderSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/),
  address: z.string().trim().min(8).max(240),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  items: z.array(cartItemSchema).min(1).max(25),
});

export const bankTransferReportSchema = z.object({
  reference: z.string().regex(/^MI-BT-[A-Z0-9]{8}$/),
  email: z.string().trim().email().max(254),
});

function newReference() {
  // Short, unambiguous reference the shopper can type into their bank app's narration field.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `MI-BT-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
}

export async function createBankTransferOrder(input: z.infer<typeof bankTransferOrderSchema>) {
  try {
    const priced = await priceCart(input.items);
    const reference = newReference();
    const items = priced.lines.map((line) => ({
      variantId: line.variantId,
      name: line.name,
      size: line.size,
      quantity: line.quantity,
      unitAmount: line.unitAmount,
    }));
    const db = getDatabase();
    await db.sql`
      INSERT INTO bank_transfer_orders
        (reference, customer_name, email, phone, delivery_address, items, total_naira)
      VALUES (
        ${reference},
        ${input.name},
        ${input.email.toLowerCase()},
        ${input.phone},
        ${`${input.address}, ${input.city}, ${input.state}`},
        ${JSON.stringify(items)}::jsonb,
        ${priced.total.toFixed(2)}
      )
    `;
    return { ok: true as const, reference, total: priced.total };
  } catch (error) {
    console.error("Bank transfer order error", error);
    return {
      ok: false as const,
      error: error instanceof Error && error.message.startsWith("A cart item")
        ? error.message
        : "We could not reserve your order. Please try again.",
    };
  }
}

export async function reportBankTransfer(input: z.infer<typeof bankTransferReportSchema>) {
  try {
    const db = getDatabase();
    const rows = await db.sql`
      UPDATE bank_transfer_orders
      SET status = 'transfer_reported', transfer_reported_at = NOW()
      WHERE reference = ${input.reference}
        AND email = ${input.email.toLowerCase()}
        AND status IN ('awaiting_transfer', 'transfer_reported')
      RETURNING reference, total_naira
    `;
    const order = rows[0] as { reference: string; total_naira: string } | undefined;
    if (!order) return { ok: false as const, error: "We could not find this order. Please contact us on WhatsApp." };
    return { ok: true as const, reference: order.reference, total: Number(order.total_naira) };
  } catch (error) {
    console.error("Bank transfer report error", error);
    return { ok: false as const, error: "We could not update your order. Please contact us on WhatsApp." };
  }
}
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
