import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, X, Loader2, Lock, Truck, RotateCcw } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";

const FREE_SHIPPING_THRESHOLD = 100000;

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    items,
    isLoading,
    isSyncing,
    updateQuantity,
    removeItem,
    getCheckoutUrl,
    syncCart,
    snapshotPendingOrder,
    markCheckoutOpened,
  } = useCartStore();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
    0,
  );
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const progress = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);

  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (!checkoutUrl) return;
    snapshotPendingOrder();
    markCheckoutOpened();
    window.open(checkoutUrl, "_blank");
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          aria-label={`Open cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
          className="relative flex h-9 items-center gap-2 text-[10px] uppercase tracking-[0.3em] transition-opacity hover:opacity-60"
        >
          <ShoppingBag className="h-4 w-4" strokeWidth={1.3} />
          <span className="hidden sm:inline">Cart</span>
          <span className="tabular-nums">({totalItems})</span>
        </button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col gap-0 border-l border-border bg-background p-0 sm:max-w-md [&>button]:hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-[10px] uppercase tracking-[0.35em]">
            Your bag <span className="text-muted-foreground">({totalItems})</span>
          </h2>
          <button aria-label="Close cart" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" strokeWidth={1.3} />
          </button>
        </div>

        {items.length > 0 && (
          <div className="border-b border-border px-6 py-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {remaining > 0
                ? `${formatPrice(remaining)} away from free shipping`
                : "You've unlocked free shipping"}
            </p>
            <div className="mt-3 h-[2px] w-full bg-border">
              <div
                className="h-full bg-foreground transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">Your bag is empty.</p>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-foreground px-8 py-3.5 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 hover:bg-foreground hover:text-background"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6">
                <ul className="divide-y divide-border">
                  {items.map((item) => (
                    <li key={item.variantId} className="flex gap-4 py-6">
                      <div className="h-28 w-24 flex-none overflow-hidden rounded-lg bg-muted">
                        {item.product.node.images.edges[0]?.node && (
                          <img
                            src={item.product.node.images.edges[0].node.url}
                            alt={item.product.node.title}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-[12px] font-medium tracking-tight">
                              {item.product.node.title}
                            </h3>
                            <button
                              aria-label={`Remove ${item.product.node.title}`}
                              onClick={() => removeItem(item.variantId)}
                              className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <X className="h-3.5 w-3.5" strokeWidth={1.3} />
                            </button>
                          </div>
                          {item.selectedOptions.length > 0 && (
                            <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                              {item.selectedOptions.map((o) => o.value).join(" · ")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 rounded-full border border-border px-3 py-1.5">
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <Minus className="h-3 w-3" strokeWidth={1.4} />
                            </button>
                            <span className="w-4 text-center text-[11px] tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              aria-label="Increase quantity"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <Plus className="h-3 w-3" strokeWidth={1.4} />
                            </button>
                          </div>
                          <span className="text-[12px] tabular-nums">
                            {formatPrice(parseFloat(item.price.amount) * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-border px-6 py-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="text-[15px] tabular-nums">{formatPrice(totalPrice)}</span>
                </div>
                <p className="mt-2 text-[10px] tracking-wide text-muted-foreground">
                  Taxes and shipping calculated at checkout.
                </p>

                <button
                  onClick={handleCheckout}
                  disabled={isLoading || isSyncing}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 text-[10px] uppercase tracking-[0.3em] text-background transition-opacity hover:opacity-85 disabled:opacity-50"
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Lock className="h-3 w-3" strokeWidth={1.5} /> Secure checkout
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-3 w-full text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground underline-offset-8 hover:underline"
                >
                  Continue shopping
                </button>

                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="flex flex-col items-center gap-2 text-center">
                    <Lock className="h-3.5 w-3.5" strokeWidth={1.2} /> Encrypted
                  </span>
                  <span className="flex flex-col items-center gap-2 text-center">
                    <Truck className="h-3.5 w-3.5" strokeWidth={1.2} /> 48h dispatch
                  </span>
                  <span className="flex flex-col items-center gap-2 text-center">
                    <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.2} /> Easy returns
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
