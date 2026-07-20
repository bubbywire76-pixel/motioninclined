
## Goal

Make `syncCart` resilient so the `/order-confirmed` page reliably loads after a Shopify checkout, even under flaky network conditions, transient API errors, stale cart IDs, or when the user takes a while to return from the checkout tab.

## Problems in the current implementation

1. **Silent failure on network / HTTP errors.** `fetchCart` throws → caught → nothing happens. Next `visibilitychange` might not re-fire (e.g. user comes back to an already-visible tab). Order completion is missed.
2. **No retry.** A single 5xx or transient fetch failure means we never learn the cart is empty.
3. **Stale `cartId` isn't detected.** If Shopify returns `cart: null` (expired/purged cart) we `return` early instead of treating it like a completed/reset cart.
4. **Race on `isSyncing`.** Guard is set inside the same async fn, so two near-simultaneous calls (initial mount + visibility) can both pass the check before either sets the flag.
5. **`pendingOrder` never expires.** A snapshot taken 3 days ago will still fire "order completed" the next time the cart happens to be empty (e.g. after manual removal).
6. **No completion signal when user never returns to the tab.** If they close the checkout tab, `visibilitychange` on the storefront tab may not fire until they refocus much later; no polling backup.
7. **Confirmation page has no self-heal.** If the user lands on `/order-confirmed` directly (e.g. bookmark, refresh) with a stale `pendingOrder` but no `lastOrder`, it shows "No recent order" instead of attempting one sync.

## Changes

### `src/lib/shopify.ts`
- Update `fetchCart` to return a discriminated result: `{ ok: true; cart: {...} | null } | { ok: false; retriable: boolean; status?: number }` instead of throwing. 402/4xx = non-retriable, network error / 5xx / timeout = retriable.
- Add an `AbortSignal` + 8s timeout to the underlying fetch for `CART_QUERY` only (via an internal helper), so a hanging request can't wedge sync.

### `src/stores/cartStore.ts`
- Add `pendingOrderStartedAt: number | null` and treat `pendingOrder` as valid only for ~2 hours; expire otherwise on next sync.
- In `snapshotPendingOrder`: also stamp `pendingOrderStartedAt`.
- Rewrite `syncCart`:
  - Guard concurrency with a module-scoped in-flight `Promise` (not just a state flag), so callers awaiting a sync all resolve together.
  - Retry `fetchCart` up to 3 times with exponential backoff (250ms, 750ms, 2s) for retriable failures.
  - Handle three outcomes:
    - `cart == null` (Shopify has no such cart anymore) → treat same as empty: if a fresh `pendingOrder` exists, promote to `lastOrder` + set `orderJustCompleted`; then `clearCart()`.
    - `cart.totalQuantity === 0` → same completion path.
    - `cart.totalQuantity > 0` → do nothing; keep local state.
  - If `pendingOrder` is older than the TTL, drop it without promoting.
  - On terminal non-retriable failure, log but do not clear state.
- Add `checkoutOpenedAt: number | null` to gate polling.
- Add `startCheckoutPolling()` action: after checkout is opened, poll `syncCart` every 5s for up to 5 minutes (cleared once `orderJustCompleted` is true or the window is unfocused-then-refocused). Also stops when component unmounts.

### `src/components/CartDrawer.tsx`
- After `window.open(checkoutUrl, "_blank")`, call `snapshotPendingOrder()` (already done) **and** `startCheckoutPolling()`.

### `src/hooks/useCartSync.ts`
- Keep initial mount sync + `visibilitychange` sync.
- Also sync on `focus` (covers cases where visibility doesn't change but the tab regains focus).
- Also sync on `pageshow` (bfcache restore after coming back from checkout).
- Manage the checkout polling interval driven by `checkoutOpenedAt`.

### `src/routes/order-confirmed.tsx`
- On mount, if `!lastOrder && pendingOrder`, call `syncCart()` once and show a brief "Finalizing your order…" state before falling back to the "No recent order" message.

## Technical notes

- The 2h `pendingOrder` TTL avoids false positives if the user abandons checkout, manually empties the cart the next day, then triggers a sync.
- The polling backup is capped (5 min, 5s interval = 60 calls max) and stops on first successful completion. Storefront API rate limits comfortably allow this.
- All timers are cleared on unmount and when `orderJustCompleted` flips true.
- No changes to add/update/remove cart flows — this only touches sync and completion detection.
