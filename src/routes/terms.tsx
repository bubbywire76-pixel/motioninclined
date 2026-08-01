import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Clause } from "@/components/LegalPage";

const DESCRIPTION =
  "The terms and conditions governing purchases from and use of the Motion Inclined online store.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Motion Inclined" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Terms & Conditions — Motion Inclined" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="By using this website or placing an order you agree to the terms set out below."
    >
      <Clause heading="Orders">
        <p>
          An order is an offer to buy. It is accepted once we confirm dispatch. We may decline or
          cancel an order where an item is out of stock, a pricing error has occurred, or payment
          cannot be verified — in which case you are refunded in full.
        </p>
      </Clause>
      <Clause heading="Pricing">
        <p>
          All prices are shown in Nigerian Naira (NGN) and are inclusive of applicable taxes unless
          stated otherwise. Prices may change without notice; the price at the time of order applies.
        </p>
      </Clause>
      <Clause heading="Product presentation">
        <p>
          We photograph every piece as accurately as possible. Slight variation in colour and finish
          between screens and physical garments is normal and is not a defect.
        </p>
      </Clause>
      <Clause heading="Intellectual property">
        <p>
          All Motion Inclined names, logos, graphics, photography and copy are our property. They may
          not be reproduced, resold or used commercially without written permission.
        </p>
      </Clause>
      <Clause heading="Limitation of liability">
        <p>
          Our liability in relation to any order is limited to the value of that order. We are not
          liable for indirect or consequential loss to the extent permitted by law.
        </p>
      </Clause>
      <Clause heading="Governing law">
        <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>
      </Clause>
    </LegalPage>
  ),
});
