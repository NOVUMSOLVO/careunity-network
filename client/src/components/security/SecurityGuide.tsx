/**
 * Security Guide Component
 * 
 * This component provides security guidance and best practices for users.
 * It educates users about password security, two-factor authentication,
 * and other security features of the CareUnity application.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Key, 
  Lock, 
  Smartphone, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  FileText,
  Download
} from 'lucide-react';

interface SecurityGuideProps {
  showSecurityScore?: boolean;
}

export function SecurityGuide({ showSecurityScore = true }: SecurityGuideProps) {
  const { t } = useTranslation();
  const [securityScore, setSecurityScore] = useState(70); // Example score
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Security Guide</h2>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download PDF Guide
        </Button>
      </div>
      
      {showSecurityScore && (
        <Card>
          <CardHeader>
            <CardTitle>Your Security Score</CardTitle>
            <CardDescription>
              Based on your current security settings and practices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Security Score: {securityScore}%</span>
                <span className="text-sm text-muted-foreground">
                  {securityScore < 50 ? 'Poor' : 
                   securityScore < 70 ? 'Fair' : 
                   securityScore < 90 ? 'Good' : 'Excellent'}
                </span>
              </div>
              <Progress value={securityScore} className="h-2" />
              
              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">Recommendations to improve your score:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>You have a strong password</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <span>Enable two-factor authentication for additional security</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <span>Review your recent login activity</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="basics">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basics">Security Basics</TabsTrigger>
          <TabsTrigger value="passwords">Password Security</TabsTrigger>
          <TabsTrigger value="2fa">Two-Factor Authentication</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basics" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Security Basics</AlertTitle>
            <AlertDescription>
              Understanding the fundamentals of security will help you protect your account and sensitive information.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Security Fundamentals</CardTitle>
              <CardDescription>
                Essential security practices for all users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Keep Your Account Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Your CareUnity account contains sensitive healthcare information. Follow these practices to keep it secure:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Use a strong, unique password</li>
                  <li>Enable two-factor authentication</li>
                  <li>Never share your login credentials</li>
                  <li>Log out when using shared or public devices</li>
                  <li>Keep your device's operating system and browser updated</li>
                  <li>Be cautious of phishing attempts</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Recognize Security Threats</h3>
                <p className="text-sm text-muted-foreground">
                  Be aware of common security threats:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Phishing:</strong> Fraudulent attempts to obtain sensitive information by disguising as a trustworthy entity</li>
                  <li><strong>Social Engineering:</strong> Psychological manipulation to trick users into making security mistakes</li>
                  <li><strong>Malware:</strong> Software designed to disrupt, damage, or gain unauthorized access</li>
                  <li><strong>Unsecured Networks:</strong> Public Wi-Fi networks that may expose your data</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Report Security Concerns</h3>
                <p className="text-sm text-muted-foreground">
                  If you notice any suspicious activity or have security concerns:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Contact your administrator immediately</li>
                  <li>Report suspicious emails or messages</li>
                  <li>Change your password if you suspect it's been compromised</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="passwords" className="space-y-4">
          <Alert>
            <Key className="h-4 w-4" />
            <AlertTitle>Password Security</AlertTitle>
            <AlertDescription>
              A strong password is your first line of defense against unauthorized access.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Creating Strong Passwords</CardTitle>
              <CardDescription>
                Guidelines for creating and managing secure passwords
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Password Requirements</h3>
                <p className="text-sm text-muted-foreground">
                  CareUnity requires passwords that meet the following criteria:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>At least 10 characters long</li>
                  <li>At least one uppercase letter (A-Z)</li>
                  <li>At least one lowercase letter (a-z)</li>
                  <li>At least one number (0-9)</li>
                  <li>At least one special character (!@#$%^&*)</li>
                  <li>Different from your previous passwords</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Password Best Practices</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Use unique passwords</strong> for different accounts</li>
                  <li><strong>Avoid personal information</strong> like names, birthdays, or common words</li>
                  <li><strong>Consider using a passphrase</strong> - a sequence of random words</li>
                  <li><strong>Change your password regularly</strong>, at least every 90 days</li>
                  <li><strong>Use a password manager</strong> to generate and store complex passwords</li>
                  <li><strong>Never share your password</strong> with anyone, including IT staff</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Examples</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Weak Password</p>
                      <p className="text-xs text-muted-foreground">password123</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-500">Strong Password</p>
                      <p className="text-xs text-muted-foreground">T!ger5Jump$Cloud9</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="2fa" className="space-y-4">
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertTitle>Two-Factor Authentication</AlertTitle>
            <AlertDescription>
              Add an extra layer of security to your account with two-factor authentication (2FA).
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Understanding Two-Factor Authentication</CardTitle>
              <CardDescription>
                How 2FA works and why you should use it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">What is Two-Factor Authentication?</h3>
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication (2FA) adds an extra layer of security by requiring two different types of verification:
                </p>
                <ol className="list-decimal pl-6 space-y-1 text-sm">
                  <li><strong>Something you know</strong> - your password</li>
                  <li><strong>Something you have</strong> - a mobile device or security key</li>
                </ol>
                <p className="text-sm text-muted-foreground mt-2">
                  Even if someone discovers your password, they still can't access your account without the second factor.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">2FA Methods in CareUnity</h3>
                <p className="text-sm text-muted-foreground">
                  CareUnity supports the following 2FA methods:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Authenticator App</strong> - Generate time-based codes using apps like Google Authenticator or Authy</li>
                  <li><strong>SMS</strong> - Receive verification codes via text message</li>
                  <li><strong>Email</strong> - Receive verification codes via email</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Recommendation:</strong> Authenticator apps are more secure than SMS or email methods.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Setting Up 2FA</h3>
                <p className="text-sm text-muted-foreground">
                  To set up two-factor authentication:
                </p>
                <ol className="list-decimal pl-6 space-y-1 text-sm">
                  <li>Go to your account settings</li>
                  <li>Select "Security"</li>
                  <li>Click "Enable Two-Factor Authentication"</li>
                  <li>Choose your preferred method</li>
                  <li>Follow the on-screen instructions</li>
                </ol>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Important:</strong> Save your backup codes in a secure location. These allow you to access your account if you lose your device.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-4">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Privacy & Data Protection</AlertTitle>
            <AlertDescription>
              Learn how to protect sensitive healthcare data and maintain privacy.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Privacy Best Practices</CardTitle>
              <CardDescription>
                Guidelines for handling sensitive healthcare information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Protecting Sensitive Information</h3>
                <p className="text-sm text-muted-foreground">
                  As a healthcare professional, you handle sensitive patient information. Follow these practices:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Only access patient data when necessary for care</li>
                  <li>Never share patient information through unsecured channels</li>
                  <li>Lock your device when stepping away</li>
                  <li>Be aware of your surroundings when viewing sensitive information</li>
                  <li>Report any data breaches or concerns immediately</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Compliance Requirements</h3>
                <p className="text-sm text-muted-foreground">
                  CareUnity is designed to help you maintain compliance with healthcare regulations:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>HIPAA (US)</strong> - Health Insurance Portability and Accountability Act</li>
                  <li><strong>GDPR (EU)</strong> - General Data Protection Regulation</li>
                  <li><strong>PIPEDA (Canada)</strong> - Personal Information Protection and Electronic Documents Act</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  Your actions within the system are logged for compliance and security purposes.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Secure Communication</h3>
                <p className="text-sm text-muted-foreground">
                  When communicating about patient care:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Use the secure messaging features within CareUnity</li>
                  <li>Avoid sending sensitive information via email or text</li>
                  <li>Double-check recipient information before sending messages</li>
                  <li>Be cautious about what information you include in communications</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What should I do if I suspect my account has been compromised?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  If you suspect your account has been compromised:
                </p>
                <ol className="list-decimal pl-6 space-y-1 text-sm mt-2">
                  <li>Change your password immediately</li>
                  <li>Enable two-factor authentication if not already enabled</li>
                  <li>Check your account activity for any unauthorized actions</li>
                  <li>Contact your administrator to report the incident</li>
                  <li>Review and update security on any other accounts that share the same password</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>How often should I change my password?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  We recommend changing your password at least every 90 days. The system will prompt you when it's time to change your password. However, if you suspect your password has been compromised, change it immediately.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>What if I lose my phone with my authenticator app?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  If you lose your phone with your authenticator app:
                </p>
                <ol className="list-decimal pl-6 space-y-1 text-sm mt-2">
                  <li>Use one of your backup codes to log in (you should have saved these when setting up 2FA)</li>
                  <li>Once logged in, disable 2FA on your old device</li>
                  <li>Set up 2FA on your new device</li>
                  <li>If you don't have backup codes, contact your administrator for assistance</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Is it safe to use CareUnity on public Wi-Fi?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  While CareUnity uses encryption to protect your data, we recommend avoiding public Wi-Fi networks when accessing sensitive healthcare information. If you must use public Wi-Fi:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
                  <li>Use a VPN (Virtual Private Network) to encrypt your connection</li>
                  <li>Verify you're connected to the legitimate network</li>
                  <li>Avoid accessing particularly sensitive information</li>
                  <li>Log out completely when finished</li>
                  <li>Consider using your mobile data connection instead</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>How does CareUnity protect my data?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  CareUnity protects your data through multiple security measures:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
                  <li><strong>Encryption</strong> - All data is encrypted both in transit and at rest</li>
                  <li><strong>Access Controls</strong> - Role-based access ensures users only see information they need</li>
                  <li><strong>Authentication</strong> - Strong password requirements and two-factor authentication</li>
                  <li><strong>Audit Logging</strong> - All system activities are logged for security monitoring</li>
                  <li><strong>Regular Security Updates</strong> - The system is regularly updated to address vulnerabilities</li>
                  <li><strong>Compliance</strong> - Built to meet healthcare security and privacy regulations</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          View Full Security Policy
        </Button>
        <Button variant="outline">
          <ExternalLink className="mr-2 h-4 w-4" />
          Security Training Resources
        </Button>
      </div>
    </div>
  );
}
