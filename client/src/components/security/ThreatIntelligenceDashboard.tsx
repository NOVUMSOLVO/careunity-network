/**
 * Threat Intelligence Dashboard Component
 * 
 * This component displays threat intelligence information and allows
 * administrators to view and manage threat indicators.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/hooks/useApi';
import { formatDistanceToNow, format } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertTriangle, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
  Filter,
  Search,
  Globe,
  Hash,
  Server,
  FileWarning,
  Info
} from 'lucide-react';

// Threat indicator types
type IndicatorType = 'ip' | 'domain' | 'hash' | 'vulnerability' | 'general';

// Threat indicator severity levels
type IndicatorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Threat indicator interface
interface ThreatIndicator {
  id: string;
  type: IndicatorType;
  value: string;
  confidence: number;
  severity: IndicatorSeverity;
  description: string;
  source: string;
  timestamp: string;
  expiresAt: string | null;
  tags: string[];
  metadata: Record<string, any>;
}

// Dashboard props
interface ThreatIntelligenceDashboardProps {
  refreshInterval?: number; // in milliseconds
}

export function ThreatIntelligenceDashboard({ refreshInterval = 60000 }: ThreatIntelligenceDashboardProps) {
  const { t } = useTranslation();
  const api = useApi();
  
  const [indicators, setIndicators] = useState<ThreatIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<ThreatIndicator | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedType, setSelectedType] = useState<IndicatorType | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<IndicatorSeverity | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState<string | 'all'>('all');
  
  // Load indicators
  const loadIndicators = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load indicators
      const response = await api.get('/api/v2/security/threat-intelligence/indicators', {
        params: {
          type: selectedType !== 'all' ? selectedType : undefined,
          severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
          source: selectedSource !== 'all' ? selectedSource : undefined,
          query: searchQuery || undefined,
          limit: 100
        }
      });
      
      setIndicators(response.data);
    } catch (error: any) {
      setError(error.message || 'Failed to load threat intelligence data');
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on mount and at regular intervals
  useEffect(() => {
    loadIndicators();
    
    const interval = setInterval(loadIndicators, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval, selectedType, selectedSeverity, selectedSource, searchQuery]);
  
  // Get unique sources
  const sources = Array.from(new Set(indicators.map(i => i.source)));
  
  // Get indicator icon based on type
  const getIndicatorIcon = (type: IndicatorType) => {
    switch (type) {
      case 'ip':
        return <Server className="h-5 w-5" />;
      case 'domain':
        return <Globe className="h-5 w-5" />;
      case 'hash':
        return <Hash className="h-5 w-5" />;
      case 'vulnerability':
        return <FileWarning className="h-5 w-5" />;
      case 'general':
        return <Info className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };
  
  // Get severity badge
  const getSeverityBadge = (severity: IndicatorSeverity) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-amber-500">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-500';
    if (confidence >= 70) return 'text-yellow-500';
    if (confidence >= 50) return 'text-amber-500';
    return 'text-red-500';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Threat Intelligence</h2>
        <Button onClick={loadIndicators} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      {error && (
        <div className="bg-destructive/15 p-3 rounded-md text-destructive">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}
      
      <Tabs defaultValue="indicators">
        <TabsList>
          <TabsTrigger value="indicators">Threat Indicators</TabsTrigger>
          <TabsTrigger value="feeds">Intelligence Feeds</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="indicators" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search indicators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ip">IP Address</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="hash">File Hash</SelectItem>
                  <SelectItem value="vulnerability">Vulnerability</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedSeverity} onValueChange={(value) => setSelectedSeverity(value as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedSource} onValueChange={(value) => setSelectedSource(value as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sources.map((source) => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Indicators Table */}
          <Card>
            <CardHeader>
              <CardTitle>Threat Indicators</CardTitle>
              <CardDescription>
                {indicators.length} indicators found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : indicators.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No threat indicators found matching the selected filters.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {indicators.map((indicator) => (
                      <TableRow key={indicator.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getIndicatorIcon(indicator.type)}
                            <span className="capitalize">{indicator.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {indicator.value.length > 30 
                            ? `${indicator.value.substring(0, 30)}...` 
                            : indicator.value}
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(indicator.severity)}
                        </TableCell>
                        <TableCell>
                          <span className={getConfidenceColor(indicator.confidence)}>
                            {indicator.confidence}%
                          </span>
                        </TableCell>
                        <TableCell>{indicator.source}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(indicator.timestamp), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedIndicator(indicator)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          {/* Indicator Details Dialog */}
          {selectedIndicator && (
            <Dialog open={!!selectedIndicator} onOpenChange={(open) => !open && setSelectedIndicator(null)}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {getIndicatorIcon(selectedIndicator.type)}
                    Threat Indicator Details
                    {getSeverityBadge(selectedIndicator.severity)}
                  </DialogTitle>
                  <DialogDescription>
                    Detailed information about the selected threat indicator
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Type</h3>
                    <p className="capitalize">{selectedIndicator.type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Value</h3>
                    <p className="font-mono text-sm break-all">{selectedIndicator.value}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Severity</h3>
                    <p className="capitalize">{selectedIndicator.severity}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Confidence</h3>
                    <p className={getConfidenceColor(selectedIndicator.confidence)}>
                      {selectedIndicator.confidence}%
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Source</h3>
                    <p>{selectedIndicator.source}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Added</h3>
                    <p>{format(new Date(selectedIndicator.timestamp), 'PPpp')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Expires</h3>
                    <p>
                      {selectedIndicator.expiresAt 
                        ? format(new Date(selectedIndicator.expiresAt), 'PPpp')
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedIndicator.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                  <p className="text-sm">{selectedIndicator.description}</p>
                </div>
                
                {Object.keys(selectedIndicator.metadata).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Metadata</h3>
                    <div className="bg-muted p-3 rounded-md">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(selectedIndicator.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedIndicator(null)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>
        
        <TabsContent value="feeds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intelligence Feeds</CardTitle>
              <CardDescription>
                Active threat intelligence data sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feed</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Update Interval</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>AbuseIPDB Blacklist</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>2 hours ago</TableCell>
                      <TableCell>24 hours</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>AlienVault OTX IP Reputation</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>5 hours ago</TableCell>
                      <TableCell>12 hours</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Emerging Threats IP Blocklist</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>3 hours ago</TableCell>
                      <TableCell>6 hours</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>NVD CVE Feed</TableCell>
                      <TableCell>Vulnerability</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>1 day ago</TableCell>
                      <TableCell>24 hours</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Indicators
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{indicators.length}</div>
                <p className="text-xs text-muted-foreground">
                  From {sources.length} sources
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Critical Threats
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {indicators.filter(i => i.severity === 'critical').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Highest priority threats
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  IP Indicators
                </CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {indicators.filter(i => i.type === 'ip').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Malicious IP addresses
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Vulnerabilities
                </CardTitle>
                <FileWarning className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {indicators.filter(i => i.type === 'vulnerability').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Known security vulnerabilities
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Threat Distribution</CardTitle>
              <CardDescription>
                Distribution of threats by type and severity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">
                  Threat distribution chart will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
