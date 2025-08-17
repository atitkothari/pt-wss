# Quarterly Pricing Implementation

## Overview
This document outlines the implementation of a quarterly pricing tier at $30 for 3 months, positioned between the existing monthly ($19.99) and yearly ($16.50/month) plans.

## Changes Made

### 1. Pricing Configuration (`app/config/pricingInfo.ts`)
- Added quarterly pricing tier for regular pricing: $30.00/quarter
- Added quarterly pricing tier for limited time pricing: $22.50/quarter
- Calculated savings: 12% compared to monthly pricing
- Added proper line-through pricing and yearly equivalent calculations

### 2. Pricing Page (`app/pricing/page.tsx`)
- Updated billing toggle from binary (monthly/yearly) to three options (monthly/quarterly/yearly)
- Added quarterly pricing display with proper formatting
- Updated state management to handle three billing cycles
- Added quarterly pricing calculations and display logic
- Updated analytics tracking for quarterly pricing

### 3. Stripe Integration (`app/lib/stripe.ts`)
- Updated `createCheckoutSession` function to accept billing cycle parameter
- Changed from boolean `isYearly` to string `billingCycle: 'monthly' | 'quarterly' | 'yearly'`

### 4. Checkout Session API (`app/api/create-checkout-session/route.ts`)
- Added support for quarterly price IDs from environment variables
- Updated price selection logic to handle three billing cycles
- Added validation for quarterly price IDs

### 5. BlurredTable Component (`app/components/auth/BlurredTable.tsx`)
- Added quarterly pricing button with purple gradient styling
- Updated `handleUpgrade` function to handle quarterly billing
- Added quarterly pricing display in upgrade prompts

### 6. Analytics (`app/utils/analytics.ts`)
- Added `PRICING_QUARTERLY_CLICK` event

### 7. Plausible Analytics (`app/utils/plausible.ts`)
- Added `PricingQuarterlyClick` event

## Required Stripe Configuration

### Environment Variables
You need to add the following environment variables to your `.env` file:

```bash
# Quarterly pricing (regular)
STRIPE_QUARTERLY_PRICE_ID=price_xxxxxxxxxxxxx

# Quarterly pricing (limited time)
STRIPE_QUARTERLY_PRICE_ID_LT=price_xxxxxxxxxxxxx
```

### Stripe Product Setup
1. Create a new product in Stripe for quarterly billing
2. Set the price to $30.00
3. Set the billing interval to "every 3 months"
4. Copy the price ID and add it to your environment variables
5. Repeat for limited time pricing if needed

## Pricing Structure

### Regular Pricing
- **Monthly**: $19.99/month
- **Quarterly**: $30.00/quarter (equivalent to $120/year, saves 12% vs monthly)
- **Yearly**: $16.50/month (equivalent to $198/year, saves 17% vs monthly)

### Limited Time Pricing
- **Monthly**: $14.99/month
- **Quarterly**: $22.50/quarter (equivalent to $90/year, saves 12% vs monthly)
- **Yearly**: $8.33/month (equivalent to $99.99/year, saves 17% vs monthly)

## User Experience Changes

### Pricing Page
- Users now see three billing options instead of two
- Quarterly option is highlighted with "Save 12%" badge
- Pricing calculations automatically update based on selected billing cycle

### Upgrade Prompts
- Quarterly option appears in all upgrade prompts throughout the app
- Consistent styling and messaging across all components

## Testing Checklist

- [ ] Verify quarterly pricing displays correctly on pricing page
- [ ] Test quarterly checkout flow in Stripe
- [ ] Verify quarterly pricing appears in upgrade prompts
- [ ] Test analytics tracking for quarterly pricing clicks
- [ ] Verify quarterly subscription creation in Stripe
- [ ] Test quarterly billing cycle in Stripe dashboard

## Notes

- The quarterly pricing provides a middle ground for users who want savings but aren't ready for annual commitment
- Savings calculation: Monthly = $19.99 × 12 = $239.88, Quarterly = $30 × 4 = $120, Savings = ($239.88 - $120) / $239.88 = 12%
- All existing functionality for monthly and yearly pricing remains unchanged
- The implementation is backward compatible and doesn't affect existing subscriptions
