'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  fallback?: ReactNode;
  errorMessage?: string;
  showRetryButton?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class FormErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('FormErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mb-3">
            <FileText className="h-5 w-5 text-red-600" />
          </div>
          
          <h4 className="text-sm font-medium text-red-900 mb-2">
            Form Error
          </h4>
          
          <p className="text-xs text-red-700 mb-3">
            {this.props.errorMessage || 
              "There was an error processing your form. Please check your input and try again."}
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-3 text-left">
              <summary className="cursor-pointer text-xs font-medium text-red-700 mb-1">
                Error Details (Development)
              </summary>
              <div className="bg-red-100 p-2 rounded text-xs font-mono text-red-800">
                {this.state.error.toString()}
              </div>
            </details>
          )}

          {this.props.showRetryButton !== false && (
            <Button
              onClick={this.handleRetry}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-3 w-3" />
              Try Again
            </Button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for handling form errors in functional components
export function useFormErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}
