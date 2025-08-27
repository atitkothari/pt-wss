# Analytics Authentication Tracking Implementation

## Overview

This implementation automatically adds user authentication status to all analytics events across the application. Every analytics event now includes whether the user is signed in or not, along with their user ID when available.

## What's Been Implemented

### 1. Centralized User Authentication Status Utility (`app/utils/userAuthStatus.ts`)

- **`getUserAuthStatus()`**: Gets current user authentication status using Firebase auth state and localStorage fallback
- **`getAnalyticsAuthStatus()`**: Returns formatted authentication data for analytics tracking
- **`isUserSignedIn()`**: Simple boolean check for user authentication status
- **`getCurrentUserId()`**: Gets current user ID if signed in

### 2. Enhanced Google Analytics (`app/utils/analytics.ts`)

- **`sendAnalyticsEvent()`**: Now automatically includes `user_signed_in` and `user_id` (when available) in all events
- All existing `sendAnalyticsEvent()` calls throughout the application now automatically include authentication status

### 3. Enhanced Plausible Analytics (`app/utils/plausible.ts`)

- **`usePlausibleTracker()`**: Hook that automatically adds authentication status to all `trackEvent()` and `trackPageView()` calls
- Prefers React context when available, falls back to utility function for non-React contexts
- All existing `trackEvent()` calls now automatically include authentication status

## How It Works

### Authentication Status Detection Priority

1. **React Context (Primary)**: Uses `useAuth()` hook when available in React components
2. **Firebase Auth State (Fallback)**: Direct access to Firebase auth when React context isn't available
3. **LocalStorage (Final Fallback)**: Checks stored Firebase auth data for non-React contexts

### Automatic Event Enhancement

Every analytics event now automatically includes:

```typescript
{
  user_signed_in: boolean,        // true if user is signed in, false otherwise
  user_id?: string,               // user ID if signed in (undefined if not signed in)
  user_email?: string             // user email if available (undefined if not signed in)
}
```

## Usage Examples

### Google Analytics Events

```typescript
// Before: Basic event
sendAnalyticsEvent({
  event_name: "button_click",
  event_category: "UI",
});

// After: Automatically enhanced with auth status
// Event now includes: user_signed_in, user_id, user_email
```

### Plausible Events

```typescript
// Before: Basic event
trackEvent(PlausibleEvents.ButtonClick, { button: "submit" });

// After: Automatically enhanced with auth status
// Event now includes: user_signed_in, user_id, user_email
```

## Files Modified

1. **`app/utils/userAuthStatus.ts`** - New utility file
2. **`app/utils/analytics.ts`** - Enhanced Google Analytics tracking
3. **`app/utils/plausible.ts`** - Enhanced Plausible tracking

## Benefits

1. **Automatic**: No need to manually add authentication status to each analytics call
2. **Consistent**: All analytics events now have the same authentication data structure
3. **Reliable**: Multiple fallback methods ensure authentication status is always available
4. **Maintainable**: Centralized logic makes updates easier
5. **Comprehensive**: Covers Google Analytics and Plausible Analytics

## Testing

To verify the implementation is working:

1. **Check Browser Console**: Look for analytics events with `user_signed_in` and `user_id` fields
2. **Google Analytics**: Events should include custom parameters for authentication status
3. **Plausible**: Events should include props for authentication status

## Future Enhancements

- Add user subscription status to analytics events
- Include user role/permissions in analytics
- Add user behavior patterns to analytics
- Implement analytics event batching for performance
