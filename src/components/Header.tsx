import { Link } from "@tanstack/react-router";
import { CartDrawer } from "./CartDrawer";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-3xl font-light tracking-[0.15em] uppercase" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          Motion Inclined
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium sm:flex">
          <Link to="/" className="transition-colors hover:text-muted-foreground" activeProps={{ className: "text-brand" }}>
            Shop
          </Link>
          <a href="#about" className="transition-colors hover:text-muted-foreground">
            About
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}
