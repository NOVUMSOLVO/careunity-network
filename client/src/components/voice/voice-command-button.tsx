/**
 * Voice Command Button Component
 * 
 * This component provides a button that activates voice commands.
 */

import React, { useState } from 'react';
import { Mic, MicOff, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceInput } from '@/components/ui/voice-input';
import { useVoiceCommands } from '@/lib/voice-command-handler';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VoiceCommandButtonProps {
  className?: string;
}

export function VoiceCommandButton({ className }: VoiceCommandButtonProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { executeCommand } = useVoiceCommands();
  
  const handleCommand = (command: string) => {
    executeCommand(command);
  };
  
  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <VoiceInput
              onCommand={handleCommand}
              commandMode={true}
              variant="outline"
              size="icon"
              iconOnly={true}
              ariaLabel="Activate voice commands"
              className={className}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Voice Commands</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Voice Command Help</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voice Commands</DialogTitle>
            <DialogDescription>
              You can use the following voice commands to navigate and control the application.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <h3 className="text-sm font-medium">Navigation</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>"Go to Dashboard"</li>
                <li>"Open Service Users"</li>
                <li>"Show Care Plans"</li>
                <li>"Go to Care Allocation"</li>
                <li>"Open Staff Management"</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Search</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>"Search for [name]"</li>
                <li>"Find [term]"</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Create</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>"Create Service User"</li>
                <li>"Add Care Plan"</li>
                <li>"New Appointment"</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Help</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>"Help"</li>
                <li>"What can you do?"</li>
                <li>"Show commands"</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsHelpOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
