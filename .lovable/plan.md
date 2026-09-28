# Pre-payment delivery review

## What shoppers will see
- Add a “Review delivery details” step before Paystack opens.
- Review the entered contact/address and cart summary with Lovable AI; do not send payment credentials or payment data.
- Show missing or inconsistent details as a short, editable checklist. Shoppers can update fields and recheck, or continue when the review is clear.
- Keep the existing checkout fields, cart contents, styling, and payment behavior; AI failures must be visible and must not be presented as a successful review.

## Technical approach
- Add a TanStack server function for delivery review and keep the gateway call and `LOVABLE_API_KEY` server-side.
- Use the assigned OpenAI Responses model through the required AI SDK helpers, streaming the model response and validating its result before returning it to the cart.
- Add the server-only AI Gateway helpers and required SDK dependencies; handle terminal provider/workspace errors per gateway status semantics, with bounded backoff only for retryable 429/5xx responses.
- Gate Paystack initialization on a completed, clear review for the current details and cart; invalidate the review when either changes.

## Verification
- Check build output, then exercise the cart details/review interaction in the preview, including an issue result, corrected details, and a visible gateway failure state where available.
- Confirm Paystack cannot start until a clear review exists and existing checkout details remain editable.
