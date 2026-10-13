export const BANK_TRANSFER_ACCOUNT = {
  accountName: "Mathew Autor Iji",
  accountNumber: "5253265702",
  bankName: "Moniepoint MFB",
} as const;

export const ORDERS_WHATSAPP_NUMBER = "2347043602465";
import { z } from "zod";

export const BANK_ACCOUNT = { name: "Mathew Autor Iji", number: "5253265702", bank: "Moniepoint MFB" };
export const TRANSFER_STATUS = { payment_method: "Bank Transfer", payment_status: "Pending Verification", order_status: "Awaiting Payment Verification" } as const;
export const transferCheckoutSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/),
  address: z.string().trim().min(8).max(240),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  reviewToken: z.string().min(16).max(200),
  items: z.array(z.object({ variantId: z.string().regex(/^gid:\/\/shopify\/ProductVariant\/\d+$/), quantity: z.number().int().min(1).max(10) })).min(1).max(25),
});
export const transferReceiptSchema = z.object({ id: z.string().uuid(), token: z.string().min(20).max(200) });
export type TransferOrder = { id: string; token: string; orderNumber: string; amount: number };
