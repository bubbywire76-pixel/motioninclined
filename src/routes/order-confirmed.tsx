import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/order-confirmed")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Motion Inclined" },
      { name: "description", content: "Thank you for your order at Motion Inclined." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderConfirmed,
});

function OrderConfirmed() {
  const lastOrder = useCartStore((s) => s.lastOrder);
  const pendingOrder = useCartStore((s) => s.pendingOrder);
  const syncCart = useCartStore((s) => s.syncCart);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    if (!lastOrder && pendingOrder) {
      setFinalizing(true);
      syncCart().finally(() => setFinalizing(false));
    }
  }, [lastOrder, pendingOrder, syncCart]);

  if (!lastOrder) {
    if (finalizing) {
      return (
        <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
          <Loader2 className="mb-4 h-6 w-6 animate-spin text-muted-foreground" strokeWidth={1.5} />
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            Finalizing your order…
          </p>
        </div>
      );
    }
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-4 text-2xl font-light tracking-tight">No recent order</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          We couldn't find a recent order in this browser.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  const completed = new Date(lastOrder.completedAt);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 sm:px-8">
      <div className="mb-12 text-center">
        <CheckCircle2 className="mx-auto mb-6 h-10 w-10 text-foreground" strokeWidth={1} />
        <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          Order confirmed
        </p>
        <h1 className="mb-3 font-serif text-4xl font-light italic tracking-tight">
          Thank you.
        </h1>
        <p className="text-sm text-muted-foreground">
          Your order has been received. A confirmation email is on its way.
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {completed.toLocaleString()}
        </p>
      </div>

      <div className="border-t border-border">
        <p className="py-4 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          Your items
        </p>
        <div className="divide-y divide-border border-y border-border">
          {lastOrder.items.map((item) => (
            <div key={item.variantId} className="flex gap-6 py-6">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden bg-muted">
                {item.product.node.images.edges[0]?.node && (
                  <img
                    src={item.product.node.images.edges[0].node.url}
                    alt={item.product.node.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium">{item.product.node.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.selectedOptions.map((o) => o.value).join(" · ")}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Qty {item.quantity}
                  </p>
                </div>
              </div>
              <div className="text-sm">
                {item.price.currencyCode} {(parseFloat(item.price.amount) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between py-6">
          <span className="text-[10px] uppercase tracking-[0.4em]">Total</span>
          <span className="text-lg">
            {lastOrder.currencyCode} {lastOrder.total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <Button asChild variant="outline" className="rounded-none">
          <Link to="/">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
