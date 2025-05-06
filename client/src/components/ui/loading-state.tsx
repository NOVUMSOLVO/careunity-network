import React from 'react';
// Importing loaders directly instead of through index
import { HeartbeatLoader } from './loaders/heartbeat-loader';
import { StethoscopeLoader } from './loaders/stethoscope-loader';
import { PulseLineLoader } from './loaders/pulse-line-loader';
import { PillLoader } from './loaders/pill-loader';
import { MedicalCrossLoader } from './loaders/medical-cross-loader';

export type LoaderType = 'heartbeat' | 'stethoscope' | 'pulse-line' | 'pill' | 'medical-cross' | 'random';

interface LoadingStateProps {
  type?: LoaderType;
  text?: string;
  fullPage?: boolean;
}

/**
 * Renders a healthcare-themed loading animation with optional text
 */
export function LoadingState({ 
  type = 'random', 
  text = 'Loading...', 
  fullPage = false 
}: LoadingStateProps) {
  // Generate random loader type if 'random' is selected
  const loaderType = type === 'random' 
    ? ['heartbeat', 'stethoscope', 'pulse-line', 'pill', 'medical-cross'][
        Math.floor(Math.random() * 5)
      ] as LoaderType 
    : type;
  
  const renderLoader = () => {
    switch(loaderType) {
      case 'heartbeat':
        return <HeartbeatLoader size="lg" color="text-primary" />;
      case 'stethoscope':
        return <StethoscopeLoader size="lg" color="text-primary" />;
      case 'pulse-line':
        return <PulseLineLoader size="lg" color="text-primary" />;
      case 'pill':
        return <PillLoader size="lg" color="text-primary" />;
      case 'medical-cross':
        return <MedicalCrossLoader size="lg" color="text-primary" />;
      default:
        return <HeartbeatLoader size="lg" color="text-primary" />;
    }
  };
  
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      {renderLoader()}
      {text && <p className="text-gray-600 animate-pulse">{text}</p>}
    </div>
  );
  
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }
  
  return content;
}