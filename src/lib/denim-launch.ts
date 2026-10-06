import { z } from "zod";

export const DENIM_HANDLE = "motion-signature-denim";
export const denimNotificationSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  productHandle: z.literal(DENIM_HANDLE),
});

export const DENIM_DETAILS = [
  "Premium dark charcoal/black denim",
  "Relaxed contemporary silhouette",
  "Tonal all-over pattern",
  "Signature curved embellishment detailing",
  "Classic five-pocket construction",
  "Branded waistband patch",
  "Premium street-luxury aesthetic",
  "Designed as a timeless statement piece",
];