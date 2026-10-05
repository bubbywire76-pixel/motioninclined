# Checkout and Motion Signature Denim upgrade

## Goal
Add a secure Nigerian bank-transfer option and launch the uploaded Motion Signature Denim as a non-purchasable coming-soon product, without changing the existing Motion identity or unrelated pages.

## Checkout
- Keep the current Paystack flow unchanged and add a clear payment-method choice after delivery details pass review.
- Generate a unique sequential `MOTION-XXXX` order number on the server for bank-transfer orders.
- Show the Moniepoint account details only inside the bank-transfer checkout, with a working copy action and the order number as transfer narration.
- When “I’ve Made the Transfer” is submitted, re-price the cart on the server and store the order as Bank Transfer / Pending Verification / Awaiting Payment Verification.
- Never mark a transfer paid automatically. Do not expose an admin control to shoppers; stored orders remain available for a future authenticated admin workflow.
- Add a dedicated pending-verification confirmation screen showing the order number and payment status, then clear only the submitted cart.

## Motion Signature Denim
- Upload the supplied jeans photo unchanged and create the real Shopify product at ₦150,000 with a Coming Soon tag.
- Add the supplied description and only the supplied/visible product details.
- Ensure the product card and product page show Coming Soon, never Add to Cart or Buy Now.
- Add a minimal Notify Me email form on the product page and store signups in Lovable Cloud.
- Add “The Next Motion” coming-soon feature to the homepage and include the product in the appropriate collection presentation.

## Data and security
- Add private bank-transfer order and launch-notification tables with explicit grants and row-level security.
- Validate checkout details, cart lines, and emails on the server; recalculate totals from Shopify before storing an order.
- Keep transfer order reads and status changes unavailable to anonymous visitors.
- Add focused tests for order-number formatting, pending-only transfer status, and non-purchasable coming-soon behavior.

## Verification
- Test desktop and mobile checkout flows, account-number copy, generated order narration, pending confirmation, cart clearing, product imagery, Coming Soon controls, and Notify Me persistence.
- Confirm Paystack remains available and bank-transfer orders are never represented as paid.
