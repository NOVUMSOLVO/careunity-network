import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface VoiceInputButtonProps {
  onCommand: (command: string) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

/**
 * Voice Input Button Component
 * 
 * This component provides a button that activates voice recognition
 * and passes recognized commands to the parent component.
 */
export function VoiceInputButton({ 
  onCommand, 
  size = 'icon', 
  variant = 'outline',
  className = ''
}: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableCommands, setAvailableCommands] = useState<string[]>([
    'Show dashboard',
    'Show schedule',
    'Show service users',
    'Show alerts',
    'Show team',
    'Create new visit',
    'Search for [name]',
    'Mark visit complete',
    'Add note',
    'Call office'
  ]);
  
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if browser supports speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const result = event.results[current][0].transcript;
          setTranscript(result);
          
          // Process the command after recognition is complete
          processCommand(result);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          
          toast({
            title: 'Voice Recognition Error',
            description: `Error: ${event.error}. Please try again.`,
            variant: 'destructive',
          });
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        toast({
          title: 'Voice Recognition Not Supported',
          description: 'Your browser does not support voice recognition.',
          variant: 'destructive',
        });
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);

  // Process the recognized command
  const processCommand = async (command: string) => {
    if (!command) return;
    
    setIsProcessing(true);
    
    try {
      // Simple command processing
      // In a real app, you might use NLP or a more sophisticated approach
      const normalizedCommand = command.toLowerCase().trim();
      
      // Wait a moment to show the processing state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Pass the command to the parent component
      onCommand(command);
      
      // Close the dialog after processing
      setTimeout(() => {
        setIsDialogOpen(false);
        setTranscript('');
        setIsProcessing(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error processing command:', error);
      toast({
        title: 'Command Processing Error',
        description: 'There was an error processing your command. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  // Start listening for voice input
  const startListening = () => {
    setIsDialogOpen(true);
    setTranscript('');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: 'Voice Recognition Error',
          description: 'Could not start voice recognition. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // Stop listening for voice input
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    stopListening();
    setIsDialogOpen(false);
    setTranscript('');
    setIsProcessing(false);
  };

  return (
    <>
      <Button 
        onClick={startListening} 
        size={size} 
        variant={variant}
        className={className}
        aria-label="Voice command"
      >
        <Mic className="h-4 w-4" />
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Voice Command</DialogTitle>
            <DialogDescription>
              {isListening ? 'Listening for your command...' : 
               isProcessing ? 'Processing your command...' : 
               transcript ? 'Command received:' : 'Click the microphone to speak a command'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-4">
            {isListening ? (
              <Button 
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-full border-2 border-primary animate-pulse"
                onClick={stopListening}
              >
                <Mic className="h-8 w-8 text-primary" />
              </Button>
            ) : isProcessing ? (
              <div className="h-16 w-16 rounded-full border-2 border-primary flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-full border-2"
                onClick={startListening}
              >
                <Mic className="h-8 w-8" />
              </Button>
            )}
            
            {transcript && (
              <div className="mt-4 p-3 bg-muted rounded-md w-full">
                <p className="text-center font-medium">{transcript}</p>
              </div>
            )}
          </div>
          
          <div className="mt-2">
            <h4 className="text-sm font-medium mb-2">Available Commands:</h4>
            <div className="flex flex-wrap gap-2">
              {availableCommands.map((command, index) => (
                <Badge key={index} variant="secondary">{command}</Badge>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
