import { createServerFn } from "@tanstack/react-start";
import { denimNotificationSchema } from "./denim-launch";
import { saveDenimNotification } from "./denim-launch.server";

export const subscribeToDenimLaunch = createServerFn({ method: "POST" })
  .inputValidator((input) => denimNotificationSchema.parse(input))
  .handler(({ data }) => saveDenimNotification(data));