
import React from 'react';
import { Loader2, Package } from 'lucide-react';

function LoadingSpinner({ fullScreen = false, message = 'Chargement...' }) {
  const containerClass = fullScreen 
    ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center'
    : 'flex items-center justify-center min-h-[200px]';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4 p-8">
        {/* Animated spinner */}
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-spin border-t-primary"></div>
          
          {/* Inner pulsing icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>

        {/* Loading text with animated dots */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-foreground">{message}</span>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;

