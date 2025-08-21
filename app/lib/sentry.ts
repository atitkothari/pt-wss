import * as Sentry from '@sentry/nextjs';

// Utility function to capture errors with additional context
export function captureError(
  error: Error | string,
  context?: Record<string, any>,
  level: Sentry.SeverityLevel = 'error'
) {
  try {
    if (typeof error === 'string') {
      Sentry.captureMessage(error, level);
    } else {
      Sentry.captureException(error, {
        contexts: context,
        level,
      });
    }
  } catch (sentryError) {
    console.error('Failed to send error to Sentry:', sentryError);
  }
}

// Set user context for better error tracking
export function setUserContext(userId: string, email?: string, username?: string) {
  try {
    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  } catch (sentryError) {
    console.error('Failed to set user context in Sentry:', sentryError);
  }
}

// Clear user context (e.g., on logout)
export function clearUserContext() {
  try {
    Sentry.setUser(null);
  } catch (sentryError) {
    console.error('Failed to clear user context in Sentry:', sentryError);
  }
}

// Add breadcrumb for better debugging
export function addBreadcrumb(
  message: string,
  category: string = 'app',
  data?: Record<string, any>
) {
  try {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  } catch (sentryError) {
    console.error('Failed to add breadcrumb to Sentry:', sentryError);
  }
}

// Set tags for better error categorization
export function setTag(key: string, value: string) {
  try {
    Sentry.setTag(key, value);
  } catch (sentryError) {
    console.error('Failed to set tag in Sentry:', sentryError);
  }
}

// Set extra context data
export function setExtra(key: string, value: any) {
  try {
    Sentry.setExtra(key, value);
  } catch (sentryError) {
    console.error('Failed to set extra in Sentry:', sentryError);
  }
}

// Performance monitoring - wraps an operation in a span
export function withTransaction<T>(
  name: string, 
  operation: string, 
  callback: () => T | Promise<T>
): T | Promise<T> {
  try {
    return Sentry.startSpan({
      name,
      op: operation,
    }, callback);
  } catch (sentryError) {
    console.error('Failed to start Sentry span:', sentryError);
    // Fallback to executing the callback without tracing
    return callback();
  }
}

// Legacy function for backward compatibility
export function startTransaction(name: string, operation: string) {
  console.warn('startTransaction is deprecated. Use withTransaction instead.');
  return null;
}

// Capture API errors specifically
export function captureApiError(
  endpoint: string,
  status: number,
  error: Error | string,
  requestData?: any
) {
  try {
    const context = {
      api: {
        endpoint,
        status,
        requestData,
      },
    };

    if (typeof error === 'string') {
      Sentry.captureMessage(`API Error: ${error}`, 'error');
    } else {
      Sentry.captureException(error, { contexts: context });
    }
  } catch (sentryError) {
    console.error('Failed to send API error to Sentry:', sentryError);
  }
}
