# Pricing Popup Feature

## Overview
The Pricing Popup is a new component that displays a 25% off coupon offer (LABORDAY25) to users. It automatically appears in two scenarios:
1. After 5 seconds on the pricing page
2. After 2 seconds when users see a blurred table with paywall

**Note**: The popup only shows for signed-in users who are not premium subscribers.

## Components

### PricingPopup.tsx
The main popup component that displays:
- 25% off coupon code (LABORDAY25)
- Updated pricing for all tiers (monthly, quarterly, yearly)
- Feature list
- Upgrade button that redirects to Stripe checkout

### PricingPopupContext.tsx
Context provider that manages the popup state globally across the application.

### PricingPopupWrapper.tsx
Wrapper component that renders the popup using the context.

## Features

### Automatic Display
- **Pricing Page**: Shows after 5 seconds (signed-in non-premium users only)
- **Blurred Table**: Shows after 2 seconds when paywall is visible (signed-in non-premium users only)
- **Cooldown Period**: 12-hour minimum interval between popup displays

### Pricing Tiers
- **Monthly**: $19.99 → $14.99 (limited time) → $11.24 (additional 25% off)
- **Quarterly**: $19.99 → $11.99 (limited time) → $8.99 (additional 25% off)  
- **Yearly**: $19.99 → $8.33 (limited time) → $6.25 (additional 25% off)

**Note**: The 25% off coupon (LABORDAY25) is applied on top of the already discounted limited time prices.

### Coupon Code
- Automatically applies `LABORDAY25` at checkout
- **Additional 25% off** on top of already discounted limited time prices
- Users can see the total savings from original price to final price
- Clear messaging about the double discount offer

## Implementation Details

### Context Usage
```tsx
import { usePricingPopupContext } from '../context/PricingPopupContext';

const { openPopup, closePopup, canShowPopup, canShowPopupNow } = usePricingPopupContext();

// Check if user can see popup and cooldown has passed
if (canShowPopup && canShowPopupNow()) {
  // Open popup from pricing page
  openPopup('pricing-page');
  
  // Open popup from blurred table
  openPopup('blurred-table');
}
```

### Stripe Integration
The coupon code is passed to the checkout session and stored in metadata for tracking purposes.

### Analytics
All pricing interactions are tracked with Plausible analytics, including the source of the popup trigger.

### Cooldown System
- **12-hour minimum interval** between popup displays
- Prevents popup fatigue and improves user experience
- Cooldown is tracked per user in localStorage
- Resets when user becomes eligible again (e.g., subscription expires)

## Styling
- Responsive design with mobile-first approach
- Smooth animations and transitions
- Professional appearance with clear call-to-action
- Backdrop click to close functionality

## Future Enhancements
- A/B testing different discount amounts
- Time-limited countdown timer
- User preference to not show again
- Integration with email marketing campaigns
