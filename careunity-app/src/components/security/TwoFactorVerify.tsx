import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Link,
  FormControlLabel,
  Checkbox,
  Divider,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import {
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
  Key as KeyIcon,
  Smartphone as SmartphoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';

interface TwoFactorVerifyProps {
  onVerify: (code: string, rememberDevice: boolean) => Promise<void>;
  onCancel: () => void;
  method: 'app' | 'sms' | 'email';
  phoneNumber?: string;
  email?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`2fa-tabpanel-${index}`}
      aria-labelledby={`2fa-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = ({
  onVerify,
  onCancel,
  method: initialMethod,
  phoneNumber,
  email
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [method, setMethod] = useState<'app' | 'sms' | 'email' | 'backup'>(initialMethod);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [backupCode, setBackupCode] = useState('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Set up resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setMethod(newValue === 0 ? initialMethod : 'backup');
    setError(null);
  };

  const handleVerificationCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 6 characters
    const value = event.target.value.replace(/[^0-9]/g, '').substring(0, 6);
    setVerificationCode(value);
  };

  const handleBackupCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBackupCode(event.target.value.toUpperCase());
  };

  const handleVerify = async () => {
    if (method !== 'backup' && verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    if (method === 'backup' && !backupCode) {
      setError('Please enter a backup code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the onVerify callback with the appropriate code
      const code = method === 'backup' ? backupCode : verificationCode;
      await onVerify(code, rememberDevice);
    } catch (error: any) {
      setError(error.message || 'Verification failed. Please try again.');
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    // In a real app, this would call an API to resend the code
    // For demo purposes, we'll just set a cooldown
    setResendCooldown(60);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={onCancel} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <SecurityIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h5">
            Two-Factor Authentication
          </Typography>
        </Box>
        
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Verification Code" />
          <Tab label="Backup Code" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Alert severity="info" sx={{ mb: 3 }}>
            {method === 'app' 
              ? 'Enter the 6-digit code from your authenticator app.' 
              : method === 'sms' 
              ? `We've sent a verification code to your phone ${phoneNumber ? `(${phoneNumber})` : ''}.` 
              : `We've sent a verification code to your email ${email ? `(${email})` : ''}.`}
          </Alert>
          
          <TextField
            label="Verification Code"
            fullWidth
            value={verificationCode}
            onChange={handleVerificationCodeChange}
            placeholder="123456"
            inputProps={{ 
              inputMode: 'numeric', 
              pattern: '[0-9]*',
              maxLength: 6
            }}
            sx={{ mb: 2 }}
            error={!!error}
            helperText={error}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          
          {(method === 'sms' || method === 'email') && (
            <Box sx={{ mb: 2 }}>
              <Button
                variant="text"
                disabled={resendCooldown > 0}
                onClick={handleResendCode}
              >
                {resendCooldown > 0 
                  ? `Resend code in ${resendCooldown}s` 
                  : 'Resend code'}
              </Button>
            </Box>
          )}
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={rememberDevice} 
                onChange={(e) => setRememberDevice(e.target.checked)} 
              />
            }
            label="Remember this device for 30 days"
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Alert severity="info" sx={{ mb: 3 }}>
            If you can't access your authentication device, enter one of your backup codes.
          </Alert>
          
          <TextField
            label="Backup Code"
            fullWidth
            value={backupCode}
            onChange={handleBackupCodeChange}
            placeholder="ABCD-EFGH"
            sx={{ mb: 2 }}
            error={!!error}
            helperText={error}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Backup codes are 8-character codes with a hyphen in the middle (e.g., ABCD-EFGH).
            Each code can only be used once.
          </Typography>
        </TabPanel>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleVerify}
            disabled={loading || (method !== 'backup' && verificationCode.length !== 6) || (method === 'backup' && !backupCode)}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default TwoFactorVerify;
