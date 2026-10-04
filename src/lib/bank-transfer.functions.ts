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
