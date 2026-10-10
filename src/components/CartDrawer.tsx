import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, X, Loader2, Lock, Truck, RotateCcw, ArrowLeft, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BANK_ACCOUNT, type TransferOrder } from "@/lib/bank-transfer";
import { prepareBankTransfer, submitBankTransfer } from "@/lib/bank-transfer.functions";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";
import { initializePaystackCheckout } from "@/lib/paystack.functions";
import { reviewCheckoutDelivery } from "@/lib/checkout-review.functions";
import { useServerFn } from "@tanstack/react-start";

const FREE_SHIPPING_THRESHOLD = 100000;

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "details" | "transfer" | "pending">("cart");
  const [transfer, setTransfer] = useState<TransferOrder | null>(null);
  const [copied, setCopied] = useState(false);
  const prepareBank = useServerFn(prepareBankTransfer);
  const submitBank = useServerFn(submitBankTransfer);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isStartingPayment, setIsStartingPayment] = useState(false);
  const [isReviewingDelivery, setIsReviewingDelivery] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewIssues, setReviewIssues] = useState<string[]>([]);
  const [reviewToken, setReviewToken] = useState<string | null>(null);
  const [reviewedCheckoutKey, setReviewedCheckoutKey] = useState<string | null>(null);
  const [details, setDetails] = useState({ name: "", email: "", phone: "+234", address: "", city: "", state: "" });
  const startPaystackCheckout = useServerFn(initializePaystackCheckout);
  const reviewCheckout = useServerFn(reviewCheckoutDelivery);
  const {
    items,
    isLoading,
    isSyncing,
    updateQuantity,
    removeItem,
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
  const reviewItems = items.map((item) => ({
    variantId: item.variantId,
    productName: item.product.node.title,
    variantTitle: item.variantTitle,
    quantity: item.quantity,
  }));
  const checkoutReviewKey = JSON.stringify({ ...details, items: reviewItems });
  const isReviewCurrent = Boolean(reviewToken && reviewedCheckoutKey === checkoutReviewKey);

  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  useEffect(() => {
    setReviewError(null);
    setReviewIssues([]);
    setReviewToken(null);
    setReviewedCheckoutKey(null);
  }, [checkoutReviewKey]);

  const handleCheckout = () => {
    setCheckoutError(null);
    setCheckoutStep("details");
  };

  const handleBankTransfer = async () => {
    if (!isReviewCurrent || !reviewToken) return;
    setCheckoutError(null);
    setIsStartingPayment(true);
    try {
      const order = await prepareBank({ data: { ...details, reviewToken, items: items.map(item => ({ variantId: item.variantId, quantity: item.quantity })) } });
      setTransfer(order);
      setCheckoutStep("transfer");
    } catch (error) { setCheckoutError(error instanceof Error ? error.message : "Transfer checkout could not be started."); }
    finally { setIsStartingPayment(false); }
  };

  const handleTransferSubmitted = async () => {
    if (!transfer) return;
    setCheckoutError(null);
    setIsStartingPayment(true);
    try {
      await submitBank({ data: { id: transfer.id, token: transfer.token } });
      setCheckoutStep("pending");
      // Only remove the lines submitted with this transfer; preserve later cart additions.
      const submitted = useCartStore.getState().items;
      for (const item of submitted) await removeItem(item.variantId);
    } catch (error) { setCheckoutError(error instanceof Error ? error.message : "Transfer submission failed. Please try again."); }
    finally { setIsStartingPayment(false); }
  };

  const handleDetailsChange = (field: keyof typeof details, value: string) => {
    setDetails((current) => ({ ...current, [field]: value }));
    setReviewError(null);
    setReviewIssues([]);
    setReviewToken(null);
    setReviewedCheckoutKey(null);
  };

  const handleReviewDetails = async () => {
    setReviewError(null);
    setCheckoutError(null);
    setReviewIssues([]);
    setReviewToken(null);
    setReviewedCheckoutKey(null);
    setIsReviewingDelivery(true);
    try {
      const result = await reviewCheckout({ data: { ...details, items: reviewItems } });
      if (!result.ok) {
        setReviewError(result.error ?? "Delivery details could not be reviewed.");
        return;
      }
      setReviewIssues(result.issues);
      if (result.clear && result.reviewToken) {
        setReviewToken(result.reviewToken);
        setReviewedCheckoutKey(checkoutReviewKey);
      }
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Delivery details could not be reviewed.");
    } finally {
      setIsReviewingDelivery(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!reviewToken || reviewedCheckoutKey !== checkoutReviewKey) {
      setCheckoutError("Review your delivery details again before payment.");
      return;
    }
    setCheckoutError(null);
    setIsStartingPayment(true);
    try {
      const result = await startPaystackCheckout({
        data: {
          ...details,
          items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
          reviewToken,
        },
      });
      if (!result.ok) {
        setCheckoutError(result.error);
        return;
      }
      snapshotPendingOrder();
      markCheckoutOpened();
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Payment could not be started. Please try again.");
    } finally {
      setIsStartingPayment(false);
    }
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
           <div className="flex items-center gap-3">
             {checkoutStep === "details" && (
               <button aria-label="Back to bag" onClick={() => setCheckoutStep("cart")}>
                 <ArrowLeft className="h-4 w-4" strokeWidth={1.3} />
               </button>
             )}
             <h2 className="text-[10px] uppercase tracking-[0.35em]">
               {checkoutStep === "details" ? "Delivery details" : checkoutStep === "transfer" ? "Bank transfer" : checkoutStep === "pending" ? "Payment verification" : "Your bag"} {checkoutStep === "cart" && <span className="text-muted-foreground">({totalItems})</span>}
             </h2>
           </div>
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
           {(checkoutStep === "transfer" || checkoutStep === "pending") && transfer ? (
             <div className="flex-1 overflow-y-auto px-6 py-7">
               {checkoutStep === "pending" ? <>
                 <Check className="mb-6 h-6 w-6" />
                 <h3 className="display-hd text-3xl">Payment verification pending</h3>
                 <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Thank you. Your transfer details have been submitted. We'll verify your payment and begin processing your order once payment has been confirmed.</p>
                 <dl className="mt-8 space-y-5 border-y border-border py-6 text-sm"><div><dt className="text-muted-foreground">Order Number</dt><dd className="mt-1">{transfer.orderNumber}</dd></div><div><dt className="text-muted-foreground">Payment Method</dt><dd className="mt-1">Bank Transfer</dd></div><div><dt className="text-muted-foreground">Payment Status</dt><dd className="mt-1">Pending Verification</dd></div><div><dt className="text-muted-foreground">Order Status</dt><dd className="mt-1">Awaiting Payment Verification</dd></div></dl>
                 <Button variant="outline" className="mt-8 w-full" onClick={() => { setIsOpen(false); setCheckoutStep("cart"); }}>Continue shopping</Button>
               </> : <>
                 <p className="text-sm leading-relaxed text-muted-foreground">Make a direct transfer from your local bank or any Nigerian financial institution. Your order will be confirmed once payment has been verified.</p>
                 <div className="mt-7 border-y border-border py-6"><p className="eyebrow">Order number / Transfer narration</p><p className="mt-3 text-xl">{transfer.orderNumber}</p><p className="mt-6 text-[10px] uppercase text-muted-foreground">Exact order amount</p><p className="mt-2 text-2xl">{formatPrice(transfer.amount)}</p></div>
                 <dl className="mt-7 space-y-6"><div><dt className="eyebrow">Account name</dt><dd className="mt-2 text-base">{BANK_ACCOUNT.name}</dd></div><div><dt className="eyebrow">Account number</dt><dd className="mt-2 flex items-center justify-between gap-3"><span className="text-2xl tabular-nums">{BANK_ACCOUNT.number}</span><Button variant="outline" size="icon" aria-label="Copy Account Number" title="Copy Account Number" onClick={async () => { try { await navigator.clipboard.writeText(BANK_ACCOUNT.number); setCopied(true); } catch { setCheckoutError("Copy unavailable. Please copy the account number manually."); } }}><Copy /></Button></dd>{copied && <p role="status" className="mt-2 text-xs text-muted-foreground">Account number copied.</p>}</div><div><dt className="eyebrow">Bank</dt><dd className="mt-2 text-base">{BANK_ACCOUNT.bank}</dd></div></dl>
                 <p className="mt-7 text-sm leading-relaxed text-muted-foreground">Transfer the exact order amount to the account above using your preferred Nigerian bank or financial institution.</p>
                 <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Please use your Order Number as the transfer narration/reference.</p>
                 {checkoutError && <p role="alert" className="mt-5 text-sm text-destructive">{checkoutError}</p>}
                 <Button onClick={handleTransferSubmitted} disabled={isStartingPayment} className="mt-8 h-12 w-full text-[10px] uppercase">{isStartingPayment ? <Loader2 className="animate-spin" /> : "I've Made the Transfer"}</Button>
                 <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Submitting does not confirm receipt of payment.</p>
               </>}
             </div>
           ) : checkoutStep === "details" ? (
              <form onSubmit={(event) => { event.preventDefault(); void handleReviewDetails(); }} className="flex min-h-0 flex-1 flex-col">
               <div className="flex-1 overflow-y-auto px-6 py-6">
                 <p className="text-sm leading-relaxed text-muted-foreground">
                   Choose direct bank transfer or pay securely by card and USSD with Paystack. Bank transfers remain pending until verified.
                 </p>
                 <div className="mt-7 space-y-4">
                   {([
                     ["name", "Full name", "Ada Lovelace", "text"],
                     ["email", "Email address", "you@example.com", "email"],
                     ["phone", "WhatsApp phone", "+2347043602465", "tel"],
                     ["address", "Delivery address", "Street and house number", "text"],
                     ["city", "City", "Lagos", "text"],
                     ["state", "State", "Lagos", "text"],
                   ] as const).map(([field, label, placeholder, type]) => (
                     <label key={field} className="block">
                       <span className="mb-2 block text-[9px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
                       <input
                         required
                         type={type}
                         value={details[field]}
                         onChange={(event) => handleDetailsChange(field, event.target.value)}
                         placeholder={placeholder}
                         className="w-full border-b border-border bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground"
                       />
                     </label>
                   ))}
                 </div>
                  {reviewIssues.length > 0 && (
                    <div aria-live="polite" className="mt-6 border-l-2 border-destructive pl-4">
                      <p className="text-[10px] uppercase tracking-[0.22em]">Please check these details</p>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                        {reviewIssues.map((issue, index) => <li key={`${index}-${issue}`}>{issue}</li>)}
                      </ul>
                    </div>
                  )}
                  {isReviewCurrent && reviewIssues.length === 0 && (
                    <p aria-live="polite" className="mt-5 text-sm text-muted-foreground">Delivery details reviewed. You can continue to payment.</p>
                  )}
                  {reviewError && <p role="alert" className="mt-5 text-sm text-destructive">{reviewError}</p>}
                  {checkoutError && <p role="alert" className="mt-5 text-sm text-destructive">{checkoutError}</p>}
               </div>
               <div className="border-t border-border px-6 py-6">
                 <div className="flex items-baseline justify-between">
                   <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Total</span>
                   <span className="text-[15px] tabular-nums">{formatPrice(totalPrice)}</span>
                 </div>
                  <button
                    type="submit"
                    disabled={isReviewingDelivery || isStartingPayment || isLoading || isSyncing}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-foreground py-4 text-[10px] uppercase tracking-[0.3em] transition-opacity hover:opacity-70 disabled:opacity-50"
                  >
                    {isReviewingDelivery ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Reviewing details</> : "Review delivery details"}
                  </button>
                  <button
                    type="button"
                    onClick={handlePaymentSubmit}
                    disabled={!isReviewCurrent || reviewIssues.length > 0 || isReviewingDelivery || isStartingPayment || isLoading || isSyncing}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 text-[10px] uppercase tracking-[0.3em] text-background transition-opacity hover:opacity-85 disabled:opacity-40"
                  >
                    {isStartingPayment ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Lock className="h-3 w-3" strokeWidth={1.5} /> Pay securely with Paystack</>}
                  </button>
                  <p className="mt-3 text-center text-[10px] leading-relaxed text-muted-foreground">Your delivery information is checked before secure payment.</p>
                  <Button type="button" variant="outline" onClick={handleBankTransfer} disabled={!isReviewCurrent || isReviewingDelivery || isStartingPayment || isLoading || isSyncing} className="mt-4 h-12 w-full rounded-none text-[10px] uppercase">Pay via bank transfer</Button>
               </div>
             </form>
           ) : items.length === 0 ? (
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
