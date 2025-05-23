/**
 * Responsive Testing Page
 * 
 * This page provides tools for testing the application's responsiveness across different device sizes.
 */

import React, { useState } from 'react';
import { ResponsiveTester } from '@/components/dev/responsive-tester';
import { useDevice } from '@/hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Tablet, Monitor, LayoutGrid } from 'lucide-react';

export default function ResponsiveTestPage() {
  const [showTester, setShowTester] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('iPhone 12/13');
  const deviceInfo = useDevice();
  
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Responsive Design Testing</h1>
      
      <Tabs defaultValue="info" className="mb-8">
        <TabsList>
          <TabsTrigger value="info">Device Info</TabsTrigger>
          <TabsTrigger value="tester">Device Tester</TabsTrigger>
          <TabsTrigger value="components">Component Tests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Current Device Information</CardTitle>
              <CardDescription>
                Details about the current device and viewport
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Device Type:</span>
                    <span>{deviceInfo.deviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Orientation:</span>
                    <span>{deviceInfo.orientation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Touch Enabled:</span>
                    <span>{deviceInfo.touchEnabled ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Viewport Width:</span>
                    <span>{deviceInfo.width}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Viewport Height:</span>
                    <span>{deviceInfo.height}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Aspect Ratio:</span>
                    <span>{(deviceInfo.width / deviceInfo.height).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Tailwind Breakpoints</h3>
                <div className="grid grid-cols-5 gap-2">
                  <div className="text-center">
                    <div className="bg-gray-100 p-2 rounded">
                      <span className="block text-xs text-gray-500">sm</span>
                      <span className="font-medium">640px</span>
                    </div>
                    <div className={`mt-1 h-1 rounded ${deviceInfo.width >= 640 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="text-center">
                    <div className="bg-gray-100 p-2 rounded">
                      <span className="block text-xs text-gray-500">md</span>
                      <span className="font-medium">768px</span>
                    </div>
                    <div className={`mt-1 h-1 rounded ${deviceInfo.width >= 768 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="text-center">
                    <div className="bg-gray-100 p-2 rounded">
                      <span className="block text-xs text-gray-500">lg</span>
                      <span className="font-medium">1024px</span>
                    </div>
                    <div className={`mt-1 h-1 rounded ${deviceInfo.width >= 1024 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="text-center">
                    <div className="bg-gray-100 p-2 rounded">
                      <span className="block text-xs text-gray-500">xl</span>
                      <span className="font-medium">1280px</span>
                    </div>
                    <div className={`mt-1 h-1 rounded ${deviceInfo.width >= 1280 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="text-center">
                    <div className="bg-gray-100 p-2 rounded">
                      <span className="block text-xs text-gray-500">2xl</span>
                      <span className="font-medium">1536px</span>
                    </div>
                    <div className={`mt-1 h-1 rounded ${deviceInfo.width >= 1536 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tester">
          <Card>
            <CardHeader>
              <CardTitle>Device Simulator</CardTitle>
              <CardDescription>
                Test how the application looks on different devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center gap-2"
                  onClick={() => {
                    setSelectedDevice('iPhone 12/13');
                    setShowTester(true);
                  }}
                >
                  <Smartphone size={16} />
                  Mobile
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center gap-2"
                  onClick={() => {
                    setSelectedDevice('iPad Air');
                    setShowTester(true);
                  }}
                >
                  <Tablet size={16} />
                  Tablet
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center gap-2"
                  onClick={() => {
                    setSelectedDevice('Laptop (Medium)');
                    setShowTester(true);
                  }}
                >
                  <Monitor size={16} />
                  Desktop
                </Button>
              </div>
              
              <Button 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setShowTester(true)}
              >
                <LayoutGrid size={16} />
                Open Device Simulator
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="components">
          <Card>
            <CardHeader>
              <CardTitle>Component Responsiveness Tests</CardTitle>
              <CardDescription>
                Test individual components across different screen sizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                This section allows you to test specific components in isolation to ensure they're responsive.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <span>Forms</span>
                  <span className="text-xs text-gray-500">Test form components</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <span>Cards</span>
                  <span className="text-xs text-gray-500">Test card layouts</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <span>Tables</span>
                  <span className="text-xs text-gray-500">Test responsive tables</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <span>Navigation</span>
                  <span className="text-xs text-gray-500">Test navigation components</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <span>Modals</span>
                  <span className="text-xs text-gray-500">Test modal dialogs</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <span>Images</span>
                  <span className="text-xs text-gray-500">Test responsive images</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {showTester && (
        <ResponsiveTester 
          defaultDevice={selectedDevice} 
          showControls={true}
          url={window.location.origin}
        />
      )}
    </div>
  );
}
