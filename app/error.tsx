'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-surface rounded-lg p-8 border border-border">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-primary-text mb-2">
            Something went wrong
          </h2>
          
          <p className="text-secondary-text mb-6">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-2 bg-liquid-lava text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
            
            <a
              href="/"
              className="px-6 py-2 bg-surface border border-border text-primary-text rounded-lg font-medium hover:bg-border transition-colors"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
