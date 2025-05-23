import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api-client';
import { ProgressiveLoader } from '../mobile/ProgressiveLoader';
import { TouchInteraction } from '../mobile/TouchInteractions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Loader } from '../ui/loader';
import { useToast } from '../ui/use-toast';
import { useDevice } from '../../hooks/use-mobile';
import { useNavigate } from 'wouter';
import { formatDate } from '../../utils/date-utils';

// Service user type
interface ServiceUser {
  id: string;
  name: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  emergencyContact: string;
  emergencyPhone: string;
  status: 'active' | 'inactive' | 'pending';
  primaryCaregiverId?: string;
  notes?: string;
  profileImageUrl?: string;
  lastVisitDate?: string;
}

// Props for the component
interface MobileServiceUserListProps {
  initialUsers?: ServiceUser[];
  showSearch?: boolean;
  showFilters?: boolean;
  onUserSelect?: (user: ServiceUser) => void;
  className?: string;
}

/**
 * Mobile-optimized Service User List Component
 * 
 * Features:
 * - Progressive loading of service users as you scroll
 * - Touch interactions (swipe, tap)
 * - Optimized for mobile devices
 */
export function MobileServiceUserList({
  initialUsers = [],
  showSearch = true,
  showFilters = true,
  onUserSelect,
  className = '',
}: MobileServiceUserListProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Hooks
  const { isMobile } = useDevice();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Load service users
  const loadServiceUsers = async (page: number, pageSize: number) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());
      
      if (searchQuery) {
        params.append('q', searchQuery);
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      // Make API request
      const response = await apiClient.get(`/api/v2/service-users?${params.toString()}`);
      
      return {
        items: response.data.data,
        total: response.data.pagination.total,
      };
    } catch (error) {
      console.error('Error loading service users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load service users',
        variant: 'destructive',
      });
      
      return {
        items: [],
        total: 0,
      };
    }
  };
  
  // Handle user selection
  const handleUserSelect = (user: ServiceUser) => {
    if (onUserSelect) {
      onUserSelect(user);
    } else {
      navigate(`/service-users/${user.id}`);
    }
  };
  
  // Handle swipe actions
  const handleSwipe = (user: ServiceUser, direction: 'left' | 'right') => {
    if (direction === 'left') {
      // Swipe left to view care plan
      navigate(`/service-users/${user.id}/care-plan`);
    } else if (direction === 'right') {
      // Swipe right to view visits
      navigate(`/service-users/${user.id}/visits`);
    }
  };
  
  // Render service user card
  const renderServiceUser = (user: ServiceUser) => {
    return (
      <TouchInteraction
        onTap={() => handleUserSelect(user)}
        onSwipe={(direction) => {
          if (direction === 'left' || direction === 'right') {
            handleSwipe(user, direction);
          }
        }}
        className="w-full"
      >
        <Card className="w-full mb-4 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Avatar>
                  {user.profileImageUrl ? (
                    <AvatarImage src={user.profileImageUrl} alt={user.name} />
                  ) : (
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <CardDescription>
                    {formatDate(user.dateOfBirth)} • {user.city}, {user.state}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={
                  user.status === 'active'
                    ? 'success'
                    : user.status === 'inactive'
                    ? 'destructive'
                    : 'outline'
                }
              >
                {user.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Phone:</span>
                <span>{user.phone}</span>
              </div>
              {user.lastVisitDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Visit:</span>
                  <span>{formatDate(user.lastVisitDate)}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-2 text-xs text-muted-foreground">
            <div className="w-full flex justify-between">
              <span>Swipe left for care plan</span>
              <span>Swipe right for visits</span>
            </div>
          </CardFooter>
        </Card>
      </TouchInteraction>
    );
  };
  
  return (
    <div className={`w-full ${className}`}>
      {/* Search and filters would go here */}
      
      {/* Service user list */}
      <ProgressiveLoader
        loadData={loadServiceUsers}
        renderItem={renderServiceUser}
        initialItems={initialUsers}
        pageSize={isMobile ? 10 : 20}
        mobileOptimized={true}
        emptyText="No service users found"
        showLoading={true}
      />
    </div>
  );
}
