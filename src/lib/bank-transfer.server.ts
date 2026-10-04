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
