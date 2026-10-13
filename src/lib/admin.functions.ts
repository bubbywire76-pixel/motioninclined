import { createServerFn } from "@tanstack/react-start";
import {
  getAdminSession,
  listAdminOrders,
  updateAdminOrderStatus,
  updateOrderStatusSchema,
} from "./admin.server";

export const fetchAdminSession = createServerFn({ method: "GET" }).handler(async () => getAdminSession());

export const fetchAdminOrders = createServerFn({ method: "GET" }).handler(async () => listAdminOrders());

export const setAdminOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((input) => updateOrderStatusSchema.parse(input))
  .handler(async ({ data }) => updateAdminOrderStatus(data));
