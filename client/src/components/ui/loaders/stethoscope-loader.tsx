import React from 'react';

export interface StethoscopeLoaderProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export function StethoscopeLoader({ 
  color = 'text-primary', 
  size = 'md' 
}: StethoscopeLoaderProps) {
  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center ${color}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Stethoscope Bell */}
        <circle 
          cx="30" 
          cy="75" 
          r="15" 
          className="stroke-current fill-none" 
          strokeWidth="6"
        />
        
        {/* Stethoscope Diaphragm (pulsing) */}
        <circle 
          cx="30" 
          cy="75" 
          r="8" 
          className="fill-current animate-pulse" 
          opacity="0.5"
        />
        
        {/* Stethoscope Tubing */}
        <path 
          d="M30 60V40C30 25 40 20 50 20H60C70 20 80 20 80 35V50" 
          className="stroke-current" 
          strokeWidth="6" 
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Ear Pieces */}
        <circle 
          cx="80" 
          cy="50" 
          r="10" 
          className="stroke-current fill-none" 
          strokeWidth="6"
        />
        
        {/* Sound Wave Animation (moving along the tube) */}
        <circle 
          cx="30" 
          cy="40" 
          r="3" 
          className="fill-current animate-bounce"
        />
        <circle 
          cx="50" 
          cy="25" 
          r="3" 
          className="fill-current animate-bounce" 
          style={{ animationDelay: '0.2s' }}
        />
        <circle 
          cx="70" 
          cy="30" 
          r="3" 
          className="fill-current animate-bounce" 
          style={{ animationDelay: '0.4s' }}
        />
      </svg>
    </div>
  );
}