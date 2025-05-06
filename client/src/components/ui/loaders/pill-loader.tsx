import React from 'react';

export interface PillLoaderProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export function PillLoader({ 
  color = 'text-primary', 
  size = 'md' 
}: PillLoaderProps) {
  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center ${color}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Pill Capsule Container */}
        <rect 
          x="20" 
          y="35" 
          width="60" 
          height="30" 
          rx="15" 
          className="stroke-current" 
          strokeWidth="5"
          fill="none"
        />
        
        {/* Pill divider */}
        <line 
          x1="50" 
          y1="35" 
          x2="50" 
          y2="65" 
          className="stroke-current" 
          strokeWidth="5"
        />
        
        {/* Animated Pills Moving Inside */}
        <circle 
          cx="35" 
          cy="50" 
          r="5" 
          className="fill-current animate-pill-move"
        />
        
        <circle 
          cx="65" 
          cy="50" 
          r="5" 
          className="fill-current animate-pill-move"
          style={{
            animationDelay: '0.7s'
          }}
        />
      </svg>
    </div>
  );
}