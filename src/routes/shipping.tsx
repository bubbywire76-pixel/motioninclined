import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Clause } from "@/components/LegalPage";

const DESCRIPTION =
  "Motion Inclined shipping policy — dispatch times, nationwide and international delivery, rates and free shipping over ₦100,000.";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — Motion Inclined" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Shipping Policy — Motion Inclined" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Shipping Policy"
      intro="Every order is packed by hand and dispatched with tracking. Here is exactly what to expect."
    >
      <Clause heading="Processing time">
        <p>
          Orders are processed within 48 hours of payment confirmation, Monday to Friday. Orders
          placed on weekends or public holidays are processed on the next business day. Limited-drop
          releases may require up to 5 business days.
        </p>
      </Clause>
      <Clause heading="Delivery — Nigeria">
        <p>
          Lagos: 1 — 3 business days. Other states: 2 — 5 business days. A flat rate is calculated at
          checkout based on your delivery address.
        </p>
        <p>Shipping is free on all orders over ₦100,000.</p>
      </Clause>
      <Clause heading="International delivery">
        <p>
          We ship worldwide via tracked courier. Typical transit is 7 — 14 business days. Duties and
          import taxes are determined by your destination country and are the responsibility of the
          recipient.
        </p>
      </Clause>
      <Clause heading="Tracking">
        <p>
          A tracking number is emailed as soon as your parcel leaves our facility. You can also check
          progress on our order tracking page or message us on WhatsApp at +234 704 360 2465.
        </p>
      </Clause>
      <Clause heading="Lost or delayed parcels">
        <p>
          If your order has not arrived within 10 business days of dispatch, contact
          bubbywire76@gmail.com with your order number. We will open a courier trace and, where a
          parcel is confirmed lost, replace or refund it in full.
        </p>
      </Clause>
    </LegalPage>
  ),
});
