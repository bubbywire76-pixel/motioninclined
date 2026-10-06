import { describe, expect, test } from "bun:test";
import { denimNotificationSchema } from "./denim-launch";
import { isComingSoon } from "./product";
import type { ShopifyProduct } from "./shopify";

describe("Motion Signature Denim launch", () => {
  test("Coming Soon tag blocks the purchasable state", () => {
    const product = { node: { tags: ["Coming Soon"] } } as ShopifyProduct;
    expect(isComingSoon(product)).toBe(true);
    expect(isComingSoon({ node: { tags: [] } } as unknown as ShopifyProduct)).toBe(false);
  });
  test("Notify Me accepts only the denim drop and valid email addresses", () => {
    expect(denimNotificationSchema.parse({ email: " Denim@example.com ", productHandle: "motion-signature-denim" }).email).toBe("denim@example.com");
    expect(denimNotificationSchema.safeParse({ email: "bad-email", productHandle: "motion-signature-denim" }).success).toBe(false);
    expect(denimNotificationSchema.safeParse({ email: "denim@example.com", productHandle: "another-product" }).success).toBe(false);
  });
});