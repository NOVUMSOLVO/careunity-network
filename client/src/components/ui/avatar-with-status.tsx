import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
type StatusColor = 'green' | 'red' | 'yellow' | 'gray';

interface AvatarWithStatusProps {
  src: string;
  alt: string;
  fallback: string;
  size?: AvatarSize;
  status?: StatusColor;
  className?: string;
}

const sizeMap = {
  sm: {
    avatar: 'h-8 w-8',
    status: 'h-2 w-2 right-0 bottom-0'
  },
  md: {
    avatar: 'h-10 w-10',
    status: 'h-2.5 w-2.5 right-0 bottom-0'
  },
  lg: {
    avatar: 'h-12 w-12',
    status: 'h-3 w-3 right-0 bottom-0'
  },
  xl: {
    avatar: 'h-16 w-16',
    status: 'h-4 w-4 right-1 bottom-1'
  }
};

const statusColorMap = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-400',
  gray: 'bg-gray-400'
};

export function AvatarWithStatus({
  src,
  alt,
  fallback,
  size = 'md',
  status,
  className
}: AvatarWithStatusProps) {
  const avatarSize = sizeMap[size].avatar;
  const statusSize = sizeMap[size].status;
  const statusColor = status ? statusColorMap[status] : undefined;
  
  return (
    <div className="relative">
      <Avatar className={cn(avatarSize, className)}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      {status && (
        <span className={cn(
          'absolute border-2 border-white dark:border-gray-800 rounded-full',
          statusColor,
          statusSize
        )}></span>
      )}
    </div>
  );
}
