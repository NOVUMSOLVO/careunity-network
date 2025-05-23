/**
 * ML Models Voice Commands Component
 * 
 * This component provides voice command functionality for ML models.
 * It listens for voice commands and triggers appropriate actions.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VoiceCommandsProps {
  className?: string;
  onCommand?: (command: string) => void;
  availableCommands?: Array<{ command: string; description: string }>;
}

export function VoiceCommands({
  className = '',
  onCommand,
  availableCommands = [
    { command: 'show models', description: 'Display all available models' },
    { command: 'test model', description: 'Test the currently selected model' },
    { command: 'show performance', description: 'Show model performance metrics' },
    { command: 'cache models', description: 'Cache all models for offline use' },
    { command: 'sync data', description: 'Synchronize pending requests' }
  ]
}: VoiceCommandsProps) {
  // State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commandHistory, setCommandHistory] = useState<Array<{ command: string; timestamp: Date }>>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Check if speech recognition is supported
  const isSpeechRecognitionSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  // Initialize speech recognition
  useEffect(() => {
    if (!isSpeechRecognitionSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    if (recognitionRef.current) {
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.trim().toLowerCase();
        
        setTranscript(command);
        processCommand(command);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          toast({
            title: 'Microphone Access Denied',
            description: 'Please allow microphone access to use voice commands',
            variant: 'destructive',
          });
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart if it was supposed to be listening
          recognitionRef.current?.start();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        if (isListening) {
          recognitionRef.current.stop();
        }
      }
    };
  }, [isSpeechRecognitionSupported, isListening, toast]);

  // Process voice command
  const processCommand = (command: string) => {
    // Add to history
    setCommandHistory(prev => [{ command, timestamp: new Date() }, ...prev].slice(0, 5));
    
    // Check if command matches any available commands
    const matchedCommand = availableCommands.find(c => 
      command.includes(c.command.toLowerCase())
    );
    
    if (matchedCommand) {
      // Provide feedback
      provideFeedback(matchedCommand.command);
      
      // Call the onCommand callback
      if (onCommand) {
        onCommand(matchedCommand.command);
      }
    }
  };

  // Provide audio feedback for recognized commands
  const provideFeedback = (command: string) => {
    // Visual feedback
    toast({
      title: 'Command Recognized',
      description: command,
    });
    
    // Audio feedback (if supported)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Command recognized: ${command}`);
      utterance.volume = 0.5;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle listening state
  const toggleListening = () => {
    if (!isSpeechRecognitionSupported) {
      toast({
        title: 'Not Supported',
        description: 'Speech recognition is not supported in this browser',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      // Stop listening
      recognitionRef.current?.stop();
      setIsListening(false);
      toast({
        title: 'Voice Commands',
        description: 'Stopped listening for commands',
      });
    } else {
      // Start listening
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast({
          title: 'Voice Commands',
          description: 'Listening for commands...',
        });
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: 'Error',
          description: 'Failed to start speech recognition',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Voice Commands</CardTitle>
            <CardDescription>
              Use voice to control ML models
            </CardDescription>
          </div>
          <Badge variant={isListening ? 'default' : 'outline'}>
            {isListening ? 'Listening' : 'Not Listening'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isSpeechRecognitionSupported && (
          <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
            Speech recognition is not supported in this browser.
          </div>
        )}
        
        {isSpeechRecognitionSupported && (
          <>
            <div className="flex justify-center">
              <Button
                size="lg"
                variant={isListening ? 'destructive' : 'default'}
                className="rounded-full w-16 h-16 flex items-center justify-center"
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
            </div>
            
            {transcript && (
              <div className="p-3 bg-muted rounded-md text-center">
                <p className="text-sm text-muted-foreground mb-1">Last heard:</p>
                <p className="font-medium">{transcript}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium mb-2">Available Commands:</h3>
              <ul className="space-y-2">
                {availableCommands.map((cmd, index) => (
                  <li key={index} className="flex items-start">
                    <Volume2 className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">"{cmd.command}"</span>
                      <p className="text-sm text-muted-foreground">{cmd.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
        
        {commandHistory.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Command History:</h3>
            <ul className="space-y-1">
              {commandHistory.map((item, index) => (
                <li key={index} className="text-sm">
                  <span className="text-muted-foreground">
                    {item.timestamp.toLocaleTimeString()}: 
                  </span>
                  <span className="ml-2 font-medium">{item.command}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance('Voice commands are ready to use. Try saying "show models" or "test model".');
              window.speechSynthesis.speak(utterance);
            }
          }}
          disabled={!('speechSynthesis' in window)}
        >
          Test Speech Output
        </Button>
      </CardFooter>
    </Card>
  );
}
