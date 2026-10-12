import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Reveal } from "@/components/Reveal";

const DESCRIPTION =
  "Track your Motion Inclined order — enter your order number and email to get a live delivery update.";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Order Tracking — Motion Inclined" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Order Tracking — Motion Inclined" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const [order, setOrder] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order.trim() || !email.includes("@")) {
      toast.error("Enter your order number and the email used at checkout.");
      return;
    }
    const body = `Order number: ${order}\nEmail: ${email}\n\nPlease send me a delivery update.`;
    window.location.href = `https://wa.me/2347043602465?text=${encodeURIComponent(body)}`;
    toast.success("Opening WhatsApp — we'll confirm your status shortly.");
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 sm:py-40">
      <Reveal>
        <p className="text-[9px] uppercase tracking-[0.45em] text-muted-foreground">Support</p>
        <h1 className="display-hd mt-6 text-4xl sm:text-6xl">Track your order</h1>
        <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
          Enter the order number from your confirmation email. Our team responds with a live courier
          update, usually within minutes during business hours.
        </p>
      </Reveal>

      <Reveal delay={120}>
        <form onSubmit={submit} className="mt-14 space-y-5 rounded-3xl border border-border p-8 sm:p-12">
          <div>
            <label
              htmlFor="order"
              className="mb-2 block text-[9px] uppercase tracking-[0.3em] text-muted-foreground"
            >
              Order number
            </label>
            <input
              id="order"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="#1024"
              className="w-full rounded-full border border-border bg-background px-5 py-3.5 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div>
            <label
              htmlFor="track-email"
              className="mb-2 block text-[9px] uppercase tracking-[0.3em] text-muted-foreground"
            >
              Email
            </label>
            <input
              id="track-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-border bg-background px-5 py-3.5 text-sm outline-none focus:border-foreground"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-foreground py-4 text-[10px] uppercase tracking-[0.3em] text-background transition-opacity hover:opacity-85"
          >
            Track order
          </button>
        </form>
      </Reveal>

      <p className="mt-10 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Prefer email?{" "}
        <Link to="/contact" className="text-foreground underline-offset-8 hover:underline">
          Contact us
        </Link>
      </p>
    </div>
  );
}
