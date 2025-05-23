import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Security as SecurityIcon,
  Password as PasswordIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PhoneAndroid as PhoneIcon,
  Email as EmailIcon,
  Key as KeyIcon,
  History as HistoryIcon,
  Devices as DevicesIcon,
  Notifications as NotificationsIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Delete as DeleteIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/auth-context';
import TwoFactorAuth from '../components/security/TwoFactorAuth';

const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPasswordValues, setShowPasswordValues] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordValues, setPasswordValues] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [passwordChangeNotifications, setPasswordChangeNotifications] = useState(true);
  const [showSessionsDialog, setShowSessionsDialog] = useState(false);
  const [showDevicesDialog, setShowDevicesDialog] = useState(false);

  // Mock active sessions
  const activeSessions = [
    {
      id: 1,
      device: 'Chrome on Windows',
      ip: '192.168.1.1',
      location: 'New York, USA',
      lastActive: '2023-05-10T10:30:00',
      current: true
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      ip: '192.168.1.2',
      location: 'New York, USA',
      lastActive: '2023-05-09T15:45:00',
      current: false
    },
    {
      id: 3,
      device: 'Firefox on MacOS',
      ip: '192.168.1.3',
      location: 'Boston, USA',
      lastActive: '2023-05-08T09:15:00',
      current: false
    }
  ];

  // Mock trusted devices
  const trustedDevices = [
    {
      id: 1,
      name: 'Windows Laptop',
      lastUsed: '2023-05-10T10:30:00',
      browser: 'Chrome',
      os: 'Windows 11',
      trusted: true
    },
    {
      id: 2,
      name: 'iPhone 13',
      lastUsed: '2023-05-09T15:45:00',
      browser: 'Safari',
      os: 'iOS 16',
      trusted: true
    },
    {
      id: 3,
      name: 'MacBook Pro',
      lastUsed: '2023-05-08T09:15:00',
      browser: 'Firefox',
      os: 'MacOS Ventura',
      trusted: true
    }
  ];

  const handleToggleTwoFactor = () => {
    if (!twoFactorEnabled) {
      setShowTwoFactorSetup(true);
    } else {
      // In a real app, this would call an API to disable 2FA
      setTwoFactorEnabled(false);
    }
  };

  const handleTwoFactorSetupComplete = () => {
    setShowTwoFactorSetup(false);
    setTwoFactorEnabled(true);
  };

  const handleTogglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswordValues({
      ...showPasswordValues,
      [field]: !showPasswordValues[field]
    });
  };

  const handlePasswordChange = (field: 'current' | 'new' | 'confirm') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordValues({
      ...passwordValues,
      [field]: event.target.value
    });
    
    // Clear error when user types
    if (passwordErrors[field]) {
      setPasswordErrors({
        ...passwordErrors,
        [field]: ''
      });
    }
  };

  const validatePassword = () => {
    const errors = {
      current: '',
      new: '',
      confirm: ''
    };
    
    if (!passwordValues.current) {
      errors.current = 'Current password is required';
    }
    
    if (!passwordValues.new) {
      errors.new = 'New password is required';
    } else if (passwordValues.new.length < 8) {
      errors.new = 'Password must be at least 8 characters';
    }
    
    if (!passwordValues.confirm) {
      errors.confirm = 'Please confirm your password';
    } else if (passwordValues.new !== passwordValues.confirm) {
      errors.confirm = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    
    return !errors.current && !errors.new && !errors.confirm;
  };

  const handleChangePassword = () => {
    if (validatePassword()) {
      // In a real app, this would call an API to change the password
      // For demo purposes, we'll just close the dialog
      setShowPasswordDialog(false);
      setPasswordValues({
        current: '',
        new: '',
        confirm: ''
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleSessionTimeout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 1 && value <= 120) {
      setSessionTimeout(value);
    }
  };

  const handleTerminateSession = (sessionId: number) => {
    // In a real app, this would call an API to terminate the session
    console.log('Terminating session:', sessionId);
  };

  const handleRemoveDevice = (deviceId: number) => {
    // In a real app, this would call an API to remove the trusted device
    console.log('Removing device:', deviceId);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Security Settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon color="primary" sx={{ fontSize: 28, mr: 2 }} />
              <Typography variant="h6">
                Account Security
              </Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <PasswordIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Password"
                  secondary="Last changed: 30 days ago"
                />
                <ListItemSecondaryAction>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => setShowPasswordDialog(true)}
                  >
                    Change
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemIcon>
                  <KeyIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Two-Factor Authentication"
                  secondary={twoFactorEnabled ? "Enabled" : "Disabled"}
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={twoFactorEnabled}
                    onChange={handleToggleTwoFactor}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Session Timeout"
                  secondary={`${sessionTimeout} minutes of inactivity`}
                />
                <ListItemSecondaryAction>
                  <TextField
                    type="number"
                    size="small"
                    value={sessionTimeout}
                    onChange={handleSessionTimeout}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">min</InputAdornment>,
                    }}
                    sx={{ width: 100 }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem button onClick={() => setShowSessionsDialog(true)}>
                <ListItemIcon>
                  <LockIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Active Sessions"
                  secondary={`${activeSessions.length} active sessions`}
                />
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem button onClick={() => setShowDevicesDialog(true)}>
                <ListItemIcon>
                  <DevicesIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Trusted Devices"
                  secondary={`${trustedDevices.length} trusted devices`}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon color="primary" sx={{ fontSize: 28, mr: 2 }} />
              <Typography variant="h6">
                Security Notifications
              </Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <LockOpenIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Login Notifications"
                  secondary="Receive notifications when someone logs into your account"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={loginNotifications}
                    onChange={() => setLoginNotifications(!loginNotifications)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemIcon>
                  <PasswordIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Password Change Notifications"
                  secondary="Receive notifications when your password is changed"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={passwordChangeNotifications}
                    onChange={() => setPasswordChangeNotifications(!passwordChangeNotifications)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon color="primary" sx={{ fontSize: 28, mr: 2 }} />
              <Typography variant="h6">
                Security Recommendations
              </Typography>
            </Box>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Enable two-factor authentication to add an extra layer of security to your account.
            </Alert>
            
            <Alert severity="warning">
              Your password was last changed more than 30 days ago. Consider updating it regularly for better security.
            </Alert>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Two-Factor Authentication Setup Dialog */}
      <Dialog 
        open={showTwoFactorSetup} 
        onClose={() => setShowTwoFactorSetup(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <TwoFactorAuth onComplete={handleTwoFactorSetupComplete} />
        </DialogContent>
      </Dialog>
      
      {/* Change Password Dialog */}
      <Dialog 
        open={showPasswordDialog} 
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Current Password"
              fullWidth
              type={showPasswordValues.current ? 'text' : 'password'}
              value={passwordValues.current}
              onChange={handlePasswordChange('current')}
              margin="normal"
              error={!!passwordErrors.current}
              helperText={passwordErrors.current}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleTogglePasswordVisibility('current')}
                      edge="end"
                    >
                      {showPasswordValues.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="New Password"
              fullWidth
              type={showPasswordValues.new ? 'text' : 'password'}
              value={passwordValues.new}
              onChange={handlePasswordChange('new')}
              margin="normal"
              error={!!passwordErrors.new}
              helperText={passwordErrors.new}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleTogglePasswordVisibility('new')}
                      edge="end"
                    >
                      {showPasswordValues.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="Confirm New Password"
              fullWidth
              type={showPasswordValues.confirm ? 'text' : 'password'}
              value={passwordValues.confirm}
              onChange={handlePasswordChange('confirm')}
              margin="normal"
              error={!!passwordErrors.confirm}
              helperText={passwordErrors.confirm}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleTogglePasswordVisibility('confirm')}
                      edge="end"
                    >
                      {showPasswordValues.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained">Change Password</Button>
        </DialogActions>
      </Dialog>
      
      {/* Active Sessions Dialog */}
      <Dialog 
        open={showSessionsDialog} 
        onClose={() => setShowSessionsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Active Sessions</DialogTitle>
        <DialogContent>
          <List>
            {activeSessions.map((session) => (
              <React.Fragment key={session.id}>
                <ListItem>
                  <ListItemIcon>
                    <DevicesIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {session.device}
                        {session.current && (
                          <Chip 
                            label="Current Session" 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 1 }} 
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          IP: {session.ip} • Location: {session.location}
                        </Typography>
                        <Typography variant="body2" component="div">
                          Last active: {formatDate(session.lastActive)}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    {!session.current && (
                      <Tooltip title="Terminate Session">
                        <IconButton 
                          edge="end" 
                          color="error"
                          onClick={() => handleTerminateSession(session.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSessionsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Trusted Devices Dialog */}
      <Dialog 
        open={showDevicesDialog} 
        onClose={() => setShowDevicesDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Trusted Devices</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            These are devices that you have marked as trusted. You won't need to verify your identity when logging in from these devices.
          </Typography>
          
          <List>
            {trustedDevices.map((device) => (
              <React.Fragment key={device.id}>
                <ListItem>
                  <ListItemIcon>
                    <DevicesIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={device.name}
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {device.browser} on {device.os}
                        </Typography>
                        <Typography variant="body2" component="div">
                          Last used: {formatDate(device.lastUsed)}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Remove Device">
                      <IconButton 
                        edge="end" 
                        color="error"
                        onClick={() => handleRemoveDevice(device.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDevicesDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings;
