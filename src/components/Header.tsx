import { Link } from "@tanstack/react-router";
import { CartDrawer } from "./CartDrawer";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/85 backdrop-blur-lg">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-6 sm:px-8">
        <nav className="flex items-center gap-6 text-[10px] font-medium uppercase tracking-[0.3em] text-foreground/70">
          <Link to="/" className="transition-opacity hover:opacity-60">
            Shop
          </Link>
          <a href="/#about" className="hidden transition-opacity hover:opacity-60 sm:inline">
            About
          </a>
        </nav>
        <Link
          to="/"
          className="justify-self-center text-[11px] font-semibold uppercase tracking-[0.55em] text-foreground"
        >
          Motion Inclined
        </Link>
        <div className="flex items-center justify-end gap-4">
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}
