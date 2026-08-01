import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { AnnouncementBar } from "./AnnouncementBar";

const LINKS = [
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/journal", label: "Journal" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full">
      <AnnouncementBar />
      <div className="w-full border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-5 sm:h-20 sm:px-10">
          <nav className="hidden items-center gap-8 text-[10px] font-medium uppercase tracking-[0.3em] text-foreground/70 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="transition-opacity duration-300 hover:opacity-50"
                activeProps={{ className: "text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center -ml-2 md:hidden"
          >
            <Menu className="h-4 w-4" strokeWidth={1.4} />
          </button>

          <Link
            to="/"
            className="justify-self-center text-[11px] font-semibold uppercase tracking-[0.5em] text-foreground transition-opacity hover:opacity-60 sm:text-[13px] sm:tracking-[0.6em]"
          >
            Motion Inclined
          </Link>

          <div className="flex items-center justify-end gap-3">
            <CartDrawer />
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex h-16 items-center justify-between px-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.5em]">Menu</span>
            <button aria-label="Close menu" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" strokeWidth={1.4} />
            </button>
          </div>
          <nav className="flex flex-col gap-8 px-6 pt-12">
            {LINKS.map((l, i) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${i * 60}ms` }}
                className="animate-fade-up display-hd text-4xl"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
