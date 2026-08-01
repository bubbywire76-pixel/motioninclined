import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const DESCRIPTION =
  "Answers to common Motion Inclined questions — sizing, shipping, returns, payment and drop releases.";

const FAQS = [
  {
    q: "How do Motion Inclined pieces fit?",
    a: "Our tees and long sleeves are cut with a relaxed, boxy shoulder. If you prefer a closer fit, size down one. Outerwear is true to size with room to layer.",
  },
  {
    q: "How long does delivery take?",
    a: "Lagos deliveries arrive in 1 — 3 business days, other Nigerian states in 2 — 5, and international orders in 7 — 14 business days after dispatch.",
  },
  {
    q: "Is shipping free?",
    a: "Yes — shipping is free on every order over ₦100,000. Below that, a flat rate is calculated at checkout.",
  },
  {
    q: "Can I return or exchange an item?",
    a: "You have 14 days from delivery to request a return on unworn pieces with tags attached. First size exchanges within Nigeria are free.",
  },
  {
    q: "What payment methods do you accept?",
    a: "All major debit and credit cards, plus bank transfer, through our encrypted checkout. We never store your card details.",
  },
  {
    q: "Will sold-out pieces be restocked?",
    a: "Collections are produced in limited runs. Some staples return in future drops, but graphics are generally one-time releases.",
  },
  {
    q: "How should I care for my garments?",
    a: "Cold machine wash inside out with like colours, no bleach, hang dry away from direct sunlight, and iron on the reverse of any print.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Motion Inclined" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "FAQ — Motion Inclined" },
      { property: "og:description", content: DESCRIPTION },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-24 sm:py-40">
      <Reveal>
        <p className="text-[9px] uppercase tracking-[0.45em] text-muted-foreground">Support</p>
        <h1 className="display-hd mt-6 text-4xl sm:text-7xl">Questions</h1>
      </Reveal>

      <div className="mt-16 border-t border-border">
        {FAQS.map((f, i) => (
          <div key={f.q} className="border-b border-border">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-7 text-left transition-opacity hover:opacity-60"
              aria-expanded={open === i}
            >
              <span className="text-base sm:text-lg">{f.q}</span>
              <Plus
                className={`h-4 w-4 shrink-0 transition-transform duration-500 ${
                  open === i ? "rotate-45" : ""
                }`}
                strokeWidth={1.3}
              />
            </button>
            <div
              className={`grid transition-all duration-500 ease-out ${
                open === i ? "grid-rows-[1fr] pb-8 opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <p className="overflow-hidden text-sm leading-loose text-muted-foreground">{f.a}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.3em]">
        <Link to="/contact" className="underline-offset-8 hover:underline">
          Contact us →
        </Link>
        <Link to="/track-order" className="underline-offset-8 hover:underline">
          Track an order →
        </Link>
      </div>
    </div>
  );
}
