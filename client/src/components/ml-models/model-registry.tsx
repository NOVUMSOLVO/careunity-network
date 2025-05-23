/**
 * Model Registry Component
 * 
 * Displays and manages model versions in the registry
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useModelFamilies, useModelFamily, usePromoteModel } from '@/hooks/use-ml-models';
import { ModelFamily, ModelVersion } from '@shared/api-client/services/ml-models-api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowUpDown, CheckCircle, Clock, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';

export function ModelRegistry() {
  const { data: families, isLoading, isError, error } = useModelFamilies();
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [versionToPromote, setVersionToPromote] = useState<ModelVersion | null>(null);
  const [targetStatus, setTargetStatus] = useState<'development' | 'staging' | 'production' | 'archived'>('staging');
  
  const { data: familyDetails } = useModelFamily(selectedFamily || '');
  const promoteModel = usePromoteModel();
  
  // Handle promoting a model version
  const handlePromoteModel = async () => {
    if (!versionToPromote) return;
    
    await promoteModel.mutateAsync({
      modelName: versionToPromote.modelName,
      version: versionToPromote.version,
      status: targetStatus
    });
    
    setIsPromoteDialogOpen(false);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Registry</CardTitle>
          <CardDescription>Manage model versions and lifecycle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Registry</CardTitle>
          <CardDescription>Manage model versions and lifecycle</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load model registry: {error instanceof Error ? error.message : 'Unknown error'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (!families || families.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Registry</CardTitle>
          <CardDescription>Manage model versions and lifecycle</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Models</AlertTitle>
            <AlertDescription>
              No model families found in the registry. Train a model to get started.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // If no family is selected, select the first one
  if (!selectedFamily && families.length > 0) {
    setSelectedFamily(families[0].name);
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Registry</CardTitle>
        <CardDescription>Manage model versions and lifecycle</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Model Family</label>
            <Select
              value={selectedFamily || ''}
              onValueChange={setSelectedFamily}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model family" />
              </SelectTrigger>
              <SelectContent>
                {families.map((family) => (
                  <SelectItem key={family.name} value={family.name}>
                    {family.name} ({formatModelType(family.modelType)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {familyDetails && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{familyDetails.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {familyDetails.description || `${formatModelType(familyDetails.modelType)} model family`}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {formatModelType(familyDetails.modelType)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Versions</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{familyDetails.versions.length}</p>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Production Version</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {familyDetails.currentProductionVersion || 'None'}
                  </p>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Last Updated</span>
                  </div>
                  <p className="text-lg font-bold mt-2">
                    {formatDistanceToNow(new Date(familyDetails.updatedAt), { addSuffix: true })}
                  </p>
                </Card>
              </div>
              
              <Tabs defaultValue="versions">
                <TabsList className="w-full">
                  <TabsTrigger value="versions" className="flex-1">Versions</TabsTrigger>
                  <TabsTrigger value="metrics" className="flex-1">Metrics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="versions" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Version</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {familyDetails.versions
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((version) => (
                            <TableRow key={version.version}>
                              <TableCell className="font-medium">{version.version}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusVariant(version.status)}>
                                  {version.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                              </TableCell>
                              <TableCell className="text-right">
                                <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setVersionToPromote(version)}
                                      disabled={version.status === 'archived'}
                                    >
                                      <ArrowUpDown className="h-3 w-3 mr-1" />
                                      Promote
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Promote Model Version</DialogTitle>
                                      <DialogDescription>
                                        Change the status of model version {versionToPromote?.version}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <label className="text-sm font-medium mb-2 block">Target Status</label>
                                      <Select
                                        value={targetStatus}
                                        onValueChange={(value: any) => setTargetStatus(value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="development">Development</SelectItem>
                                          <SelectItem value="staging">Staging</SelectItem>
                                          <SelectItem value="production">Production</SelectItem>
                                          <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      
                                      {targetStatus === 'production' && (
                                        <Alert className="mt-4">
                                          <AlertCircle className="h-4 w-4" />
                                          <AlertTitle>Warning</AlertTitle>
                                          <AlertDescription>
                                            Promoting to production will archive the current production version.
                                          </AlertDescription>
                                        </Alert>
                                      )}
                                    </div>
                                    <DialogFooter>
                                      <Button 
                                        variant="outline" 
                                        onClick={() => setIsPromoteDialogOpen(false)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button 
                                        onClick={handlePromoteModel}
                                        disabled={promoteModel.isPending}
                                      >
                                        {promoteModel.isPending ? 'Promoting...' : 'Promote'}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="metrics" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Version</TableHead>
                          <TableHead>Status</TableHead>
                          {getMetricsForModelType(familyDetails.modelType).map(metric => (
                            <TableHead key={metric}>{formatMetricName(metric)}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {familyDetails.versions
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((version) => (
                            <TableRow key={version.version}>
                              <TableCell className="font-medium">{version.version}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusVariant(version.status)}>
                                  {version.status}
                                </Badge>
                              </TableCell>
                              {getMetricsForModelType(familyDetails.modelType).map(metric => (
                                <TableCell key={metric}>
                                  {formatMetricValue(metric, version.metrics[metric as keyof typeof version.metrics])}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Format model type for display
 */
function formatModelType(type: string): string {
  switch (type) {
    case 'recommendation':
      return 'Recommendation';
    case 'timeSeries':
      return 'Time Series';
    case 'satisfaction':
      return 'Satisfaction';
    case 'workload':
      return 'Workload';
    default:
      return type;
  }
}

/**
 * Get status badge variant
 */
function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'production':
      return 'default';
    case 'staging':
      return 'secondary';
    case 'archived':
      return 'destructive';
    case 'development':
    default:
      return 'outline';
  }
}

/**
 * Get metrics for model type
 */
function getMetricsForModelType(modelType: string): string[] {
  switch (modelType) {
    case 'recommendation':
    case 'satisfaction':
      return ['accuracy', 'precision', 'recall'];
    case 'timeSeries':
    case 'workload':
      return ['rmse', 'mae'];
    default:
      return ['accuracy'];
  }
}

/**
 * Format metric name for display
 */
function formatMetricName(metric: string): string {
  switch (metric) {
    case 'accuracy':
      return 'Accuracy';
    case 'precision':
      return 'Precision';
    case 'recall':
      return 'Recall';
    case 'f1Score':
      return 'F1 Score';
    case 'rmse':
      return 'RMSE';
    case 'mae':
      return 'MAE';
    default:
      return metric;
  }
}

/**
 * Format metric value for display
 */
function formatMetricValue(metric: string, value: number | undefined): string {
  if (value === undefined) return 'N/A';
  
  switch (metric) {
    case 'accuracy':
    case 'precision':
    case 'recall':
    case 'f1Score':
      return `${(value * 100).toFixed(1)}%`;
    case 'rmse':
    case 'mae':
      return value.toFixed(2);
    default:
      return value.toString();
  }
}
