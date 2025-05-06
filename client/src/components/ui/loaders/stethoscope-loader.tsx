import { cn } from "@/lib/utils";

interface StethoscopeLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function StethoscopeLoader({
  className,
  size = "md",
  color = "stroke-primary",
}: StethoscopeLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        className={cn("animate-pulse", sizeClasses[size])}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className={cn("animate-draw-path stroke-2 fill-none", color)}
          d="M4.5 12.5L6 11C7.5 9.5 10.5 9.5 12 11L13 12L14 11C15.5 9.5 18.5 9.5 20 11L21.5 12.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          className={cn("animate-pulse-delay fill-none stroke-2", color)}
          cx="18"
          cy="16"
          r="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className={cn("animate-draw-path stroke-2 fill-none", color)}
          d="M18 18V22C18 22 18 22.5 17.5 22.5C17 22.5 16 22.5 16 22.5C16 22.5 12 22.5 10 20.5C10 20.5 2 12.5 2 7C2 4.5 4 2.5 6.5 2.5C9 2.5 10 4 10 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}