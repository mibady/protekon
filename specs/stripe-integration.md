# Stripe Integration — Implementation Spec

## Overview

Stage 5 of the backend-first workflow: integrate Stripe for subscription payments. Creates checkout sessions for plan signups, a billing portal for subscription management, and a webhook handler that syncs payment events to the database and triggers Inngest workflows.

## Layers

- [ ] Database: No schema changes (stripe_customer_id already on clients table)
- [x] Backend: Stripe client + 3 API routes
- [x] Frontend: Wire pricing page + settings billing tab
- [ ] AI: Not applicable

## Architecture

```
Pricing Page → POST /api/stripe/checkout → Stripe Checkout → redirect back
Settings Billing → POST /api/stripe/portal → Stripe Portal → redirect back
Stripe Events → POST /api/stripe/webhook → update DB + fire Inngest events
```

## Contract

### Stripe Client

```ts
// lib/stripe.ts
export const stripe: Stripe  // initialized with STRIPE_SECRET_KEY
export const PRICE_IDS: Record<string, string>  // plan slug → Stripe price ID
```

### API Routes

```ts
// POST /api/stripe/checkout
// Body: { planId: string }
// Returns: { url: string } (Stripe Checkout URL)

// POST /api/stripe/portal
// Returns: { url: string } (Stripe Portal URL)

// POST /api/stripe/webhook
// Body: Stripe event (raw)
// Handles: checkout.session.completed, invoice.payment_failed,
//          invoice.payment_succeeded, customer.subscription.updated,
//          customer.subscription.deleted
```

## Environment Variables (Already Provisioned)

```
STRIPE_SECRET_KEY              ✅ in .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  ✅ in .env.local
STRIPE_WEBHOOK_SECRET          ❌ needs to be added (create webhook in Stripe dashboard)
```

Note: Price IDs will use env vars (STRIPE_PRICE_STARTER, etc.) or be configured after creating products in Stripe dashboard. For now, use placeholder mapping.

## Files to Create

| # | File | Purpose |
|---|------|---------|
| 1 | `lib/stripe.ts` | Stripe client + price ID mapping |
| 2 | `app/api/stripe/checkout/route.ts` | Create checkout session |
| 3 | `app/api/stripe/portal/route.ts` | Create billing portal session |
| 4 | `app/api/stripe/webhook/route.ts` | Handle Stripe webhook events |

## Files to Modify

| # | File | Change |
|---|------|--------|
| 5 | `app/pricing/page.tsx` | Wire plan buttons to checkout API |
| 6 | `app/dashboard/settings/page.tsx` | Wire billing tab to portal API |

## Implementation Order

### Phase 1: Stripe Client (file 1)
1. Install `stripe` package
2. Create `lib/stripe.ts` with client initialization and price ID map

### Phase 2: API Routes (files 2-4)
3. `checkout/route.ts`: Authenticate user, create checkout session with plan price, redirect URL
4. `portal/route.ts`: Authenticate user, get stripe_customer_id from clients table, create portal session
5. `webhook/route.ts`: Verify signature, handle 5 event types:
   - `checkout.session.completed` → update clients.stripe_customer_id + plan + status
   - `invoice.payment_failed` → fire `billing/payment.failed` Inngest event
   - `invoice.payment_succeeded` → fire `billing/payment.succeeded` Inngest event
   - `customer.subscription.updated` → sync status to active/inactive
   - `customer.subscription.deleted` → set status to churned

### Phase 3: Wire Frontend (files 5-6)
6. Pricing page: Add client component that calls `/api/stripe/checkout` on plan selection
7. Settings billing tab: Add "Manage Subscription" button that calls `/api/stripe/portal`

## Acceptance Criteria

- [ ] `npm run build` passes
- [ ] `stripe` package installed
- [ ] Stripe client initialized with secret key
- [ ] POST /api/stripe/checkout creates session and returns URL
- [ ] POST /api/stripe/portal creates portal session for authenticated users
- [ ] POST /api/stripe/webhook verifies signature and handles all 5 event types
- [ ] Webhook updates clients table (stripe_customer_id, plan, status)
- [ ] Webhook fires Inngest events for payment.failed and payment.succeeded
- [ ] Pricing page buttons trigger checkout flow
- [ ] Settings billing tab has "Manage Subscription" button
