/**
 * Security Training Module Card Component
 * 
 * This component displays a card for a security training module.
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  BookOpen, 
  Video, 
  FileText, 
  HelpCircle, 
  MousePointer, 
  CheckCircle, 
  AlertTriangle,
  Star
} from 'lucide-react';
import { SecurityTrainingModule, UserSecurityTraining } from '@/api/security-training-api';

interface SecurityTrainingModuleCardProps {
  module: SecurityTrainingModule;
  progress?: UserSecurityTraining;
  isRequired: boolean;
  onClick: () => void;
}

export function SecurityTrainingModuleCard({ 
  module, 
  progress, 
  isRequired, 
  onClick 
}: SecurityTrainingModuleCardProps) {
  // Get the appropriate icon based on module type
  const getModuleTypeIcon = () => {
    switch (module.type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      case 'interactive':
        return <MousePointer className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };
  
  // Get the appropriate difficulty color
  const getDifficultyColor = () => {
    switch (module.difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return '';
    }
  };
  
  // Format the estimated duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hr ${remainingMinutes} min` 
      : `${hours} hr`;
  };
  
  // Check if the module is expired
  const isExpired = progress?.expiresAt 
    ? new Date(progress.expiresAt) < new Date() 
    : false;
  
  // Get the status badge
  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <Badge variant="destructive" className="ml-auto">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }
    
    if (progress?.completed) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 ml-auto">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }
    
    if (progress?.progress && progress.progress > 0) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 ml-auto">
          In Progress
        </Badge>
      );
    }
    
    if (isRequired) {
      return (
        <Badge variant="destructive" className="ml-auto">
          Required
        </Badge>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="overflow-hidden">
      {module.thumbnail && (
        <div 
          className="h-32 bg-cover bg-center" 
          style={{ backgroundImage: `url(${module.thumbnail})` }}
        />
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <Badge className={`${getDifficultyColor()} mr-2`}>
            {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
          </Badge>
          <Badge variant="outline" className="flex items-center">
            {getModuleTypeIcon()}
            <span className="ml-1">
              {module.type.charAt(0).toUpperCase() + module.type.slice(1)}
            </span>
          </Badge>
          {getStatusBadge()}
        </div>
        <CardTitle className="text-lg mt-2">{module.title}</CardTitle>
        <CardDescription className="line-clamp-2">{module.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Clock className="h-4 w-4 mr-1" />
          <span>{formatDuration(module.estimatedDuration)}</span>
          
          {progress?.score && (
            <>
              <span className="mx-2">•</span>
              <Star className="h-4 w-4 mr-1" />
              <span>{progress.score}%</span>
            </>
          )}
        </div>
        
        {(progress?.progress !== undefined && progress.progress > 0) && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{progress.progress}%</span>
            </div>
            <Progress value={progress.progress} className="h-2" />
          </div>
        )}
        
        {module.tags && module.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {module.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onClick} className="w-full">
          {progress?.completed 
            ? isExpired 
              ? 'Retake Training' 
              : 'Review Training' 
            : progress?.progress && progress.progress > 0 
              ? 'Continue Training' 
              : 'Start Training'
          }
        </Button>
      </CardFooter>
    </Card>
  );
}
