import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Tabs, 
  Tab, 
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Chip,
  Rating,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Assignment as AssignmentIcon,
  Feedback as FeedbackIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Bar, Radar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
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
      id={`quality-tabpanel-${index}`}
      aria-labelledby={`quality-tab-${index}`}
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

const QualityImprovement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeframe, setTimeframe] = useState('month');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeframeChange = (event: any) => {
    setTimeframe(event.target.value);
  };

  // Sample data for charts
  const qualityMetricsData = {
    labels: ['Care Delivery', 'Documentation', 'Medication Management', 'Client Satisfaction', 'Staff Performance', 'Safety Measures'],
    datasets: [
      {
        label: 'Current Period',
        data: [85, 78, 92, 88, 82, 90],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
      },
      {
        label: 'Previous Period',
        data: [80, 75, 88, 85, 80, 85],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
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

  const satisfactionTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Client Satisfaction Score',
        data: [4.2, 4.3, 4.1, 4.4, 4.5, 4.6, 4.7, 4.8, 4.7, 4.8, 4.9, 4.8],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Staff Satisfaction Score',
        data: [3.8, 3.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.4, 4.5, 4.6, 4.5],
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        tension: 0.1,
      },
    ],
  };

  // Sample data for quality improvement initiatives
  const initiatives = [
    {
      id: 1,
      title: 'Medication Management Enhancement',
      status: 'In Progress',
      progress: 65,
      owner: 'Sarah Johnson',
      startDate: '2023-03-15',
      targetDate: '2023-06-30',
      description: 'Implementing improved medication management protocols and training to reduce medication errors by 50%.'
    },
    {
      id: 2,
      title: 'Fall Prevention Program',
      status: 'Completed',
      progress: 100,
      owner: 'Michael Brown',
      startDate: '2023-01-10',
      targetDate: '2023-04-10',
      description: 'Comprehensive fall risk assessment and prevention strategies to reduce falls by 30%.'
    },
    {
      id: 3,
      title: 'Documentation Quality Improvement',
      status: 'In Progress',
      progress: 40,
      owner: 'Emily Davis',
      startDate: '2023-04-01',
      targetDate: '2023-07-31',
      description: 'Standardizing documentation processes and implementing quality checks to improve accuracy and completeness.'
    },
    {
      id: 4,
      title: 'Client Feedback System Enhancement',
      status: 'Planning',
      progress: 15,
      owner: 'Robert Wilson',
      startDate: '2023-05-15',
      targetDate: '2023-08-15',
      description: 'Developing a more comprehensive client feedback system to better capture satisfaction and improvement opportunities.'
    },
  ];

  // Sample data for audit findings
  const auditFindings = [
    {
      id: 1,
      area: 'Medication Management',
      finding: 'Medication administration records incomplete in 15% of cases',
      severity: 'Medium',
      date: '2023-04-15',
      status: 'Open',
      assignedTo: 'Sarah Johnson'
    },
    {
      id: 2,
      area: 'Care Planning',
      finding: 'Care plan reviews not completed within required timeframe for 8% of clients',
      severity: 'High',
      date: '2023-04-10',
      status: 'In Progress',
      assignedTo: 'Michael Brown'
    },
    {
      id: 3,
      area: 'Staff Training',
      finding: 'Manual handling refresher training overdue for 5 staff members',
      severity: 'Medium',
      date: '2023-04-05',
      status: 'Resolved',
      assignedTo: 'Emily Davis'
    },
    {
      id: 4,
      area: 'Documentation',
      finding: 'Visit notes lacking required detail in 12% of records reviewed',
      severity: 'Medium',
      date: '2023-04-01',
      status: 'Open',
      assignedTo: 'Robert Wilson'
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Planning': return 'warning';
      case 'Open': return 'error';
      case 'Resolved': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Quality Improvement</Typography>
        <Box>
          <FormControl sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              label="Timeframe"
              onChange={handleTimeframeChange}
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
          >
            New Initiative
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="quality improvement tabs">
          <Tab label="Dashboard" icon={<BarChartIcon />} iconPosition="start" />
          <Tab label="Initiatives" icon={<AssignmentIcon />} iconPosition="start" />
          <Tab label="Audit Findings" icon={<FeedbackIcon />} iconPosition="start" />
          <Tab label="Trends" icon={<TimelineIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Quality Metrics Overview" />
              <CardContent>
                <Box sx={{ height: 350 }}>
                  <Radar data={qualityMetricsData} options={{ maintainAspectRatio: false }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Incident Types" />
              <CardContent>
                <Box sx={{ height: 350 }}>
                  <Bar 
                    data={incidentTypeData} 
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
            <Card>
              <CardHeader title="Key Performance Indicators" />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Medication Compliance" 
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={92} 
                            sx={{ flexGrow: 1, mr: 1, height: 8, borderRadius: 4 }} 
                          />
                          <Typography variant="body2">92%</Typography>
                        </Box>
                      } 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Visit Completion Rate" 
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={95} 
                            sx={{ flexGrow: 1, mr: 1, height: 8, borderRadius: 4 }} 
                          />
                          <Typography variant="body2">95%</Typography>
                        </Box>
                      } 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <TrendingDownIcon color="error" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Documentation Compliance" 
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={78} 
                            sx={{ flexGrow: 1, mr: 1, height: 8, borderRadius: 4 }} 
                          />
                          <Typography variant="body2">78%</Typography>
                        </Box>
                      } 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Client Satisfaction" 
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Rating value={4.8} precision={0.1} readOnly size="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">4.8/5</Typography>
                        </Box>
                      } 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Recent Audit Findings" />
              <CardContent>
                <List>
                  {auditFindings.slice(0, 3).map((finding) => (
                    <React.Fragment key={finding.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          {finding.severity === 'High' ? (
                            <ErrorIcon color="error" />
                          ) : finding.severity === 'Medium' ? (
                            <WarningIcon color="warning" />
                          ) : (
                            <CheckCircleIcon color="info" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1">{finding.area}</Typography>
                              <Chip 
                                label={finding.status} 
                                size="small" 
                                color={getStatusColor(finding.status) as any}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.primary">
                                {finding.finding}
                              </Typography>
                              <Typography variant="caption">
                                {finding.date} | Assigned to: {finding.assignedTo}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button onClick={() => setTabValue(2)}>View All Findings</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Quality Improvement Initiatives</Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            New Initiative
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {initiatives.map((initiative) => (
            <Grid item xs={12} md={6} key={initiative.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6">{initiative.title}</Typography>
                    <Chip 
                      label={initiative.status} 
                      size="small" 
                      color={getStatusColor(initiative.status) as any}
                    />
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {initiative.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Progress: {initiative.progress}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={initiative.progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                      color={initiative.progress === 100 ? "success" : "primary"}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Owner:</strong> {initiative.owner}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      <strong>Start:</strong> {initiative.startDate}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Target:</strong> {initiative.targetDate}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Audit Findings</Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            New Finding
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {auditFindings.map((finding) => (
            <Grid item xs={12} md={6} key={finding.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6">{finding.area}</Typography>
                    <Box>
                      <Chip 
                        label={finding.severity} 
                        size="small" 
                        color={getSeverityColor(finding.severity) as any}
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={finding.status} 
                        size="small" 
                        color={getStatusColor(finding.status) as any}
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {finding.finding}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      <strong>Date:</strong> {finding.date}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Assigned to:</strong> {finding.assignedTo}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Satisfaction Trends" />
              <CardContent>
                <Box sx={{ height: 400 }}>
                  <Line 
                    data={satisfactionTrendData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: false,
                          min: 3.5,
                          max: 5,
                          title: {
                            display: true,
                            text: 'Satisfaction Score (out of 5)'
                          }
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
    </Box>
  );
};

export default QualityImprovement;
