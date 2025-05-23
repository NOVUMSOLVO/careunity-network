/**
 * Feedback Dashboard Page
 * 
 * Displays feedback items and allows users to submit new feedback
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Feedback } from '@shared/schema';
import { FeedbackList } from '@/components/feedback/FeedbackList';
import { FeedbackDialog } from '@/components/feedback/FeedbackDialog';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { FeedbackResponseDialog } from '@/components/feedback/FeedbackResponseDialog';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { MessageSquarePlus, ThumbsUp, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export function FeedbackDashboard() {
  const { t } = useTranslation();
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Handle feedback selection
  const handleFeedbackSelected = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
  };
  
  // Handle feedback deselection
  const handleBackToList = () => {
    setSelectedFeedback(null);
  };
  
  // Render feedback details
  const renderFeedbackDetails = () => {
    if (!selectedFeedback) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleBackToList}>
            {t('common.back')}
          </Button>
          <Badge variant={
            selectedFeedback.status === 'completed' ? 'default' :
            selectedFeedback.status === 'in_progress' ? 'secondary' :
            'outline'
          }>
            {t(`feedback.statuses.${selectedFeedback.status}`)}
          </Badge>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{selectedFeedback.title}</CardTitle>
                <CardDescription>
                  {t('feedback.submittedBy', { userId: selectedFeedback.userId })}
                  {' • '}
                  {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {t(`feedback.categories.${selectedFeedback.category}`)}
                </Badge>
                {selectedFeedback.priority && (
                  <Badge variant={
                    selectedFeedback.priority === 'critical' ? 'destructive' : 
                    selectedFeedback.priority === 'high' ? 'default' : 'outline'
                  }>
                    {t(`feedback.priorities.${selectedFeedback.priority}`)}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {t('feedback.description')}
                </h3>
                <p className="whitespace-pre-line">{selectedFeedback.description}</p>
              </div>
              
              {selectedFeedback.relatedFeature && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    {t('feedback.relatedFeature')}
                  </h3>
                  <p>{selectedFeedback.relatedFeature}</p>
                </div>
              )}
              
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedFeedback.upvotes} {t('feedback.upvotes')}</span>
                </div>
                <FeedbackResponseDialog feedbackId={selectedFeedback.id} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('feedback.addResponse')}</CardTitle>
            <CardDescription>
              {t('feedback.addResponseDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeedbackResponseDialog 
              feedbackId={selectedFeedback.id}
              trigger={
                <Button className="w-full">
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  {t('feedback.writeResponse')}
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="container py-6">
      <PageHeader
        title={t('feedback.dashboardTitle')}
        description={t('feedback.dashboardDescription')}
        actions={
          !selectedFeedback && (
            <FeedbackDialog buttonProps={{ size: 'sm' }} />
          )
        }
      />
      
      {selectedFeedback ? (
        renderFeedbackDetails()
      ) : (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="all">
                {t('feedback.allFeedback')}
              </TabsTrigger>
              <TabsTrigger value="feature_request">
                {t('feedback.featureRequests')}
              </TabsTrigger>
              <TabsTrigger value="bug_report">
                {t('feedback.bugReports')}
              </TabsTrigger>
              <TabsTrigger value="my_feedback">
                {t('feedback.myFeedback')}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <FeedbackList 
              showFilters={true}
              onFeedbackSelected={handleFeedbackSelected}
              isPublicOnly={false}
            />
          </TabsContent>
          
          <TabsContent value="feature_request" className="mt-0">
            <FeedbackList 
              showFilters={true}
              defaultCategory="feature_request"
              onFeedbackSelected={handleFeedbackSelected}
              isPublicOnly={false}
            />
          </TabsContent>
          
          <TabsContent value="bug_report" className="mt-0">
            <FeedbackList 
              showFilters={true}
              defaultCategory="bug_report"
              onFeedbackSelected={handleFeedbackSelected}
              isPublicOnly={false}
            />
          </TabsContent>
          
          <TabsContent value="my_feedback" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <FeedbackList 
                  showFilters={false}
                  onFeedbackSelected={handleFeedbackSelected}
                  isPublicOnly={false}
                />
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('feedback.submitNewFeedback')}</CardTitle>
                    <CardDescription>
                      {t('feedback.submitNewFeedbackDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FeedbackForm />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
