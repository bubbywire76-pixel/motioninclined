import { Link } from "@tanstack/react-router";
import { Instagram, Music2, MessageCircle } from "lucide-react";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { to: "/shop", label: "All Products" },
      { to: "/shop", label: "Drop 001" },
      { to: "/shop", label: "Collections" },
    ],
  },
  {
    title: "Motion",
    links: [
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

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1600px] px-6 py-20 sm:px-10 sm:py-28">
        <div className="grid gap-14 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.5em]">Motion Inclined</p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Move with purpose. Premium streetwear built for people who refuse to stand still.
            </p>
            <div className="mt-8 flex items-center gap-5 text-foreground/70">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="transition-opacity hover:opacity-50"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.3} />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="transition-opacity hover:opacity-50"
              >
                <Music2 className="h-4 w-4" strokeWidth={1.3} />
              </a>
              <a
                href="https://wa.me/2347043602465"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="transition-opacity hover:opacity-50"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.3} />
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                {col.title}
              </p>
              <ul className="mt-6 space-y-3.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-foreground/80 transition-opacity hover:opacity-50"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
            © {new Date().getFullYear()} Motion Inclined
          </p>
          <div className="flex flex-wrap gap-6 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            <a href="mailto:bubbywire76@gmail.com" className="hover:opacity-60">
              bubbywire76@gmail.com
            </a>
            <a href="https://wa.me/2347043602465" className="hover:opacity-60">
              +234 704 360 2465
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
