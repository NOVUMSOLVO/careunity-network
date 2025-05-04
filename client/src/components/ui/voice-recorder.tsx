import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import useVoiceRecognition from '@/lib/useVoiceRecognition';
import { cn } from '@/lib/utils';

export interface ServiceUserOption {
  id: number;
  name: string;
}

interface VoiceRecorderProps {
  serviceUsers: ServiceUserOption[];
  onSave: (note: { content: string; serviceUserId: number }) => void;
  isSubmitting?: boolean;
  className?: string;
}

export function VoiceRecorder({
  serviceUsers,
  onSave,
  isSubmitting = false,
  className
}: VoiceRecorderProps) {
  const [serviceUserId, setServiceUserId] = useState<number | null>(null);
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
    continuous: true,
    lang: 'en-GB'
  });

  const [noteContent, setNoteContent] = useState('');

  // Sync transcript with noteContent
  useEffect(() => {
    setNoteContent(text);
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(e.target.value);
  };

  const handleSave = () => {
    if (!serviceUserId || !noteContent.trim()) return;
    
    onSave({
      content: noteContent.trim(),
      serviceUserId
    });
    
    resetTranscript();
    setNoteContent('');
    setServiceUserId(null);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-accent-600 text-white">
        <CardTitle>Voice Notes</CardTitle>
        <CardDescription className="text-accent-100">
          Record care notes without typing - speak naturally while maintaining eye contact
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1">
            <ScrollArea className="h-[150px]">
              <Textarea
                value={noteContent}
                onChange={handleTextChange}
                placeholder="Your voice notes will appear here..."
                className="min-h-[150px] resize-none"
              />
            </ScrollArea>
            <div className="mt-4">
              <Label htmlFor="service-user-selector" className="text-sm text-gray-500 dark:text-gray-400">
                Associated with:
              </Label>
              <Select 
                onValueChange={(value) => setServiceUserId(Number(value))}
                value={serviceUserId?.toString() || undefined}
              >
                <SelectTrigger id="service-user-selector" className="mt-1">
                  <SelectValue placeholder="Select service user" />
                </SelectTrigger>
                <SelectContent>
                  {serviceUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-center">
            {supported ? (
              <Button
                type="button" 
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isSubmitting}
                className={cn(
                  "mb-3 w-full md:w-auto inline-flex items-center px-6 py-3 text-base",
                  isRecording ? "bg-red-600 hover:bg-red-700" : "bg-accent-600 hover:bg-accent-700"
                )}
              >
                {isRecording ? (
                  <>
                    <MicOff className="mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            ) : (
              <div className="text-center mb-3 p-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
                <p>Voice recording not supported in this browser</p>
              </div>
            )}
            
            <Button
              type="button"
              onClick={handleSave}
              disabled={!serviceUserId || !noteContent.trim() || isSubmitting}
              className="w-full md:w-auto mb-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2" />
                  Save Note
                </>
              )}
            </Button>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Works offline too!
            </div>
            
            {error && (
              <div className="mt-2 p-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
