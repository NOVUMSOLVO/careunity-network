/**
 * ML Model Deployment Component
 *
 * Handles deployment of ML models to production environments
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDeployModel, useModelDeployments } from '@/hooks/use-ml-models';
import { ModelVersion } from '@shared/api-client/services/ml-models-api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Clock, Server, Shield } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDistanceToNow } from 'date-fns';

interface ModelDeploymentProps {
  modelId?: string;
  modelType?: 'recommendation' | 'timeSeries' | 'satisfaction' | 'workload';
}

export function ModelDeployment({ modelId, modelType }: ModelDeploymentProps) {
  const [selectedEnvironment, setSelectedEnvironment] = useState<'staging' | 'production'>('staging');
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
  const [deploymentNotes, setDeploymentNotes] = useState('');
  
  const { data: deployments, isLoading, isError, error } = useModelDeployments(modelId);
  const deployModel = useDeployModel();
  
  // Handle deployment
  const handleDeploy = async () => {
    if (!modelId) return;
    
    await deployModel.mutateAsync({
      modelId,
      environment: selectedEnvironment,
      notes: deploymentNotes
    });
    
    setIsDeployDialogOpen(false);
    setDeploymentNotes('');
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Deployments</CardTitle>
          <CardDescription>Deployment history and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-[300px] w-full" />
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
          <CardTitle>Model Deployments</CardTitle>
          <CardDescription>Deployment history and status</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load deployment data'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // No deployments yet
  if (!deployments || deployments.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Model Deployments</CardTitle>
            <CardDescription>Deployment history and status</CardDescription>
          </div>
          {modelId && (
            <Button onClick={() => setIsDeployDialogOpen(true)}>
              <Server className="mr-2 h-4 w-4" />
              Deploy Model
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Deployments</AlertTitle>
            <AlertDescription>
              This model has not been deployed to any environment yet.
            </AlertDescription>
          </Alert>
        </CardContent>
        
        {/* Deploy Dialog */}
        <Dialog open={isDeployDialogOpen} onOpenChange={setIsDeployDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deploy Model</DialogTitle>
              <DialogDescription>
                Deploy this model to a target environment.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="environment">Target Environment</Label>
                <Select
                  value={selectedEnvironment}
                  onValueChange={(value) => setSelectedEnvironment(value as 'staging' | 'production')}
                >
                  <SelectTrigger id="environment">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Deployment Notes</Label>
                <Input
                  id="notes"
                  placeholder="Enter deployment notes"
                  value={deploymentNotes}
                  onChange={(e) => setDeploymentNotes(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeployDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDeploy} disabled={deployModel.isPending}>
                {deployModel.isPending ? 'Deploying...' : 'Deploy'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Model Deployments</CardTitle>
          <CardDescription>Deployment history and status</CardDescription>
        </div>
        {modelId && (
          <Button onClick={() => setIsDeployDialogOpen(true)}>
            <Server className="mr-2 h-4 w-4" />
            Deploy Model
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="history">
          <TabsList className="mb-4">
            <TabsTrigger value="history">Deployment History</TabsTrigger>
            <TabsTrigger value="status">Current Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deployed By</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deployments.map((deployment, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {formatDistanceToNow(new Date(deployment.timestamp), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={deployment.environment === 'production' ? 'default' : 'secondary'}>
                        {deployment.environment}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          deployment.status === 'success' ? 'success' : 
                          deployment.status === 'failed' ? 'destructive' : 
                          'outline'
                        }
                      >
                        {deployment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{deployment.deployedBy || 'System'}</TableCell>
                    <TableCell>{deployment.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="status">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Staging</CardTitle>
                </CardHeader>
                <CardContent>
                  {deployments.find(d => d.environment === 'staging' && d.status === 'success') ? (
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Deployed</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-500 mr-2" />
                      <span>Not deployed</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Production</CardTitle>
                </CardHeader>
                <CardContent>
                  {deployments.find(d => d.environment === 'production' && d.status === 'success') ? (
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Deployed</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-500 mr-2" />
                      <span>Not deployed</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Deploy Dialog */}
      <Dialog open={isDeployDialogOpen} onOpenChange={setIsDeployDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy Model</DialogTitle>
            <DialogDescription>
              Deploy this model to a target environment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="environment">Target Environment</Label>
              <Select
                value={selectedEnvironment}
                onValueChange={(value) => setSelectedEnvironment(value as 'staging' | 'production')}
              >
                <SelectTrigger id="environment">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Deployment Notes</Label>
              <Input
                id="notes"
                placeholder="Enter deployment notes"
                value={deploymentNotes}
                onChange={(e) => setDeploymentNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeployDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeploy} disabled={deployModel.isPending}>
              {deployModel.isPending ? 'Deploying...' : 'Deploy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
