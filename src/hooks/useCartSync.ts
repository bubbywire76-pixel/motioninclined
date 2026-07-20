import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { useCartStore } from "@/stores/cartStore";

const CHECKOUT_POLL_INTERVAL_MS = 5000;
const CHECKOUT_POLL_MAX_MS = 5 * 60 * 1000; // 5 minutes

export function useCartSync() {
  const syncCart = useCartStore((state) => state.syncCart);
  const orderJustCompleted = useCartStore((state) => state.orderJustCompleted);
  const consumeOrderCompleted = useCartStore((state) => state.consumeOrderCompleted);
  const checkoutOpenedAt = useCartStore((state) => state.checkoutOpenedAt);
  const clearCheckoutOpened = useCartStore((state) => state.clearCheckoutOpened);
  const router = useRouter();

  // Latest sync fn in a ref so listeners don't re-bind.
  const syncRef = useRef(syncCart);
  useEffect(() => {
    syncRef.current = syncCart;
  }, [syncCart]);

  useEffect(() => {
    syncRef.current();

    const trigger = () => {
      if (document.visibilityState === "visible") syncRef.current();
    };
    const onFocus = () => syncRef.current();
    const onPageShow = () => syncRef.current();

    document.addEventListener("visibilitychange", trigger);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", trigger);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  // Polling backup while a checkout is in progress.
  useEffect(() => {
    if (!checkoutOpenedAt) return;
    const elapsed = Date.now() - checkoutOpenedAt;
    if (elapsed > CHECKOUT_POLL_MAX_MS) {
      clearCheckoutOpened();
      return;
    }

    const interval = window.setInterval(() => {
      const age = Date.now() - checkoutOpenedAt;
      if (age > CHECKOUT_POLL_MAX_MS) {
        clearCheckoutOpened();
        return;
      }
      syncRef.current();
    }, CHECKOUT_POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [checkoutOpenedAt, clearCheckoutOpened]);

  useEffect(() => {
    if (orderJustCompleted) {
      consumeOrderCompleted();
      clearCheckoutOpened();
      router.navigate({ to: "/order-confirmed" });
    }
  }, [orderJustCompleted, consumeOrderCompleted, clearCheckoutOpened, router]);
}
