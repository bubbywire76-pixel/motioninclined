# Nigerian Paystack checkout

## Goal
Replace the cart’s Shopify checkout handoff with a secure Nigerian Paystack payment flow while preserving the existing catalog, cart design, and “Add to Motion” shopping experience.

## What will change
- Add a short checkout step inside the cart for the buyer’s email and delivery/contact details.
- Initialize NGN payments securely on the server using the cart’s live product prices and quantities.
- Open Paystack’s hosted Nigerian checkout for card, bank transfer, and USSD payment methods.
- Add a secure Paystack callback and server-side verification step; never trust a browser-only success message.
- Send successful customers to the existing order confirmation page and clear the paid cart.
- Show clear retry and cancellation states without losing cart contents.

## Payment and order behavior
- Paystack will collect payment in naira.
- This is payment-only: successful payments will not create Shopify orders automatically.
- Product browsing and cart line updates will continue using the existing Shopify catalog.
- A unique payment reference and a server-calculated cart summary will be included with each transaction.

## Security and setup
- Enable Lovable Cloud for secure server-side payment initialization and verification.
- Store `PAYSTACK_SECRET_KEY` securely; it will never be exposed in website code or the browser.
- Validate checkout fields and recalculate totals server-side before initializing payment.
- Verify the Paystack reference, amount, currency, and success status before showing confirmation.

## Final checks
- Test Add to Motion → cart → Paystack test payment → confirmation on desktop and mobile.
- Confirm unsuccessful or abandoned payments preserve the cart.
- Confirm the live checkout cannot be opened with a manipulated browser total.
- Confirm existing Shopify product, quantity, and cart behavior remains intact.

## Required from you
After approval, provide a Paystack secret key through the secure key form. You can copy it from **Paystack Dashboard → Settings → API Keys & Webhooks**. A test secret key is best for the first checkout test; replace it with the live secret key when ready to accept real payments.
