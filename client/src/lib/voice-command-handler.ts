/**
 * Voice Command Handler
 * 
 * This module processes voice commands and executes the corresponding actions.
 */

import { useNavigate } from 'wouter';
import { useToast } from '@/components/ui/use-toast';

// Command types
type CommandAction = 'navigate' | 'search' | 'create' | 'edit' | 'delete' | 'help' | 'unknown';

// Command structure
interface Command {
  action: CommandAction;
  target?: string;
  params?: Record<string, any>;
}

// Navigation targets
const navigationTargets: Record<string, string> = {
  'dashboard': '/',
  'home': '/',
  'service users': '/service-users',
  'users': '/service-users',
  'clients': '/service-users',
  'calendar': '/calendar',
  'schedule': '/calendar',
  'care plans': '/care-plans',
  'plans': '/care-plans',
  'care allocation': '/care-allocation',
  'allocation': '/care-allocation',
  'staff': '/staff-management',
  'staff management': '/staff-management',
  'reports': '/reports',
  'reporting': '/reports',
  'settings': '/settings',
  'profile': '/profile',
  'my profile': '/profile',
  'ml models': '/ml-models',
  'machine learning': '/ml-models',
  'models': '/ml-models',
};

/**
 * Parse a voice command string into a structured command object
 */
export function parseCommand(commandText: string): Command {
  // Convert to lowercase for easier matching
  const text = commandText.toLowerCase().trim();
  
  // Navigation commands
  if (text.startsWith('go to') || text.startsWith('open') || text.startsWith('show')) {
    const target = text.replace(/^(go to|open|show)\s+/, '').trim();
    
    // Check if the target is a known navigation target
    for (const [key, path] of Object.entries(navigationTargets)) {
      if (target === key || target.includes(key)) {
        return {
          action: 'navigate',
          target: path,
        };
      }
    }
    
    // Unknown navigation target
    return {
      action: 'navigate',
      target: 'unknown',
      params: { requestedTarget: target }
    };
  }
  
  // Search commands
  if (text.startsWith('search for') || text.startsWith('find')) {
    const searchTerm = text.replace(/^(search for|find)\s+/, '').trim();
    return {
      action: 'search',
      params: { query: searchTerm }
    };
  }
  
  // Create commands
  if (text.startsWith('create') || text.startsWith('add') || text.startsWith('new')) {
    const target = text.replace(/^(create|add|new)\s+/, '').trim();
    return {
      action: 'create',
      target,
    };
  }
  
  // Help command
  if (text.includes('help') || text.includes('what can you do') || text.includes('commands')) {
    return {
      action: 'help',
    };
  }
  
  // Unknown command
  return {
    action: 'unknown',
    params: { originalText: text }
  };
}

/**
 * Hook for handling voice commands
 */
export function useVoiceCommands() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  /**
   * Execute a voice command
   */
  const executeCommand = (commandText: string) => {
    const command = parseCommand(commandText);
    
    switch (command.action) {
      case 'navigate':
        if (command.target && command.target !== 'unknown') {
          navigate(command.target);
          toast({
            title: 'Navigation',
            description: `Navigating to ${command.target}`,
          });
        } else {
          toast({
            title: 'Navigation Error',
            description: `Unknown location: ${command.params?.requestedTarget}`,
            variant: 'destructive',
          });
        }
        break;
        
      case 'search':
        if (command.params?.query) {
          // Navigate to search page with query
          navigate(`/search?q=${encodeURIComponent(command.params.query)}`);
          toast({
            title: 'Search',
            description: `Searching for "${command.params.query}"`,
          });
        }
        break;
        
      case 'create':
        if (command.target) {
          // Handle different creation targets
          switch (command.target) {
            case 'service user':
            case 'client':
            case 'patient':
              navigate('/service-users/new');
              toast({
                title: 'Create',
                description: 'Creating new service user',
              });
              break;
              
            case 'care plan':
            case 'plan':
              navigate('/care-plans/new');
              toast({
                title: 'Create',
                description: 'Creating new care plan',
              });
              break;
              
            case 'appointment':
            case 'visit':
              navigate('/calendar/new');
              toast({
                title: 'Create',
                description: 'Creating new appointment',
              });
              break;
              
            default:
              toast({
                title: 'Create',
                description: `Cannot create unknown item: ${command.target}`,
                variant: 'destructive',
              });
          }
        }
        break;
        
      case 'help':
        toast({
          title: 'Voice Commands Help',
          description: 'You can say: "Go to [page]", "Search for [term]", "Create [item]", etc.',
        });
        break;
        
      case 'unknown':
      default:
        toast({
          title: 'Unknown Command',
          description: `Sorry, I didn't understand "${command.params?.originalText}"`,
          variant: 'destructive',
        });
    }
    
    return command;
  };
  
  return {
    executeCommand,
    parseCommand,
  };
}
