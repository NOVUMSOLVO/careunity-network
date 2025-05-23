/**
 * Security Audit Log Component
 * 
 * Displays security-related events and activities
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Shield, ShieldAlert, ShieldCheck, Search, Calendar } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';

// Audit log event types
type EventType = 'login' | 'logout' | 'failed_login' | 'password_change' | 'permission_change' | 'data_access' | 'api_access' | 'security_setting_change';

// Audit log severity levels
type SeverityLevel = 'info' | 'warning' | 'critical';

// Audit log entry interface
interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: number;
  username: string;
  ipAddress: string;
  userAgent: string;
  eventType: EventType;
  description: string;
  severity: SeverityLevel;
  metadata?: Record<string, any>;
}

interface SecurityAuditLogProps {
  limit?: number;
  showFilters?: boolean;
  defaultEventType?: EventType | 'all';
  defaultSeverity?: SeverityLevel | 'all';
}

export function SecurityAuditLog({
  limit = 50,
  showFilters = true,
  defaultEventType = 'all',
  defaultSeverity = 'all',
}: SecurityAuditLogProps) {
  const { t } = useTranslation();
  const api = useApi();
  
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedEventType, setSelectedEventType] = useState<EventType | 'all'>(defaultEventType);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'all'>(defaultSeverity);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  
  // Mock data for demonstration
  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      userId: 1,
      username: 'admin',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      eventType: 'login',
      description: 'User logged in successfully',
      severity: 'info',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
      userId: 2,
      username: 'john.doe',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      eventType: 'failed_login',
      description: 'Failed login attempt',
      severity: 'warning',
      metadata: { attemptCount: 2 },
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      userId: 1,
      username: 'admin',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      eventType: 'permission_change',
      description: 'Changed user permissions',
      severity: 'critical',
      metadata: { 
        targetUser: 'john.doe',
        changes: {
          oldRole: 'user',
          newRole: 'manager',
        }
      },
    },
  ];
  
  // Load audit logs
  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real application, this would be an API call
        // const response = await api.security.getAuditLogs({
        //   eventType: selectedEventType !== 'all' ? selectedEventType : undefined,
        //   severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
        //   search: searchQuery || undefined,
        //   from: dateRange.from?.toISOString(),
        //   to: dateRange.to?.toISOString(),
        //   limit,
        // });
        
        // For demonstration, use mock data
        setTimeout(() => {
          let filteredLogs = [...mockAuditLogs];
          
          // Apply filters
          if (selectedEventType !== 'all') {
            filteredLogs = filteredLogs.filter(log => log.eventType === selectedEventType);
          }
          
          if (selectedSeverity !== 'all') {
            filteredLogs = filteredLogs.filter(log => log.severity === selectedSeverity);
          }
          
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredLogs = filteredLogs.filter(log => 
              log.username.toLowerCase().includes(query) || 
              log.description.toLowerCase().includes(query) ||
              log.ipAddress.includes(query)
            );
          }
          
          if (dateRange.from) {
            filteredLogs = filteredLogs.filter(log => 
              new Date(log.timestamp) >= dateRange.from!
            );
          }
          
          if (dateRange.to) {
            filteredLogs = filteredLogs.filter(log => 
              new Date(log.timestamp) <= dateRange.to!
            );
          }
          
          setLogs(filteredLogs);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error loading audit logs:', err);
        setError(t('security.auditLogLoadError'));
        setLoading(false);
      }
    };
    
    loadLogs();
  }, [selectedEventType, selectedSeverity, searchQuery, dateRange, limit]);
  
  // Get severity badge variant
  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">{t(`security.severity.${severity}`)}</Badge>;
      case 'warning':
        return <Badge variant="warning">{t(`security.severity.${severity}`)}</Badge>;
      case 'info':
      default:
        return <Badge variant="secondary">{t(`security.severity.${severity}`)}</Badge>;
    }
  };
  
  // Get event type icon
  const getEventTypeIcon = (eventType: EventType) => {
    switch (eventType) {
      case 'login':
      case 'logout':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'failed_login':
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'password_change':
      case 'security_setting_change':
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
      case 'permission_change':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };
  
  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      </TableRow>
    ));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('security.auditLogTitle')}</CardTitle>
        <CardDescription>
          {t('security.auditLogDescription')}
        </CardDescription>
      </CardHeader>
      
      {showFilters && (
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('security.searchAuditLog')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              
              <div className="flex gap-2">
                <Select
                  value={selectedEventType}
                  onValueChange={(value) => setSelectedEventType(value as any)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('security.eventTypeFilter')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="login">{t('security.eventTypes.login')}</SelectItem>
                    <SelectItem value="logout">{t('security.eventTypes.logout')}</SelectItem>
                    <SelectItem value="failed_login">{t('security.eventTypes.failed_login')}</SelectItem>
                    <SelectItem value="password_change">{t('security.eventTypes.password_change')}</SelectItem>
                    <SelectItem value="permission_change">{t('security.eventTypes.permission_change')}</SelectItem>
                    <SelectItem value="data_access">{t('security.eventTypes.data_access')}</SelectItem>
                    <SelectItem value="api_access">{t('security.eventTypes.api_access')}</SelectItem>
                    <SelectItem value="security_setting_change">{t('security.eventTypes.security_setting_change')}</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={selectedSeverity}
                  onValueChange={(value) => setSelectedSeverity(value as any)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('security.severityFilter')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="info">{t('security.severity.info')}</SelectItem>
                    <SelectItem value="warning">{t('security.severity.warning')}</SelectItem>
                    <SelectItem value="critical">{t('security.severity.critical')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
          </div>
        </CardContent>
      )}
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>{t('security.timestamp')}</TableHead>
                <TableHead>{t('security.user')}</TableHead>
                <TableHead>{t('security.eventType')}</TableHead>
                <TableHead>{t('security.description')}</TableHead>
                <TableHead>{t('security.severity')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                renderSkeletons()
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    {error || t('security.noAuditLogs')}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const timestamp = new Date(log.timestamp);
                  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
                  
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        {getEventTypeIcon(log.eventType)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap" title={format(timestamp, 'PPpp')}>
                        {timeAgo}
                      </TableCell>
                      <TableCell>
                        {log.username}
                      </TableCell>
                      <TableCell>
                        {t(`security.eventTypes.${log.eventType}`)}
                      </TableCell>
                      <TableCell>
                        {log.description}
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(log.severity)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
