import { createServerFn } from "@tanstack/react-start";
import {
  bankTransferOrderSchema,
  bankTransferReportSchema,
  createBankTransferOrder,
  reportBankTransfer,
} from "./bank-transfer.server";

export const startBankTransferOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => bankTransferOrderSchema.parse(input))
  .handler(async ({ data }) => createBankTransferOrder(data));

export const confirmBankTransferSent = createServerFn({ method: "POST" })
  .inputValidator((input) => bankTransferReportSchema.parse(input))
  .handler(async ({ data }) => reportBankTransfer(data));
import { transferCheckoutSchema, transferReceiptSchema } from "./bank-transfer";
import { prepareTransfer, submitTransfer } from "./bank-transfer.server";

export const prepareBankTransfer = createServerFn({ method: "POST" }).inputValidator(input => transferCheckoutSchema.parse(input)).handler(({ data }) => prepareTransfer(data));
export const submitBankTransfer = createServerFn({ method: "POST" }).inputValidator(input => transferReceiptSchema.parse(input)).handler(({ data }) => submitTransfer(data));
