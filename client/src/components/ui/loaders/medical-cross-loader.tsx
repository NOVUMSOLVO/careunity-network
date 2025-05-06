import React from 'react';

export interface MedicalCrossLoaderProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export function MedicalCrossLoader({ 
  color = 'text-primary', 
  size = 'md' 
}: MedicalCrossLoaderProps) {
  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center ${color}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer Circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="40" 
          className="stroke-current" 
          strokeWidth="5"
          fill="none"
        />
        
        {/* Horizontal Bar of Cross */}
        <rect 
          x="25" 
          y="40" 
          width="50" 
          height="20" 
          rx="2" 
          className="fill-current"
        />
        
        {/* Vertical Bar of Cross */}
        <rect 
          x="40" 
          y="25" 
          width="20" 
          height="50" 
          rx="2" 
          className="fill-current"
        />
        
        {/* Animated Pulse Effect */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          className="stroke-current animate-medical-cross-pulse" 
          strokeWidth="2"
          strokeOpacity="0.5"
          fill="none"
        />
      </svg>
    </div>
  );
}