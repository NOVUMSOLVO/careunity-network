/**
 * Voice Dictation Field Component
 * 
 * This component provides a textarea with voice dictation capabilities.
 */

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useVoiceRecognition } from '@/lib/useVoiceRecognition';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VoiceDictationFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  ariaLabel?: string;
}

export function VoiceDictationField({
  value,
  onChange,
  placeholder = 'Type or dictate your notes here...',
  className,
  rows = 4,
  maxLength,
  disabled = false,
  ariaLabel = 'Notes',
}: VoiceDictationFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  
  const {
    text,
    isRecording,
    status,
    startRecording,
    stopRecording,
    resetTranscript,
    error,
    supported,
  } = useVoiceRecognition({
    continuous: true,
    lang: 'en-GB',
  });
  
  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Update local value when dictation text changes
  useEffect(() => {
    if (text && !disabled) {
      // If we have a cursor position, insert at that position
      if (cursorPosition !== null) {
        const newValue = localValue.substring(0, cursorPosition) + text + localValue.substring(cursorPosition);
        setLocalValue(newValue);
        setCursorPosition(cursorPosition + text.length);
      } else {
        // Otherwise append to the end
        setLocalValue((prev) => prev + text);
      }
      
      // Reset the transcript
      resetTranscript();
      
      // Notify parent component
      onChange(localValue + text);
    }
  }, [text, localValue, onChange, resetTranscript, cursorPosition, disabled]);
  
  // Handle manual text input
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
    
    // Update cursor position
    setCursorPosition(e.target.selectionStart);
  };
  
  // Handle cursor position changes
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    setCursorPosition(target.selectionStart);
  };
  
  // Toggle recording
  const toggleRecording = () => {
    if (disabled) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      resetTranscript();
      startRecording();
    }
  };
  
  return (
    <div className="relative">
      <Textarea
        value={localValue}
        onChange={handleTextChange}
        onSelect={handleSelect}
        onClick={handleSelect}
        placeholder={placeholder}
        className={cn("pr-10", className)}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        aria-label={ariaLabel}
      />
      
      {supported && (
        <div className="absolute right-2 bottom-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full",
                    isRecording && "bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600"
                  )}
                  onClick={toggleRecording}
                  disabled={disabled || status === 'processing'}
                  aria-label={isRecording ? "Stop dictation" : "Start dictation"}
                >
                  {status === 'processing' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isRecording ? (
                    <Mic className="h-4 w-4" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {isRecording ? "Stop dictation" : "Start dictation"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-500 mt-1">{error}</div>
      )}
    </div>
  );
}
