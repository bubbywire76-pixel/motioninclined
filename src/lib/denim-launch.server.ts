import type { z } from "zod";
import { denimNotificationSchema } from "./denim-launch";

export async function saveDenimNotification(input: z.infer<typeof denimNotificationSchema>) {
  const data = denimNotificationSchema.parse(input);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("product_launch_notifications").insert({
    email: data.email,
    product_handle: data.productHandle,
  });
  // Duplicate signups get the same response; never expose the subscriber list.
  if (error && error.code !== "23505") {
    throw new Error("We couldn't save your email. Please try again.");
  }
  return { success: true };
}