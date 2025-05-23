import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Medication as MedicationIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
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

const AnalyticsDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(1, 'month'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDateRangeChange = (event: any) => {
    const value = event.target.value;
    setDateRange(value);
    
    // Update date range based on selection
    const now = dayjs();
    switch (value) {
      case 'day':
        setStartDate(now.subtract(1, 'day'));
        break;
      case 'week':
        setStartDate(now.subtract(1, 'week'));
        break;
      case 'month':
        setStartDate(now.subtract(1, 'month'));
        break;
      case 'quarter':
        setStartDate(now.subtract(3, 'month'));
        break;
      case 'year':
        setStartDate(now.subtract(1, 'year'));
        break;
      case 'custom':
        // Keep current dates
        break;
    }
    
    setEndDate(now);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    // In a real app, this would trigger an export
    console.log(`Exporting in ${format} format`);
  };

  // Sample data for charts
  const visitTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Completed Visits',
        data: [250, 280, 300, 320, 350, 380, 400, 410, 390, 420, 450, 480],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Scheduled Visits',
        data: [270, 300, 320, 340, 370, 400, 420, 430, 410, 440, 470, 500],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
        borderDash: [5, 5],
      },
    ],
  };

  const visitTypeData = {
    labels: ['Personal Care', 'Medication', 'Mobility Support', 'Meal Preparation', 'Social Support', 'Health Check'],
    datasets: [
      {
        label: 'Number of Visits',
        data: [120, 80, 60, 45, 30, 25],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const caregiverPerformanceData = {
    labels: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'Robert Wilson'],
    datasets: [
      {
        label: 'On-Time Rate (%)',
        data: [95, 92, 88, 97, 90],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Completion Rate (%)',
        data: [98, 95, 92, 99, 94],
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const serviceUserStatusData = {
    labels: ['Active', 'Inactive', 'On Hold', 'Pending'],
    datasets: [
      {
        data: [65, 10, 15, 10],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(54, 162, 235, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const medicationComplianceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Medication Compliance (%)',
        data: [88, 90, 89, 92, 94, 95, 96, 97, 96, 98, 97, 99],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const incidentTypeData = {
    labels: ['Medication Error', 'Fall', 'Missed Visit', 'Documentation Issue', 'Communication Failure', 'Other'],
    datasets: [
      {
        label: 'Number of Incidents',
        data: [12, 19, 8, 15, 7, 5],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Key metrics
  const keyMetrics = [
    { 
      title: 'Total Visits', 
      value: 1,250, 
      change: 5.2, 
      trend: 'up',
      icon: <EventIcon />
    },
    { 
      title: 'Active Service Users', 
      value: 65, 
      change: 2.1, 
      trend: 'up',
      icon: <PersonIcon />
    },
    { 
      title: 'Medication Compliance', 
      value: '98%', 
      change: 1.5, 
      trend: 'up',
      icon: <MedicationIcon />
    },
    { 
      title: 'On-Time Rate', 
      value: '94%', 
      change: -0.8, 
      trend: 'down',
      icon: <AccessTimeIcon />
    },
  ];

  // Recent incidents
  const recentIncidents = [
    {
      id: 1,
      type: 'Medication Error',
      description: 'Incorrect medication dosage administered',
      date: '2023-05-10T10:30:00',
      severity: 'high',
      status: 'open'
    },
    {
      id: 2,
      type: 'Missed Visit',
      description: 'Caregiver did not arrive for scheduled visit',
      date: '2023-05-09T15:45:00',
      severity: 'medium',
      status: 'investigating'
    },
    {
      id: 3,
      type: 'Fall',
      description: 'Service user fell in bathroom',
      date: '2023-05-08T09:15:00',
      severity: 'medium',
      status: 'resolved'
    },
    {
      id: 4,
      type: 'Documentation Issue',
      description: 'Incomplete care notes for visit',
      date: '2023-05-07T14:20:00',
      severity: 'low',
      status: 'resolved'
    }
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <ErrorIcon color="error" />;
      case 'medium':
        return <WarningIcon color="warning" />;
      case 'low':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'investigating':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Analytics Dashboard</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export as PDF">
            <IconButton onClick={() => handleExport('pdf')}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Print">
            <IconButton>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Share">
            <IconButton>
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                label="Date Range"
                onChange={handleDateRangeChange}
              >
                <MenuItem value="day">Last 24 Hours</MenuItem>
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
                <MenuItem value="quarter">Last 3 Months</MenuItem>
                <MenuItem value="year">Last 12 Months</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {dateRange === 'custom' && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </LocalizationProvider>
          )}
          
          <Grid item xs={12} md={dateRange === 'custom' ? 3 : 9} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
            >
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {keyMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {metric.title}
                    </Typography>
                    <Typography variant="h4" sx={{ my: 1 }}>
                      {metric.value}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {metric.trend === 'up' ? (
                        <TrendingUpIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                      ) : (
                        <TrendingDownIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                      )}
                      <Typography 
                        variant="body2" 
                        color={metric.trend === 'up' ? 'success.main' : 'error.main'}
                      >
                        {metric.change}% {metric.trend === 'up' ? 'increase' : 'decrease'}
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.light', p: 1 }}>
                    {metric.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
          <Tab icon={<DashboardIcon />} iconPosition="start" label="Overview" />
          <Tab icon={<EventIcon />} iconPosition="start" label="Visits" />
          <Tab icon={<PersonIcon />} iconPosition="start" label="Service Users" />
          <Tab icon={<MedicationIcon />} iconPosition="start" label="Medications" />
          <Tab icon={<WarningIcon />} iconPosition="start" label="Incidents" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader 
                title="Visit Trends" 
                action={
                  <Tooltip title="View detailed report">
                    <IconButton>
                      <BarChartIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Line 
                    data={visitTrendData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardHeader 
                title="Service User Status" 
                action={
                  <Tooltip title="View detailed report">
                    <IconButton>
                      <PieChartIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Doughnut 
                    data={serviceUserStatusData} 
                    options={{ 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Visit Types" 
                action={
                  <Tooltip title="View detailed report">
                    <IconButton>
                      <BarChartIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Bar 
                    data={visitTypeData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Recent Incidents" 
                action={
                  <Button size="small">View All</Button>
                }
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                <List>
                  {recentIncidents.map((incident) => (
                    <React.Fragment key={incident.id}>
                      <ListItem>
                        <ListItemIcon>
                          {getSeverityIcon(incident.severity)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="subtitle2">
                                {incident.type}
                              </Typography>
                              <Chip 
                                label={incident.status} 
                                size="small" 
                                color={getStatusColor(incident.status) as any}
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {incident.description}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {formatDate(incident.date)}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Visit Trends" />
              <Divider />
              <CardContent>
                <Box sx={{ height: 400 }}>
                  <Line 
                    data={visitTrendData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Visit Types" />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Bar 
                    data={visitTypeData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Caregiver Performance" />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Bar 
                    data={caregiverPerformanceData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100
                        }
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Typography variant="body1">
          Service Users analytics content will be implemented in a future update.
        </Typography>
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Medication Compliance Trends" />
              <Divider />
              <CardContent>
                <Box sx={{ height: 400 }}>
                  <Line 
                    data={medicationComplianceData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: false,
                          min: 80,
                          max: 100
                        }
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Incident Types" />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Pie 
                    data={incidentTypeData} 
                    options={{ 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right'
                        }
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Recent Incidents" />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                <List>
                  {recentIncidents.map((incident) => (
                    <React.Fragment key={incident.id}>
                      <ListItem>
                        <ListItemIcon>
                          {getSeverityIcon(incident.severity)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="subtitle2">
                                {incident.type}
                              </Typography>
                              <Chip 
                                label={incident.status} 
                                size="small" 
                                color={getStatusColor(incident.status) as any}
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {incident.description}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {formatDate(incident.date)}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default AnalyticsDashboard;
