import { cn } from "@/lib/utils";
import { 
  HeartBeatLoader, 
  StethoscopeLoader, 
  PulseLineLoader,
  PillLoader,
  MedicalCrossLoader
} from "./loaders";

export type LoaderType = 
  | "heartbeat" 
  | "stethoscope" 
  | "pulse-line" 
  | "pill" 
  | "medical-cross" 
  | "random";

interface LoadingStateProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  type?: LoaderType;
  color?: string;
  text?: string;
  textPosition?: "top" | "bottom" | "left" | "right";
  fullPage?: boolean;
}

export function LoadingState({
  className,
  size = "md",
  type = "random",
  color = "primary",
  text = "Loading...",
  textPosition = "bottom",
  fullPage = false,
}: LoadingStateProps) {
  // Dynamic color class based on the color prop
  const colorClass = color.startsWith("text-") || color.startsWith("stroke-") || color.startsWith("fill-")
    ? color
    : `text-${color}`;
  
  // Choose a loader randomly if type is "random"
  const loaderTypes: LoaderType[] = ["heartbeat", "stethoscope", "pulse-line", "pill", "medical-cross"];
  const finalType = type === "random" 
    ? loaderTypes[Math.floor(Math.random() * loaderTypes.length)] 
    : type;
  
  // Define the container classes based on text position
  const containerClasses = {
    top: "flex-col-reverse",
    bottom: "flex-col",
    left: "flex-row-reverse",
    right: "flex-row",
  };
  
  // Define text margin classes based on text position
  const textMarginClasses = {
    top: "mb-3",
    bottom: "mt-3",
    left: "mr-3",
    right: "ml-3",
  };
  
  // Render the selected loader
  const renderLoader = () => {
    switch (finalType) {
      case "heartbeat":
        return <HeartBeatLoader size={size} color={colorClass} />;
      case "stethoscope":
        return <StethoscopeLoader size={size} color={colorClass} />;
      case "pulse-line":
        return <PulseLineLoader height={size} width={size} color={colorClass} />;
      case "pill":
        return <PillLoader size={size} primaryColor={colorClass} />;
      case "medical-cross":
        return <MedicalCrossLoader size={size} color={colorClass} />;
      default:
        return <HeartBeatLoader size={size} color={colorClass} />;
    }
  };
  
  // Create the component based on whether it should be full page or not
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className={cn(
          "flex items-center justify-center",
          containerClasses[textPosition],
          className
        )}>
          {renderLoader()}
          {text && (
            <div className={cn(
              "text-foreground font-medium",
              textMarginClasses[textPosition]
            )}>
              {text}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "flex items-center justify-center",
      containerClasses[textPosition],
      className
    )}>
      {renderLoader()}
      {text && (
        <div className={cn(
          "text-foreground font-medium",
          textMarginClasses[textPosition]
        )}>
          {text}
        </div>
      )}
    </div>
  );
}