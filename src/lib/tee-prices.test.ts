import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchProductByHandle } from "./shopify";

for (const [handle, price] of [
  ["pray-tee", 40000],
  ["believe-tee", 45000],
  ["human-being-long-sleeve", 55000],
] as const) {
  test(`Shopify ${handle} has the approved price on every size`, async () => {
    const product = await fetchProductByHandle(handle);
    assert.ok(product);
    assert.equal(Number(product.priceRange.minVariantPrice.amount), price);
    assert.equal(product.variants.edges.length, 4);
    for (const { node: variant } of product.variants.edges) {
      assert.equal(Number(variant.price.amount), price);
    }
  });
}