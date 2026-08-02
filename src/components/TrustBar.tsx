import { Truck, ShieldCheck, RotateCcw, Sparkles } from "lucide-react";

const ITEMS = [
  { icon: Truck, label: "Free shipping over ₦100,000" },
  { icon: ShieldCheck, label: "Encrypted secure checkout" },
  { icon: RotateCcw, label: "14-day easy returns" },
  { icon: Sparkles, label: "Limited-run production" },
];

export function TrustBar() {
  return (
    <section aria-label="Store guarantees" className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-y-8 px-5 py-10 sm:px-10 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-3 px-2">
            <item.icon className="h-4 w-4 flex-none text-foreground" strokeWidth={1.2} />
            <span className="text-[9px] uppercase leading-relaxed tracking-[0.22em] text-muted-foreground sm:text-[10px]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
