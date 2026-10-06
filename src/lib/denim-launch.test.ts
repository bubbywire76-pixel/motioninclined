import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { denimNotificationSchema } from "./denim-launch";
import { isComingSoon } from "./product";
import type { ShopifyProduct } from "./shopify";

describe("Motion Signature Denim launch", () => {
  test("Coming Soon tag blocks the purchasable state", () => {
    const product = { node: { tags: ["Coming Soon"] } } as ShopifyProduct;
    assert.equal(isComingSoon(product), true);
    assert.equal(isComingSoon({ node: { tags: [] } } as unknown as ShopifyProduct), false);
  });
  test("Notify Me accepts only the denim drop and valid email addresses", () => {
    assert.equal(denimNotificationSchema.parse({ email: " Denim@example.com ", productHandle: "motion-signature-denim" }).email, "denim@example.com");
    assert.equal(denimNotificationSchema.safeParse({ email: "bad-email", productHandle: "motion-signature-denim" }).success, false);
    assert.equal(denimNotificationSchema.safeParse({ email: "denim@example.com", productHandle: "another-product" }).success, false);
  });
});