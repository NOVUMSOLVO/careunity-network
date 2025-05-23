import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/auth-context';
import { usersApi } from '../services/api';
import { User, UserRole } from '../types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Form validation schema for profile
const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  role: z.string(),
});

// Form validation schema for password change
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const UserProfile: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const { control: profileControl, handleSubmit: handleProfileSubmit, reset: resetProfile, formState: { errors: profileErrors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      role: user?.role || '',
    },
  });

  const { control: passwordControl, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        role: user.role,
      });
    }
  }, [user, resetProfile]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit mode and reset form
      resetProfile({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        role: user?.role || '',
      });
    }
    setEditMode(!editMode);
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await usersApi.update(user.id, data);
      setEditMode(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      setLoading(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!user) return;
    
    try {
      setLoading(true);
      // In a real app, you would call an API to change the password
      // For demo purposes, we'll just simulate a successful password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      resetPassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setSnackbar({
        open: true,
        message: 'Password changed successfully',
        severity: 'success'
      });
      setLoading(false);
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbar({
        open: true,
        message: 'Failed to change password',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTogglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  if (authLoading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={user.profileImage}
            alt={user.fullName}
            sx={{ width: 100, height: 100, mr: 3 }}
          >
            {user.fullName.charAt(0)}
          </Avatar>
          
          <Box>
            <Typography variant="h5">{user.fullName}</Typography>
            <Typography variant="body1" color="text.secondary">{user.email}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Role: <strong>{user.role}</strong>
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
          <Tab icon={<PersonIcon />} iconPosition="start" label="Personal Information" />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Security" />
          <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notifications" />
          <Tab icon={<SettingsIcon />} iconPosition="start" label="Preferences" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant={editMode ? "outlined" : "contained"}
            startIcon={editMode ? <CancelIcon /> : <EditIcon />}
            onClick={handleEditToggle}
            sx={{ mr: 1 }}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
          
          {editMode && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleProfileSubmit(onProfileSubmit)}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          )}
        </Box>
        
        <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="fullName"
                control={profileControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    fullWidth
                    disabled={!editMode}
                    error={!!profileErrors.fullName}
                    helperText={profileErrors.fullName?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={profileControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    disabled={!editMode}
                    error={!!profileErrors.email}
                    helperText={profileErrors.email?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="phoneNumber"
                control={profileControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    disabled={!editMode}
                    error={!!profileErrors.phoneNumber}
                    helperText={profileErrors.phoneNumber?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="role"
                control={profileControl}
                render={({ field }) => (
                  <FormControl fullWidth disabled>
                    <InputLabel>Role</InputLabel>
                    <Select
                      {...field}
                      label="Role"
                    >
                      <MenuItem value={UserRole.ADMIN}>Administrator</MenuItem>
                      <MenuItem value={UserRole.MANAGER}>Manager</MenuItem>
                      <MenuItem value={UserRole.CAREGIVER}>Caregiver</MenuItem>
                      <MenuItem value={UserRole.SERVICE_USER}>Service User</MenuItem>
                      <MenuItem value={UserRole.FAMILY}>Family Member</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </form>
        
        <Divider sx={{ my: 4 }} />
        
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">Username</Typography>
                <Typography variant="body1">{user.username}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">Account Created</Typography>
                <Typography variant="body1">January 15, 2023</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">Last Login</Typography>
                <Typography variant="body1">Today at 9:30 AM</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">Two-Factor Authentication</Typography>
                <Typography variant="body1" color="error">Not Enabled</Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={() => setTabValue(1)}
                >
                  Enable
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="currentPassword"
                control={passwordControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Current Password"
                    fullWidth
                    type={showPassword.current ? 'text' : 'password'}
                    error={!!passwordErrors.currentPassword}
                    helperText={passwordErrors.currentPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleTogglePasswordVisibility('current')}
                            edge="end"
                          >
                            {showPassword.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              {/* Spacer */}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="newPassword"
                control={passwordControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="New Password"
                    fullWidth
                    type={showPassword.new ? 'text' : 'password'}
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleTogglePasswordVisibility('new')}
                            edge="end"
                          >
                            {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="confirmPassword"
                control={passwordControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Confirm New Password"
                    fullWidth
                    type={showPassword.confirm ? 'text' : 'password'}
                    error={!!passwordErrors.confirmPassword}
                    helperText={passwordErrors.confirmPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleTogglePasswordVisibility('confirm')}
                            edge="end"
                          >
                            {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Change Password'}
              </Button>
            </Grid>
          </Grid>
        </form>
        
        <Divider sx={{ my: 4 }} />
        
        <Typography variant="h6" gutterBottom>
          Two-Factor Authentication
        </Typography>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <SecurityIcon sx={{ mr: 2, color: 'error.main' }} />
              <Box>
                <Typography variant="subtitle1">Two-Factor Authentication is not enabled</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add an extra layer of security to your account by enabling two-factor authentication.
                  When enabled, you'll be required to enter a verification code in addition to your password when signing in.
                </Typography>
                <Button variant="contained" color="primary">
                  Enable Two-Factor Authentication
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Typography variant="h6" gutterBottom>
          Login Sessions
        </Typography>
        
        <Card>
          <CardContent>
            <Typography variant="subtitle1">Current Session</Typography>
            <Typography variant="body2" color="text.secondary">
              Device: Chrome on Windows
            </Typography>
            <Typography variant="body2" color="text.secondary">
              IP Address: 192.168.1.1
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Started: Today at 9:30 AM
            </Typography>
            <Button variant="outlined" color="error" size="small" sx={{ mt: 1 }}>
              Log Out
            </Button>
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Notification Settings
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Configure how you receive notifications from the CareUnity system.
        </Alert>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Email Notifications
            </Typography>
            
            {/* Email notification settings would go here */}
            <Typography variant="body2" color="text.secondary">
              Email notification settings will be implemented in a future update.
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              In-App Notifications
            </Typography>
            
            {/* In-app notification settings would go here */}
            <Typography variant="body2" color="text.secondary">
              In-app notification settings will be implemented in a future update.
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              SMS Notifications
            </Typography>
            
            {/* SMS notification settings would go here */}
            <Typography variant="body2" color="text.secondary">
              SMS notification settings will be implemented in a future update.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Application Preferences
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Customize your experience with CareUnity.
        </Alert>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Theme Settings
            </Typography>
            
            {/* Theme settings would go here */}
            <Typography variant="body2" color="text.secondary">
              Theme settings will be implemented in a future update.
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Language Preferences
            </Typography>
            
            {/* Language preferences would go here */}
            <Typography variant="body2" color="text.secondary">
              Language preferences will be implemented in a future update.
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Dashboard Customization
            </Typography>
            
            {/* Dashboard customization settings would go here */}
            <Typography variant="body2" color="text.secondary">
              Dashboard customization settings will be implemented in a future update.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;
