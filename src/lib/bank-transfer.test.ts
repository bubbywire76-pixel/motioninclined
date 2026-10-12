import { test } from "node:test";
import assert from "node:assert/strict";
import { BANK_ACCOUNT, TRANSFER_STATUS } from "./bank-transfer";

test("Transfer uses Mathew Autor Iji's Moniepoint account", () => {
  assert.deepEqual(BANK_ACCOUNT, { name: "Mathew Autor Iji", number: "5253265702", bank: "Moniepoint MFB" });
});
test("Shopper transfer submissions remain pending, never paid", () => {
  assert.deepEqual(TRANSFER_STATUS, { payment_method: "Bank Transfer", payment_status: "Pending Verification", order_status: "Awaiting Payment Verification" });
});