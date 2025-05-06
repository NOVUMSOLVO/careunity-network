import { cn } from "@/lib/utils";

interface MedicalCrossLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function MedicalCrossLoader({
  className,
  size = "md",
  color = "text-primary",
}: MedicalCrossLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("animate-spin-slow", sizeClasses[size])}>
        <svg 
          className="w-full h-full" 
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className={cn("fill-current", color)}
            d="M14 4H10V10H4V14H10V20H14V14H20V10H14V4Z"
          />
        </svg>
      </div>
    </div>
  );
}