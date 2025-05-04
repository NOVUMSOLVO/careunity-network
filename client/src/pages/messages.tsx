import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AvatarWithStatus } from '@/components/ui/avatar-with-status';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Send, Users, Edit, Paperclip } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock conversations data - in a real app, this would come from an API
  const conversations = [
    {
      id: '1',
      name: 'Team Group',
      lastMessage: 'Remember the staff meeting tomorrow at 9 AM',
      time: '10:30 AM',
      unread: 2,
      isGroup: true,
      status: 'online', // or offline, away
      members: ['Sarah J.', 'Mark L.', 'Emma R.'],
      messages: [
        { id: 1, sender: 'Mark L.', content: 'Good morning team! Just a reminder that we have our weekly staff meeting tomorrow at 9 AM.', time: '10:15 AM', isMe: false },
        { id: 2, sender: 'Emma R.', content: 'Thanks for the reminder, Mark. Will we be discussing the new care plan templates?', time: '10:20 AM', isMe: false },
        { id: 3, sender: 'Mark L.', content: "Yes, that's on the agenda. Also updates on CQC compliance.", time: '10:25 AM', isMe: false },
        { id: 4, sender: 'Me', content: "I'll prepare a brief report on our compliance progress. See you all tomorrow!", time: '10:30 AM', isMe: true },
      ]
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      lastMessage: "I've reviewed James's medication plan and made some adjustments",
      time: 'Yesterday',
      unread: 0,
      isGroup: false,
      status: 'offline',
      messages: [
        { id: 1, sender: 'Dr. Michael Chen', content: "Hello Sarah, I've been reviewing James Wilson's medication plan.", time: 'Yesterday, 2:15 PM', isMe: false },
        { id: 2, sender: 'Dr. Michael Chen', content: "I've made some adjustments to his blood pressure medication dosage. The updated prescription has been sent to the pharmacy.", time: 'Yesterday, 2:18 PM', isMe: false },
        { id: 3, sender: 'Me', content: "Thank you, Dr. Chen. I'll make sure to update his care plan and inform the team about the changes.", time: 'Yesterday, 2:25 PM', isMe: true },
        { id: 4, sender: 'Dr. Michael Chen', content: 'Great. Please monitor for any side effects and let me know how he responds to the adjusted dosage.', time: 'Yesterday, 2:30 PM', isMe: false },
      ]
    },
    {
      id: '3',
      name: 'Anna Johnson (Family)',
      lastMessage: 'How is my father doing today?',
      time: '2 days ago',
      unread: 1,
      isGroup: false,
      status: 'away',
      messages: [
        { id: 1, sender: 'Anna Johnson', content: 'Hi Sarah, how is my father doing today?', time: '2 days ago, 11:05 AM', isMe: false },
        { id: 2, sender: 'Me', content: 'Hello Anna! Your father had a good morning. He had breakfast in the garden and really enjoyed the sunshine.', time: '2 days ago, 11:15 AM', isMe: true },
        { id: 3, sender: 'Anna Johnson', content: "That's wonderful to hear! He always loved being outdoors. Did he take his medication without any issues?", time: '2 days ago, 11:20 AM', isMe: false },
        { id: 4, sender: 'Me', content: "Yes, no problems with medication. He's looking forward to your visit this weekend.", time: '2 days ago, 11:30 AM', isMe: true },
      ]
    }
  ];

  // Filter conversations based on search term
  const filteredConversations = searchTerm
    ? conversations.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : conversations;

  // Currently selected conversation
  const currentConversation = conversations.find(c => c.id === selectedConversation);

  // Handle send message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // In a real app, this would send the message to the API
    console.log('Sending message:', newMessage);
    
    // Clear the input
    setNewMessage('');
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Messages"
          description="Communicate with your team and families"
          actions={
            <Button className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              New Message
            </Button>
          }
        />

        <div className="py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
            {/* Conversations List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-350px)] min-h-[400px]">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        "p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer",
                        selectedConversation === conversation.id && "bg-primary-50 dark:bg-primary-900/20"
                      )}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          {conversation.isGroup ? (
                            <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            </div>
                          ) : (
                            <AvatarWithStatus
                              src=""
                              alt={conversation.name}
                              fallback={conversation.name.substring(0, 2)}
                              status={conversation.status as any}
                            />
                          )}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {conversation.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {conversation.time}
                          </p>
                          {conversation.unread > 0 && (
                            <Badge className="mt-1 bg-primary-500">
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            {/* Message Thread */}
            <div className="col-span-1 lg:col-span-2">
              {selectedConversation ? (
                <Card className="h-full flex flex-col">
                  <CardHeader className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {currentConversation?.isGroup ? (
                          <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          </div>
                        ) : (
                          <AvatarWithStatus
                            src=""
                            alt={currentConversation?.name || ""}
                            fallback={currentConversation?.name.substring(0, 2) || ""}
                            status={currentConversation?.status as any}
                          />
                        )}
                        <div className="ml-3">
                          <CardTitle className="text-base">{currentConversation?.name}</CardTitle>
                          {currentConversation?.isGroup && (
                            <CardDescription className="text-xs">
                              {currentConversation?.members?.join(', ')}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 flex-grow overflow-y-auto flex flex-col-reverse">
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-4">
                        {currentConversation?.messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex",
                              message.isMe ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[75%] rounded-lg px-4 py-2 text-sm",
                                message.isMe
                                  ? "bg-primary-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                              )}
                            >
                              {!message.isMe && (
                                <p className="font-medium text-xs mb-1">
                                  {message.sender}
                                </p>
                              )}
                              <p>{message.content}</p>
                              <p
                                className={cn(
                                  "text-right text-xs mt-1",
                                  message.isMe
                                    ? "text-primary-100"
                                    : "text-gray-500 dark:text-gray-400"
                                )}
                              >
                                {message.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  
                  <CardFooter className="p-4 border-t border-gray-200 dark:border-gray-700 gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="flex-shrink-0"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-0 h-10 resize-none py-2"
                    />
                    <Button 
                      className="flex-shrink-0"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center pt-6">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                      Select a conversation
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Choose a conversation from the list or start a new one.
                    </p>
                    <Button className="mt-4">
                      <Edit className="mr-2 h-4 w-4" />
                      New Message
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
