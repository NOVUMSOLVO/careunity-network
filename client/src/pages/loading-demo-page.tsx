import { useState } from "react";
import { LoadingState, LoaderType } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  HeartBeatLoader, 
  StethoscopeLoader, 
  PulseLineLoader,
  PillLoader,
  MedicalCrossLoader
} from "@/components/ui/loaders";

export default function LoadingDemoPage() {
  const [selectedLoader, setSelectedLoader] = useState<LoaderType>("heartbeat");
  const [showText, setShowText] = useState(true);
  const [fullPage, setFullPage] = useState(false);
  const [customLoaderText, setCustomLoaderText] = useState("Loading...");
  const [textPosition, setTextPosition] = useState<"top" | "bottom" | "left" | "right">("bottom");
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [color, setColor] = useState("primary");
  
  const loaderOptions: { label: string; value: LoaderType }[] = [
    { label: "Heart Beat", value: "heartbeat" },
    { label: "Stethoscope", value: "stethoscope" },
    { label: "Pulse Line", value: "pulse-line" },
    { label: "Pill", value: "pill" },
    { label: "Medical Cross", value: "medical-cross" },
    { label: "Random", value: "random" },
  ];
  
  const positionOptions = [
    { label: "Top", value: "top" },
    { label: "Bottom", value: "bottom" },
    { label: "Left", value: "left" },
    { label: "Right", value: "right" },
  ];
  
  const sizeOptions = [
    { label: "Small", value: "sm" },
    { label: "Medium", value: "md" },
    { label: "Large", value: "lg" },
  ];
  
  const colorOptions = [
    { label: "Primary", value: "primary" },
    { label: "Secondary", value: "secondary" },
    { label: "Accent", value: "accent" },
    { label: "Destructive", value: "destructive" },
  ];
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Loading State Components</h1>
        <p className="text-muted-foreground">
          Healthcare-themed animated loaders for use throughout the CareUnity application
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
              <CardDescription>Customize the loading state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Loader Type</Label>
                <RadioGroup 
                  value={selectedLoader} 
                  onValueChange={(value) => setSelectedLoader(value as LoaderType)}
                  className="grid grid-cols-1 gap-2"
                >
                  {loaderOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`loader-${option.value}`} />
                      <Label htmlFor={`loader-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Text</Label>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-text">Show Text</Label>
                  <Switch 
                    id="show-text" 
                    checked={showText}
                    onCheckedChange={setShowText}
                  />
                </div>
                
                {showText && (
                  <div className="pt-2">
                    <Label htmlFor="loader-text">Custom Text</Label>
                    <input
                      id="loader-text"
                      type="text"
                      value={customLoaderText}
                      onChange={(e) => setCustomLoaderText(e.target.value)}
                      className="w-full p-2 rounded-md border mt-1"
                    />
                  </div>
                )}
              </div>
              
              {showText && (
                <>
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Text Position</Label>
                    <RadioGroup 
                      value={textPosition} 
                      onValueChange={(value) => setTextPosition(value as any)}
                      className="grid grid-cols-2 gap-2"
                    >
                      {positionOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={`position-${option.value}`} />
                          <Label htmlFor={`position-${option.value}`}>{option.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Size</Label>
                <RadioGroup 
                  value={size} 
                  onValueChange={(value) => setSize(value as any)}
                  className="grid grid-cols-3 gap-2"
                >
                  {sizeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`size-${option.value}`} />
                      <Label htmlFor={`size-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Color</Label>
                <RadioGroup 
                  value={color} 
                  onValueChange={setColor}
                  className="grid grid-cols-2 gap-2"
                >
                  {colorOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`color-${option.value}`} />
                      <Label htmlFor={`color-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="full-page">Full Page Overlay</Label>
                  <Switch 
                    id="full-page" 
                    checked={fullPage}
                    onCheckedChange={setFullPage}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                {fullPage 
                  ? "Toggle full page overlay on/off" 
                  : "Customize your loader using the controls"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[400px] relative">
              {fullPage ? (
                <Button 
                  onClick={() => setFullPage(true)}
                  className="relative z-10"
                >
                  Activate Full Page Loader
                </Button>
              ) : (
                <LoadingState
                  type={selectedLoader}
                  text={showText ? customLoaderText : ""}
                  textPosition={textPosition}
                  size={size}
                  color={color}
                />
              )}
              
              {fullPage && (
                <LoadingState
                  type={selectedLoader}
                  text={showText ? customLoaderText : ""}
                  textPosition={textPosition}
                  size={size}
                  color={color}
                  fullPage
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-10 space-y-6">
        <h2 className="text-2xl font-bold">Individual Loader Components</h2>
        <p className="text-muted-foreground">
          These loader components can be used independently throughout the application
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Heart Beat</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-40">
              <HeartBeatLoader size="md" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Stethoscope</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-40">
              <StethoscopeLoader size="md" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pulse Line</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-40">
              <PulseLineLoader width="full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pill</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-40">
              <PillLoader size="md" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Medical Cross</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-40">
              <MedicalCrossLoader size="md" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}