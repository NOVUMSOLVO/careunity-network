/**
 * Mobile-Optimized Form Component
 * 
 * A form component that's optimized for mobile devices with:
 * - Larger touch targets
 * - Appropriate input types for mobile keyboards
 * - Simplified validation
 * - Responsive layout
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDevice } from '@/hooks/use-mobile';
import { TouchTarget } from './touch-target';
import { Label } from './label';
import { Input } from './input';
import { Textarea } from './textarea';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Checkbox } from './checkbox';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Switch } from './switch';
import { AlertCircle, Check } from 'lucide-react';

// Form field types
export type FieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch';

// Form field definition
export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { label: string; value: string }[];
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: any) => boolean;
    errorMessage?: string;
  };
  defaultValue?: any;
  autoComplete?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  hideLabel?: boolean;
}

// Form props
export interface MobileOptimizedFormProps {
  fields: FormField[];
  onSubmit: (values: Record<string, any>) => void;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
  fieldClassName?: string;
  submitClassName?: string;
  cancelClassName?: string;
  initialValues?: Record<string, any>;
  responsive?: boolean;
  compact?: boolean;
  fullWidthButtons?: boolean;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
  showSuccessIndicators?: boolean;
}

/**
 * Mobile-Optimized Form Component
 */
export function MobileOptimizedForm({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  loading = false,
  className,
  fieldClassName,
  submitClassName,
  cancelClassName,
  initialValues = {},
  responsive = true,
  compact = false,
  fullWidthButtons = false,
  validationMode = 'onBlur',
  showSuccessIndicators = true,
}: MobileOptimizedFormProps) {
  const { isMobile, touchEnabled } = useDevice();
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [valid, setValid] = useState<Record<string, boolean>>({});
  
  // Initialize form values from initialValues
  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);
  
  // Handle input change
  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validate on change if configured
    if (validationMode === 'onChange') {
      validateField(name, value);
    }
  };
  
  // Handle input blur
  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur if configured
    if (validationMode === 'onBlur') {
      validateField(name, values[name]);
    }
  };
  
  // Validate a single field
  const validateField = (name: string, value: any): boolean => {
    const field = fields.find(f => f.name === name);
    if (!field) return true;
    
    // Required validation
    if (field.required && (value === undefined || value === null || value === '')) {
      setErrors(prev => ({ ...prev, [name]: 'This field is required' }));
      setValid(prev => ({ ...prev, [name]: false }));
      return false;
    }
    
    // Skip other validations if value is empty and not required
    if (value === undefined || value === null || value === '') {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      setValid(prev => ({ ...prev, [name]: true }));
      return true;
    }
    
    // Pattern validation
    if (field.validation?.pattern && !field.validation.pattern.test(String(value))) {
      setErrors(prev => ({ 
        ...prev, 
        [name]: field.validation?.errorMessage || 'Invalid format' 
      }));
      setValid(prev => ({ ...prev, [name]: false }));
      return false;
    }
    
    // Min/max length validation for strings
    if (typeof value === 'string') {
      if (field.validation?.minLength && value.length < field.validation.minLength) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: `Must be at least ${field.validation?.minLength} characters` 
        }));
        setValid(prev => ({ ...prev, [name]: false }));
        return false;
      }
      
      if (field.validation?.maxLength && value.length > field.validation.maxLength) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: `Must be at most ${field.validation?.maxLength} characters` 
        }));
        setValid(prev => ({ ...prev, [name]: false }));
        return false;
      }
    }
    
    // Min/max validation for numbers
    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
      const numValue = Number(value);
      
      if (field.validation?.min !== undefined && numValue < field.validation.min) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: `Must be at least ${field.validation?.min}` 
        }));
        setValid(prev => ({ ...prev, [name]: false }));
        return false;
      }
      
      if (field.validation?.max !== undefined && numValue > field.validation.max) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: `Must be at most ${field.validation?.max}` 
        }));
        setValid(prev => ({ ...prev, [name]: false }));
        return false;
      }
    }
    
    // Custom validation
    if (field.validation?.custom && !field.validation.custom(value)) {
      setErrors(prev => ({ 
        ...prev, 
        [name]: field.validation?.errorMessage || 'Invalid value' 
      }));
      setValid(prev => ({ ...prev, [name]: false }));
      return false;
    }
    
    // If all validations pass, clear error and mark as valid
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    setValid(prev => ({ ...prev, [name]: true }));
    return true;
  };
  
  // Validate all fields
  const validateForm = (): boolean => {
    let isValid = true;
    
    fields.forEach(field => {
      const fieldIsValid = validateField(field.name, values[field.name]);
      if (!fieldIsValid) {
        isValid = false;
      }
      
      // Mark all fields as touched
      setTouched(prev => ({ ...prev, [field.name]: true }));
    });
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const isValid = validateForm();
    
    if (isValid) {
      onSubmit(values);
    }
  };
  
  // Determine if a field has an error and should show it
  const shouldShowError = (name: string): boolean => {
    return !!errors[name] && touched[name];
  };
  
  // Determine if a field is valid and should show success indicator
  const shouldShowSuccess = (name: string): boolean => {
    return showSuccessIndicators && valid[name] && touched[name];
  };
  
  // Render a form field based on its type
  const renderField = (field: FormField) => {
    const {
      name,
      label,
      type,
      placeholder,
      helperText,
      required,
      disabled,
      options,
      autoComplete,
      className: fieldSpecificClassName,
      labelClassName,
      inputClassName,
      hideLabel,
    } = field;
    
    const showError = shouldShowError(name);
    const showSuccess = shouldShowSuccess(name);
    
    // Common props for all input types
    const commonProps = {
      id: name,
      name,
      disabled: disabled || loading,
      'aria-invalid': showError,
      'aria-describedby': showError ? `${name}-error` : helperText ? `${name}-helper` : undefined,
    };
    
    // Common wrapper classes
    const wrapperClassName = cn(
      'space-y-2',
      compact ? 'mb-3' : 'mb-4',
      fieldClassName,
      fieldSpecificClassName
    );
    
    // Common input classes
    const commonInputClassName = cn(
      inputClassName,
      showError && 'border-red-500 focus:ring-red-500',
      showSuccess && 'border-green-500 focus:ring-green-500',
      isMobile && touchEnabled && 'text-base py-3' // Larger text and padding on mobile
    );
    
    // Render label
    const renderLabel = () => {
      if (hideLabel) return null;
      
      return (
        <Label
          htmlFor={name}
          className={cn(
            'mb-1 block',
            required && 'after:content-["*"] after:ml-0.5 after:text-red-500',
            labelClassName
          )}
        >
          {label}
        </Label>
      );
    };
    
    // Render error or helper text
    const renderHelperText = () => {
      if (showError) {
        return (
          <div id={`${name}-error`} className="text-red-500 text-sm flex items-center mt-1">
            <AlertCircle size={14} className="mr-1" />
            {errors[name]}
          </div>
        );
      }
      
      if (helperText) {
        return (
          <div id={`${name}-helper`} className="text-gray-500 text-sm mt-1">
            {helperText}
          </div>
        );
      }
      
      return null;
    };
    
    // Render success indicator
    const renderSuccessIndicator = () => {
      if (showSuccess) {
        return (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
            <Check size={16} />
          </div>
        );
      }
      
      return null;
    };
    
    switch (type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'tel':
      case 'url':
      case 'date':
      case 'time':
      case 'datetime-local':
        return (
          <div className={wrapperClassName}>
            {renderLabel()}
            <div className="relative">
              <Input
                {...commonProps}
                type={type}
                placeholder={placeholder}
                value={values[name] || ''}
                onChange={(e) => handleChange(name, e.target.value)}
                onBlur={() => handleBlur(name)}
                autoComplete={autoComplete}
                className={commonInputClassName}
                inputMode={
                  type === 'email' ? 'email' :
                  type === 'tel' ? 'tel' :
                  type === 'number' ? 'decimal' :
                  type === 'url' ? 'url' :
                  'text'
                }
              />
              {renderSuccessIndicator()}
            </div>
            {renderHelperText()}
          </div>
        );
        
      case 'textarea':
        return (
          <div className={wrapperClassName}>
            {renderLabel()}
            <Textarea
              {...commonProps}
              placeholder={placeholder}
              value={values[name] || ''}
              onChange={(e) => handleChange(name, e.target.value)}
              onBlur={() => handleBlur(name)}
              className={commonInputClassName}
              rows={isMobile ? 4 : 3}
            />
            {renderHelperText()}
          </div>
        );
        
      case 'select':
        return (
          <div className={wrapperClassName}>
            {renderLabel()}
            <Select
              value={values[name] || ''}
              onValueChange={(value) => handleChange(name, value)}
              disabled={disabled || loading}
            >
              <SelectTrigger
                id={name}
                className={commonInputClassName}
                onBlur={() => handleBlur(name)}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderHelperText()}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className={cn(wrapperClassName, 'flex items-start space-y-0 space-x-2')}>
            <Checkbox
              {...commonProps}
              checked={!!values[name]}
              onCheckedChange={(checked) => handleChange(name, checked)}
              onBlur={() => handleBlur(name)}
              className={cn(
                isMobile && touchEnabled && 'h-5 w-5', // Larger checkbox on mobile
                inputClassName
              )}
            />
            <div className="space-y-1 leading-none">
              <label
                htmlFor={name}
                className={cn(
                  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                  labelClassName
                )}
              >
                {label}
              </label>
              {renderHelperText()}
            </div>
          </div>
        );
        
      case 'radio':
        return (
          <div className={wrapperClassName}>
            {renderLabel()}
            <RadioGroup
              value={values[name] || ''}
              onValueChange={(value) => handleChange(name, value)}
              onBlur={() => handleBlur(name)}
              className="space-y-2"
            >
              {options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    id={`${name}-${option.value}`}
                    value={option.value}
                    disabled={disabled || loading}
                    className={cn(
                      isMobile && touchEnabled && 'h-5 w-5', // Larger radio on mobile
                      inputClassName
                    )}
                  />
                  <label
                    htmlFor={`${name}-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </RadioGroup>
            {renderHelperText()}
          </div>
        );
        
      case 'switch':
        return (
          <div className={cn(wrapperClassName, 'flex items-center justify-between')}>
            <label
              htmlFor={name}
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                labelClassName
              )}
            >
              {label}
            </label>
            <Switch
              {...commonProps}
              checked={!!values[name]}
              onCheckedChange={(checked) => handleChange(name, checked)}
              onBlur={() => handleBlur(name)}
              className={inputClassName}
            />
            {renderHelperText()}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className={cn(
        responsive && isMobile ? 'space-y-3' : 'space-y-4',
        responsive && 'sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0'
      )}>
        {fields.map((field) => (
          <div key={field.name} className={cn(
            responsive && field.type === 'textarea' && 'sm:col-span-2'
          )}>
            {renderField(field)}
          </div>
        ))}
      </div>
      
      <div className={cn(
        'flex items-center',
        fullWidthButtons ? 'flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2' : 'justify-end space-x-2'
      )}>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className={cn(
              fullWidthButtons && 'w-full sm:w-auto',
              cancelClassName
            )}
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className={cn(
            fullWidthButtons && 'w-full sm:w-auto',
            submitClassName
          )}
        >
          {loading ? 'Loading...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
