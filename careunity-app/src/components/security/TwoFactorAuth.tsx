import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Security as SecurityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Check as CheckIcon,
  QrCode as QrCodeIcon,
  Key as KeyIcon,
  Smartphone as SmartphoneIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import QRCode from 'qrcode.react';
import { useAuth } from '../../contexts/auth-context';

// Mock 2FA secret for demo purposes
const MOCK_2FA_SECRET = 'JBSWY3DPEHPK3PXP';

interface TwoFactorAuthProps {
  onComplete?: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [method, setMethod] = useState<'app' | 'sms' | 'email'>('app');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  // Steps for the 2FA setup process
  const steps = ['Choose Method', 'Setup', 'Verify', 'Backup Codes'];

  // Generate backup codes
  useEffect(() => {
    if (activeStep === 3 && backupCodes.length === 0) {
      // Generate 10 random backup codes
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
        Math.random().toString(36).substring(2, 6).toUpperCase()
      );
      setBackupCodes(codes);
    }
  }, [activeStep, backupCodes.length]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleMethodChange = (newMethod: 'app' | 'sms' | 'email') => {
    setMethod(newMethod);
    handleNext();
  };

  const handleVerificationCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 6 characters
    const value = event.target.value.replace(/[^0-9]/g, '').substring(0, 6);
    setVerificationCode(value);
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real app, this would call an API to verify the code
      // For demo purposes, we'll simulate a successful verification after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, any code is valid except "000000"
      if (verificationCode === '000000') {
        throw new Error('Invalid verification code');
      }
      
      setSuccess(true);
      handleNext();
    } catch (error: any) {
      setError(error.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    setShowBackupCodes(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleDownloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'careunity-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Authentication Method
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Two-factor authentication adds an extra layer of security to your account. 
              Choose your preferred method below.
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 6 },
                    height: '100%'
                  }}
                  onClick={() => handleMethodChange('app')}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <SmartphoneIcon fontSize="large" color="primary" sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Authenticator App
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use an authenticator app like Google Authenticator or Authy
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 6 },
                    height: '100%'
                  }}
                  onClick={() => handleMethodChange('sms')}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <PhoneIcon fontSize="large" color="primary" sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      SMS
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive verification codes via text message
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 6 },
                    height: '100%'
                  }}
                  onClick={() => handleMethodChange('email')}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <EmailIcon fontSize="large" color="primary" sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Email
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive verification codes via email
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {method === 'app' ? 'Set Up Authenticator App' : 
               method === 'sms' ? 'Set Up SMS Authentication' : 
               'Set Up Email Authentication'}
            </Typography>
            
            {method === 'app' ? (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Scan the QR code below with your authenticator app, or enter the setup key manually.
                </Alert>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <QRCode 
                      value={`otpauth://totp/CareUnity:${user?.email}?secret=${MOCK_2FA_SECRET}&issuer=CareUnity`} 
                      size={200} 
                      level="H"
                    />
                  </Paper>
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  Manual Setup Key:
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    letterSpacing: 1,
                    bgcolor: 'grey.100',
                    p: 1,
                    borderRadius: 1,
                    mb: 2
                  }}
                >
                  {MOCK_2FA_SECRET}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  After scanning the QR code or entering the key manually, your authenticator app will display a 6-digit code. 
                  You'll need to enter this code in the next step to verify the setup.
                </Typography>
              </>
            ) : method === 'sms' ? (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  We'll send verification codes to your phone number when you sign in.
                </Alert>
                
                <TextField
                  label="Phone Number"
                  fullWidth
                  defaultValue={user?.phoneNumber || ''}
                  placeholder="+1 (555) 123-4567"
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="text.secondary">
                  Standard message and data rates may apply. We'll send you a verification code to confirm your phone number in the next step.
                </Typography>
              </>
            ) : (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  We'll send verification codes to your email address when you sign in.
                </Alert>
                
                <TextField
                  label="Email Address"
                  fullWidth
                  defaultValue={user?.email || ''}
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="text.secondary">
                  Make sure you have access to this email address. We'll send you a verification code to confirm your email in the next step.
                </Typography>
              </>
            )}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Verify Setup
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              {method === 'app' 
                ? 'Enter the 6-digit code from your authenticator app.' 
                : method === 'sms' 
                ? 'We\'ve sent a verification code to your phone. Enter it below.' 
                : 'We\'ve sent a verification code to your email. Enter it below.'}
            </Alert>
            
            <TextField
              label="Verification Code"
              fullWidth
              value={verificationCode}
              onChange={handleVerificationCodeChange}
              placeholder="123456"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              sx={{ mb: 2 }}
              error={!!error}
              helperText={error}
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={rememberDevice} 
                  onChange={(e) => setRememberDevice(e.target.checked)} 
                />
              }
              label="Remember this device for 30 days"
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              If you're having trouble, you can go back and try a different method.
            </Typography>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Backup Codes
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 2 }}>
              Save these backup codes in a secure place. You can use them to sign in if you lose access to your authentication device.
            </Alert>
            
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1
              }}>
                {backupCodes.map((code, index) => (
                  <Typography 
                    key={index} 
                    variant="body1" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      letterSpacing: 1
                    }}
                  >
                    {code}
                  </Typography>
                ))}
              </Box>
            </Paper>
            
            <Button 
              variant="outlined" 
              onClick={handleDownloadBackupCodes}
              startIcon={<KeyIcon />}
              sx={{ mb: 2 }}
            >
              Download Backup Codes
            </Button>
            
            <Typography variant="body2" color="text.secondary">
              Each backup code can only be used once. When you've used a backup code to sign in, it will be invalidated.
              You can generate new backup codes at any time.
            </Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SecurityIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h5">
            Two-Factor Authentication Setup
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleComplete}
              >
                Finish
              </Button>
            ) : activeStep === 2 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleVerify}
                disabled={verificationCode.length !== 6 || loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify'}
              </Button>
            ) : activeStep === 0 ? null : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      
      <Dialog open={showBackupCodes} onClose={() => setShowBackupCodes(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Your Backup Codes</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Save these backup codes in a secure place. You can use them to sign in if you lose access to your authentication device.
          </Alert>
          
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1
            }}>
              {backupCodes.map((code, index) => (
                <Typography 
                  key={index} 
                  variant="body1" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    letterSpacing: 1
                  }}
                >
                  {code}
                </Typography>
              ))}
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBackupCodes(false)}>Close</Button>
          <Button 
            variant="outlined" 
            onClick={handleDownloadBackupCodes}
            startIcon={<KeyIcon />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TwoFactorAuth;
