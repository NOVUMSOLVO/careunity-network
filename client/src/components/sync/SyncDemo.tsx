import React, { useState, useEffect } from 'react';
import { useSync } from '../../contexts/sync-context';
import { useSyncApi } from '../../hooks/use-sync-api';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Loader2, WifiOff, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { SyncStatus } from './SyncStatus';

/**
 * Demo component to showcase the sync functionality
 */
export function SyncDemo() {
  const { isOnline, hasPendingOperations, pendingOperationsCount, syncPendingOperations } = useSync();
  const syncApi = useSyncApi();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load notes on component mount
  useEffect(() => {
    loadNotes();
  }, []);
  
  // Load notes from the API
  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const data = await syncApi.get<any[]>('/api/notes');
      if (data) {
        setNotes(data);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new note
  const createNote = async () => {
    if (!title.trim()) return;
    
    setIsLoading(true);
    try {
      const newNote = {
        title,
        content,
        createdAt: new Date().toISOString(),
      };
      
      const result = await syncApi.post('/api/notes', newNote, {}, 'note');
      
      // If we're online, result will be the created note
      // If we're offline, result will be the operation ID
      if (typeof result === 'string') {
        // We're offline, add a temporary note with a local ID
        setNotes([
          ...notes,
          {
            ...newNote,
            id: `temp_${result}`,
            _isOffline: true,
          },
        ]);
      } else {
        // We're online, add the note returned from the server
        await loadNotes();
      }
      
      // Clear the form
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sync Demo</CardTitle>
          <CardDescription>
            This demo shows how to use the sync service to create notes that work offline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter note content"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Check className="w-3 h-3 mr-1" /> Online
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <WifiOff className="w-3 h-3 mr-1" /> Offline
              </Badge>
            )}
            
            {hasPendingOperations && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <RefreshCw className="w-3 h-3 mr-1" /> {pendingOperationsCount} pending
              </Badge>
            )}
          </div>
          
          <Button onClick={createNote} disabled={isLoading || !title.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Create Note'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <SyncStatus showBanner={true} showButton={true} />
      
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>
            {notes.length === 0
              ? 'No notes yet. Create one above.'
              : `You have ${notes.length} note${notes.length === 1 ? '' : 's'}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 border rounded-md ${
                    note._isOffline ? 'bg-yellow-50 border-yellow-200' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{note.title}</h3>
                    {note._isOffline && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Pending Sync
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              
              {notes.length === 0 && (
                <div className="text-center p-4 text-gray-500">
                  No notes found. Create your first note above.
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={loadNotes} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh Notes'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
