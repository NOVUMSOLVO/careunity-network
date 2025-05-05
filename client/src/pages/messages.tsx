import React, { useState } from 'react';
import { MessageSquare, Plus, Search, Send, UserPlus, Paperclip, MoreHorizontal, X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Messages() {
  const [selectedContact, setSelectedContact] = useState<number | null>(1);
  const [messageInput, setMessageInput] = useState('');
  const [newMessageModalOpen, setNewMessageModalOpen] = useState(false);
  
  // State for new message dialog
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageSubject, setNewMessageSubject] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');

  // Mock data
  const contacts = [
    { id: 1, name: 'Jane Wilson', role: 'Caregiver', status: 'online', unread: 1, lastMessage: 'Yes, I can visit tomorrow morning', lastMessageTime: '10:32 AM' },
    { id: 2, name: 'Sarah Johnson', role: 'Service User', status: 'offline', unread: 0, lastMessage: 'Thank you for your help', lastMessageTime: 'Yesterday' },
    { id: 3, name: 'Michael Brown', role: 'Caregiver', status: 'online', unread: 3, lastMessage: 'We need to discuss Mr. Smith\'s care plan', lastMessageTime: '09:15 AM' },
    { id: 4, name: 'Robert Davis', role: 'Service User', status: 'away', unread: 0, lastMessage: 'Appointment confirmed', lastMessageTime: 'Monday' },
    { id: 5, name: 'David Thompson', role: 'Manager', status: 'online', unread: 0, lastMessage: 'I\'ll review the report today', lastMessageTime: 'Yesterday' },
  ];

  const messages = [
    { id: 1, senderId: 1, text: 'Good morning! How are you today?', timestamp: '09:15 AM', isRead: true },
    { id: 2, senderId: 'me', text: 'I\'m doing well, thank you! How about you?', timestamp: '09:17 AM', isRead: true },
    { id: 3, senderId: 1, text: 'I\'m good as well. I wanted to check if we\'re still on for the care plan review this afternoon?', timestamp: '09:20 AM', isRead: true },
    { id: 4, senderId: 'me', text: 'Yes, definitely. Let\'s meet at 2:00 PM as planned.', timestamp: '09:22 AM', isRead: true },
    { id: 5, senderId: 1, text: 'Perfect! I\'ll bring the updated assessment documentation.', timestamp: '09:25 AM', isRead: true },
    { id: 6, senderId: 'me', text: 'Great, thanks. Also, could you update me on Mr. Smith\'s medication compliance?', timestamp: '09:30 AM', isRead: true },
    { id: 7, senderId: 1, text: 'Yes, I can visit tomorrow morning at 10:00 AM to check on that.', timestamp: '10:32 AM', isRead: false },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim() === '') return;
    // In a real app, this would send the message to the API
    // For now, we just clear the input
    setMessageInput('');
  };
  
  const handleNewMessage = () => {
    // In a real app, this would send the new message to an API
    if (newMessageRecipient.trim() === '' || newMessageContent.trim() === '') return;
    
    // Reset the form
    setNewMessageRecipient('');
    setNewMessageSubject('');
    setNewMessageContent('');
    
    // Close the modal
    setNewMessageModalOpen(false);
    
    // Show success message
    alert(`Message sent to ${newMessageRecipient}`);
  };

  const getStatusIndicator = (status: string) => {
    switch(status) {
      case 'online':
        return <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block"></span>;
      case 'away':
        return <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full inline-block"></span>;
      default:
        return <span className="w-2.5 h-2.5 bg-gray-300 rounded-full inline-block"></span>;
    }
  };

  const selectedContactData = contacts.find(c => c.id === selectedContact);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
          <p className="text-gray-600">Communicate with caregivers and service users</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white" 
          onClick={() => setNewMessageModalOpen(true)}
        >
          <Plus size={18} className="mr-2" />
          New Message
        </Button>
      </div>

      <div className="flex flex-1 bg-white rounded-lg shadow overflow-hidden">
        {/* Contacts sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2"
                placeholder="Search contacts"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {contacts.map(contact => (
              <div 
                key={contact.id}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedContact === contact.id ? 'bg-indigo-50' : ''}`}
                onClick={() => setSelectedContact(contact.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {getStatusIndicator(contact.status)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-gray-800 truncate">{contact.name}</p>
                      <span className="text-xs text-gray-500">{contact.lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                  </div>
                  {contact.unread > 0 && (
                    <div className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {contact.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Chat area */}
        {selectedContact ? (
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                  {selectedContactData?.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{selectedContactData?.name}</p>
                  <div className="flex items-center gap-1.5">
                    {getStatusIndicator(selectedContactData?.status || '')}
                    <span className="text-xs text-gray-500">{selectedContactData?.status}</span>
                  </div>
                </div>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div 
                  key={message.id}
                  className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === 'me' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p>{message.text}</p>
                    <div className={`text-xs mt-1 ${message.senderId === 'me' ? 'text-indigo-200' : 'text-gray-500'}`}>
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button className="text-gray-500 hover:text-gray-700">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  className={`p-2 rounded-full ${
                    messageInput.trim() === '' 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  onClick={handleSendMessage}
                  disabled={messageInput.trim() === ''}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
      
      {/* New Message Modal */}
      <Dialog open={newMessageModalOpen} onOpenChange={setNewMessageModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                placeholder="Enter recipient name or select from contacts"
                value={newMessageRecipient}
                onChange={(e) => setNewMessageRecipient(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input
                id="subject"
                placeholder="Enter message subject"
                value={newMessageSubject}
                onChange={(e) => setNewMessageSubject(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                placeholder="Type your message here..."
                className="min-h-[120px]"
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewMessageModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleNewMessage}
              disabled={newMessageRecipient.trim() === '' || newMessageContent.trim() === ''}
            >
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}