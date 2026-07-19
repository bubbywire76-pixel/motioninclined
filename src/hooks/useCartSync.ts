import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { useCartStore } from "@/stores/cartStore";

export function useCartSync() {
  const syncCart = useCartStore((state) => state.syncCart);
  const orderJustCompleted = useCartStore((state) => state.orderJustCompleted);
  const consumeOrderCompleted = useCartStore((state) => state.consumeOrderCompleted);
  const router = useRouter();

  useEffect(() => {
    syncCart();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") syncCart();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [syncCart]);

  useEffect(() => {
    if (orderJustCompleted) {
      consumeOrderCompleted();
      router.navigate({ to: "/order-confirmed" });
    }
  }, [orderJustCompleted, consumeOrderCompleted, router]);
}
