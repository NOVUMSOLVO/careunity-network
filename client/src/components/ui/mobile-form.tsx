/**
 * MobileForm Component
 * 
 * A form component optimized for mobile devices.
 * Features:
 * - Touch-friendly inputs
 * - Mobile keyboard optimization
 * - Simplified validation
 * - Responsive layout
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { TouchButton } from './touch-button';
import { useDevice } from '@/hooks/use-mobile';

export interface MobileFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
  /** Form children */
  children: React.ReactNode;
  /** Submit button text */
  submitText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Whether the form is submitting */
  isSubmitting?: boolean;
  /** Whether to show a loading indicator */
  isLoading?: boolean;
  /** Whether to disable the form */
  disabled?: boolean;
  /** Submit handler */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Cancel handler */
  onCancel?: () => void;
  /** Additional class names */
  className?: string;
  /** Whether to use a compact layout */
  compact?: boolean;
  /** Whether to show the form in a card */
  card?: boolean;
}

export function MobileForm({
  title,
  description,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isSubmitting = false,
  isLoading = false,
  disabled = false,
  onSubmit,
  onCancel,
  className,
  compact = false,
  card = true,
  ...props
}: MobileFormProps) {
  const { isMobile } = useDevice();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (disabled || isSubmitting) {
      e.preventDefault();
      return;
    }
    
    if (onSubmit) {
      onSubmit(e);
    }
  };
  
  const formContent = (
    <form
      className={cn(
        "w-full",
        compact ? "space-y-3" : "space-y-4",
        className
      )}
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      {/* Form header */}
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h2 className={cn(
              "font-semibold text-gray-900",
              compact ? "text-lg" : "text-xl"
            )}>
              {title}
            </h2>
          )}
          {description && (
            <p className={cn(
              "text-gray-500 mt-1",
              compact ? "text-sm" : "text-base"
            )}>
              {description}
            </p>
          )}
        </div>
      )}
      
      {/* Form fields */}
      <div className={cn(
        "space-y-4",
        compact && "space-y-3"
      )}>
        {children}
      </div>
      
      {/* Form actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2">
        {onCancel && (
          <TouchButton
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={disabled || isSubmitting}
            className="mt-3 sm:mt-0 w-full sm:w-auto"
            size={compact ? "sm" : "md"}
          >
            {cancelText}
          </TouchButton>
        )}
        <TouchButton
          type="submit"
          variant="primary"
          disabled={disabled || isSubmitting}
          className="w-full sm:w-auto"
          size={compact ? "sm" : "md"}
        >
          {isSubmitting ? 'Submitting...' : submitText}
        </TouchButton>
      </div>
    </form>
  );
  
  // Wrap in card if needed
  if (card) {
    return (
      <div className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-100",
        compact ? "p-4" : "p-6",
      )}>
        {formContent}
      </div>
    );
  }
  
  return formContent;
}

export interface MobileFormFieldProps {
  /** Field label */
  label: string;
  /** Field name */
  name: string;
  /** Field type */
  type?: string;
  /** Field value */
  value?: string | number;
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Whether the field is required */
  required?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Input class names */
  inputClassName?: string;
  /** Whether to use a compact layout */
  compact?: boolean;
  /** Autocomplete attribute */
  autoComplete?: string;
  /** Input mode for mobile keyboards */
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
}

export function MobileFormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  error,
  helperText,
  disabled = false,
  className,
  inputClassName,
  compact = false,
  autoComplete,
  inputMode,
}: MobileFormFieldProps) {
  const [focused, setFocused] = useState(false);
  const { isMobile } = useDevice();
  
  // Determine appropriate input mode for mobile keyboards
  const determineInputMode = () => {
    if (inputMode) return inputMode;
    
    switch (type) {
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      case 'url':
        return 'url';
      case 'number':
        return 'decimal';
      case 'search':
        return 'search';
      default:
        return 'text';
    }
  };
  
  return (
    <div className={cn("w-full", className)}>
      <label 
        htmlFor={name}
        className={cn(
          "block font-medium text-gray-700 mb-1",
          compact ? "text-sm" : "text-base",
          required && "after:content-['*'] after:ml-0.5 after:text-red-500"
        )}
      >
        {label}
      </label>
      
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        inputMode={determineInputMode()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "w-full px-3 py-2 border rounded-md shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          "transition-colors duration-200",
          compact ? "text-sm" : "text-base",
          {
            "border-gray-300": !error && !focused,
            "border-primary": focused && !error,
            "border-red-500 ring-2 ring-red-200": error,
            "bg-gray-100 text-gray-500": disabled,
          },
          // Mobile optimizations
          isMobile && "text-base py-3", // Larger touch target on mobile
          inputClassName
        )}
      />
      
      {/* Error message or helper text */}
      {(error || helperText) && (
        <p className={cn(
          "mt-1",
          compact ? "text-xs" : "text-sm",
          error ? "text-red-500" : "text-gray-500"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

export interface MobileFormTextAreaProps extends Omit<MobileFormFieldProps, 'type' | 'inputMode'> {
  /** Number of rows */
  rows?: number;
}

export function MobileFormTextArea({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder,
  error,
  helperText,
  disabled = false,
  className,
  inputClassName,
  compact = false,
  autoComplete,
  rows = 3,
}: MobileFormTextAreaProps) {
  const [focused, setFocused] = useState(false);
  const { isMobile } = useDevice();
  
  return (
    <div className={cn("w-full", className)}>
      <label 
        htmlFor={name}
        className={cn(
          "block font-medium text-gray-700 mb-1",
          compact ? "text-sm" : "text-base",
          required && "after:content-['*'] after:ml-0.5 after:text-red-500"
        )}
      >
        {label}
      </label>
      
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange as any}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "w-full px-3 py-2 border rounded-md shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          "transition-colors duration-200",
          compact ? "text-sm" : "text-base",
          {
            "border-gray-300": !error && !focused,
            "border-primary": focused && !error,
            "border-red-500 ring-2 ring-red-200": error,
            "bg-gray-100 text-gray-500": disabled,
          },
          // Mobile optimizations
          isMobile && "text-base py-3", // Larger touch target on mobile
          inputClassName
        )}
      />
      
      {/* Error message or helper text */}
      {(error || helperText) && (
        <p className={cn(
          "mt-1",
          compact ? "text-xs" : "text-sm",
          error ? "text-red-500" : "text-gray-500"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
