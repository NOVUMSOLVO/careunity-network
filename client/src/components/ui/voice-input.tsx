import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useVoiceRecognition } from '@/lib/useVoiceRecognition';

interface VoiceInputProps {
  onTextChange?: (text: string) => void;
  onCommand?: (command: string) => void;
  commandMode?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  iconOnly?: boolean;
  placeholder?: string;
  ariaLabel?: string;
}

/**
 * Voice Input component for hands-free operation
 * 
 * This component provides a button that activates voice recognition
 * and either returns the recognized text or processes it as a command.
 */
export function VoiceInput({
  onTextChange,
  onCommand,
  commandMode = false,
  className,
  variant = 'outline',
  size = 'icon',
  iconOnly = false,
  placeholder = 'Tap to speak',
  ariaLabel = 'Activate voice input',
}: VoiceInputProps) {
  const [pulseAnimation, setPulseAnimation] = useState(false);
  
  const {
    text,
    isRecording,
    status,
    startRecording,
    stopRecording,
    resetTranscript,
    error,
    supported
  } = useVoiceRecognition({
    continuous: !commandMode,
    lang: 'en-GB'
  });

  // Pass recognized text to parent component
  useEffect(() => {
    if (onTextChange && text) {
      onTextChange(text);
    }
  }, [text, onTextChange]);

  // Process command when in command mode
  useEffect(() => {
    if (commandMode && onCommand && text && status === 'done') {
      onCommand(text);
      resetTranscript();
    }
  }, [commandMode, onCommand, text, status, resetTranscript]);

  // Start/stop pulse animation based on recording state
  useEffect(() => {
    setPulseAnimation(isRecording);
  }, [isRecording]);

  // Handle button click
  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // If voice recognition is not supported, don't render the component
  if (!supported) {
    return null;
  }

  // Determine button label based on state
  const buttonLabel = isRecording 
    ? 'Listening...' 
    : status === 'processing' 
      ? 'Processing...' 
      : placeholder;

  return (
    <div className={cn('flex items-center', className)}>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={status === 'processing'}
        className={cn(
          pulseAnimation && 'animate-pulse',
          isRecording && variant === 'outline' && 'border-red-500 text-red-500',
          isRecording && variant === 'default' && 'bg-red-500'
        )}
        aria-label={ariaLabel}
      >
        {status === 'processing' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRecording ? (
          <Mic className="h-4 w-4" />
        ) : (
          <MicOff className="h-4 w-4" />
        )}
        {!iconOnly && <span className="ml-2">{buttonLabel}</span>}
      </Button>
      
      {error && !iconOnly && (
        <span className="ml-2 text-sm text-red-500">{error}</span>
      )}
    </div>
  );
}
