import React, { useState, useEffect, useRef } from 'react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Send,
  MoreVertical,
  User,
  Users,
  Phone,
  Video,
  Info,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Mic,
  Star,
  Clock,
  CheckCheck,
  CheckCircle,
  Plus,
  RefreshCcw,
  Filter,
  MessageSquare as MessageSquareIcon
} from 'lucide-react';

// Types
interface User {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastActive?: string;
  isTyping?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string | null; // null for group messages
  groupId?: string | null;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  type: 'image' | 'document' | 'voice';
  name: string;
  url: string;
  size?: string;
}

interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  name?: string; // for group chats
}

// Mock data for users
const users: User[] = [
  {
    id: 'u1',
    name: 'Sarah Johnson',
    role: 'Care Coordinator',
    avatar: '',
    status: 'online',
  },
  {
    id: 'u2',
    name: 'David Thompson',
    role: 'Caregiver',
    avatar: '',
    status: 'online',
    isTyping: true,
  },
  {
    id: 'u3',
    name: 'Michael Roberts',
    role: 'Manager',
    avatar: '',
    status: 'away',
    lastActive: '10 min ago',
  },
  {
    id: 'u4',
    name: 'Emily Clark',
    role: 'Caregiver',
    avatar: '',
    status: 'offline',
    lastActive: '2 hours ago',
  },
  {
    id: 'u5',
    name: 'Robert Davis',
    role: 'Caregiver',
    avatar: '',
    status: 'online',
  },
  {
    id: 'u6',
    name: 'Jessica Wilson',
    role: 'Care Coordinator',
    avatar: '',
    status: 'busy',
  }
];

// Mock data for conversations
const conversations: Conversation[] = [
  {
    id: 'c1',
    type: 'direct',
    participants: [users[0], users[1]],
    lastMessage: {
      id: 'm1',
      senderId: 'u2',
      recipientId: 'u1',
      content: "I'll be 10 minutes late to the Thompson visit due to traffic",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      isRead: false,
    },
    unreadCount: 1,
    isPinned: true,
  },
  {
    id: 'c2',
    type: 'direct',
    participants: [users[0], users[2]],
    lastMessage: {
      id: 'm2',
      senderId: 'u1',
      recipientId: 'u3',
      content: 'Please review the updated care plan for Mrs. Wilson',
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
      isRead: true,
    },
    unreadCount: 0,
    isPinned: false,
  },
  {
    id: 'c3',
    type: 'group',
    name: 'Morning Shift Team',
    participants: [users[0], users[1], users[3], users[4]],
    lastMessage: {
      id: 'm3',
      senderId: 'u4',
      recipientId: null,
      groupId: 'c3',
      content: 'All visits completed for this morning',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      isRead: true,
    },
    unreadCount: 0,
    isPinned: true,
  },
  {
    id: 'c4',
    type: 'direct',
    participants: [users[0], users[3]],
    lastMessage: {
      id: 'm4',
      senderId: 'u1',
      recipientId: 'u4',
      content: 'Could you take an extra visit tomorrow afternoon?',
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
      isRead: true,
    },
    unreadCount: 0,
    isPinned: false,
  },
  {
    id: 'c5',
    type: 'group',
    name: 'Urgent Care Team',
    participants: [users[0], users[1], users[2], users[5]],
    lastMessage: {
      id: 'm5',
      senderId: 'u6',
      recipientId: null,
      groupId: 'c5',
      content: 'New emergency protocol documents have been shared',
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      isRead: false,
    },
    unreadCount: 1,
    isPinned: false,
  }
];

// Mock data for messages in a conversation
const mockMessages: Record<string, Message[]> = {
  'c1': [
    {
      id: 'm1-1',
      senderId: 'u1',
      recipientId: 'u2',
      content: 'Hi David, how is the morning route going?',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      isRead: true,
    },
    {
      id: 'm1-2',
      senderId: 'u2',
      recipientId: 'u1',
      content: "Morning Sarah, it's going well. Just finished with Mrs. Brown",
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      isRead: true,
    },
    {
      id: 'm1-3',
      senderId: 'u1',
      recipientId: 'u2',
      content: 'Great! Any issues to report?',
      timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      isRead: true,
    },
    {
      id: 'm1-4',
      senderId: 'u2',
      recipientId: 'u1',
      content: "No issues with Mrs. Brown, but I'm heading to the Thompson visit now and there's heavy traffic",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      isRead: true,
    },
    {
      id: 'm1-5',
      senderId: 'u1',
      recipientId: 'u2',
      content: "Thanks for letting me know. I'll call Mr. Thompson to inform him.",
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      isRead: true,
    },
    {
      id: 'm1-6',
      senderId: 'u2',
      recipientId: 'u1',
      content: "I'll be 10 minutes late to the Thompson visit due to traffic",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      isRead: false,
    }
  ],
  'c3': [
    {
      id: 'm3-1',
      senderId: 'u1',
      recipientId: null,
      groupId: 'c3',
      content: 'Good morning team, please update on your visits as you complete them',
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
      isRead: true,
    },
    {
      id: 'm3-2',
      senderId: 'u5',
      recipientId: null,
      groupId: 'c3',
      content: 'Clark and Davis visits complete, heading to Wilson now',
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      isRead: true,
    },
    {
      id: 'm3-3',
      senderId: 'u4',
      recipientId: null,
      groupId: 'c3',
      content: 'Brown visit complete. Johnson medication administered, need restock soon',
      timestamp: new Date(Date.now() - 3.5 * 3600000).toISOString(),
      isRead: true,
      attachments: [
        {
          id: 'a1',
          type: 'image',
          name: 'Medication_chart.jpg',
          url: '',
          size: '1.2 MB'
        }
      ]
    },
    {
      id: 'm3-4',
      senderId: 'u1',
      recipientId: null,
      groupId: 'c3',
      content: "Thanks for the updates. @Emily I'll arrange medication restock for Johnson",
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
      isRead: true,
    },
    {
      id: 'm3-5',
      senderId: 'u5',
      recipientId: null,
      groupId: 'c3',
      content: 'Wilson visit complete',
      timestamp: new Date(Date.now() - 2.5 * 3600000).toISOString(),
      isRead: true,
    },
    {
      id: 'm3-6',
      senderId: 'u4',
      recipientId: null,
      groupId: 'c3',
      content: 'All visits completed for this morning',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      isRead: true,
    }
  ]
};

// Get conversation name
const getConversationName = (conversation: Conversation, currentUserId: string): string => {
  if (conversation.type === 'group') {
    return conversation.name || 'Group Chat';
  } else {
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
    return otherParticipant ? otherParticipant.name : 'Chat';
  }
};

// Format date for message timestamp
const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than a minute
  if (diff < 60000) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }
  
  // Today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  
  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Within a week
  if (diff < 604800000) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  
  // Older
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Format date for conversation list
const formatConversationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  
  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Within a week
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (date > weekAgo) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  
  // Older
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Get user initials
const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Get user by ID
const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

// Get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'busy':
      return 'bg-red-500';
    case 'away':
      return 'bg-yellow-500';
    case 'offline':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

export default function Messages() {
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string>('u1'); // Default user (Sarah)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOfflineUsers, setShowOfflineUsers] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineMessages, setOfflineMessages] = useState<{[key: string]: Message[]}>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize conversation selection
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      selectConversation(conversations[0]);
    }
  }, []);
  
  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Select conversation and load messages
  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Load messages for this conversation
    if (mockMessages[conversation.id]) {
      setMessages(mockMessages[conversation.id]);
    } else {
      setMessages([]);
    }
    
    // Mark as read
    if (conversation.unreadCount > 0) {
      // In a real app, this would update the backend
      conversation.unreadCount = 0;
      if (conversation.lastMessage) {
        conversation.lastMessage.isRead = true;
      }
    }
  };
  
  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation => {
    const conversationName = getConversationName(conversation, currentUserId).toLowerCase();
    return conversationName.includes(searchQuery.toLowerCase());
  });
  
  // Send a message
  const sendMessage = () => {
    if (!selectedConversation || !inputMessage.trim()) return;
    
    // Create new message
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      senderId: currentUserId,
      recipientId: selectedConversation.type === 'direct' 
        ? selectedConversation.participants.find(p => p.id !== currentUserId)?.id || null
        : null,
      groupId: selectedConversation.type === 'group' ? selectedConversation.id : undefined,
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    // If we're offline, store the message locally
    if (isOffline) {
      const conversationId = selectedConversation.id;
      setOfflineMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage]
      }));
      
      toast({
        title: 'Offline Mode',
        description: "Message saved locally and will be sent when you're back online",
      });
    } else {
      // In a real app, this would send to the backend
      // For now, just update the local state
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      
      // Update the conversation's last message
      if (selectedConversation) {
        selectedConversation.lastMessage = newMessage;
      }
      
      // In a real app, the server would emit this message to other participants via WebSocket
    }
    
    // Clear input
    setInputMessage('');
  };
  
  // Toggle online/offline mode
  const toggleOfflineMode = () => {
    setIsOffline(!isOffline);
    
    toast({
      title: isOffline ? 'Back Online' : 'Offline Mode',
      description: isOffline 
        ? 'You are now connected. Queued messages will be sent.'
        : 'Messages will be saved locally until connectivity is restored.',
    });
    
    // If going back online, send all offline messages
    if (isOffline && Object.keys(offlineMessages).length > 0) {
      // In a real app, this would batch send messages to the backend
      Object.entries(offlineMessages).forEach(([conversationId, msgList]) => {
        if (msgList.length > 0) {
          // Find the conversation
          const conv = conversations.find(c => c.id === conversationId);
          if (conv) {
            // Add messages to the conversation
            if (!mockMessages[conversationId]) {
              mockMessages[conversationId] = [];
            }
            
            mockMessages[conversationId] = [...mockMessages[conversationId], ...msgList];
            
            // Update the conversation's last message
            conv.lastMessage = msgList[msgList.length - 1];
          }
        }
      });
      
      // If the current conversation has offline messages, update the UI
      if (selectedConversation && offlineMessages[selectedConversation.id]) {
        setMessages([...messages, ...offlineMessages[selectedConversation.id]]);
      }
      
      // Clear offline messages
      setOfflineMessages({});
    }
  };
  
  // Create a new conversation
  const createNewConversation = (userId: string) => {
    const otherUser = getUserById(userId);
    if (!otherUser) return;
    
    // Check if conversation already exists
    const existingConversation = conversations.find(
      c => c.type === 'direct' && c.participants.some(p => p.id === userId)
    );
    
    if (existingConversation) {
      selectConversation(existingConversation);
      return;
    }
    
    // Create new conversation
    const newConversation: Conversation = {
      id: `c-${Date.now()}`,
      type: 'direct',
      participants: [getUserById(currentUserId)!, otherUser],
      unreadCount: 0,
      isPinned: false,
    };
    
    // In a real app, this would save to the backend
    conversations.push(newConversation);
    selectConversation(newConversation);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">Communicate with caregivers and staff members</p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant={isOffline ? "destructive" : "outline"}
            size="sm"
            onClick={toggleOfflineMode}
            className="flex items-center gap-1"
          >
            {isOffline ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-1" />
                Offline Mode
              </>
            ) : (
              <>
                <CheckCheck className="h-4 w-4 mr-1" />
                Online
              </>
            )}
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Message
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Start a conversation</CardTitle>
                  <CardDescription>Select a team member to message</CardDescription>
                  <div className="relative mt-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8"
                    />
                  </div>
                </CardHeader>
                <CardContent className="grid gap-1 p-0 max-h-[300px] overflow-y-auto">
                  {users
                    .filter(user => user.id !== currentUserId)
                    .filter(user => showOfflineUsers || user.status !== 'offline')
                    .map(user => (
                      <Button
                        key={user.id}
                        variant="ghost"
                        className="justify-start w-full py-2"
                        onClick={() => {
                          createNewConversation(user.id);
                          document.body.click(); // Close popover
                        }}
                      >
                        <div className="flex items-center w-full">
                          <div className="relative mr-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.role}</div>
                          </div>
                        </div>
                      </Button>
                    ))
                  }
                </CardContent>
                <CardFooter className="flex justify-between border-t p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show-offline"
                      checked={showOfflineUsers}
                      onChange={() => setShowOfflineUsers(!showOfflineUsers)}
                      className="rounded"
                    />
                    <label htmlFor="show-offline" className="text-sm">Show offline users</label>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => document.body.click()}>
                    Cancel
                  </Button>
                </CardFooter>
              </Card>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
        {/* Conversations Panel */}
        <Card className="md:col-span-1 overflow-hidden flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-1 pt-1">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="pinned">Pinned</TabsTrigger>
                </TabsList>
              </Tabs>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 ml-1">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter Conversations</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Direct Messages</DropdownMenuItem>
                  <DropdownMenuItem>Group Chats</DropdownMenuItem>
                  <DropdownMenuItem>Recent</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <ScrollArea className="flex-1">
            <div className="px-4 py-3 space-y-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredConversations.map(conversation => {
                  const conversationName = getConversationName(conversation, currentUserId);
                  const isActive = selectedConversation?.id === conversation.id;
                  
                  let otherUser: User | undefined;
                  if (conversation.type === 'direct') {
                    otherUser = conversation.participants.find(p => p.id !== currentUserId);
                  }
                  
                  return (
                    <div
                      key={conversation.id}
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${
                        isActive 
                          ? 'bg-primary-50 border border-primary-200' 
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={() => selectConversation(conversation)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          {conversation.type === 'direct' ? (
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={otherUser?.avatar} />
                              <AvatarFallback>{getUserInitials(otherUser?.name || 'User')}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                              <Users className="h-5 w-5" />
                            </div>
                          )}
                          
                          {conversation.type === 'direct' && otherUser && (
                            <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(otherUser.status)}`} />
                          )}
                          
                          {conversation.type === 'group' && (
                            <Badge className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] flex items-center justify-center p-0">
                              {conversation.participants.length}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm truncate">{conversationName}</h4>
                            <div className="flex flex-col items-end">
                              {conversation.lastMessage && (
                                <span className="text-xs text-gray-500">
                                  {formatConversationTime(conversation.lastMessage.timestamp)}
                                </span>
                              )}
                              {conversation.unreadCount > 0 && (
                                <Badge className="mt-1 h-5 min-w-[1.25rem] flex items-center justify-center p-0">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {conversation.lastMessage && conversation.type === 'group' && (
                              <span className="text-xs font-medium text-gray-600 truncate">
                                {getUserById(conversation.lastMessage.senderId)?.name.split(' ')[0]}:
                              </span>
                            )}
                            
                            {conversation.lastMessage ? (
                              <p className="text-xs text-gray-500 truncate">
                                {conversation.lastMessage.content}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400 italic">No messages yet</p>
                            )}
                            
                            {conversation.isPinned && (
                              <Star className="h-3 w-3 text-amber-500 flex-shrink-0 ml-auto" />
                            )}
                          </div>
                          
                          {otherUser?.isTyping && (
                            <div className="text-xs text-primary-600 mt-1 flex items-center">
                              <div className="flex space-x-1 mr-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" style={{ animationDelay: '200ms' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" style={{ animationDelay: '400ms' }}></div>
                              </div>
                              typing...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </Card>
        
        {/* Chat Panel */}
        <Card className="md:col-span-2 overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {selectedConversation.type === 'direct' ? (
                      <div className="flex items-center">
                        <div className="relative mr-3">
                          {(() => {
                            const otherUser = selectedConversation.participants.find(p => p.id !== currentUserId);
                            return (
                              <>
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src={otherUser?.avatar} />
                                  <AvatarFallback>{getUserInitials(otherUser?.name || 'User')}</AvatarFallback>
                                </Avatar>
                                {otherUser && (
                                  <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(otherUser.status)}`} />
                                )}
                              </>
                            );
                          })()}
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {getConversationName(selectedConversation, currentUserId)}
                          </CardTitle>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            {(() => {
                              const otherUser = selectedConversation.participants.find(p => p.id !== currentUserId);
                              if (otherUser) {
                                return (
                                  <>
                                    <span className="capitalize">{otherUser.status}</span>
                                    {otherUser.status === 'offline' && otherUser.lastActive && (
                                      <span>• Last active {otherUser.lastActive}</span>
                                    )}
                                    {otherUser.isTyping && (
                                      <span className="text-primary-600">• typing...</span>
                                    )}
                                  </>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="mr-3 h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {selectedConversation.name}
                            <Badge variant="outline" className="ml-1 text-xs">
                              {selectedConversation.participants.length} members
                            </Badge>
                          </CardTitle>
                          <div className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-[300px]">
                            {selectedConversation.participants
                              .map(p => p.name.split(' ')[0])
                              .join(', ')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    {selectedConversation.type === 'direct' && (
                      <>
                        <Button variant="ghost" size="icon" className="rounded-full" title="Voice Call">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full" title="Video Call">
                          <Video className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" className="rounded-full" title="Conversation Info">
                      <Info className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          selectedConversation.isPinned = !selectedConversation.isPinned;
                          toast({
                            title: selectedConversation.isPinned 
                              ? "Conversation pinned" 
                              : "Conversation unpinned",
                            description: selectedConversation.isPinned 
                              ? "This conversation will stay at the top of your list" 
                              : "This conversation has been unpinned",
                          });
                        }}>
                          {selectedConversation.isPinned ? "Unpin Conversation" : "Pin Conversation"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>Mark as Unread</DropdownMenuItem>
                        <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Clear Chat History</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => {
                        const isCurrentUser = message.senderId === currentUserId;
                        const sender = getUserById(message.senderId);
                        
                        // Check if we need to show a day separator
                        let showDateSeparator = false;
                        if (index === 0) {
                          showDateSeparator = true;
                        } else {
                          const currentDate = new Date(message.timestamp).toDateString();
                          const prevDate = new Date(messages[index - 1].timestamp).toDateString();
                          if (currentDate !== prevDate) {
                            showDateSeparator = true;
                          }
                        }
                        
                        return (
                          <div key={message.id}>
                            {showDateSeparator && (
                              <div className="flex items-center justify-center my-6">
                                <div className="bg-gray-200 h-px flex-grow"></div>
                                <div className="mx-4 text-xs text-gray-500 font-medium">
                                  {new Date(message.timestamp).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className="bg-gray-200 h-px flex-grow"></div>
                              </div>
                            )}
                            
                            <div 
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className="flex max-w-[75%]">
                                {!isCurrentUser && selectedConversation.type === 'group' && (
                                  <div className="mr-2 mt-1">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={sender?.avatar} />
                                      <AvatarFallback>{getUserInitials(sender?.name || 'User')}</AvatarFallback>
                                    </Avatar>
                                  </div>
                                )}
                                
                                <div className={`space-y-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                  {!isCurrentUser && selectedConversation.type === 'group' && (
                                    <div className="text-xs font-medium text-gray-600">
                                      {sender?.name}
                                    </div>
                                  )}
                                  
                                  <div 
                                    className={`rounded-lg px-3 py-2 break-words ${
                                      isCurrentUser 
                                        ? 'bg-primary-600 text-white' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    <p className="text-sm">{message.content}</p>
                                    
                                    {message.attachments && message.attachments.length > 0 && (
                                      <div className="mt-2 space-y-2">
                                        {message.attachments.map(attachment => (
                                          <div 
                                            key={attachment.id}
                                            className={`flex items-center gap-2 p-2 rounded ${
                                              isCurrentUser 
                                                ? 'bg-primary-700 text-white' 
                                                : 'bg-gray-200 text-gray-800'
                                            }`}
                                          >
                                            {attachment.type === 'image' ? (
                                              <ImageIcon className="h-4 w-4 flex-shrink-0" />
                                            ) : (
                                              <FileText className="h-4 w-4 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                              <div className="text-xs font-medium truncate">
                                                {attachment.name}
                                              </div>
                                              {attachment.size && (
                                                <div className="text-xs opacity-75">{attachment.size}</div>
                                              )}
                                            </div>
                                            <Button 
                                              variant="ghost" 
                                              size="icon"
                                              className={`h-6 w-6 rounded-full ${
                                                isCurrentUser 
                                                  ? 'text-white hover:bg-primary-800' 
                                                  : 'text-gray-700 hover:bg-gray-300'
                                              }`}
                                            >
                                              <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                viewBox="0 0 24 24" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                strokeWidth="2"
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                className="h-3 w-3"
                                              >
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7 10 12 15 17 10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                              </svg>
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center text-xs text-gray-500">
                                    <span>{formatMessageTime(message.timestamp)}</span>
                                    {isCurrentUser && (
                                      <span className="ml-1">
                                        {message.isRead ? (
                                          <CheckCheck className="h-3 w-3 text-primary-500" />
                                        ) : (
                                          <CheckCheck className="h-3 w-3" />
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </ScrollArea>
              
              <CardFooter className="border-t p-3 space-y-3">
                <div className="w-full">
                  <Textarea
                    placeholder={`Message ${getConversationName(selectedConversation, currentUserId)}...`}
                    className="resize-none min-h-[80px]"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    className="gap-1"
                    disabled={!inputMessage.trim()}
                    onClick={sendMessage}
                  >
                    <Send className="h-4 w-4" />
                    <span>Send</span>
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquareIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No conversation selected</h3>
                <p className="text-gray-500 mt-1">Select a conversation from the list or start a new one</p>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    document.querySelector<HTMLButtonElement>('button:has(svg.lucide-plus)')?.click();
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Start New Conversation
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}