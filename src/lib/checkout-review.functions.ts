import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { checkoutReviewSchema, reviewCheckoutDetails } from "./checkout-review.server";

export const reviewCheckoutDelivery = createServerFn({ method: "POST" })
  .inputValidator((input) => checkoutReviewSchema.parse(input))
  .handler(async ({ data }) => reviewCheckoutDetails(data));

export const deliveryReviewInputSchema = z.object({ reviewToken: z.string() });