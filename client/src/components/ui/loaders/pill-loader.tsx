import { cn } from "@/lib/utils";

interface PillLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  primaryColor?: string;
  secondaryColor?: string;
}

export function PillLoader({
  className,
  size = "md",
  primaryColor = "fill-primary",
  secondaryColor = "fill-primary/20",
}: PillLoaderProps) {
  const sizeClasses = {
    sm: "w-10 h-6",
    md: "w-16 h-10",
    lg: "w-24 h-16",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <svg
          className="w-full h-full"
          viewBox="0 0 60 30"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pill capsule outline */}
          <rect 
            x="5" 
            y="5" 
            width="50" 
            height="20" 
            rx="10" 
            ry="10" 
            className={cn("stroke-2", secondaryColor)} 
          />
          
          {/* Left half - animated fill */}
          <rect 
            x="5" 
            y="5" 
            width="25" 
            height="20" 
            rx="10" 
            ry="10" 
            className={cn("animate-pill-fill", primaryColor)} 
          />
          
          {/* Right half - animated fill with delay */}
          <rect 
            x="30" 
            y="5" 
            width="25" 
            height="20" 
            rx="10" 
            ry="10" 
            className={cn("animate-pill-fill-delay", primaryColor)} 
          />
          
          {/* Pill divider line */}
          <line 
            x1="30" 
            y1="5" 
            x2="30" 
            y2="25" 
            stroke="white" 
            strokeWidth="1" 
          />
        </svg>
      </div>
    </div>
  );
}