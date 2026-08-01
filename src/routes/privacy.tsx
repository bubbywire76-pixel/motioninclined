import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Clause } from "@/components/LegalPage";

const DESCRIPTION =
  "How Motion Inclined collects, uses and protects your personal information when you shop with us.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Motion Inclined" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Privacy Policy — Motion Inclined" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="Your data is handled with the same care as our garments — deliberately and minimally."
    >
      <Clause heading="Information we collect">
        <p>
          When you place an order we collect your name, email address, phone number, delivery address
          and order contents. Payment card details are handled entirely by our payment processor and
          are never stored on our systems.
        </p>
      </Clause>
      <Clause heading="How we use it">
        <p>
          To process and deliver orders, provide customer support, prevent fraud, and — where you
          have opted in — send you drop announcements. We do not sell your data.
        </p>
      </Clause>
      <Clause heading="Cookies">
        <p>
          We use essential cookies to keep your cart and session working, and privacy-respecting
          analytics to understand which pages perform. You can block cookies in your browser; core
          checkout functionality may be affected.
        </p>
      </Clause>
      <Clause heading="Sharing">
        <p>
          We share only what is necessary with our payment processor, e-commerce platform and courier
          partners so your order can be fulfilled.
        </p>
      </Clause>
      <Clause heading="Your rights">
        <p>
          You may request access to, correction of, or deletion of your personal data at any time by
          emailing bubbywire76@gmail.com. We respond within 30 days.
        </p>
      </Clause>
      <Clause heading="Retention">
        <p>
          Order records are retained for as long as required by applicable tax and accounting law.
          Marketing data is deleted on unsubscribe request.
        </p>
      </Clause>
    </LegalPage>
  ),
});
