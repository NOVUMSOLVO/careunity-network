/**
 * Integration Settings Page
 * 
 * Allows users to manage external integrations
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/useToast';

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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/layout/page-header';
import { 
  Globe, 
  Activity, 
  Building, 
  Truck, 
  CreditCard, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Check, 
  X, 
  Loader2 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

// Integration types
enum IntegrationType {
  HEALTHCARE = 'healthcare',
  WEARABLE = 'wearable',
  PHARMACY = 'pharmacy',
  SOCIAL_SERVICES = 'social_services',
  TRANSPORTATION = 'transportation',
  BILLING = 'billing',
  CUSTOM = 'custom',
}

// Integration status
enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ERROR = 'error',
}

// Integration configuration
interface IntegrationConfig {
  id?: number;
  name: string;
  type: IntegrationType;
  subtype?: string;
  status: IntegrationStatus;
  config: Record<string, any>;
  userId?: number;
  organizationId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function IntegrationSettings() {
  const { t } = useTranslation();
  const api = useApi();
  const { toast } = useToast();
  
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<IntegrationType | 'all'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newIntegration, setNewIntegration] = useState<Partial<IntegrationConfig>>({
    name: '',
    type: IntegrationType.HEALTHCARE,
    status: IntegrationStatus.INACTIVE,
    config: {},
  });
  const [testingIntegration, setTestingIntegration] = useState<number | null>(null);
  const [deletingIntegration, setDeletingIntegration] = useState<number | null>(null);
  
  // Load integrations
  useEffect(() => {
    const loadIntegrations = async () => {
      setLoading(true);
      
      try {
        // In a real application, this would be an API call
        // const response = await api.integrations.getAll();
        
        // Mock data for demonstration
        const mockIntegrations: IntegrationConfig[] = [
          {
            id: 1,
            name: 'Epic EHR Integration',
            type: IntegrationType.HEALTHCARE,
            subtype: 'fhir',
            status: IntegrationStatus.ACTIVE,
            config: {
              baseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
              clientId: 'mock-client-id',
              scope: 'patient/*.read',
            },
            organizationId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            name: 'Fitbit Integration',
            type: IntegrationType.WEARABLE,
            subtype: 'fitbit',
            status: IntegrationStatus.ACTIVE,
            config: {
              deviceType: 'fitbit',
              apiKey: 'mock-api-key',
              redirectUri: 'https://careunity.app/integrations/callback',
            },
            userId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 3,
            name: 'Local Pharmacy API',
            type: IntegrationType.PHARMACY,
            status: IntegrationStatus.INACTIVE,
            config: {
              apiUrl: 'https://api.localpharmacy.com',
              apiKey: 'mock-pharmacy-key',
            },
            organizationId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        
        setIntegrations(mockIntegrations);
      } catch (error) {
        console.error('Error loading integrations:', error);
        toast({
          title: t('integrations.loadError'),
          description: t('integrations.loadErrorDescription'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadIntegrations();
  }, []);
  
  // Filter integrations by type
  const filteredIntegrations = selectedType === 'all'
    ? integrations
    : integrations.filter(integration => integration.type === selectedType);
  
  // Handle adding a new integration
  const handleAddIntegration = async () => {
    try {
      // In a real application, this would be an API call
      // const response = await api.integrations.create(newIntegration);
      
      // Mock response for demonstration
      const mockResponse: IntegrationConfig = {
        ...newIntegration as IntegrationConfig,
        id: Math.floor(Math.random() * 1000) + 10,
        status: IntegrationStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setIntegrations([...integrations, mockResponse]);
      setShowAddDialog(false);
      setNewIntegration({
        name: '',
        type: IntegrationType.HEALTHCARE,
        status: IntegrationStatus.INACTIVE,
        config: {},
      });
      
      toast({
        title: t('integrations.addSuccess'),
        description: t('integrations.addSuccessDescription'),
      });
    } catch (error) {
      console.error('Error adding integration:', error);
      toast({
        title: t('integrations.addError'),
        description: t('integrations.addErrorDescription'),
        variant: 'destructive',
      });
    }
  };
  
  // Handle testing an integration
  const handleTestIntegration = async (id: number) => {
    setTestingIntegration(id);
    
    try {
      // In a real application, this would be an API call
      // const response = await api.integrations.test(id);
      
      // Mock response for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      const success = Math.random() > 0.3; // 70% chance of success
      
      if (success) {
        toast({
          title: t('integrations.testSuccess'),
          description: t('integrations.testSuccessDescription'),
        });
      } else {
        toast({
          title: t('integrations.testError'),
          description: t('integrations.testErrorDescription'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error testing integration:', error);
      toast({
        title: t('integrations.testError'),
        description: t('integrations.testErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setTestingIntegration(null);
    }
  };
  
  // Handle deleting an integration
  const handleDeleteIntegration = async (id: number) => {
    setDeletingIntegration(id);
    
    try {
      // In a real application, this would be an API call
      // await api.integrations.delete(id);
      
      // Mock response for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIntegrations(integrations.filter(integration => integration.id !== id));
      
      toast({
        title: t('integrations.deleteSuccess'),
        description: t('integrations.deleteSuccessDescription'),
      });
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast({
        title: t('integrations.deleteError'),
        description: t('integrations.deleteErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setDeletingIntegration(null);
    }
  };
  
  // Handle toggling integration status
  const handleToggleStatus = async (id: number, currentStatus: IntegrationStatus) => {
    try {
      const newStatus = currentStatus === IntegrationStatus.ACTIVE
        ? IntegrationStatus.INACTIVE
        : IntegrationStatus.ACTIVE;
      
      // In a real application, this would be an API call
      // await api.integrations.update(id, { status: newStatus });
      
      // Update local state
      setIntegrations(integrations.map(integration => 
        integration.id === id
          ? { ...integration, status: newStatus, updatedAt: new Date().toISOString() }
          : integration
      ));
      
      toast({
        title: newStatus === IntegrationStatus.ACTIVE
          ? t('integrations.activateSuccess')
          : t('integrations.deactivateSuccess'),
        description: newStatus === IntegrationStatus.ACTIVE
          ? t('integrations.activateSuccessDescription')
          : t('integrations.deactivateSuccessDescription'),
      });
    } catch (error) {
      console.error('Error toggling integration status:', error);
      toast({
        title: t('integrations.updateError'),
        description: t('integrations.updateErrorDescription'),
        variant: 'destructive',
      });
    }
  };
  
  // Get integration type icon
  const getIntegrationTypeIcon = (type: IntegrationType) => {
    switch (type) {
      case IntegrationType.HEALTHCARE:
        return <Activity className="h-5 w-5" />;
      case IntegrationType.WEARABLE:
        return <Activity className="h-5 w-5" />;
      case IntegrationType.PHARMACY:
        return <Building className="h-5 w-5" />;
      case IntegrationType.SOCIAL_SERVICES:
        return <Globe className="h-5 w-5" />;
      case IntegrationType.TRANSPORTATION:
        return <Truck className="h-5 w-5" />;
      case IntegrationType.BILLING:
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case IntegrationStatus.ACTIVE:
        return <Badge variant="success">{t('integrations.statusActive')}</Badge>;
      case IntegrationStatus.INACTIVE:
        return <Badge variant="secondary">{t('integrations.statusInactive')}</Badge>;
      case IntegrationStatus.PENDING:
        return <Badge variant="warning">{t('integrations.statusPending')}</Badge>;
      case IntegrationStatus.ERROR:
        return <Badge variant="destructive">{t('integrations.statusError')}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="container py-6">
      <PageHeader
        title={t('integrations.settingsTitle')}
        description={t('integrations.settingsDescription')}
        icon={<Globe className="h-6 w-6" />}
        actions={
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('integrations.addNew')}
          </Button>
        }
      />
      
      <Tabs defaultValue="all" value={selectedType} onValueChange={(value) => setSelectedType(value as any)} className="mt-6">
        <TabsList className="grid grid-cols-7">
          <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
          <TabsTrigger value={IntegrationType.HEALTHCARE}>{t('integrations.typeHealthcare')}</TabsTrigger>
          <TabsTrigger value={IntegrationType.WEARABLE}>{t('integrations.typeWearable')}</TabsTrigger>
          <TabsTrigger value={IntegrationType.PHARMACY}>{t('integrations.typePharmacy')}</TabsTrigger>
          <TabsTrigger value={IntegrationType.SOCIAL_SERVICES}>{t('integrations.typeSocialServices')}</TabsTrigger>
          <TabsTrigger value={IntegrationType.TRANSPORTATION}>{t('integrations.typeTransportation')}</TabsTrigger>
          <TabsTrigger value={IntegrationType.BILLING}>{t('integrations.typeBilling')}</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('integrations.currentIntegrations')}</CardTitle>
              <CardDescription>
                {t('integrations.currentIntegrationsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('integrations.name')}</TableHead>
                    <TableHead>{t('integrations.type')}</TableHead>
                    <TableHead>{t('integrations.status')}</TableHead>
                    <TableHead>{t('integrations.lastUpdated')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredIntegrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        {t('integrations.noIntegrations')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIntegrations.map((integration) => (
                      <TableRow key={integration.id}>
                        <TableCell className="font-medium">{integration.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getIntegrationTypeIcon(integration.type)}
                            <span className="ml-2">{t(`integrations.type${integration.type.charAt(0).toUpperCase() + integration.type.slice(1)}`)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(integration.status)}</TableCell>
                        <TableCell>{new Date(integration.updatedAt!).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestIntegration(integration.id!)}
                              disabled={testingIntegration === integration.id}
                            >
                              {testingIntegration === integration.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                              <span className="sr-only">{t('integrations.test')}</span>
                            </Button>
                            
                            <Switch
                              checked={integration.status === IntegrationStatus.ACTIVE}
                              onCheckedChange={() => handleToggleStatus(integration.id!, integration.status)}
                            />
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">{t('common.delete')}</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('integrations.deleteConfirm')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('integrations.deleteConfirmDescription')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteIntegration(integration.id!)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {deletingIntegration === integration.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 mr-2" />
                                    )}
                                    {t('common.delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </Tabs>
      
      {/* Add Integration Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('integrations.addNew')}</DialogTitle>
            <DialogDescription>
              {t('integrations.addNewDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('integrations.name')}
              </Label>
              <Input
                id="name"
                value={newIntegration.name}
                onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                {t('integrations.type')}
              </Label>
              <Select
                value={newIntegration.type}
                onValueChange={(value) => setNewIntegration({ ...newIntegration, type: value as IntegrationType })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('integrations.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={IntegrationType.HEALTHCARE}>{t('integrations.typeHealthcare')}</SelectItem>
                  <SelectItem value={IntegrationType.WEARABLE}>{t('integrations.typeWearable')}</SelectItem>
                  <SelectItem value={IntegrationType.PHARMACY}>{t('integrations.typePharmacy')}</SelectItem>
                  <SelectItem value={IntegrationType.SOCIAL_SERVICES}>{t('integrations.typeSocialServices')}</SelectItem>
                  <SelectItem value={IntegrationType.TRANSPORTATION}>{t('integrations.typeTransportation')}</SelectItem>
                  <SelectItem value={IntegrationType.BILLING}>{t('integrations.typeBilling')}</SelectItem>
                  <SelectItem value={IntegrationType.CUSTOM}>{t('integrations.typeCustom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="config-url" className="text-right">
                {t('integrations.apiUrl')}
              </Label>
              <Input
                id="config-url"
                value={newIntegration.config?.apiUrl || ''}
                onChange={(e) => setNewIntegration({
                  ...newIntegration,
                  config: { ...newIntegration.config, apiUrl: e.target.value }
                })}
                className="col-span-3"
                placeholder="https://api.example.com"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="config-key" className="text-right">
                {t('integrations.apiKey')}
              </Label>
              <Input
                id="config-key"
                value={newIntegration.config?.apiKey || ''}
                onChange={(e) => setNewIntegration({
                  ...newIntegration,
                  config: { ...newIntegration.config, apiKey: e.target.value }
                })}
                className="col-span-3"
                type="password"
                placeholder="••••••••••••••••"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAddIntegration} disabled={!newIntegration.name}>
              {t('integrations.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
