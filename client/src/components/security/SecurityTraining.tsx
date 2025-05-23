/**
 * Security Training Component
 * 
 * This component displays security training modules and allows users to complete them.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSecurityTrainingModules,
  useUserProgress,
  useRequiredModules,
  useTrainingCompliance
} from '@/hooks/use-security-training';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SecurityTrainingModuleCard } from './SecurityTrainingModuleCard';
import { SecurityTrainingModuleView } from './SecurityTrainingModuleView';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Award, 
  Calendar, 
  BarChart, 
  Info
} from 'lucide-react';
import { SecurityTrainingModule, UserSecurityTraining } from '@/api/security-training-api';

interface SecurityTrainingProps {
  className?: string;
}

export function SecurityTraining({ className }: SecurityTrainingProps) {
  const { t } = useTranslation();
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch data
  const { data: modules, isLoading: isLoadingModules } = useSecurityTrainingModules();
  const { data: userProgress, isLoading: isLoadingProgress } = useUserProgress();
  const { data: requiredModules, isLoading: isLoadingRequired } = useRequiredModules();
  const { data: compliance, isLoading: isLoadingCompliance } = useTrainingCompliance();
  
  const isLoading = isLoadingModules || isLoadingProgress || isLoadingRequired || isLoadingCompliance;
  
  // Calculate statistics
  const completedModules = userProgress?.filter(p => p.completed) || [];
  const completionRate = modules?.length 
    ? Math.round((completedModules.length / modules.length) * 100) 
    : 0;
  
  const requiredCompletedModules = requiredModules?.filter(module => 
    userProgress?.some(p => p.moduleId === module.id && p.completed)
  ) || [];
  
  const requiredCompletionRate = requiredModules?.length 
    ? Math.round((requiredCompletedModules.length / requiredModules.length) * 100) 
    : 0;
  
  // Filter modules based on active tab
  const filteredModules = modules?.filter(module => {
    if (activeTab === 'all') return true;
    if (activeTab === 'required') return requiredModules?.some(m => m.id === module.id);
    if (activeTab === 'completed') return userProgress?.some(p => p.moduleId === module.id && p.completed);
    if (activeTab === 'in-progress') return userProgress?.some(p => p.moduleId === module.id && p.progress > 0 && !p.completed);
    if (activeTab === 'not-started') return !userProgress?.some(p => p.moduleId === module.id && p.progress > 0);
    return true;
  });
  
  // Get progress for a module
  const getModuleProgress = (moduleId: number): UserSecurityTraining | undefined => {
    return userProgress?.find(p => p.moduleId === moduleId);
  };
  
  // Check if a module is required
  const isModuleRequired = (moduleId: number): boolean => {
    return requiredModules?.some(m => m.id === moduleId) || false;
  };
  
  // Handle module selection
  const handleModuleSelect = (moduleId: number) => {
    setSelectedModuleId(moduleId);
  };
  
  // Handle back button
  const handleBack = () => {
    setSelectedModuleId(null);
  };
  
  // If a module is selected, show the module view
  if (selectedModuleId) {
    return (
      <SecurityTrainingModuleView 
        moduleId={selectedModuleId} 
        onBack={handleBack} 
      />
    );
  }
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Security Training</h2>
        {compliance?.isCompliant ? (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="h-4 w-4 mr-1" />
            Training Compliant
          </Badge>
        ) : (
          <Badge variant="destructive">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Training Incomplete
          </Badge>
        )}
      </div>
      
      {!compliance?.isCompliant && requiredModules && requiredModules.length > 0 && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Required Training Incomplete</AlertTitle>
          <AlertDescription>
            You have {requiredModules.length - requiredCompletedModules.length} required security training modules to complete.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedModules.length} of {modules?.length || 0} modules completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Required Training</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requiredCompletionRate}%</div>
            <Progress value={requiredCompletionRate} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {requiredCompletedModules.length} of {requiredModules?.length || 0} required modules completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedModules.reduce((total, module) => {
                const mod = modules?.find(m => m.id === module.moduleId);
                return total + (mod?.estimatedDuration || 0);
              }, 0)} min
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total time spent on security training
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedModules.length > 0 
                ? Math.round(completedModules.reduce((total, module) => total + (module.score || 0), 0) / completedModules.length) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average score across all completed modules
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Modules</TabsTrigger>
          <TabsTrigger value="required">Required</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="not-started">Not Started</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredModules && filteredModules.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredModules.map(module => (
                <SecurityTrainingModuleCard
                  key={module.id}
                  module={module}
                  progress={getModuleProgress(module.id)}
                  isRequired={isModuleRequired(module.id)}
                  onClick={() => handleModuleSelect(module.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No modules found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                There are no security training modules in this category.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
