import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const PAID_STATUS = { payment_status: "Paid", order_status: "Payment Confirmed — Processing" } as const;

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { isAdmin: data === true };
  });

export const listTransferOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) return { isAdmin: false as const, orders: [] };
    const { data, error } = await context.supabase
      .from("bank_transfer_orders")
      .select("id, order_number, customer_name, customer_email, customer_phone, delivery_address, items, amount, payment_status, order_status, created_at, verified_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("Orders could not be loaded.");
    return {
      isAdmin: true as const,
      orders: (data ?? []).map((o) => ({
        ...o,
        amount: Number(o.amount),
        items: (Array.isArray(o.items) ? o.items : []) as { name?: string; size?: string; quantity?: number; unitAmount?: number }[],
      })),
    };
  });

export const markTransferPaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Only administrators can verify payments.");
    const { data: row, error } = await context.supabase
      .from("bank_transfer_orders")
      .update({ ...PAID_STATUS, verified_at: new Date().toISOString(), verified_by: context.userId, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("payment_status", "Pending Verification")
      .select("order_number, payment_status")
      .maybeSingle();
    if (error || !row) throw new Error("This order could not be verified. It may already be marked paid.");
    return row;
  });
