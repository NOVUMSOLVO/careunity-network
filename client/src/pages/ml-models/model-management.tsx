import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ModelDeploymentPipeline } from '@/components/ml-models/model-deployment-pipeline';
import { ModelMonitoringDashboard } from '@/components/ml-models/model-monitoring-dashboard';
import { ArrowLeft, Download, Upload, RefreshCw, Settings } from 'lucide-react';

export default function ModelManagement() {
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch model details
  const { data: model, isLoading } = useQuery({
    queryKey: ['ml-model', modelId],
    queryFn: async () => {
      try {
        const { data, error } = await apiClient.get(`/api/v2/ml-models/${modelId}`);
        if (error) throw new Error(error.message);
        return data;
      } catch (err) {
        // Return mock data if API fails
        return getMockModelData(modelId || '');
      }
    },
    enabled: !!modelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/ml-models')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="ml-2">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mt-1"></div>
          </div>
        </div>
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/ml-models')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Model Not Found</h1>
        </div>
        <div className="p-8 text-center bg-gray-100 rounded-lg">
          <p>The requested model could not be found.</p>
          <Button className="mt-4" onClick={() => navigate('/ml-models')}>
            Back to Models
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/ml-models')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="ml-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{model.name}</h1>
              <Badge variant="outline">v{model.version}</Badge>
              <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>
                {model.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-muted-foreground">{model.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" />
            Upload New Version
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Retrain
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="col-span-1">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Model Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{model.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">{new Date(model.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">{new Date(model.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Framework:</span>
                <span className="font-medium">{model.framework}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium">{model.size}</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <h3 className="font-medium mb-2">Performance</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accuracy:</span>
                <span className="font-medium">{(model.metrics.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precision:</span>
                <span className="font-medium">{(model.metrics.precision * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recall:</span>
                <span className="font-medium">{(model.metrics.recall * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">F1 Score:</span>
                <span className="font-medium">{(model.metrics.f1Score * 100).toFixed(1)}%</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <h3 className="font-medium mb-2">Deployments</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Development:</span>
                <Badge variant={model.deployments.development ? 'default' : 'outline'} className="text-xs">
                  {model.deployments.development ? 'Deployed' : 'Not Deployed'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Staging:</span>
                <Badge variant={model.deployments.staging ? 'default' : 'outline'} className="text-xs">
                  {model.deployments.staging ? 'Deployed' : 'Not Deployed'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Production:</span>
                <Badge variant={model.deployments.production ? 'default' : 'outline'} className="text-xs">
                  {model.deployments.production ? 'Deployed' : 'Not Deployed'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-span-3">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="deployment">Deployment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Model Description</h3>
                    <p className="text-sm">{model.longDescription}</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Features</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {model.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Training Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Training Dataset</div>
                      <p>{model.training.dataset}</p>
                      <div className="font-medium mt-2">Training Duration</div>
                      <p>{model.training.duration}</p>
                    </div>
                    <div>
                      <div className="font-medium">Training Method</div>
                      <p>{model.training.method}</p>
                      <div className="font-medium mt-2">Last Trained</div>
                      <p>{new Date(model.training.lastTrained).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Usage</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold">{model.usage.totalRequests.toLocaleString()}</div>
                      <div className="text-muted-foreground">Total Requests</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{model.usage.avgRequestsPerDay.toLocaleString()}</div>
                      <div className="text-muted-foreground">Avg. Requests/Day</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{model.usage.avgResponseTime}ms</div>
                      <div className="text-muted-foreground">Avg. Response Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="monitoring" className="mt-4">
              <ModelMonitoringDashboard modelId={modelId || ''} />
            </TabsContent>
            
            <TabsContent value="deployment" className="mt-4">
              <ModelDeploymentPipeline modelId={modelId || ''} modelType={model.type} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Mock data for testing
function getMockModelData(modelId: string) {
  return {
    id: modelId,
    name: 'Caregiver Recommendation Model',
    description: 'AI model for matching caregivers with service users based on skills and preferences',
    longDescription: 'This model analyzes caregiver skills, experience, and preferences alongside service user needs and preferences to recommend optimal caregiver-service user matches. It considers factors such as location, availability, specialized skills, and past satisfaction ratings.',
    version: '1.2.3',
    type: 'recommendation',
    status: 'active',
    framework: 'TensorFlow.js',
    size: '4.2 MB',
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2023-09-22T14:45:00Z',
    features: [
      'Caregiver skill matching',
      'Location-based recommendations',
      'Availability optimization',
      'Preference matching',
      'Historical satisfaction analysis',
      'Continuity of care prioritization'
    ],
    metrics: {
      accuracy: 0.92,
      precision: 0.89,
      recall: 0.85,
      f1Score: 0.87
    },
    deployments: {
      development: true,
      staging: true,
      production: false
    },
    training: {
      dataset: 'CareUnity Historical Matches (Jan 2020 - Jun 2023)',
      method: 'Supervised Learning with Gradient Boosting',
      duration: '4.5 hours',
      lastTrained: '2023-09-20T08:15:00Z'
    },
    usage: {
      totalRequests: 125750,
      avgRequestsPerDay: 1250,
      avgResponseTime: 120
    }
  };
}
