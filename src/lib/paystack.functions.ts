import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";

const domain = "my-merch-shop-hsh8y.myshopify.com";
const apiVersion = "2025-07";

const cartItemSchema = z.object({
  variantId: z.string().regex(/^gid:\/\/shopify\/ProductVariant\/\d+$/),
  quantity: z.number().int().min(1).max(10),
});

const checkoutSchema = z.object({
  email: z.string().trim().email().max(254),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/),
  address: z.string().trim().min(8).max(240),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  items: z.array(cartItemSchema).min(1).max(25),
});

const verifySchema = z.object({ reference: z.string().regex(/^[A-Za-z0-9._=-]{8,100}$/) });

const paymentMetadataSchema = z.object({
  customer_name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  phone: z.string().min(10).max(20),
  delivery_address: z.string().min(8).max(420),
  cart: z.array(z.object({
    variant_id: z.string().regex(/^gid:\/\/shopify\/ProductVariant\/\d+$/),
    quantity: z.number().int().min(1).max(10),
  })).min(1).max(25),
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

async function priceCart(items: Array<z.infer<typeof cartItemSchema>>) {
  const token = process.env["SHOPIFY_STOREFRONT_ACCESS_TOKEN"];
  if (!token) throw new Error("Store checkout is temporarily unavailable.");

  const response = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
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

async function verifyPaystackReference(reference: string) {
  const secretKey = process.env["PAYSTACK_SECRET_KEY"];
  if (!secretKey) return { ok: false as const, error: "Nigerian checkout is not configured yet." };

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  );
  const body = await response.json() as {
    status?: boolean;
    data?: {
      status?: string;
      reference?: string;
      amount?: number;
      currency?: string;
      paid_at?: string;
      metadata?: unknown;
    };
  };
  const payment = body.data;
  if (!response.ok || !body.status || payment?.status !== "success" || payment.currency !== "NGN") {
    return { ok: false as const, error: "This payment has not been completed." };
  }
  return {
    ok: true as const,
    reference: payment.reference ?? reference,
    amount: payment.amount ?? 0,
    paidAt: payment.paid_at ?? new Date().toISOString(),
    metadata: payment.metadata,
  };
}

async function adminRequest(path: string, init: RequestInit = {}) {
  const token = process.env["SHOPIFY_ACCESS_TOKEN"];
  if (!token) throw new Error("Order creation is not configured yet.");
  const response = await fetch(`https://${domain}/admin/api/${apiVersion}/${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
      ...init.headers,
    },
  });
  const body = await response.json() as { errors?: unknown; order?: { id?: number; name?: string } };
  if (!response.ok) {
    console.error("Shopify order request failed", response.status, body.errors);
    throw new Error("Payment succeeded, but we could not create the store order yet.");
  }
  return body;
}

function variantNumericId(variantId: string) {
  const id = variantId.split("/").pop();
  if (!id) throw new Error("A cart item has an invalid variant.");
  return Number(id);
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return { first_name: parts[0] ?? name, last_name: parts.slice(1).join(" ") || (parts[0] ?? name) };
}

async function createShopifyOrder(reference: string, amountInKobo: number, metadata: unknown, paidAt: string) {
  const details = paymentMetadataSchema.safeParse(metadata);
  if (!details.success) throw new Error("Payment details could not be confirmed. Please contact us.");

  const priced = await priceCart(details.data.cart.map((item) => ({
    variantId: item.variant_id,
    quantity: item.quantity,
  })));
  if (Math.round(priced.total * 100) !== amountInKobo) {
    throw new Error("The cart total changed before payment could be completed. Please contact us.");
  }

  const orderTag = `MI-PAYSTACK-${reference}`;
  const existing = await adminRequest(`orders.json?status=any&limit=1&tag=${encodeURIComponent(orderTag)}`, { method: "GET" });
  if (existing.order?.id) {
    return { orderId: String(existing.order.id), orderName: existing.order.name ?? null };
  }

  const name = splitName(details.data.customer_name);
  const address = {
    ...name,
    address1: details.data.delivery_address,
    city: "Nigeria",
    country: "Nigeria",
    country_code: "NG",
    phone: details.data.phone,
  };
  const order = await adminRequest("orders.json", {
    method: "POST",
    body: JSON.stringify({
      order: {
        email: details.data.email,
        phone: details.data.phone,
        line_items: priced.lines.map((line) => ({ variant_id: variantNumericId(line.variantId), quantity: line.quantity })),
        financial_status: "paid",
        currency: "NGN",
        shipping_address: address,
        billing_address: address,
        note: `Paystack payment reference: ${reference}\nPaid at: ${paidAt}`,
        tags: orderTag,
        send_receipt: true,
        send_fulfillment_receipt: false,
        transactions: [{
          kind: "sale",
          status: "success",
          amount: priced.total.toFixed(2),
          currency: "NGN",
          gateway: "Paystack",
          authorization: reference,
        }],
      },
    }),
  });
  if (!order.order?.id) throw new Error("Payment succeeded, but the store did not return an order number.");
  return { orderId: String(order.order.id), orderName: order.order.name ?? null };
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
            email: data.email,
            phone: data.phone,
            delivery_address: `${data.address}, ${data.city}, ${data.state}`,
            cart: priced.lines.map((line) => ({ variant_id: line.variantId, quantity: line.quantity })),
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
    try {
      const payment = await verifyPaystackReference(data.reference);
      if (!payment.ok) return payment;
      return {
        ok: true as const,
        reference: payment.reference,
        amount: payment.amount / 100,
        paidAt: payment.paidAt,
      };
    } catch (error) {
      console.error("Paystack verification error", error);
      return { ok: false as const, error: "We could not verify this payment. Please try again." };
    }
  });

export const createShopifyOrderForPayment = createServerFn({ method: "POST" })
  .inputValidator((input) => verifySchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const payment = await verifyPaystackReference(data.reference);
      if (!payment.ok) return payment;
      const order = await createShopifyOrder(payment.reference, payment.amount, payment.metadata, payment.paidAt);
      return {
        ok: true as const,
        reference: payment.reference,
        amount: payment.amount / 100,
        paidAt: payment.paidAt,
        ...order,
      };
    } catch (error) {
      console.error("Shopify order creation error", error);
      return { ok: false as const, error: error instanceof Error ? error.message : "We could not finish the store order." };
    }
  });