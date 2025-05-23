import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { 
  UserIcon, 
  CalendarIcon, 
  ClipboardIcon, 
  FileTextIcon,
  MessageSquareIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'visit' | 'task' | 'note' | 'message' | 'incident' | 'care-plan' | 'user';
  title: string;
  description: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  relatedTo?: {
    id: string;
    name: string;
    type: 'service-user' | 'staff' | 'task';
  };
  status?: 'completed' | 'pending' | 'cancelled' | 'in-progress';
}

interface RecentActivityProps {
  data?: ActivityItem[];
}

/**
 * Recent activity component
 * 
 * Displays recent activity in the system
 */
export function RecentActivity({ data }: RecentActivityProps) {
  if (!data) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-muted-foreground">Loading activity...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  // Get icon for activity type
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'visit':
        return <CalendarIcon className="h-4 w-4" />;
      case 'task':
        return <ClipboardIcon className="h-4 w-4" />;
      case 'note':
        return <FileTextIcon className="h-4 w-4" />;
      case 'message':
        return <MessageSquareIcon className="h-4 w-4" />;
      case 'incident':
        return <AlertCircleIcon className="h-4 w-4" />;
      case 'care-plan':
        return <FileTextIcon className="h-4 w-4" />;
      case 'user':
        return <UserIcon className="h-4 w-4" />;
      default:
        return <CheckCircleIcon className="h-4 w-4" />;
    }
  };

  // Get background color for activity type
  const getActivityBgColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'visit':
        return 'bg-blue-100 text-blue-600';
      case 'task':
        return 'bg-green-100 text-green-600';
      case 'note':
        return 'bg-purple-100 text-purple-600';
      case 'message':
        return 'bg-indigo-100 text-indigo-600';
      case 'incident':
        return 'bg-red-100 text-red-600';
      case 'care-plan':
        return 'bg-amber-100 text-amber-600';
      case 'user':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {data.map((activity) => (
        <div key={activity.id} className="flex gap-4">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${getActivityBgColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
            <div className="flex items-center gap-2 pt-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{activity.user.name}</span>
              
              {activity.relatedTo && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {activity.relatedTo.type === 'service-user' ? 'Service User' : 
                     activity.relatedTo.type === 'staff' ? 'Staff' : 'Task'}: {activity.relatedTo.name}
                  </span>
                </>
              )}
              
              {activity.status && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className={`text-xs ${
                    activity.status === 'completed' ? 'text-green-500' :
                    activity.status === 'cancelled' ? 'text-red-500' :
                    activity.status === 'in-progress' ? 'text-blue-500' :
                    'text-amber-500'
                  }`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
