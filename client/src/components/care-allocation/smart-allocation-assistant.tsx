import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  Clock, 
  UserCheck, 
  Briefcase, 
  MapPin, 
  CalendarClock,
  ThumbsUp,
  ChevronRight,
  RefreshCw,
  UserCog,
  Calendar
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface SmartAllocationAssistantProps {
  className?: string;
}

export function SmartAllocationAssistant({ className }: SmartAllocationAssistantProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');

  const handleVoiceCommand = () => {
    setIsProcessing(true);
    setVoiceCommand('Find a qualified carer for Elizabeth Johnson tomorrow morning');
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuggestions(true);
    }, 1500);
  };

  const handleTextCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (voiceCommand) {
      setIsProcessing(true);
      
      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false);
        setShowSuggestions(true);
      }, 1000);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-primary-600" />
          Smart Allocation Assistant
        </CardTitle>
        <CardDescription>
          Voice-activated allocation commands and intelligent suggestions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <form onSubmit={handleTextCommand} className="flex gap-2">
            <Input 
              placeholder="E.g., Find a carer for Mrs. Smith tomorrow" 
              value={voiceCommand}
              onChange={(e) => setVoiceCommand(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline"
              onClick={handleVoiceCommand}
              className="px-3"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button type="submit">Search</Button>
          </form>

          {isProcessing && (
            <div className="text-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
              <p className="text-sm text-gray-500">Processing your request...</p>
            </div>
          )}

          {showSuggestions && !isProcessing && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="font-medium text-sm">
                  Found 3 suitable carers for Elizabeth Johnson on Tue, May 7th (AM)
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setShowSuggestions(false)}
                >
                  Clear
                </Button>
              </div>

              {/* Suggestion 1 */}
              <div className="border rounded-lg p-4 bg-primary-50">
                <div className="flex items-center gap-4 mb-3">
                  <Badge className="bg-green-100 text-green-800 border-green-200">Best Match</Badge>
                  <div className="text-sm text-gray-500">98% compatibility score</div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary-200">
                    <AvatarImage src="" alt="Sarah Jones" />
                    <AvatarFallback className="bg-primary-100 text-primary-800">SJ</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="font-semibold">Sarah Jones</div>
                    <div className="text-sm text-gray-500">Senior Care Worker</div>
                  </div>
                  
                  <Button size="sm">Allocate</Button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock className="h-3.5 w-3.5 text-primary-500" />
                    <span>Available 8AM-4PM</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <UserCheck className="h-3.5 w-3.5 text-primary-500" />
                    <span>Continuity (12 visits)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Briefcase className="h-3.5 w-3.5 text-primary-500" />
                    <span>Medication trained</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <MapPin className="h-3.5 w-3.5 text-primary-500" />
                    <span>3.2 miles away</span>
                  </div>
                </div>
              </div>

              {/* Suggestion 2 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-4 mb-3">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good Match</Badge>
                  <div className="text-sm text-gray-500">85% compatibility score</div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt="Michael Brown" />
                    <AvatarFallback className="bg-gray-100">MB</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="font-semibold">Michael Brown</div>
                    <div className="text-sm text-gray-500">Care Worker</div>
                  </div>
                  
                  <Button size="sm" variant="outline">Allocate</Button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock className="h-3.5 w-3.5 text-primary-500" />
                    <span>Available 9AM-5PM</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <UserCheck className="h-3.5 w-3.5 text-gray-400" />
                    <span>New to client</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Briefcase className="h-3.5 w-3.5 text-primary-500" />
                    <span>Medication trained</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <MapPin className="h-3.5 w-3.5 text-primary-500" />
                    <span>2.5 miles away</span>
                  </div>
                </div>
              </div>

              {/* Suggestion 3 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-4 mb-3">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Alternative</Badge>
                  <div className="text-sm text-gray-500">73% compatibility score</div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt="Emma Wilson" />
                    <AvatarFallback className="bg-gray-100">EW</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="font-semibold">Emma Wilson</div>
                    <div className="text-sm text-gray-500">Care Worker</div>
                  </div>
                  
                  <Button size="sm" variant="outline">Allocate</Button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock className="h-3.5 w-3.5 text-primary-500" />
                    <span>Available 7AM-3PM</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <UserCheck className="h-3.5 w-3.5 text-primary-500" />
                    <span>Previous visits (3)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                    <span>Medication training needed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <MapPin className="h-3.5 w-3.5 text-primary-500" />
                    <span>4.1 miles away</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!showSuggestions && !isProcessing && (
            <div className="space-y-6 mt-4">
              <h3 className="text-sm font-medium text-gray-700">Quick Commands</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => {
                    setVoiceCommand("Find available carers for tomorrow with medication training");
                    handleTextCommand(new Event('submit') as any);
                  }}
                >
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-primary-500" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Skills-based search</div>
                      <div className="text-xs text-gray-500">Find carers with specific qualifications</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => {
                    setVoiceCommand("Find closest carers to Robert Wilson for emergency visit");
                    handleTextCommand(new Event('submit') as any);
                  }}
                >
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Proximity search</div>
                      <div className="text-xs text-gray-500">Find nearest available carers</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => {
                    setVoiceCommand("Reallocate Michael Brown's visits for May 10th");
                    handleTextCommand(new Event('submit') as any);
                  }}
                >
                  <div className="flex items-center">
                    <CalendarClock className="h-4 w-4 mr-2 text-primary-500" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Reallocation</div>
                      <div className="text-xs text-gray-500">Reassign visits when staff unavailable</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => {
                    setVoiceCommand("Who is the best match for Mrs. Johnson's morning medication visit?");
                    handleTextCommand(new Event('submit') as any);
                  }}
                >
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-2 text-primary-500" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Best match finder</div>
                      <div className="text-xs text-gray-500">Optimal carer-client compatibility</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button variant="outline" className="w-full">
          <Calendar className="h-4 w-4 mr-2" />
          View Full Allocation Calendar
        </Button>
      </CardFooter>
    </Card>
  );
}