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
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import { 
  DatePicker, 
  LocalizationProvider 
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { 
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
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

const Reports: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [reportType, setReportType] = useState('visits');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleReportTypeChange = (event: any) => {
    setReportType(event.target.value);
  };

  // Sample data for charts
  const visitStatusData = {
    labels: ['Completed', 'Scheduled', 'Cancelled', 'Missed'],
    datasets: [
      {
        data: [65, 20, 10, 5],
        backgroundColor: ['#4caf50', '#2196f3', '#f44336', '#ff9800'],
        borderWidth: 1,
      },
    ],
  };

  const visitTypeData = {
    labels: ['Personal Care', 'Medication', 'Mobility Support', 'Meal Preparation', 'Social Support', 'Health Check'],
    datasets: [
      {
        label: 'Number of Visits',
        data: [120, 80, 60, 45, 30, 25],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
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

  const visitTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Number of Visits',
        data: [250, 280, 300, 320, 350, 380, 400, 410, 390, 420, 450, 480],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  };

  // Sample data for tables
  const topServiceUsers = [
    { id: 1, name: 'Alice Johnson', visits: 45, hours: 67.5 },
    { id: 2, name: 'Bob Smith', visits: 38, hours: 57.0 },
    { id: 3, name: 'Carol Williams', visits: 32, hours: 48.0 },
    { id: 4, name: 'David Brown', visits: 30, hours: 45.0 },
    { id: 5, name: 'Eve Davis', visits: 28, hours: 42.0 },
  ];

  const missedVisits = [
    { id: 1, date: '2023-05-01', serviceUser: 'Frank Miller', caregiver: 'Sarah Johnson', reason: 'Caregiver illness' },
    { id: 2, date: '2023-05-03', serviceUser: 'Grace Taylor', caregiver: 'Michael Brown', reason: 'Service user unavailable' },
    { id: 3, date: '2023-05-07', serviceUser: 'Henry Wilson', caregiver: 'John Smith', reason: 'Transportation issue' },
    { id: 4, date: '2023-05-12', serviceUser: 'Irene Clark', caregiver: 'Emily Davis', reason: 'Weather conditions' },
    { id: 5, date: '2023-05-18', serviceUser: 'Jack Moore', caregiver: 'Robert Wilson', reason: 'Family emergency' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Reports & Analytics</Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            sx={{ mr: 1 }}
          >
            Print
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<ShareIcon />}
          >
            Share
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label="Report Type"
              onChange={handleReportTypeChange}
            >
              <MenuItem value="visits">Visit Analysis</MenuItem>
              <MenuItem value="caregivers">Caregiver Performance</MenuItem>
              <MenuItem value="serviceUsers">Service User Analysis</MenuItem>
              <MenuItem value="financial">Financial Reports</MenuItem>
              <MenuItem value="quality">Quality Metrics</MenuItem>
            </Select>
          </FormControl>
          
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{ textField: { sx: { minWidth: 150 } } }}
            />
            
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{ textField: { sx: { minWidth: 150 } } }}
            />
          </LocalizationProvider>
          
          <Button variant="contained">Generate Report</Button>
        </Box>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
          <Tab label="Dashboard" />
          <Tab label="Charts" />
          <Tab label="Tables" />
          <Tab label="Trends" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Visit Status Distribution" />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Pie data={visitStatusData} options={{ maintainAspectRatio: false }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Visit Types" />
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
          
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Visit Trends (Last 12 Months)" />
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
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Caregiver Performance Metrics" />
              <CardContent>
                <Box sx={{ height: 400 }}>
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
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Top Service Users by Visit Count" />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Service User</TableCell>
                        <TableCell align="right">Visits</TableCell>
                        <TableCell align="right">Hours</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topServiceUsers.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell component="th" scope="row">
                            {row.name}
                          </TableCell>
                          <TableCell align="right">{row.visits}</TableCell>
                          <TableCell align="right">{row.hours}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Recent Missed Visits" />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Service User</TableCell>
                        <TableCell>Caregiver</TableCell>
                        <TableCell>Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {missedVisits.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.serviceUser}</TableCell>
                          <TableCell>{row.caregiver}</TableCell>
                          <TableCell>{row.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Visit Trends Over Time" />
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
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default Reports;
