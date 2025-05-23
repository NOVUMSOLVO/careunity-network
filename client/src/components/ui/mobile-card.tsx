/**
 * MobileCard Component
 * 
 * A card component optimized for mobile devices.
 * Features:
 * - Touch-friendly design
 * - Optional swipe actions
 * - Compact layout for mobile screens
 * - Supports various content layouts
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Swipeable } from './swipeable';
import { TouchButton } from './touch-button';
import { useDevice } from '@/hooks/use-mobile';

export interface MobileCardProps {
  /** Card title */
  title: string;
  /** Card subtitle or description */
  subtitle?: string;
  /** Main content of the card */
  children?: React.ReactNode;
  /** Icon to display in the card */
  icon?: React.ReactNode;
  /** Actions to display in the card footer */
  actions?: React.ReactNode;
  /** Whether to make the entire card clickable */
  clickable?: boolean;
  /** Click handler for the card */
  onClick?: () => void;
  /** Left swipe actions (usually delete) */
  leftSwipeActions?: React.ReactNode;
  /** Right swipe actions (usually secondary actions) */
  rightSwipeActions?: React.ReactNode;
  /** Callback when swiped left beyond threshold */
  onSwipeLeft?: () => void;
  /** Callback when swiped right beyond threshold */
  onSwipeRight?: () => void;
  /** Whether the card is dismissible by swiping */
  dismissible?: boolean;
  /** Whether to disable the card */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Whether to show a compact version of the card */
  compact?: boolean;
  /** Badge content to display in the corner */
  badge?: React.ReactNode;
  /** Badge color */
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export function MobileCard({
  title,
  subtitle,
  children,
  icon,
  actions,
  clickable = false,
  onClick,
  leftSwipeActions,
  rightSwipeActions,
  onSwipeLeft,
  onSwipeRight,
  dismissible = false,
  disabled = false,
  className,
  compact = false,
  badge,
  badgeColor = 'primary',
}: MobileCardProps) {
  const { isMobile, touchEnabled } = useDevice();
  
  // Determine if we should use swipe actions
  const useSwipeActions = (leftSwipeActions || rightSwipeActions) && (isMobile || touchEnabled);
  
  // Card content
  const cardContent = (
    <div 
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden",
        compact ? "p-3" : "p-4",
        clickable && !disabled && "hover:shadow-md transition-shadow cursor-pointer",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
      onClick={clickable && !disabled ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable && !disabled ? 0 : undefined}
      aria-disabled={disabled}
    >
      {/* Badge (if provided) */}
      {badge && (
        <div className={cn(
          "absolute top-0 right-0 px-2 py-1 text-xs font-medium text-white rounded-bl-lg rounded-tr-lg",
          {
            "bg-primary": badgeColor === 'primary',
            "bg-secondary": badgeColor === 'secondary',
            "bg-green-500": badgeColor === 'success',
            "bg-yellow-500": badgeColor === 'warning',
            "bg-red-500": badgeColor === 'error',
            "bg-blue-500": badgeColor === 'info',
          }
        )}>
          {badge}
        </div>
      )}
      
      {/* Card header */}
      <div className="flex items-start gap-3 mb-2">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-medium text-gray-900 truncate",
            compact ? "text-sm" : "text-base"
          )}>
            {title}
          </h3>
          {subtitle && (
            <p className={cn(
              "text-gray-500 truncate",
              compact ? "text-xs" : "text-sm"
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {/* Card content */}
      {children && (
        <div className={cn(
          "text-gray-700",
          compact ? "text-sm" : "text-base",
          icon ? "ml-10" : ""
        )}>
          {children}
        </div>
      )}
      
      {/* Card actions */}
      {actions && (
        <div className={cn(
          "flex flex-wrap items-center gap-2 mt-3",
          icon ? "ml-10" : ""
        )}>
          {actions}
        </div>
      )}
    </div>
  );
  
  // Wrap with swipeable if needed
  if (useSwipeActions) {
    return (
      <Swipeable
        leftActions={leftSwipeActions}
        rightActions={rightSwipeActions}
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
        dismissible={dismissible}
        disabled={disabled}
        leftActionsClassName="bg-red-500 text-white px-4"
        rightActionsClassName="bg-blue-500 text-white px-4"
      >
        {cardContent}
      </Swipeable>
    );
  }
  
  // Otherwise return the card content directly
  return cardContent;
}

/**
 * MobileCardAction component for consistent action buttons in MobileCard
 */
export function MobileCardAction({
  children,
  onClick,
  variant = 'ghost',
  icon,
  disabled,
  className,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <TouchButton
      variant={variant}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={className}
      startIcon={icon}
    >
      {children}
    </TouchButton>
  );
}

/**
 * MobileCardDelete component for delete action in swipeable cards
 */
export function MobileCardDelete({
  onDelete,
  confirmLabel = "Delete",
}: {
  onDelete: () => void;
  confirmLabel?: string;
}) {
  return (
    <TouchButton
      variant="destructive"
      size="sm"
      onClick={onDelete}
      className="h-full px-4"
    >
      {confirmLabel}
    </TouchButton>
  );
}

/**
 * MobileCardEdit component for edit action in swipeable cards
 */
export function MobileCardEdit({
  onEdit,
  label = "Edit",
}: {
  onEdit: () => void;
  label?: string;
}) {
  return (
    <TouchButton
      variant="primary"
      size="sm"
      onClick={onEdit}
      className="h-full px-4"
    >
      {label}
    </TouchButton>
  );
}
