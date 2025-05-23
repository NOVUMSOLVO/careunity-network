import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, CheckCircle, Clock, Server, 
  Database, Code, Play, Pause, RotateCcw,
  ArrowRight, ChevronRight, ChevronDown, 
  FileText, Settings, Activity
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ModelDeployment, ModelMetadata } from '@shared/api-client/services/ml-models-api';

interface ModelDeploymentPipelineProps {
  modelId: string;
  modelType: string;
}

/**
 * Model Deployment Pipeline Component
 * 
 * This component provides a UI for deploying ML models through different environments
 * (development, staging, production) with validation steps and monitoring.
 */
export function ModelDeploymentPipeline({ modelId, modelType }: ModelDeploymentPipelineProps) {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch model details
  const { data: model, isLoading: isLoadingModel } = useQuery({
    queryKey: ['ml-model', modelId],
    queryFn: async () => {
      const { data, error } = await apiClient.get(`/api/v2/ml-models/${modelId}`);
      if (error) throw new Error(error.message);
      return data as ModelMetadata;
    }
  });

  // Fetch deployment history
  const { data: deployments, isLoading: isLoadingDeployments } = useQuery({
    queryKey: ['ml-model-deployments', modelId],
    queryFn: async () => {
      const { data, error } = await apiClient.get(`/api/v2/ml-models/${modelId}/deployments`);
      if (error) throw new Error(error.message);
      return data as ModelDeployment[];
    }
  });

  // Deploy model mutation
  const deployMutation = useMutation({
    mutationFn: async (environment: string) => {
      const { data, error } = await apiClient.post(`/api/v2/ml-models/${modelId}/deploy`, {
        environment,
        version: model?.version
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Deployment started',
        description: 'The model deployment process has been initiated.',
      });
      queryClient.invalidateQueries({ queryKey: ['ml-model-deployments', modelId] });
    },
    onError: (error) => {
      toast({
        title: 'Deployment failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  });

  // Get current deployment status for each environment
  const getDeploymentStatus = (environment: string) => {
    if (!deployments) return 'not_deployed';
    
    const envDeployments = deployments.filter(d => d.environment === environment);
    if (envDeployments.length === 0) return 'not_deployed';
    
    const latestDeployment = envDeployments.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    return latestDeployment.status;
  };

  // Get deployment progress for a given environment
  const getDeploymentProgress = (environment: string) => {
    const status = getDeploymentStatus(environment);
    
    switch (status) {
      case 'in_progress':
        return 50;
      case 'success':
        return 100;
      case 'failed':
        return 100;
      default:
        return 0;
    }
  };

  // Get badge variant based on deployment status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'in_progress':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Toggle expanded stage
  const toggleStage = (stage: string) => {
    if (expandedStage === stage) {
      setExpandedStage(null);
    } else {
      setExpandedStage(stage);
    }
  };

  // Handle deploy button click
  const handleDeploy = (environment: string) => {
    deployMutation.mutate(environment);
  };

  if (isLoadingModel || isLoadingDeployments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="skeleton h-6 w-1/3"></CardTitle>
          <CardDescription className="skeleton h-4 w-1/2"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="skeleton h-8 w-full"></div>
            <div className="skeleton h-24 w-full"></div>
            <div className="skeleton h-24 w-full"></div>
            <div className="skeleton h-24 w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Model Deployment Pipeline</CardTitle>
            <CardDescription>
              Deploy and manage {model?.name} (v{model?.version}) across environments
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            {modelType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pipeline">Deployment Pipeline</TabsTrigger>
            <TabsTrigger value="history">Deployment History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pipeline" className="space-y-6">
            {/* Development Environment */}
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer"
                onClick={() => toggleStage('development')}
              >
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">Development Environment</h3>
                  <Badge variant={getStatusBadgeVariant(getDeploymentStatus('development'))}>
                    {getDeploymentStatus('development') === 'success' ? 'Deployed' : 
                     getDeploymentStatus('development') === 'in_progress' ? 'Deploying' : 
                     getDeploymentStatus('development') === 'failed' ? 'Failed' : 'Not Deployed'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={getDeploymentProgress('development')} className="w-24" />
                  {expandedStage === 'development' ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
              </div>
              
              {expandedStage === 'development' && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Deployment Steps</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Model validation</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Environment preparation</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Model deployment</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Integration tests</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Deployment Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium">
                            {getDeploymentStatus('development') === 'success' ? 'Deployed' : 
                             getDeploymentStatus('development') === 'in_progress' ? 'Deploying' : 
                             getDeploymentStatus('development') === 'failed' ? 'Failed' : 'Not Deployed'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Version:</span>
                          <span className="font-medium">{model?.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span className="font-medium">
                            {deployments && deployments.some(d => d.environment === 'development') 
                              ? new Date(deployments.filter(d => d.environment === 'development')[0].timestamp).toLocaleString() 
                              : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={getDeploymentStatus('development') === 'in_progress'}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Logs
                    </Button>
                    <Button 
                      size="sm"
                      disabled={deployMutation.isPending || getDeploymentStatus('development') === 'in_progress'}
                      onClick={() => handleDeploy('development')}
                    >
                      {getDeploymentStatus('development') === 'success' ? 'Redeploy' : 'Deploy'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Staging Environment */}
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer"
                onClick={() => toggleStage('staging')}
              >
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">Staging Environment</h3>
                  <Badge variant={getStatusBadgeVariant(getDeploymentStatus('staging'))}>
                    {getDeploymentStatus('staging') === 'success' ? 'Deployed' : 
                     getDeploymentStatus('staging') === 'in_progress' ? 'Deploying' : 
                     getDeploymentStatus('staging') === 'failed' ? 'Failed' : 'Not Deployed'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={getDeploymentProgress('staging')} className="w-24" />
                  {expandedStage === 'staging' ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
              </div>
              
              {expandedStage === 'staging' && (
                <div className="p-4 space-y-4">
                  {getDeploymentStatus('development') !== 'success' && (
                    <Alert variant="warning">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Development deployment required</AlertTitle>
                      <AlertDescription>
                        You must successfully deploy to the development environment before deploying to staging.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Deployment Steps</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          {getDeploymentStatus('staging') === 'success' ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> : 
                            <Clock className="h-4 w-4 text-muted-foreground" />}
                          <span>Model validation</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {getDeploymentStatus('staging') === 'success' ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> : 
                            <Clock className="h-4 w-4 text-muted-foreground" />}
                          <span>Environment preparation</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {getDeploymentStatus('staging') === 'success' ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> : 
                            <Clock className="h-4 w-4 text-muted-foreground" />}
                          <span>Model deployment</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {getDeploymentStatus('staging') === 'success' ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> : 
                            <Clock className="h-4 w-4 text-muted-foreground" />}
                          <span>Integration tests</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {getDeploymentStatus('staging') === 'success' ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> : 
                            <Clock className="h-4 w-4 text-muted-foreground" />}
                          <span>Performance tests</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Deployment Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium">
                            {getDeploymentStatus('staging') === 'success' ? 'Deployed' : 
                             getDeploymentStatus('staging') === 'in_progress' ? 'Deploying' : 
                             getDeploymentStatus('staging') === 'failed' ? 'Failed' : 'Not Deployed'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Version:</span>
                          <span className="font-medium">{model?.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span className="font-medium">
                            {deployments && deployments.some(d => d.environment === 'staging') 
                              ? new Date(deployments.filter(d => d.environment === 'staging')[0].timestamp).toLocaleString() 
                              : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={getDeploymentStatus('staging') === 'in_progress'}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Logs
                    </Button>
                    <Button 
                      size="sm"
                      disabled={
                        deployMutation.isPending || 
                        getDeploymentStatus('staging') === 'in_progress' || 
                        getDeploymentStatus('development') !== 'success'
                      }
                      onClick={() => handleDeploy('staging')}
                    >
                      {getDeploymentStatus('staging') === 'success' ? 'Redeploy' : 'Deploy'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Production Environment */}
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer"
                onClick={() => toggleStage('production')}
              >
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">Production Environment</h3>
                  <Badge variant={getStatusBadgeVariant(getDeploymentStatus('production'))}>
                    {getDeploymentStatus('production') === 'success' ? 'Deployed' : 
                     getDeploymentStatus('production') === 'in_progress' ? 'Deploying' : 
                     getDeploymentStatus('production') === 'failed' ? 'Failed' : 'Not Deployed'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={getDeploymentProgress('production')} className="w-24" />
                  {expandedStage === 'production' ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
              </div>
              
              {expandedStage === 'production' && (
                <div className="p-4 space-y-4">
                  {getDeploymentStatus('staging') !== 'success' && (
                    <Alert variant="warning">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Staging deployment required</AlertTitle>
                      <AlertDescription>
                        You must successfully deploy to the staging environment before deploying to production.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Deployment Steps</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          {getDeploymentStatus('production') === 'success' ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> : 
                            <Clock className="h-4 w-4 text-muted-foreground" />}
                          <span>Model validation</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {getDeploymentStatus('production') === 'success' ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> : 
                            <Clock className="h-4 w-4 text-muted-foreground" />}
                          <span>Environment preparation</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {getDeploymentStatus('production') === 'success' ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> : 
                            <Clock className="h-4 w-4 text-muted-foreground" />}
                          <span>Model deployment</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {getDeploymentStatus('production') === 'success' ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> : 
                            <Clock className="h-4 w-4 text-muted-foreground" />}
                          <span>Integration tests</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {getDeploymentStatus('production') === 'success' ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> : 
                            <Clock className="h-4 w-4 text-muted-foreground" />}
                          <span>Performance tests</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {getDeploymentStatus('production') === 'success' ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> : 
                            <Clock className="h-4 w-4 text-muted-foreground" />}
                          <span>Canary deployment</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {getDeploymentStatus('production') === 'success' ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> : 
                            <Clock className="h-4 w-4 text-muted-foreground" />}
                          <span>Full deployment</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Deployment Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium">
                            {getDeploymentStatus('production') === 'success' ? 'Deployed' : 
                             getDeploymentStatus('production') === 'in_progress' ? 'Deploying' : 
                             getDeploymentStatus('production') === 'failed' ? 'Failed' : 'Not Deployed'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Version:</span>
                          <span className="font-medium">{model?.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span className="font-medium">
                            {deployments && deployments.some(d => d.environment === 'production') 
                              ? new Date(deployments.filter(d => d.environment === 'production')[0].timestamp).toLocaleString() 
                              : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={getDeploymentStatus('production') === 'in_progress'}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Logs
                    </Button>
                    <Button 
                      size="sm"
                      disabled={
                        deployMutation.isPending || 
                        getDeploymentStatus('production') === 'in_progress' || 
                        getDeploymentStatus('staging') !== 'success'
                      }
                      onClick={() => handleDeploy('production')}
                    >
                      {getDeploymentStatus('production') === 'success' ? 'Redeploy' : 'Deploy'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Deployment History</h3>
              
              {deployments && deployments.length > 0 ? (
                <div className="space-y-4">
                  {deployments
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((deployment, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className={`p-2 rounded-full ${
                          deployment.status === 'success' ? 'bg-green-100' : 
                          deployment.status === 'in_progress' ? 'bg-blue-100' : 
                          'bg-red-100'
                        }`}>
                          {deployment.status === 'success' ? 
                            <CheckCircle className={`h-4 w-4 text-green-600`} /> : 
                            deployment.status === 'in_progress' ? 
                            <Clock className={`h-4 w-4 text-blue-600`} /> : 
                            <AlertCircle className={`h-4 w-4 text-red-600`} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">
                              {deployment.environment.charAt(0).toUpperCase() + deployment.environment.slice(1)} Deployment
                            </h4>
                            <Badge variant={getStatusBadgeVariant(deployment.status)}>
                              {deployment.status === 'success' ? 'Success' : 
                               deployment.status === 'in_progress' ? 'In Progress' : 'Failed'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Version: {deployment.version} • {new Date(deployment.timestamp).toLocaleString()}
                          </div>
                          {deployment.message && (
                            <div className="mt-2 text-sm">
                              {deployment.message}
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-8 text-center border rounded-lg bg-muted/50">
                  <h4 className="font-medium">No deployment history</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    This model hasn't been deployed to any environment yet.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Deployment Settings</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Auto-Promotion</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically promote successful deployments to the next environment
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Deployment Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure who gets notified about deployment events
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Rollback Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure automatic rollback conditions
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
