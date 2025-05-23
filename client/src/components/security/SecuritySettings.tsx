/**
 * Security Settings Component
 * 
 * This component allows users to manage their security settings,
 * including password, two-factor authentication, and login history.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
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
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  Key, 
  Smartphone, 
  Shield, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  CheckCircle,
  Clock,
  LogOut,
  RefreshCw,
  Copy,
  Loader2,
  X,
  Check,
  Globe,
  Monitor,
  Smartphone as MobileIcon,
  Tablet
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Password change form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Login session interface
interface LoginSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  timestamp: string;
  current: boolean;
}

// Two-factor method
type TwoFactorMethod = 'app' | 'sms' | 'email';

export function SecuritySettings() {
  const { t } = useTranslation();
  const api = useApi();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<TwoFactorMethod>('app');
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [passwordLastChanged, setPasswordLastChanged] = useState<Date | null>(null);
  
  // Password change form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  // Load security data
  const loadSecurityData = async () => {
    setLoading(true);
    
    try {
      // Load sessions
      const sessionsResponse = await api.get('/api/v2/security/sessions');
      setSessions(sessionsResponse.data);
      
      // Load 2FA status
      const twoFactorResponse = await api.get('/api/v2/security/two-factor');
      setTwoFactorEnabled(twoFactorResponse.data.enabled);
      if (twoFactorResponse.data.method) {
        setTwoFactorMethod(twoFactorResponse.data.method);
      }
      
      // Load password info
      if (user?.lastPasswordChange) {
        setPasswordLastChanged(new Date(user.lastPasswordChange));
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on mount
  useEffect(() => {
    loadSecurityData();
  }, []);
  
  // Handle password change
  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
      await api.post('/api/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      
      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully',
        variant: 'default',
      });
      
      // Reset form
      passwordForm.reset();
      
      // Refresh user data
      refreshUser();
      
      // Update password last changed
      setPasswordLastChanged(new Date());
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  
  // Handle session termination
  const terminateSession = async (sessionId: string) => {
    try {
      await api.delete(`/api/v2/security/sessions/${sessionId}`);
      
      // Update sessions list
      setSessions(sessions.filter(session => session.id !== sessionId));
      
      toast({
        title: 'Session Terminated',
        description: 'The session has been terminated successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to terminate session',
        variant: 'destructive',
      });
    }
  };
  
  // Handle 2FA setup
  const setupTwoFactor = async () => {
    try {
      const response = await api.post('/api/v2/security/two-factor/setup', {
        method: twoFactorMethod,
      });
      
      setSecret(response.data.secret);
      setQrCodeUrl(response.data.qrCodeUrl);
      setShowQrCode(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set up two-factor authentication',
        variant: 'destructive',
      });
    }
  };
  
  // Handle 2FA verification
  const verifyTwoFactor = async () => {
    setVerifying(true);
    
    try {
      const response = await api.post('/api/v2/security/two-factor/verify', {
        method: twoFactorMethod,
        code: verificationCode,
        secret,
      });
      
      setBackupCodes(response.data.backupCodes);
      setShowBackupCodes(true);
      setTwoFactorEnabled(true);
      
      toast({
        title: 'Two-Factor Authentication Enabled',
        description: 'Your account is now more secure',
        variant: 'default',
      });
      
      // Refresh user data
      refreshUser();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid verification code';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };
  
  // Handle 2FA disable
  const disableTwoFactor = async () => {
    try {
      await api.delete('/api/v2/security/two-factor');
      
      setTwoFactorEnabled(false);
      setShowQrCode(false);
      setShowBackupCodes(false);
      
      toast({
        title: 'Two-Factor Authentication Disabled',
        description: 'Two-factor authentication has been disabled',
        variant: 'default',
      });
      
      // Refresh user data
      refreshUser();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disable two-factor authentication',
        variant: 'destructive',
      });
    }
  };
  
  // Copy backup codes to clipboard
  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    
    toast({
      title: 'Copied',
      description: 'Backup codes copied to clipboard',
      variant: 'default',
    });
  };
  
  // Get device icon
  const getDeviceIcon = (device: string) => {
    const deviceLower = device.toLowerCase();
    
    if (deviceLower.includes('mobile') || deviceLower.includes('phone')) {
      return <MobileIcon className="h-4 w-4" />;
    } else if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) {
      return <Tablet className="h-4 w-4" />;
    } else {
      return <Monitor className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Security Settings</h2>
        <Button onClick={loadSecurityData} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <Tabs defaultValue="password">
        <TabsList>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="two-factor">Two-Factor Authentication</TabsTrigger>
          <TabsTrigger value="sessions">Login Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              {passwordLastChanged && (
                <div className="flex items-center mb-4 text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  Last changed: {format(passwordLastChanged, 'MMMM d, yyyy')}
                </div>
              )}
              
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 10 characters and include uppercase, lowercase, number, and special character.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                    {passwordForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Change Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Password Requirements</CardTitle>
              <CardDescription>
                Ensure your password meets these requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  At least 10 characters long
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  At least one uppercase letter (A-Z)
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  At least one lowercase letter (a-z)
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  At least one number (0-9)
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  At least one special character (!@#$%^&*)
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Different from your previous passwords
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="two-factor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">
                    {twoFactorEnabled 
                      ? 'Your account is protected with two-factor authentication' 
                      : 'Protect your account with two-factor authentication'}
                  </div>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setupTwoFactor();
                    } else {
                      disableTwoFactor();
                    }
                  }}
                />
              </div>
              
              {!twoFactorEnabled && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Choose a Method</h3>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="method-app"
                            name="2fa-method"
                            value="app"
                            checked={twoFactorMethod === 'app'}
                            onChange={() => setTwoFactorMethod('app')}
                            className="h-4 w-4"
                          />
                          <label htmlFor="method-app" className="text-sm font-medium">
                            Authenticator App (Recommended)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="method-sms"
                            name="2fa-method"
                            value="sms"
                            checked={twoFactorMethod === 'sms'}
                            onChange={() => setTwoFactorMethod('sms')}
                            className="h-4 w-4"
                          />
                          <label htmlFor="method-sms" className="text-sm font-medium">
                            SMS Text Message
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="method-email"
                            name="2fa-method"
                            value="email"
                            checked={twoFactorMethod === 'email'}
                            onChange={() => setTwoFactorMethod('email')}
                            className="h-4 w-4"
                          />
                          <label htmlFor="method-email" className="text-sm font-medium">
                            Email
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {showQrCode && twoFactorMethod === 'app' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">Scan QR Code</h3>
                          <p className="text-sm text-muted-foreground">
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                          </p>
                          <div className="flex justify-center p-4 bg-white rounded-md">
                            <img src={qrCodeUrl} alt="QR Code" className="h-48 w-48" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">Manual Setup</h3>
                          <p className="text-sm text-muted-foreground">
                            If you can't scan the QR code, enter this code manually in your app:
                          </p>
                          <div className="flex items-center space-x-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm">{secret}</code>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => {
                                navigator.clipboard.writeText(secret);
                                toast({
                                  title: 'Copied',
                                  description: 'Secret copied to clipboard',
                                  variant: 'default',
                                });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">Verify Setup</h3>
                          <p className="text-sm text-muted-foreground">
                            Enter the verification code from your authenticator app:
                          </p>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="text"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              placeholder="Enter 6-digit code"
                              className="w-40"
                            />
                            <Button onClick={verifyTwoFactor} disabled={verifying}>
                              {verifying ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Verify
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {showQrCode && twoFactorMethod !== 'app' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">
                            {twoFactorMethod === 'sms' ? 'Verify Phone Number' : 'Verify Email'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {twoFactorMethod === 'sms'
                              ? `We've sent a verification code to your phone number ending in ${user?.phoneNumber?.slice(-4) || 'XXXX'}`
                              : `We've sent a verification code to your email address ${user?.email || 'your email'}`}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="text"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              placeholder="Enter 6-digit code"
                              className="w-40"
                            />
                            <Button onClick={verifyTwoFactor} disabled={verifying}>
                              {verifying ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Verify
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {showBackupCodes && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-lg font-medium">Backup Codes</h3>
                  <p className="text-sm text-muted-foreground">
                    Save these backup codes in a secure place. You can use them to sign in if you lose access to your authentication device.
                  </p>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, index) => (
                        <code key={index} className="text-sm">{code}</code>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={copyBackupCodes}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Codes
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active login sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Loading sessions...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No active sessions found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(session.device)}
                            <div>
                              <div className="font-medium">{session.device}</div>
                              <div className="text-xs text-muted-foreground">{session.browser}</div>
                            </div>
                            {session.current && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            {session.location || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell>{session.ipAddress}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(session.timestamp), 'MMM d, yyyy')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(session.timestamp), 'h:mm a')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {!session.current && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => terminateSession(session.id)}
                            >
                              <LogOut className="mr-1 h-3 w-3" />
                              Terminate
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={loadSecurityData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Sessions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
