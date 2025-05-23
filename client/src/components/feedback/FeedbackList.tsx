/**
 * Feedback List Component
 * 
 * Displays a list of feedback items with filtering options
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/hooks/useApi';
import { Feedback } from '@shared/schema';
import { FeedbackCategory, FeedbackStatus, feedbackCategoryValues, feedbackStatusValues } from '@shared/types/feedback';
import { formatDistanceToNow } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ThumbsUp, MessageSquare, Filter } from 'lucide-react';
import { FeedbackDialog } from './FeedbackDialog';
import { FeedbackResponseDialog } from './FeedbackResponseDialog';

interface FeedbackListProps {
  showFilters?: boolean;
  defaultCategory?: FeedbackCategory;
  defaultStatus?: FeedbackStatus;
  limit?: number;
  showAddButton?: boolean;
  onFeedbackSelected?: (feedback: Feedback) => void;
  isPublicOnly?: boolean;
}

export function FeedbackList({
  showFilters = true,
  defaultCategory,
  defaultStatus,
  limit,
  showAddButton = true,
  onFeedbackSelected,
  isPublicOnly = true,
}: FeedbackListProps) {
  const { t } = useTranslation();
  const api = useApi();
  
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | 'all'>(defaultCategory || 'all');
  const [selectedStatus, setSelectedStatus] = useState<FeedbackStatus | 'all'>(defaultStatus || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load feedback items
  const loadFeedback = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const options: any = { limit };
      
      if (selectedCategory !== 'all') {
        options.category = selectedCategory;
      }
      
      if (selectedStatus !== 'all') {
        options.status = selectedStatus;
      }
      
      if (isPublicOnly) {
        options.isPublic = true;
      }
      
      let items = await api.feedback.getAllFeedback(options);
      
      // Apply client-side search if query exists
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        items = items.filter(item => 
          item.title.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)
        );
      }
      
      setFeedbackItems(items);
    } catch (err) {
      console.error('Error loading feedback:', err);
      setError(t('feedback.loadError'));
    } finally {
      setLoading(false);
    }
  };
  
  // Load feedback when filters change
  useEffect(() => {
    loadFeedback();
  }, [selectedCategory, selectedStatus, isPublicOnly]);
  
  // Handle search
  const handleSearch = () => {
    loadFeedback();
  };
  
  // Handle upvote
  const handleUpvote = async (feedbackId: number) => {
    try {
      await api.feedback.upvoteFeedback(feedbackId);
      // Refresh the list
      loadFeedback();
    } catch (err) {
      console.error('Error upvoting feedback:', err);
    }
  };
  
  // Render feedback item
  const renderFeedbackItem = (item: Feedback) => {
    const createdAt = new Date(item.createdAt);
    const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });
    
    return (
      <Card key={item.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>
                {t('feedback.submittedTimeAgo', { timeAgo })}
              </CardDescription>
            </div>
            <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
              {t(`feedback.statuses.${item.status}`)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {item.description.length > 200 
              ? `${item.description.substring(0, 200)}...` 
              : item.description}
          </p>
          <div className="flex gap-2 mt-3">
            <Badge variant="outline">
              {t(`feedback.categories.${item.category}`)}
            </Badge>
            {item.priority && (
              <Badge variant={
                item.priority === 'critical' ? 'destructive' : 
                item.priority === 'high' ? 'default' : 'outline'
              }>
                {t(`feedback.priorities.${item.priority}`)}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => handleUpvote(item.id)}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{item.upvotes}</span>
            </Button>
            <FeedbackResponseDialog 
              feedbackId={item.id}
              trigger={
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{t('feedback.respond')}</span>
                </Button>
              }
              onResponseSubmitted={loadFeedback}
            />
          </div>
          {onFeedbackSelected && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onFeedbackSelected(item)}
            >
              {t('common.view')}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };
  
  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <Card key={`skeleton-${index}`} className="mb-4">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/3 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-5 w-20" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-8 w-24" />
        </CardFooter>
      </Card>
    ));
  };
  
  return (
    <div>
      {/* Filters and search */}
      {showFilters && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('feedback.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as any)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('feedback.categoryFilter')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {feedbackCategoryValues.map((category) => (
                    <SelectItem key={category} value={category}>
                      {t(`feedback.categories.${category}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as any)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('feedback.statusFilter')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {feedbackStatusValues.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`feedback.statuses.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {showAddButton && (
            <div className="flex justify-end">
              <FeedbackDialog onFeedbackSubmitted={loadFeedback} />
            </div>
          )}
        </div>
      )}
      
      {/* Feedback list */}
      <div>
        {loading ? (
          renderSkeletons()
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-red-500">{error}</p>
              <div className="flex justify-center mt-4">
                <Button onClick={loadFeedback}>{t('common.retry')}</Button>
              </div>
            </CardContent>
          </Card>
        ) : feedbackItems.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center">{t('feedback.noFeedback')}</p>
              {showAddButton && (
                <div className="flex justify-center mt-4">
                  <FeedbackDialog onFeedbackSubmitted={loadFeedback} />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          feedbackItems.map(renderFeedbackItem)
        )}
      </div>
    </div>
  );
}
