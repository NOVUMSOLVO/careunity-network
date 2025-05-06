import React from 'react';

export interface HeartbeatLoaderProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export function HeartbeatLoader({ 
  color = 'text-primary', 
  size = 'md' 
}: HeartbeatLoaderProps) {
  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center ${color}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Heart outline */}
        <path 
          d="M50 88.9C48.7 88.9 47.4 88.5 46.3 87.7C41.9 84.4 37.4 81.2 33.5 78.3C21.9 70.0 12.5 63.2 6.7 56.3C0.700001 49.2 -1.3 42.3 1.1 34.7C2.8 29.2 6.6 24.6 11.9 21.8C17.2 18.9 23.4 18.3 29.3 19.9C35.5 21.5 41.1 25.4 45.2 30.9C46.4 32.5 48.2 33.3 50 33.3C51.8 33.3 53.6 32.5 54.8 30.9C58.9 25.4 64.5 21.5 70.7 19.9C76.6 18.3 82.8 18.9 88.1 21.8C93.4 24.6 97.2 29.2 98.9 34.7C101.3 42.3 99.3 49.2 93.3 56.3C87.5 63.2 78.1 70.0 66.5 78.3C62.6 81.2 58.1 84.4 53.7 87.7C52.6 88.5 51.3 88.9 50 88.9Z" 
          className="stroke-current"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Animated heartbeat pulse */}
        <path 
          d="M50 88.9C48.7 88.9 47.4 88.5 46.3 87.7C41.9 84.4 37.4 81.2 33.5 78.3C21.9 70.0 12.5 63.2 6.7 56.3C0.700001 49.2 -1.3 42.3 1.1 34.7C2.8 29.2 6.6 24.6 11.9 21.8C17.2 18.9 23.4 18.3 29.3 19.9C35.5 21.5 41.1 25.4 45.2 30.9C46.4 32.5 48.2 33.3 50 33.3C51.8 33.3 53.6 32.5 54.8 30.9C58.9 25.4 64.5 21.5 70.7 19.9C76.6 18.3 82.8 18.9 88.1 21.8C93.4 24.6 97.2 29.2 98.9 34.7C101.3 42.3 99.3 49.2 93.3 56.3C87.5 63.2 78.1 70.0 66.5 78.3C62.6 81.2 58.1 84.4 53.7 87.7C52.6 88.5 51.3 88.9 50 88.9Z" 
          className="fill-current animate-heartbeat"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}