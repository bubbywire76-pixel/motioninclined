import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { PaymentIcons } from "@/components/PaymentIcons";

const DESCRIPTION =
  "Your Motion Inclined account — track an order, manage returns and reach our client care team directly.";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account & Orders — Motion Inclined" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Account & Orders — Motion Inclined" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

const CARDS = [
  { to: "/track-order", title: "Track an order", copy: "Follow your parcel from dispatch to doorstep." },
  { to: "/returns", title: "Returns & exchanges", copy: "14 days on unworn pieces with tags attached." },
  { to: "/shipping", title: "Shipping", copy: "Free nationwide over ₦100,000, dispatched in 48 hours." },
  { to: "/faq", title: "FAQ", copy: "Sizing, payments, care and everything in between." },
];

function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 pb-32 pt-24 sm:px-10 sm:pb-44 sm:pt-36">
      <Reveal>
        <p className="eyebrow">Account</p>
        <h1 className="display-hd mt-8 text-[13vw] leading-[0.9] sm:text-7xl">Client care.</h1>
        <p className="mt-8 max-w-md text-sm leading-loose text-muted-foreground">
          Motion Inclined checkout is guest-first — no password required. Everything you need to
          manage a purchase lives here.
        </p>
      </Reveal>

      <div className="mt-20 grid gap-6 sm:grid-cols-2">
        {CARDS.map((c, i) => (
          <Reveal key={c.title} style={{ transitionDelay: `${i * 70}ms` }}>
            <Link
              to={c.to}
              className="group block rounded-[24px] border border-border p-10 transition-colors duration-500 hover:border-foreground"
            >
              <h2 className="text-[11px] uppercase tracking-[0.3em]">{c.title}</h2>
              <p className="mt-5 text-sm leading-loose text-muted-foreground">{c.copy}</p>
              <span className="link-underline mt-8 inline-block text-[10px] uppercase tracking-[0.3em]">
                Continue
              </span>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-20 rounded-[24px] bg-card p-10 sm:p-14">
        <p className="eyebrow">Direct line</p>
        <p className="mt-6 text-sm leading-loose text-muted-foreground">
          Prefer to talk? Message us on WhatsApp at{" "}
          <a href="https://wa.me/2347043602465" className="text-foreground underline-offset-4 hover:underline">
            +234 704 360 2465
          </a>{" "}
          or email{" "}
          <a href="mailto:bubbywire76@gmail.com" className="text-foreground underline-offset-4 hover:underline">
            bubbywire76@gmail.com
          </a>
          .
        </p>
        <PaymentIcons className="mt-10" />
      </Reveal>
    </div>
  );
}
