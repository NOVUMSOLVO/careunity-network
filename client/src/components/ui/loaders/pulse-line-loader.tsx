import React from 'react';

export interface PulseLineLoaderProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-16 h-4',
  md: 'w-24 h-6',
  lg: 'w-32 h-8',
  xl: 'w-48 h-10'
};

export function PulseLineLoader({ 
  color = 'text-primary', 
  size = 'md' 
}: PulseLineLoaderProps) {
  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center ${color}`}>
      <svg 
        viewBox="0 0 200 50" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Base Line */}
        <line 
          x1="0" 
          y1="25" 
          x2="200" 
          y2="25" 
          className="stroke-current" 
          strokeWidth="2" 
          strokeOpacity="0.3"
        />
        
        {/* Pulse Wave Path */}
        <path 
          d="M0,25 L30,25 L40,15 L50,35 L60,15 L70,35 L80,25 L100,25 L110,10 L120,40 L130,25 L200,25" 
          className="stroke-current animate-pulse-line" 
          strokeWidth="3" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          strokeDasharray="200"
          strokeDashoffset="200"
        />
        
        {/* Ping Circle (traveling along the path) */}
        <circle 
          cx="0" 
          cy="25" 
          r="3" 
          className="fill-current animate-pulse-dot"
        />
      </svg>
    </div>
  );
}