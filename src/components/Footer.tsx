import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Instagram, Music2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { PaymentIcons } from "./PaymentIcons";

const COLUMNS = [
  {
    title: "Quick Links",
    links: [
      { to: "/shop", label: "Shop" },
      { to: "/collections", label: "Collections" },
      { to: "/about", label: "About" },
      { to: "/journal", label: "Journal" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/faq", label: "FAQ" },
      { to: "/shipping", label: "Shipping" },
      { to: "/returns", label: "Returns" },
      { to: "/track-order", label: "Order Tracking" },
      { to: "/account", label: "Account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
] as const;

const SOCIALS = [
  { href: "https://instagram.com", label: "Instagram", Icon: Instagram },
  { href: "https://tiktok.com", label: "TikTok", Icon: Music2 },
  { href: "https://pinterest.com", label: "Pinterest", Icon: PinterestIcon },
  { href: "https://wa.me/2347043602465", label: "WhatsApp", Icon: MessageCircle },
];

function PinterestIcon({ className, strokeWidth }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? 1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.5 19c.6-1.6 1.3-4.2 1.6-5.6M8.8 10.4c0-2 1.6-3.6 3.7-3.6 2 0 3.4 1.3 3.4 3.2 0 2.4-1.3 4.2-3.1 4.2-.9 0-1.6-.7-1.4-1.6" />
    </svg>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    toast.success("You're on the list. Stay inclined.");
    setEmail("");
  };

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1600px] px-6 py-24 sm:px-10 sm:py-32">
        <div className="grid gap-16 lg:grid-cols-[1.5fr_repeat(3,0.8fr)_1.3fr] lg:gap-12">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.5em]">Motion Inclined</p>
            <p className="mt-7 max-w-xs text-sm leading-loose text-muted-foreground">
              More than clothing. A movement for people who refuse to stand still —
              <span className="font-serif-display italic"> move with purpose.</span>
            </p>
            <div className="mt-9 flex items-center gap-5 text-foreground/70">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="transition-opacity duration-300 hover:opacity-50"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.3} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                {col.title}
              </p>
              <ul className="mt-7 space-y-4">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="link-underline text-sm text-foreground/80 transition-opacity hover:opacity-60"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
              Newsletter
            </p>
            <p className="mt-7 text-sm leading-relaxed text-muted-foreground">
              Early access to drops, private releases and studio notes.
            </p>
            <form onSubmit={submit} className="mt-7 flex flex-col gap-3">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-full border border-border bg-background px-6 py-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              />
              <button
                type="submit"
                className="rounded-full bg-foreground py-3.5 text-[10px] uppercase tracking-[0.3em] text-background transition-opacity duration-300 hover:opacity-85"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-24 flex flex-col gap-8 border-t border-border pt-10 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
            © {new Date().getFullYear()} Motion Inclined. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            <a href="mailto:bubbywire76@gmail.com" className="hover:opacity-60">
              bubbywire76@gmail.com
            </a>
            <a href="https://wa.me/2347043602465" className="hover:opacity-60">
              +234 704 360 2465
            </a>
          </div>
          <PaymentIcons />
        </div>
      </div>
    </footer>
  );
}
