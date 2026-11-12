# AI modification proposals — frontend QA

## Architecture decisions

- The browser calls only Next.js `/api/ai/...` handlers. Auth.js supplies the bearer token server-side.
- Modification mode is explicit; no keyword or regular-expression intent detection is used.
- Proposal cards are restored by joining `assistantMessageId` with the persisted assistant message.
- A proposal without a matching loaded message is ignored safely. It appears when that paginated message is loaded.
- There is no local `REJECTED` simulation because the backend has no reject endpoint. Pending cards expose only `Appliquer`.
- APPLY sends only `proposalId` in the URL. The browser never sends types, targets, old values or new values.
- After APPLY, the complete Business Plan is fetched again. Proposal changes are never replayed into local BP state.

## Manual QA checklist

- [ ] Enable modification mode and send a simple request.
- [ ] Confirm the deferred conversation is created only on first send.
- [ ] Confirm the proposal card appears after its assistant message.
- [ ] Verify all old/new values and human-readable labels.
- [ ] Verify MGA formatting includes `Ar` and COUNT uses integer formatting.
- [ ] Apply a proposal successfully and verify the card becomes APPLIED.
- [ ] Verify the complete BP editor reflects backend values after APPLY.
- [ ] Verify financial indicators refresh for price and sales-count changes.
- [ ] Verify a text-only change reloads the BP without an unnecessary financial request.
- [ ] Verify repeated clicks cannot submit APPLY twice.
- [ ] Reload the browser and verify APPLIED cards are restored in the right positions.
- [ ] Verify CLARIFICATION_REQUIRED renders as an assistant message and modification mode stays enabled.
- [ ] Verify UNSUPPORTED renders as an assistant message and modification mode stays enabled.
- [ ] Verify EXPIRED and REJECTED cards are read-only.
- [ ] Change the same BP value manually, then APPLY and verify the dedicated 409 guidance.
- [ ] Verify a multi-change proposal has one atomic Apply button.
- [ ] Verify project name, both descriptions and short-term objective proposals.
- [ ] Verify offer price and first-year sales-count proposals.
- [ ] Verify long detailed descriptions expand without breaking layout.
- [ ] Verify mobile fullscreen layout, focus visibility and minimum button sizes.
- [ ] Verify pending, applied, expired and error states in dark mode.
- [ ] Verify an autosave timer cannot overwrite the server result after APPLY.
- [ ] Verify no JWT, Authorization header or session token is logged or stored client-side.
