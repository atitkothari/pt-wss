# Error Boundaries Implementation

This document describes the error boundary system implemented throughout the WSS application to provide graceful error handling and better user experience.

## Overview

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of the component tree that crashed.

## Components

### 1. Base ErrorBoundary (`app/components/ErrorBoundary.tsx`)

The main error boundary component that catches all JavaScript errors and displays a user-friendly error message.

**Features:**
- Catches JavaScript errors in component tree
- Displays user-friendly error message
- Shows error details in development mode
- Provides retry and home navigation options
- Logs errors to console in development

**Usage:**
```tsx
import { ErrorBoundary } from './components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 2. DataErrorBoundary (`app/components/DataErrorBoundary.tsx`)

Specialized error boundary for data-related components that handles data loading errors gracefully.

**Features:**
- Specifically designed for data loading errors
- Provides retry functionality
- Customizable error messages
- Compact design for inline use

**Usage:**
```tsx
import { DataErrorBoundary } from './components/DataErrorBoundary';

<DataErrorBoundary 
  errorMessage="Custom error message"
  onRetry={() => refetchData()}
>
  <DataComponent />
</DataErrorBoundary>
```

### 3. FormErrorBoundary (`app/components/FormErrorBoundary.tsx`)

Specialized error boundary for form components that handles validation and submission errors.

**Features:**
- Designed for form-related errors
- Compact design for form layouts
- Optional retry button
- Customizable error messages

**Usage:**
```tsx
import { FormErrorBoundary } from './components/FormErrorBoundary';

<FormErrorBoundary 
  errorMessage="Form error occurred"
  showRetryButton={false}
>
  <YourForm />
</FormErrorBoundary>
```

### 4. TableErrorBoundary (`app/components/TableErrorBoundary.tsx`)

Specialized error boundary for table components that handles data rendering and sorting errors.

**Features:**
- Designed for table-related errors
- Customizable table names
- Reload table functionality
- Professional error display

**Usage:**
```tsx
import { TableErrorBoundary } from './components/TableErrorBoundary';

<TableErrorBoundary tableName="Options Table">
  <OptionsTable />
</TableErrorBoundary>
```

### 5. GlobalErrorHandler (`app/components/GlobalErrorHandler.tsx`)

Global error handler that catches unhandled errors and promise rejections at the application level.

**Features:**
- Catches unhandled promise rejections
- Catches unhandled JavaScript errors
- Wraps the entire application
- Logs errors for debugging

**Usage:**
```tsx
import { GlobalErrorHandler } from './components/GlobalErrorHandler';

<GlobalErrorHandler>
  <App />
</GlobalErrorHandler>
```

## Hooks

### useErrorHandler()
Hook for handling errors in functional components.

```tsx
import { useErrorHandler } from './components/ErrorBoundary';

function MyComponent() {
  const error = useErrorHandler();
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return <div>Normal content</div>;
}
```

### useDataErrorHandler()
Hook for handling data errors in functional components.

```tsx
import { useDataErrorHandler } from './components/DataErrorBoundary';

function MyComponent() {
  const { error, handleError, clearError } = useDataErrorHandler();
  
  const fetchData = async () => {
    try {
      // fetch data
    } catch (err) {
      handleError(err);
    }
  };
  
  if (error) {
    return <div>Data error: {error.message}</div>;
  }
  
  return <div>Data content</div>;
}
```

## Higher-Order Components

### withErrorBoundary()
HOC for wrapping components with error boundaries.

```tsx
import { withErrorBoundary } from './components/ErrorBoundary';

const WrappedComponent = withErrorBoundary(MyComponent, 
  <div>Custom fallback</div>,
  (error, errorInfo) => console.log('Error:', error)
);
```

## Implementation Locations

### 1. Root Layout (`app/layout.tsx`)
- Wraps entire application with `GlobalErrorHandler`

### 2. Page Layout (`app/components/PageLayout.tsx`)
- Wraps navigation and main content with `ErrorBoundary`

### 3. Navigation (`app/components/NavBar.tsx`)
- Wraps navigation content with `ErrorBoundary`

### 4. Tables (`app/components/table/`)
- `OptionsTable.tsx` - Wrapped with `TableErrorBoundary`
- `TradesTable.tsx` - Wrapped with `TableErrorBoundary`

### 5. Forms (`app/components/forms/`)
- `AddTradeForm.tsx` - Wrapped with `FormErrorBoundary`

### 6. Pages
- Main page (`app/page.tsx`) - Wrapped with `ErrorBoundary`
- Covered call screener (`app/covered-call-screener/page.tsx`) - Wrapped with `ErrorBoundary` and `DataErrorBoundary`

### 7. Shared Components
- `OptionsTableComponent.tsx` - Wrapped with `ErrorBoundary`

## Error Reporting

In development mode, error boundaries log errors to the console. In production, you can:

1. Send errors to an error reporting service (e.g., Sentry, LogRocket)
2. Log errors to your backend
3. Track errors in analytics

Example:
```tsx
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // Send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    reportErrorToService(error, errorInfo);
  }
}
```

## Best Practices

1. **Wrap critical components**: Always wrap important components with appropriate error boundaries
2. **Use specific boundaries**: Use specialized error boundaries for different types of components
3. **Provide fallbacks**: Always provide meaningful fallback UIs
4. **Handle retries**: Implement retry functionality where appropriate
5. **Log errors**: Log errors for debugging and monitoring
6. **User-friendly messages**: Display user-friendly error messages
7. **Development details**: Show detailed error information only in development

## Customization

All error boundaries can be customized with:
- Custom fallback UI
- Custom error messages
- Custom retry logic
- Custom error handling callbacks

Example:
```tsx
<DataErrorBoundary
  fallback={<CustomErrorComponent />}
  errorMessage="Custom error message"
  onRetry={() => customRetryLogic()}
>
  <YourComponent />
</DataErrorBoundary>
```

## Testing

Error boundaries can be tested by:
1. Throwing errors in components
2. Testing retry functionality
3. Verifying fallback UI display
4. Testing error logging

## Future Enhancements

1. **Error analytics**: Track error patterns and frequency
2. **Automatic retry**: Implement exponential backoff for retries
3. **Error categorization**: Categorize errors by type and severity
4. **User feedback**: Allow users to report errors
5. **Performance monitoring**: Track error impact on performance
