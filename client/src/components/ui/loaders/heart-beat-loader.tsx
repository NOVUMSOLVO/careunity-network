import { cn } from "@/lib/utils";

interface HeartBeatLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function HeartBeatLoader({
  className,
  size = "md",
  color = "stroke-primary",
}: HeartBeatLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        className={cn("animate-heartbeat", sizeClasses[size])}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19.5 13.5L12 21L4.5 13.5C2.5 11.5 2.5 8 4.5 6C6.5 4 9.5 4 11.5 6C11.6667 6.16667 11.8333 6.33333 12 6.5C12.1667 6.33333 12.3333 6.16667 12.5 6C14.5 4 17.5 4 19.5 6C21.5 8 21.5 11.5 19.5 13.5Z"
          className={cn("stroke-2 fill-none", color)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}