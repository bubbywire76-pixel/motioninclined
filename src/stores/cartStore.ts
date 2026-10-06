import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  createShopifyCart,
  addLineToShopifyCart,
  updateShopifyCartLine,
  removeLineFromShopifyCart,
  fetchCart,
  type ShopifyProduct,
} from "@/lib/shopify";
import { isComingSoon } from "@/lib/product";

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface OrderSnapshot {
  items: CartItem[];
  total: number;
  currencyCode: string;
  completedAt: number;
  paymentReference?: string;
  shopifyOrderName?: string | null;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  pendingOrder: OrderSnapshot | null;
  pendingOrderStartedAt: number | null;
  lastOrder: OrderSnapshot | null;
  orderJustCompleted: boolean;
  checkoutOpenedAt: number | null;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
  snapshotPendingOrder: () => void;
  consumeOrderCompleted: () => void;
  markCheckoutOpened: () => void;
  clearCheckoutOpened: () => void;
  completePaidOrder: (details?: {
    paidAt?: string;
    paymentReference?: string;
    shopifyOrderName?: string | null;
  }) => void;
}

// TTL for a snapshotted pending order — after this, we don't promote it to lastOrder.
const PENDING_ORDER_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// Module-scoped in-flight sync so concurrent callers coalesce.
let inflightSync: Promise<void> | null = null;

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      pendingOrder: null,
      pendingOrderStartedAt: null,
      lastOrder: null,
      orderJustCompleted: false,
      checkoutOpenedAt: null,

      snapshotPendingOrder: () => {
        const { items } = get();
        if (items.length === 0) return;
        const total = items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0);
        const currencyCode = items[0]?.price.currencyCode || "USD";
        const now = Date.now();
        set({
          pendingOrder: {
            items: items.map((i) => ({ ...i })),
            total,
            currencyCode,
            completedAt: now,
          },
          pendingOrderStartedAt: now,
        });
      },

      consumeOrderCompleted: () => set({ orderJustCompleted: false }),
      markCheckoutOpened: () => set({ checkoutOpenedAt: Date.now() }),
      clearCheckoutOpened: () => set({ checkoutOpenedAt: null }),
      completePaidOrder: (details) => {
        const { pendingOrder, items } = get();
        const source = pendingOrder ?? (items.length > 0 ? {
          items: items.map((item) => ({ ...item })),
          total: items.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0),
          currencyCode: items[0]?.price.currencyCode || "NGN",
          completedAt: Date.now(),
        } : null);
        if (!source) return;
        set({
          lastOrder: {
            ...source,
            completedAt: details?.paidAt ? new Date(details.paidAt).getTime() : Date.now(),
            paymentReference: details?.paymentReference,
            shopifyOrderName: details?.shopifyOrderName,
          },
          pendingOrder: null,
          pendingOrderStartedAt: null,
          orderJustCompleted: false,
          checkoutOpenedAt: null,
          items: [],
          cartId: null,
          checkoutUrl: null,
        });
      },

      addItem: async (item) => {
        if (isComingSoon(item.product)) return;
        const { items, cartId, clearCart } = get();
        const existingItem = items.find((i) => i.variantId === item.variantId);

        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart({ quantity: item.quantity, variantId: item.variantId });
            if (result) {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: [{ ...item, lineId: result.lineId }],
              });
            }
          } else if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            if (!existingItem.lineId) {
              console.error("Cannot update quantity for item without lineId:", existingItem);
              return;
            }
            const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
            if (result.success) {
              const currentItems = get().items;
              set({
                items: currentItems.map((i) =>
                  i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i,
                ),
              });
            } else if (result.cartNotFound) {
              clearCart();
            }
          } else {
            const result = await addLineToShopifyCart(cartId, { quantity: item.quantity, variantId: item.variantId });
            if (result.success) {
              const currentItems = get().items;
              set({ items: [...currentItems, { ...item, lineId: result.lineId ?? null }] });
            } else if (result.cartNotFound) {
              clearCart();
            }
          }
        } catch (error) {
          console.error("Failed to add item:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }

        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;

        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            const currentItems = get().items;
            set({ items: currentItems.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)) });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to update quantity:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;

        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const currentItems = get().items;
            const newItems = currentItems.filter((i) => i.variantId !== variantId);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to remove item:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () =>
        set({
          items: [],
          cartId: null,
          checkoutUrl: null,
        }),

      getCheckoutUrl: () => get().checkoutUrl,

      syncCart: async () => {
        if (inflightSync) return inflightSync;

        const run = async () => {
          const { cartId, clearCart, pendingOrder, pendingOrderStartedAt, items } = get();
          if (!cartId) return;

          set({ isSyncing: true });
          try {
            const backoffs = [0, 250, 750, 2000];
            let result: Awaited<ReturnType<typeof fetchCart>> | null = null;

            for (let attempt = 0; attempt < backoffs.length; attempt++) {
              if (backoffs[attempt] > 0) await delay(backoffs[attempt]);
              result = await fetchCart(cartId);
              if (result.ok) break;
              if (!result.retriable) break;
            }

            if (!result || !result.ok) {
              // Preserve local state; a later sync will try again.
              if (result && !result.retriable) {
                console.error("Cart sync failed (non-retriable):", result);
              } else {
                console.warn("Cart sync failed after retries:", result);
              }
              return;
            }

            const cart = result.cart;
            const cartIsGone = cart === null || cart.totalQuantity === 0;
            if (!cartIsGone) return;

            // Cart is empty or expired on Shopify's side.
            const snapshotFresh =
              pendingOrder &&
              pendingOrderStartedAt !== null &&
              Date.now() - pendingOrderStartedAt < PENDING_ORDER_TTL_MS &&
              items.length > 0;

            if (snapshotFresh) {
              set({
                lastOrder: pendingOrder,
                pendingOrder: null,
                pendingOrderStartedAt: null,
                orderJustCompleted: true,
                checkoutOpenedAt: null,
              });
            } else if (pendingOrder) {
              // Stale snapshot — drop it without promoting.
              set({ pendingOrder: null, pendingOrderStartedAt: null });
            }
            clearCart();
          } catch (error) {
            console.error("Failed to sync cart with Shopify:", error);
          } finally {
            set({ isSyncing: false });
          }
        };

        inflightSync = run().finally(() => {
          inflightSync = null;
        });
        return inflightSync;
      },
    }),
    {
      name: "shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        checkoutUrl: state.checkoutUrl,
        pendingOrder: state.pendingOrder,
        pendingOrderStartedAt: state.pendingOrderStartedAt,
        lastOrder: state.lastOrder,
        checkoutOpenedAt: state.checkoutOpenedAt,
      }),
    },
  ),
);
