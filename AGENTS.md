<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep AI Gateway calls and signed checkout-review validation in `*.server.ts` helpers invoked by `*.functions.ts` server functions, so secrets and approvals remain server-side.
- Store denim launch subscriptions through a validated public server function and a server-only helper; keep subscriber reads private and duplicate submissions idempotent.
- Render the signature denim launch with a dedicated product view using the shared Shopify loader, so unreleased-product copy cannot inherit purchasable-product claims.
- Keep the denim drop announcement as a shareable /drop route reusing the dedicated denim view and product query, so imagery, price, and subscriptions remain consistent.
