import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box,
  Button, Chip, Avatar, LinearProgress, Tabs, Tab,
  List, ListItem, ListItemText, ListItemIcon, Badge,
  Paper, Divider, IconButton, Switch, FormControlLabel,
  Alert, AlertTitle
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Mic as MicIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
  LocalHospital as LocalHospitalIcon
} from '@mui/icons-material';

const CareUnityPOC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Demo data
  const systemStats = {
    totalServiceUsers: 248,
    activeStaff: 89,
    todaysVisits: 156,
    completionRate: 94.2,
    cqcCompliance: 96.8,
    systemUptime: 99.9,
    careHours: 1284,
    emergencyAlerts: 2
  };

  const modules = [
    {
      id: 'care-coordinator',
      title: 'Care Coordinator Dashboard',
      description: 'AI-powered scheduling, allocation management, and operational command center',
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      features: ['Smart Allocation', 'Real-time Monitoring', 'CQC Compliance', 'Staff Management'],
      status: 'active'
    },
    {
      id: 'person-centered',
      title: 'Person-Centered Care Hub',
      description: 'Digital life stories, outcome tracking, and personalized care recommendations',
      icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      features: ['Life Stories', 'Goal Tracking', 'Family Portal', 'Care Preferences'],
      status: 'active'
    },
    {
      id: 'caregiver-companion',
      title: 'Caregiver Companion',
      description: 'Voice-enabled documentation, mobile interface, and wellness tracking',
      icon: <MicIcon sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      features: ['Voice Documentation', 'Biometric Auth', 'Offline Mode', 'Wellness Tracking'],
      status: 'active'
    },
    {
      id: 'ai-scheduling',
      title: 'AI Scheduling Engine',
      description: 'Predictive scheduling optimization with ML-powered insights',
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      features: ['Route Optimization', 'Preference Matching', 'Predictive Analytics', 'Auto-allocation'],
      status: 'active'
    },
    {
      id: 'insights-engine',
      title: 'Intelligent Insights Engine',
      description: 'Predictive health monitoring and pattern recognition',
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
      features: ['Health Predictions', 'NLP Analysis', 'Quality Monitoring', 'Outcome Measurement'],
      status: 'active'
    }
  ];

  const recentActivity = [
    { id: 1, type: 'allocation', message: 'AI allocation completed for 12 visits', time: '2 min ago', status: 'success' },
    { id: 2, type: 'voice', message: 'Voice documentation processed for Sarah M.', time: '5 min ago', status: 'info' },
    { id: 3, type: 'alert', message: 'Medication reminder sent to John D.', time: '8 min ago', status: 'warning' },
    { id: 4, type: 'compliance', message: 'CQC compliance check completed', time: '15 min ago', status: 'success' }
  ];

  const serviceUsers = [
    { id: 1, name: 'Margaret Thompson', age: 78, condition: 'Dementia Care', riskLevel: 'Medium', nextVisit: '10:30 AM' },
    { id: 2, name: 'Robert Wilson', age: 65, condition: 'Post-Surgery Care', riskLevel: 'High', nextVisit: '2:15 PM' },
    { id: 3, name: 'Eleanor Davis', age: 82, condition: 'Diabetes Management', riskLevel: 'Low', nextVisit: '4:00 PM' }
  ];

  const staffMembers = [
    { id: 1, name: 'Sarah Johnson', role: 'Senior Carer', status: 'On Duty', visits: 6, location: 'North District' },
    { id: 2, name: 'Michael Brown', role: 'Care Assistant', status: 'Available', visits: 4, location: 'Central District' },
    { id: 3, name: 'Emma Wilson', role: 'Nurse', status: 'In Transit', visits: 5, location: 'South District' }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      setTimeout(() => {
        alert('🎤 Voice commands activated! Try saying "Show today\'s schedule" or "Display service users"');
      }, 500);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return '#d32f2f';
      case 'Medium': return '#f57c00';
      case 'Low': return '#388e3c';
      default: return '#757575';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Duty': return '#388e3c';
      case 'Available': return '#1976d2';
      case 'In Transit': return '#f57c00';
      default: return '#757575';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              🏥 CareUnity Network
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Next Generation Care Management System
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
              {currentTime.toLocaleString()} • System Status: Operational
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Badge badgeContent={notifications} color="error">
                <IconButton color="inherit">
                  <NotificationsIcon />
                </IconButton>
              </Badge>
              <FormControlLabel
                control={
                  <Switch
                    checked={voiceEnabled}
                    onChange={toggleVoice}
                    color="default"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MicIcon />
                    Voice {voiceEnabled ? 'ON' : 'OFF'}
                  </Box>
                }
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Emergency Alerts */}
      {systemStats.emergencyAlerts > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Emergency Alerts</AlertTitle>
          {systemStats.emergencyAlerts} urgent care situations require immediate attention.
          <Button color="inherit" size="small" sx={{ ml: 2 }}>
            View Details
          </Button>
        </Alert>
      )}

      {/* System Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {systemStats.totalServiceUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Service Users
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {systemStats.activeStaff}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active Staff
                  </Typography>
                </Box>
                <GroupIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {systemStats.todaysVisits}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Today's Visits
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {systemStats.completionRate}% completed
                  </Typography>
                </Box>
                <AccessTimeIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#333' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {systemStats.cqcCompliance}%
                  </Typography>
                  <Typography variant="body2">
                    CQC Compliance
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={systemStats.cqcCompliance}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Box>
                <SecurityIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper elevation={2} sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="System Overview" icon={<DashboardIcon />} />
          <Tab label="Core Modules" icon={<LocalHospitalIcon />} />
          <Tab label="Service Users" icon={<PeopleIcon />} />
          <Tab label="Staff Management" icon={<GroupIcon />} />
          <Tab label="Recent Activity" icon={<TrendingUpIcon />} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Tab 0: System Overview */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      System Health Metrics
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        System Uptime
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={systemStats.systemUptime}
                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                      />
                      <Typography variant="caption">{systemStats.systemUptime}%</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Visit Completion Rate
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={systemStats.completionRate}
                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                        color="success"
                      />
                      <Typography variant="caption">{systemStats.completionRate}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Care Hours This Month
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {systemStats.careHours}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Key Performance Indicators
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="CQC Compliance"
                          secondary={`${systemStats.cqcCompliance}% - Excellent`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <TrendingUpIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Service Quality Score"
                          secondary="4.8/5.0 - Outstanding"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <SecurityIcon color="info" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Data Security"
                          secondary="ISO 27001 Compliant"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Core Modules */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              {modules.map((module) => (
                <Grid item xs={12} md={6} lg={4} key={module.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => alert(`🚀 Launching ${module.title}...\n\nThis would open the full module interface with all features.`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ color: module.color, mr: 2 }}>
                          {module.icon}
                        </Box>
                        <Typography variant="h6" component="div">
                          {module.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {module.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {module.features.map((feature, index) => (
                          <Chip
                            key={index}
                            label={feature}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: module.color, color: module.color }}
                          />
                        ))}
                      </Box>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2, backgroundColor: module.color }}
                        startIcon={<DashboardIcon />}
                      >
                        Launch Module
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Tab 2: Service Users */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              {serviceUsers.map((user) => (
                <Grid item xs={12} md={6} lg={4} key={user.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ mr: 2, bgcolor: getRiskColor(user.riskLevel) }}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{user.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Age {user.age} • {user.condition}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={`${user.riskLevel} Risk`}
                          size="small"
                          sx={{
                            backgroundColor: getRiskColor(user.riskLevel),
                            color: 'white'
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          Next visit: {user.nextVisit}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 2 }}
                        startIcon={<AssignmentIcon />}
                      >
                        View Care Plan
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Tab 3: Staff Management */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              {staffMembers.map((staff) => (
                <Grid item xs={12} md={6} lg={4} key={staff.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ mr: 2, bgcolor: getStatusColor(staff.status) }}>
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{staff.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {staff.role}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={staff.status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(staff.status),
                            color: 'white'
                          }}
                        />
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          📍 {staff.location}
                        </Typography>
                        <Typography variant="body2">
                          📋 {staff.visits} visits today
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 2 }}
                        startIcon={<ScheduleIcon />}
                      >
                        View Schedule
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Tab 4: Recent Activity */}
          {activeTab === 4 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent System Activity
                </Typography>
                <List>
                  {recentActivity.map((activity) => (
                    <ListItem key={activity.id}>
                      <ListItemIcon>
                        {activity.status === 'success' && <CheckCircleIcon color="success" />}
                        {activity.status === 'warning' && <WarningIcon color="warning" />}
                        {activity.status === 'info' && <NotificationsIcon color="info" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.message}
                        secondary={activity.time}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      </Paper>

      {/* Feature Highlights */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          🚀 CareUnity Key Features
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <MicIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6">Voice-First Interface</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Hands-free documentation and navigation
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <AnalyticsIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6">AI-Powered Insights</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Predictive analytics and smart recommendations
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <SecurityIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6">Enterprise Security</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                GDPR compliant with end-to-end encryption
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <LocalHospitalIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6">Person-Centered Care</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Individualized care plans and family engagement
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Footer */}
      <Paper elevation={1} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          CareUnity Network - Comprehensive Proof of Concept
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enhancing human care through intelligent technology • Voice-First • Person-Centered • Predictive • Comprehensive
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" color="primary" startIcon={<DashboardIcon />}>
            Launch Full System
          </Button>
          <Button variant="outlined" startIcon={<PhoneIcon />}>
            Contact Sales
          </Button>
          <Button variant="outlined" startIcon={<EmailIcon />}>
            Request Demo
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CareUnityPOC;