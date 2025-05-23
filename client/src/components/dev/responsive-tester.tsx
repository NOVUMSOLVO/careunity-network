/**
 * Responsive Tester Component
 * 
 * A development tool to test the application's responsiveness across different device sizes.
 * This component renders a frame with controls to switch between different device sizes.
 */

import React, { useState } from 'react';
import { X, Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react';

// Device presets
const DEVICE_PRESETS = [
  { name: 'iPhone SE', width: 375, height: 667, type: 'mobile' },
  { name: 'iPhone 12/13', width: 390, height: 844, type: 'mobile' },
  { name: 'iPhone 12/13 Pro Max', width: 428, height: 926, type: 'mobile' },
  { name: 'Pixel 5', width: 393, height: 851, type: 'mobile' },
  { name: 'Samsung Galaxy S20', width: 360, height: 800, type: 'mobile' },
  { name: 'iPad Mini', width: 768, height: 1024, type: 'tablet' },
  { name: 'iPad Air', width: 820, height: 1180, type: 'tablet' },
  { name: 'iPad Pro 11"', width: 834, height: 1194, type: 'tablet' },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, type: 'tablet' },
  { name: 'Surface Pro 7', width: 912, height: 1368, type: 'tablet' },
  { name: 'Laptop (Small)', width: 1280, height: 800, type: 'desktop' },
  { name: 'Laptop (Medium)', width: 1440, height: 900, type: 'desktop' },
  { name: 'Desktop', width: 1920, height: 1080, type: 'desktop' },
];

interface ResponsiveTesterProps {
  url?: string; // URL to load in the frame (defaults to current app)
  defaultDevice?: string; // Default device to show
  showControls?: boolean; // Whether to show the device controls
}

export function ResponsiveTester({
  url,
  defaultDevice = 'iPhone 12/13',
  showControls = true,
}: ResponsiveTesterProps) {
  const [selectedDevice, setSelectedDevice] = useState(
    DEVICE_PRESETS.find(d => d.name === defaultDevice) || DEVICE_PRESETS[1]
  );
  const [isLandscape, setIsLandscape] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');

  // Calculate dimensions based on orientation
  const frameWidth = isLandscape ? selectedDevice.height : selectedDevice.width;
  const frameHeight = isLandscape ? selectedDevice.width : selectedDevice.height;

  // Apply custom dimensions if provided
  const width = customWidth ? parseInt(customWidth) : frameWidth;
  const height = customHeight ? parseInt(customHeight) : frameHeight;

  // Toggle orientation
  const toggleOrientation = () => {
    setIsLandscape(!isLandscape);
  };

  // Apply custom dimensions
  const applyCustomDimensions = () => {
    if (customWidth && customHeight) {
      // Custom dimensions are applied via the width and height variables
    }
  };

  // Reset custom dimensions
  const resetCustomDimensions = () => {
    setCustomWidth('');
    setCustomHeight('');
  };

  // Get frame source URL
  const frameSource = url || window.location.href;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex flex-col items-center justify-center p-4">
      {/* Close button */}
      {showControls && (
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-white hover:text-gray-300"
        >
          <X size={24} />
        </button>
      )}

      {/* Device controls */}
      {showControls && (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 w-full max-w-4xl">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => {
                setSelectedDevice(DEVICE_PRESETS.find(d => d.type === 'mobile') || DEVICE_PRESETS[1]);
                resetCustomDimensions();
              }}
              className={`flex items-center px-3 py-2 rounded ${
                selectedDevice.type === 'mobile' && !customWidth
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <Smartphone size={16} className="mr-2" />
              Mobile
            </button>
            <button
              onClick={() => {
                setSelectedDevice(DEVICE_PRESETS.find(d => d.type === 'tablet') || DEVICE_PRESETS[5]);
                resetCustomDimensions();
              }}
              className={`flex items-center px-3 py-2 rounded ${
                selectedDevice.type === 'tablet' && !customWidth
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <Tablet size={16} className="mr-2" />
              Tablet
            </button>
            <button
              onClick={() => {
                setSelectedDevice(DEVICE_PRESETS.find(d => d.type === 'desktop') || DEVICE_PRESETS[11]);
                resetCustomDimensions();
              }}
              className={`flex items-center px-3 py-2 rounded ${
                selectedDevice.type === 'desktop' && !customWidth
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <Monitor size={16} className="mr-2" />
              Desktop
            </button>
            <button
              onClick={toggleOrientation}
              className="flex items-center px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              <RotateCcw size={16} className="mr-2" />
              Rotate
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <select
              value={selectedDevice.name}
              onChange={(e) => {
                const device = DEVICE_PRESETS.find(d => d.name === e.target.value);
                if (device) {
                  setSelectedDevice(device);
                  resetCustomDimensions();
                }
              }}
              className="px-3 py-2 border rounded"
            >
              {DEVICE_PRESETS.map((device) => (
                <option key={device.name} value={device.name}>
                  {device.name} ({device.width}x{device.height})
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Width"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                className="w-20 px-3 py-2 border rounded"
              />
              <span>×</span>
              <input
                type="number"
                placeholder="Height"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                className="w-20 px-3 py-2 border rounded"
              />
              <button
                onClick={applyCustomDimensions}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Apply
              </button>
              <button
                onClick={resetCustomDimensions}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Current size: {width}×{height}px ({isLandscape ? 'Landscape' : 'Portrait'})
          </div>
        </div>
      )}

      {/* Device frame */}
      <div
        className="bg-white rounded-lg shadow-2xl overflow-hidden"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: '100%',
          maxHeight: 'calc(100vh - 200px)',
          transform: 'scale(0.9)',
          transformOrigin: 'top center',
        }}
      >
        <iframe
          src={frameSource}
          title="Responsive Tester"
          width={width}
          height={height}
          className="border-0"
        />
      </div>
    </div>
  );
}
