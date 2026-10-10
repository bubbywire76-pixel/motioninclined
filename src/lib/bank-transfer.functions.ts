import { createServerFn } from "@tanstack/react-start";
import { transferCheckoutSchema, transferReceiptSchema } from "./bank-transfer";
import { prepareTransfer, submitTransfer } from "./bank-transfer.server";

export const prepareBankTransfer = createServerFn({ method: "POST" }).inputValidator(input => transferCheckoutSchema.parse(input)).handler(({ data }) => prepareTransfer(data));
export const submitBankTransfer = createServerFn({ method: "POST" }).inputValidator(input => transferReceiptSchema.parse(input)).handler(({ data }) => submitTransfer(data));