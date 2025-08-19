'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from './ErrorBoundary';

// Component that intentionally throws an error
function BuggyComponent() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('This is a test error to demonstrate error boundaries!');
  }

  return (
    <div className="p-4 border rounded-lg bg-green-50">
      <h3 className="font-semibold text-green-800 mb-2">Buggy Component</h3>
      <p className="text-green-700 mb-3">This component is working normally.</p>
      <Button 
        onClick={() => setShouldThrow(true)}
        variant="destructive"
        size="sm"
      >
        Throw Error
      </Button>
    </div>
  );
}

// Component that throws an error on mount
function AlwaysBuggyComponent(): never {
  throw new Error('This component always throws an error on mount!');
}

// Component that throws an error after a delay
function DelayedBuggyComponent() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('This is a delayed error!');
  }

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="font-semibold text-yellow-800 mb-2">Delayed Buggy Component</h3>
      <p className="text-yellow-700 mb-3">This component will throw an error after 3 seconds.</p>
      <Button 
        onClick={() => {
          setTimeout(() => setShouldThrow(true), 3000);
        }}
        variant="outline"
        size="sm"
      >
        Start 3s Timer
      </Button>
    </div>
  );
}

export function ErrorBoundaryTest() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900">Error Boundary Test Page</h2>
      <p className="text-gray-600">
        This page demonstrates the different types of error boundaries implemented in the application.
        Use the buttons below to test error handling.
      </p>

      <div className="grid gap-6">
        {/* Test 1: Basic Error Boundary */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Test 1: Basic Error Boundary</h3>
          <ErrorBoundary>
            <BuggyComponent />
          </ErrorBoundary>
        </div>

        {/* Test 2: Always Buggy Component */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Test 2: Always Buggy Component</h3>
          <ErrorBoundary>
            <AlwaysBuggyComponent />
          </ErrorBoundary>
        </div>

        {/* Test 3: Delayed Error */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Test 3: Delayed Error</h3>
          <ErrorBoundary>
            <DelayedBuggyComponent />
          </ErrorBoundary>
        </div>

        {/* Test 4: Nested Error Boundaries */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Test 4: Nested Error Boundaries</h3>
          <ErrorBoundary>
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-semibold text-blue-800 mb-2">Outer Error Boundary</h4>
              <p className="text-blue-700 mb-3">This content is wrapped in an outer error boundary.</p>
              
              <ErrorBoundary>
                <div className="p-3 border rounded bg-blue-100">
                  <h5 className="font-medium text-blue-800 mb-2">Inner Error Boundary</h5>
                  <p className="text-blue-700 mb-2">This content is wrapped in an inner error boundary.</p>
                  
                  <Button 
                    onClick={() => {
                      throw new Error('Nested error boundary test!');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Throw Nested Error
                  </Button>
                </div>
              </ErrorBoundary>
            </div>
          </ErrorBoundary>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">How to Test:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li><strong>Test 1:</strong> Click "Throw Error" to see the error boundary catch a runtime error</li>
          <li><strong>Test 2:</strong> This component always throws an error on mount</li>
          <li><strong>Test 3:</strong> Click "Start 3s Timer" and wait for the delayed error</li>
          <li><strong>Test 4:</strong> Click "Throw Nested Error" to test nested error boundaries</li>
        </ul>
      </div>
    </div>
  );
}
