import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, X, Search, User, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CartDrawer } from "./CartDrawer";
import { AnnouncementBar } from "./AnnouncementBar";
import { fetchProducts, formatPrice } from "@/lib/shopify";

type NavLink = {
  to: string;
  label: string;
  menu?: { to: string; label: string; caption: string }[];
};

const LINKS: NavLink[] = [
  { to: "/", label: "Home" },
  {
    to: "/shop",
    label: "Shop",
    menu: [
      { to: "/shop", label: "All Products", caption: "The complete collection" },
      { to: "/shop", label: "Tees & Tops", caption: "Heavyweight jersey" },
      { to: "/shop", label: "Outerwear", caption: "Denim and layers" },
      { to: "/shop", label: "Accessories", caption: "Finishing pieces" },
    ],
  },
  { to: "/about", label: "About" },
  {
    to: "/collections",
    label: "Collections",
    menu: [
      { to: "/collections", label: "Chapter 37", caption: "Essentials, limited run" },
      { to: "/collections", label: "Faith Series", caption: "Believe · Pray · Growth" },
      { to: "/collections", label: "Motion Denim", caption: "Custom two-piece" },
    ],
  },
  { to: "/contact", label: "Contact" },
];

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(50),
    enabled: open,
  });

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
    else setQ("");
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return (data ?? [])
      .filter(
        (p) =>
          p.node.title.toLowerCase().includes(term) ||
          (p.node.tags ?? []).some((t: string) => t.toLowerCase().includes(term)),
      )
      .slice(0, 6);
  }, [q, data]);

  return (
    <div
      className={`fixed inset-0 z-[70] transition-all duration-500 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative mx-auto w-full bg-background px-5 pb-14 pt-8 transition-transform duration-500 ease-out sm:px-10 ${
          open ? "translate-y-0" : "-translate-y-6"
        }`}
      >
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Search</span>
            <button aria-label="Close search" onClick={onClose}>
              <X className="h-4 w-4" strokeWidth={1.3} />
            </button>
          </div>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pieces, collections…"
            className="mt-7 w-full border-b border-border bg-transparent pb-5 text-2xl font-light tracking-tight outline-none placeholder:text-muted-foreground focus:border-foreground sm:text-4xl"
          />
          <div className="mt-8 space-y-1">
            {q && results.length === 0 && (
              <p className="text-sm text-muted-foreground">No pieces match “{q}”.</p>
            )}
            {results.map((p) => (
              <Link
                key={p.node.id}
                to="/product/$handle"
                params={{ handle: p.node.handle }}
                onClick={onClose}
                className="flex items-center gap-5 rounded-2xl px-3 py-3 transition-colors hover:bg-muted"
              >
                <img
                  src={p.node.images.edges[0]?.node.url}
                  alt=""
                  className="h-16 w-14 rounded-lg object-cover"
                />
                <span className="flex-1 text-sm tracking-tight">{p.node.title}</span>
                <span className="text-[11px] text-muted-foreground">
                  {formatPrice(p.node.priceRange.minVariantPrice.amount)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const overHero = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open || search ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, search]);

  return (
    <header className="fixed inset-x-0 top-0 z-[60] w-full">
      <AnnouncementBar />
      <div
        className={`w-full transition-all duration-700 ease-out ${
          overHero
            ? "border-b border-transparent bg-transparent text-white"
            : "border-b border-border/70 bg-background/85 text-foreground backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-5 sm:h-20 sm:px-10">
          <nav className="hidden min-w-0 items-center gap-5 whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.2em] lg:flex xl:gap-7 xl:text-[10px] xl:tracking-[0.26em]">
            {LINKS.map((l) => (
              <div
                key={l.label}
                className={`group relative py-6 ${l.label === "Home" ? "hidden 2xl:block" : ""}`}
              >
                <Link
                  to={l.to}
                  className="inline-flex items-center gap-1.5 opacity-75 transition-opacity duration-300 hover:opacity-100"
                  activeProps={{ className: "opacity-100" }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                  {l.menu && <ChevronDown className="h-3 w-3" strokeWidth={1.4} />}
                </Link>
                {l.menu && (
                  <div className="pointer-events-none absolute left-1/2 top-full w-72 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-500 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="rounded-2xl border border-border bg-background p-3 text-foreground shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]">
                      {l.menu.map((m) => (
                        <Link
                          key={m.label}
                          to={m.to}
                          className="block rounded-xl px-4 py-3 transition-colors hover:bg-muted"
                        >
                          <span className="block text-[10px] tracking-[0.25em]">{m.label}</span>
                          <span className="mt-1.5 block text-[10px] normal-case tracking-normal text-muted-foreground">
                            {m.caption}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="-ml-2 flex h-9 w-9 items-center justify-center lg:hidden"
          >
            <Menu className="h-4 w-4" strokeWidth={1.4} />
          </button>

          <Link
            to="/"
            className="justify-self-center whitespace-nowrap px-4 text-[11px] font-semibold uppercase tracking-[0.5em] transition-opacity hover:opacity-60 sm:text-[13px] sm:tracking-[0.6em]"
          >
            Motion Inclined
          </Link>

          <div className="flex items-center justify-end gap-1 sm:gap-3">
            <button
              aria-label="Search"
              onClick={() => setSearch(true)}
              className="flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60"
            >
              <Search className="h-4 w-4" strokeWidth={1.4} />
            </button>
            <Link
              to="/account"
              aria-label="Account"
              className="hidden h-9 w-9 items-center justify-center transition-opacity hover:opacity-60 sm:flex"
            >
              <User className="h-4 w-4" strokeWidth={1.4} />
            </Link>
            <CartDrawer />
          </div>
        </div>
      </div>

      <SearchOverlay open={search} onClose={() => setSearch(false)} />

      {/* Mobile slide-out */}
      <div
        className={`fixed inset-0 z-[65] lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-foreground/40 transition-opacity duration-500 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-background text-foreground transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.45em]">Menu</span>
            <button aria-label="Close menu" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" strokeWidth={1.4} />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-7 pt-10">
            {LINKS.map((l, i) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: `${120 + i * 55}ms` }}
                className={`display-hd text-3xl transition-all duration-700 ${
                  open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border px-7 py-7">
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
            >
              Account & Orders
            </Link>
            <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              +234 704 360 2465
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
