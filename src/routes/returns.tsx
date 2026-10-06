import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Clause } from "@/components/LegalPage";

const DESCRIPTION =
  "Motion Inclined return and exchange policy — 14-day returns on unworn pieces, exchange process and refund timelines.";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Return Policy — Motion Inclined" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Return Policy — Motion Inclined" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Return Policy"
      intro="We want the fit to be right. If a piece isn't for you, here's how to send it back."
    >
      <Clause heading="Return window">
        <p>
          You may request a return within 14 days of delivery. Pieces must be unworn, unwashed, and
          returned with all original tags and packaging intact.
        </p>
      </Clause>
      <Clause heading="How to start a return">
        <p>
          Email bubbywire76@gmail.com or message +234 704 360 2465 on WhatsApp with your order number
          and reason for return. We will confirm the return address and issue instructions within one
          business day.
        </p>
      </Clause>
      <Clause heading="Exchanges">
        <p>
          Size exchanges are free within Nigeria on your first request per order, subject to stock
          availability. Where your size has sold out, we issue a full refund or store credit.
        </p>
      </Clause>
      <Clause heading="Refunds">
        <p>
          Approved refunds are issued to the original payment method within 5 — 10 business days of us
          receiving and inspecting the item. Original shipping charges are non-refundable unless the
          item arrived faulty or incorrect.
        </p>
      </Clause>
      <Clause heading="Faulty or incorrect items">
        <p>
          If your order arrives damaged or is not what you ordered, contact us within 48 hours with
          photographs. We cover return shipping and prioritise a replacement.
        </p>
      </Clause>
      <Clause heading="Non-returnable items">
        <p>
          Headwear and accessories worn against the skin, plus final-sale and archive pieces, cannot
          be returned unless faulty.
        </p>
      </Clause>
    </LegalPage>
  ),
});
