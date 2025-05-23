import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGestureControls } from '@/hooks/use-gesture-controls';
import { 
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, 
  Maximize, Minimize, Tap, Clock, 
  Smartphone, Info
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Gesture Controls Demo Component
 * 
 * This component demonstrates the gesture controls functionality
 * with visual feedback for each gesture.
 */
export function GestureControlsDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [scale, setScale] = useState(1);
  const { toast } = useToast();
  
  // Define sections for the demo
  const sections = [
    { title: 'Dashboard', color: 'bg-blue-500' },
    { title: 'Schedule', color: 'bg-green-500' },
    { title: 'Service Users', color: 'bg-purple-500' },
    { title: 'Messages', color: 'bg-amber-500' },
  ];
  
  // Define gesture handlers
  const gestureHandlers = {
    swipeLeft: () => {
      setActiveSection(prev => (prev < sections.length - 1 ? prev + 1 : prev));
    },
    swipeRight: () => {
      setActiveSection(prev => (prev > 0 ? prev - 1 : prev));
    },
    swipeUp: () => {
      toast({
        title: 'Refresh Content',
        description: 'Content refreshed via swipe up gesture',
      });
    },
    swipeDown: () => {
      toast({
        title: 'Menu Opened',
        description: 'Menu opened via swipe down gesture',
      });
    },
    doubleTap: () => {
      toast({
        title: 'Item Selected',
        description: 'Item selected via double tap gesture',
      });
    },
    longPress: () => {
      toast({
        title: 'Context Menu',
        description: 'Context menu opened via long press gesture',
      });
    },
    pinch: (scaleValue) => {
      setScale(prev => Math.max(0.5, prev * 0.95));
    },
    spread: (scaleValue) => {
      setScale(prev => Math.min(1.5, prev * 1.05));
    }
  };
  
  // Use the gesture controls hook
  const { activeGesture } = useGestureControls(
    containerRef,
    gestureHandlers,
    { enableFeedback: false } // We'll handle feedback ourselves
  );
  
  // Get icon for gesture
  const getGestureIcon = (gesture: string | null) => {
    switch (gesture) {
      case 'swipeLeft': return <ArrowLeft className="h-5 w-5" />;
      case 'swipeRight': return <ArrowRight className="h-5 w-5" />;
      case 'swipeUp': return <ArrowUp className="h-5 w-5" />;
      case 'swipeDown': return <ArrowDown className="h-5 w-5" />;
      case 'doubleTap': return <Tap className="h-5 w-5" />;
      case 'longPress': return <Clock className="h-5 w-5" />;
      case 'pinch': return <Minimize className="h-5 w-5" />;
      case 'spread': return <Maximize className="h-5 w-5" />;
      default: return null;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Gesture Controls Demo
        </CardTitle>
        <CardDescription>
          Try different touch gestures on the colored area below
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 p-3 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4" />
            <span>
              Use swipe left/right to navigate sections, pinch/spread to zoom, 
              double tap to select, and long press for context menu.
            </span>
          </div>
        </div>
        
        {/* Gesture area */}
        <div 
          ref={containerRef}
          className={`relative h-64 rounded-lg ${sections[activeSection].color} transition-all duration-300 overflow-hidden touch-manipulation`}
          style={{ transform: `scale(${scale})` }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-2xl font-bold text-white">
              {sections[activeSection].title}
            </h2>
          </div>
          
          {/* Section indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {sections.map((_, index) => (
              <div 
                key={index} 
                className={`h-2 w-2 rounded-full ${
                  index === activeSection ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
          
          {/* Active gesture indicator */}
          {activeGesture && (
            <div className="absolute top-4 right-4 bg-white/90 rounded-full p-2 animate-pulse">
              {getGestureIcon(activeGesture)}
            </div>
          )}
        </div>
        
        {/* Gesture information */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 border rounded-lg">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Swipe Left: Next Section</span>
          </div>
          <div className="flex items-center gap-2 p-2 border rounded-lg">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Swipe Right: Previous Section</span>
          </div>
          <div className="flex items-center gap-2 p-2 border rounded-lg">
            <Minimize className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Pinch: Zoom Out</span>
          </div>
          <div className="flex items-center gap-2 p-2 border rounded-lg">
            <Maximize className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Spread: Zoom In</span>
          </div>
          <div className="flex items-center gap-2 p-2 border rounded-lg">
            <Tap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Double Tap: Select</span>
          </div>
          <div className="flex items-center gap-2 p-2 border rounded-lg">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Long Press: Context Menu</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={activeGesture ? 'default' : 'outline'}>
            {activeGesture ? `${activeGesture} detected` : 'No gesture'}
          </Badge>
          <Badge variant="outline">Scale: {scale.toFixed(2)}</Badge>
        </div>
        <Button variant="outline" onClick={() => setScale(1)}>Reset Zoom</Button>
      </CardFooter>
    </Card>
  );
}
