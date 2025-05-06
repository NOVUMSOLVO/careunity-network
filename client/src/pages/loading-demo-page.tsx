import React, { useState } from 'react';
import { useLoading } from '@/contexts/loading-context';
import { LoadingState } from '@/components/ui/loading-state';
// Direct imports of the loader components
import { HeartbeatLoader } from '@/components/ui/loaders/heartbeat-loader';
import { StethoscopeLoader } from '@/components/ui/loaders/stethoscope-loader';
import { PulseLineLoader } from '@/components/ui/loaders/pulse-line-loader';
import { PillLoader } from '@/components/ui/loaders/pill-loader';
import { MedicalCrossLoader } from '@/components/ui/loaders/medical-cross-loader';

export default function LoadingDemoPage() {
  const { 
    startLoading, 
    stopLoading, 
    updateLoadingMessage, 
    updateLoaderType, 
    withLoading 
  } = useLoading();
  
  const [demoStatus, setDemoStatus] = useState('');
  
  // Simulate a data loading operation
  const simulateLoadOperation = async () => {
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    return { success: true, data: 'Sample data loaded successfully!' };
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading State Demo</h1>
        <p className="text-gray-600">Explore the healthcare-themed loading animations in CareUnity</p>
      </div>
      
      {/* Demo Card */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Individual Loaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Heartbeat Loader */}
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <HeartbeatLoader size="lg" color="text-rose-500" />
            <p className="mt-3 text-sm font-medium">Heartbeat</p>
          </div>
          
          {/* Stethoscope Loader */}
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <StethoscopeLoader size="lg" color="text-blue-500" />
            <p className="mt-3 text-sm font-medium">Stethoscope</p>
          </div>
          
          {/* Pulse Line Loader */}
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <PulseLineLoader size="lg" color="text-green-500" />
            <p className="mt-3 text-sm font-medium">Pulse Line</p>
          </div>
          
          {/* Pill Loader */}
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <PillLoader size="lg" color="text-amber-500" />
            <p className="mt-3 text-sm font-medium">Pill</p>
          </div>
          
          {/* Medical Cross Loader */}
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <MedicalCrossLoader size="lg" color="text-indigo-500" />
            <p className="mt-3 text-sm font-medium">Medical Cross</p>
          </div>
        </div>
      </div>
      
      {/* Full Page Loading Demo */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Full-Page Loading State</h2>
        <div className="space-y-4">
          <p className="text-gray-600">Test the global loading overlay with different animations:</p>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => {
                startLoading('Loading with Heartbeat...', 'heartbeat');
                setTimeout(() => stopLoading(), 3000);
              }}
              className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600"
            >
              Heartbeat Loader
            </button>
            
            <button 
              onClick={() => {
                startLoading('Checking with Stethoscope...', 'stethoscope');
                setTimeout(() => stopLoading(), 3000);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Stethoscope Loader
            </button>
            
            <button 
              onClick={() => {
                startLoading('Monitoring Vital Signs...', 'pulse-line');
                setTimeout(() => stopLoading(), 3000);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Pulse Line Loader
            </button>
            
            <button 
              onClick={() => {
                startLoading('Preparing Medication...', 'pill');
                setTimeout(() => stopLoading(), 3000);
              }}
              className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
            >
              Pill Loader
            </button>
            
            <button 
              onClick={() => {
                startLoading('Providing Medical Care...', 'medical-cross');
                setTimeout(() => stopLoading(), 3000);
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
            >
              Medical Cross Loader
            </button>
            
            <button 
              onClick={() => {
                startLoading('Random Healthcare Loading...', 'random');
                setTimeout(() => stopLoading(), 3000);
              }}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
            >
              Random Loader
            </button>
          </div>
        </div>
      </div>
      
      {/* withLoading Demo */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">withLoading Hook Demo</h2>
        <div className="space-y-4">
          <p className="text-gray-600">Test the withLoading hook to wrap async operations:</p>
          
          <button 
            onClick={async () => {
              try {
                const result = await withLoading(simulateLoadOperation, {
                  loadingMessage: 'Loading data from server...',
                  loaderType: 'pulse-line',
                  successMessage: 'Data loaded successfully!'
                });
                setDemoStatus(`Operation completed: ${result.data}`);
              } catch (error: any) {
                setDemoStatus(`Error: ${error?.message || 'Unknown error occurred'}`);
              }
            }}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Load Data with Animation
          </button>
          
          {demoStatus && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-sm">{demoStatus}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}