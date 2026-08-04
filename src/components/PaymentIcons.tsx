const METHODS = ["Visa", "Mastercard", "Verve", "Paystack", "Transfer"];

export function PaymentIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {METHODS.map((m) => (
        <span
          key={m}
          className="rounded-md border border-border px-2.5 py-1.5 text-[8px] uppercase tracking-[0.25em] text-muted-foreground"
        >
          {m}
        </span>
      ))}
    </div>
  );
}
