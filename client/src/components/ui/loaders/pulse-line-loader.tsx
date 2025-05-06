import { cn } from "@/lib/utils";

interface PulseLineLoaderProps {
  className?: string;
  height?: "sm" | "md" | "lg";
  width?: "sm" | "md" | "lg" | "full";
  color?: string;
}

export function PulseLineLoader({
  className,
  height = "md",
  width = "md",
  color = "stroke-primary",
}: PulseLineLoaderProps) {
  const heightClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
  };
  
  const widthClasses = {
    sm: "w-24",
    md: "w-40",
    lg: "w-64",
    full: "w-full",
  };

  return (
    <div className={cn("flex items-center justify-center", heightClasses[height], widthClasses[width], className)}>
      <svg 
        viewBox="0 0 120 30" 
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <path
          className={cn("animate-pulse-line", color)}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="180"
          strokeDashoffset="180"
          d="M0,15 L10,15 C15,15 15,5 20,5 C25,5 25,25 30,25 C35,25 35,15 40,15 L50,15 L60,15 C65,15 65,5 70,5 C75,5 75,25 80,25 C85,25 85,15 90,15 L100,15 L110,15 L120,15"
        />
      </svg>
    </div>
  );
}