# Sentry Error Tracking Setup

This project has been configured with Sentry for comprehensive error tracking and monitoring.

## What's Been Set Up

### 1. **Core Configuration Files**
- `instrumentation-client.ts` - Browser-side error tracking (Next.js 13+)
- `sentry.server.config.ts` - Server-side error tracking  
- `sentry.edge.config.ts` - Edge runtime error tracking
- `next.config.js` - Updated with Sentry webpack plugin

### 2. **Error Boundaries**
- Enhanced `ErrorBoundary.tsx` with Sentry integration
- Global error handler (`app/global-error.tsx`)
- Automatic error capture for React component errors

### 3. **Utility Functions** (`app/lib/sentry.ts`)
- `captureError()` - Capture errors with context
- `setUserContext()` - Track user information
- `addBreadcrumb()` - Add debugging breadcrumbs
- `captureApiError()` - Track API errors specifically

### 4. **Authentication Integration**
- User context automatically set on login/logout
- Auth state changes tracked as breadcrumbs
- User ID, email, and username linked to errors

## How to Use

### Basic Error Tracking

```typescript
import { captureError } from '@/lib/sentry';

try {
  // Your code here
} catch (error) {
  captureError(error, { 
    context: 'user_action',
    userId: user?.uid 
  });
}
```

### API Error Tracking

```typescript
import { captureApiError } from '@/lib/sentry';

try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) {
    captureApiError('/api/endpoint', response.status, 'API request failed');
  }
} catch (error) {
  captureApiError('/api/endpoint', 0, error);
}
```

### Adding User Context

```typescript
import { setUserContext, clearUserContext } from '@/lib/sentry';

// On login
setUserContext(userId, email, username);

// On logout
clearUserContext();
```

### Performance Monitoring

```typescript
import { withTransaction } from '@/lib/sentry';

// Wrap an operation in a performance span
const result = await withTransaction('Load User Data', 'db.query', async () => {
  // Your operation here
  const data = await fetchUserData();
  return data;
});

// Or for synchronous operations
const result = withTransaction('Process Data', 'data.process', () => {
  return processData(input);
});
```

## Testing

Visit `/sentry-example-page` to test your Sentry setup. This page will:
- Test connectivity to Sentry
- Allow you to throw test errors
- Verify error capture is working

## Environment Variables

The following environment variables are automatically configured:
- `SENTRY_DSN` - Your Sentry project DSN
- `SENTRY_ORG` - Your Sentry organization
- `SENTRY_PROJECT` - Your Sentry project name

## What Gets Tracked

### Automatic Tracking
- JavaScript errors and exceptions
- React component errors
- Unhandled promise rejections
- Network request failures
- Performance metrics
- User context (browser, OS, location)

### Manual Tracking
- Custom error messages
- API errors with context
- User actions as breadcrumbs
- Performance transactions
- Custom tags and metadata

## Dashboard Access

Your Sentry dashboard is available at:
https://perseus-labs.sentry.io/projects/javascript-nextjs/

## Best Practices

1. **Always add context** when capturing errors
2. **Use breadcrumbs** to track user actions
3. **Set user context** for better error correlation
4. **Monitor performance** with transactions
5. **Review errors regularly** in the Sentry dashboard

## Troubleshooting

### Common Issues

1. **Errors not appearing**: Check your DSN and network connectivity
2. **Source maps missing**: Ensure `SENTRY_AUTH_TOKEN` is set in CI/CD
3. **Performance impact**: Adjust `tracesSampleRate` in production

### Debug Mode

Enable debug mode in your Sentry config files:
```typescript
debug: true
```

This will show Sentry initialization logs in the console.

## Support

- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Issues](https://github.com/getsentry/sentry-javascript/issues)
- [Your Sentry Dashboard](https://perseus-labs.sentry.io/projects/javascript-nextjs/)
