import { getUser } from "@netlify/identity";
import { getDatabase } from "@netlify/database";
import { z } from "zod";

// The founder's inbox is the only identity allowed into /admin. Override with FOUNDER_EMAIL (comma-separated) if it changes.
const DEFAULT_FOUNDER_EMAIL = "bubbywire76@gmail.com";

export const ORDER_STATUSES = ["awaiting_transfer", "transfer_reported", "paid", "shipped", "cancelled"] as const;

export const updateOrderStatusSchema = z.object({
  reference: z.string().regex(/^MI-BT-[A-Z0-9]{8}$/),
  status: z.enum(ORDER_STATUSES),
});

function founderEmails() {
  return (process.env["FOUNDER_EMAIL"] || DEFAULT_FOUNDER_EMAIL)
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getFounder() {
  const user = await getUser();
  if (!user?.email || !user.confirmedAt) return null;
  return founderEmails().includes(user.email.toLowerCase()) ? { email: user.email } : null;
}

export async function getAdminSession() {
  const user = await getUser();
  if (!user) return { signedIn: false as const };
  const founder = await getFounder();
  return { signedIn: true as const, email: user.email ?? null, isFounder: Boolean(founder) };
}

type OrderRow = {
  reference: string;
  status: (typeof ORDER_STATUSES)[number];
  customer_name: string;
  email: string;
  phone: string;
  delivery_address: string;
  items: Array<{ name: string; size: string; quantity: number; unitAmount: number }>;
  total_naira: string;
  created_at: string;
  transfer_reported_at: string | null;
};

export async function listAdminOrders() {
  if (!await getFounder()) return { ok: false as const, error: "Founder access only." };
  try {
    const db = getDatabase();
    const rows = await db.sql`
      SELECT reference, status, customer_name, email, phone, delivery_address, items, total_naira,
             created_at, transfer_reported_at
      FROM bank_transfer_orders
      ORDER BY created_at DESC
      LIMIT 500
    ` as OrderRow[];
    const orders = rows.map((row) => ({
      reference: row.reference,
      status: row.status,
      customerName: row.customer_name,
      email: row.email,
      phone: row.phone,
      deliveryAddress: row.delivery_address,
      items: typeof row.items === "string" ? JSON.parse(row.items) as OrderRow["items"] : row.items,
      total: Number(row.total_naira),
      createdAt: new Date(row.created_at).toISOString(),
      transferReportedAt: row.transfer_reported_at ? new Date(row.transfer_reported_at).toISOString() : null,
    }));
    return { ok: true as const, orders };
  } catch (error) {
    console.error("Admin order list error", error);
    return { ok: false as const, error: "Orders could not be loaded." };
  }
}

export async function updateAdminOrderStatus(input: z.infer<typeof updateOrderStatusSchema>) {
  if (!await getFounder()) return { ok: false as const, error: "Founder access only." };
  try {
    const db = getDatabase();
    const rows = await db.sql`
      UPDATE bank_transfer_orders SET status = ${input.status}
      WHERE reference = ${input.reference}
      RETURNING reference
    `;
    if (!rows[0]) return { ok: false as const, error: "Order not found." };
    return { ok: true as const };
  } catch (error) {
    console.error("Admin order update error", error);
    return { ok: false as const, error: "The order could not be updated." };
  }
}
