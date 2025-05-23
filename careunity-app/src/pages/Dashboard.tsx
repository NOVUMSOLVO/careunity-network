import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider, 
  Button,
  CircularProgress
} from '@mui/material';
import { 
  People as PeopleIcon, 
  EventNote as EventNoteIcon, 
  Assignment as AssignmentIcon, 
  Notifications as NotificationsIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { format } from 'date-fns';
import { useAuth } from '../contexts/auth-context';
import { appointmentsApi, serviceUsersApi } from '../services/api';
import { Appointment, ServiceUser } from '../types';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [stats, setStats] = useState({
    totalServiceUsers: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingCarePlans: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch today's appointments
        const today = format(new Date(), 'yyyy-MM-dd');
        let appointments: Appointment[] = [];
        
        if (user?.role === 'caregiver') {
          appointments = await appointmentsApi.getByCaregiver(user.id);
        } else {
          appointments = await appointmentsApi.getAll();
        }
        
        const todayAppts = appointments.filter(appt => appt.date === today);
        setTodayAppointments(todayAppts);
        
        // Fetch service users
        const users = await serviceUsersApi.getAll();
        setServiceUsers(users);
        
        // Calculate stats
        setStats({
          totalServiceUsers: users.length,
          totalAppointments: appointments.length,
          completedAppointments: appointments.filter(appt => appt.status === 'completed').length,
          pendingCarePlans: 5 // This would come from a real API call in a production app
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  // Chart data for appointment status
  const appointmentStatusData = {
    labels: ['Completed', 'Scheduled', 'Cancelled'],
    datasets: [
      {
        data: [stats.completedAppointments, stats.totalAppointments - stats.completedAppointments, 2],
        backgroundColor: ['#4caf50', '#2196f3', '#f44336'],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for service user care needs
  const careNeedsData = {
    labels: ['Personal Care', 'Medication', 'Mobility', 'Nutrition', 'Social'],
    datasets: [
      {
        label: 'Number of Service Users',
        data: [18, 12, 15, 10, 8],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Service Users
            </Typography>
            <Typography component="p" variant="h4">
              {stats.totalServiceUsers}
            </Typography>
            <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
              <PeopleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Active service users
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Today's Visits
            </Typography>
            <Typography component="p" variant="h4">
              {todayAppointments.length}
            </Typography>
            <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
              <EventNoteIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Scheduled for today
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Completed Visits
            </Typography>
            <Typography component="p" variant="h4">
              {stats.completedAppointments}
            </Typography>
            <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Total completed visits
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Pending Reviews
            </Typography>
            <Typography component="p" variant="h4">
              {stats.pendingCarePlans}
            </Typography>
            <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Care plans needing review
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Today's Appointments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Today's Appointments" />
            <Divider />
            <CardContent sx={{ maxHeight: 400, overflow: 'auto' }}>
              {todayAppointments.length > 0 ? (
                <List>
                  {todayAppointments.map((appointment) => (
                    <React.Fragment key={appointment.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            <AccessTimeIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={appointment.title}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {appointment.startTime} - {appointment.endTime}
                              </Typography>
                              {` — ${appointment.visitType}`}
                            </>
                          }
                        />
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => navigate(`/appointments/${appointment.id}`)}
                        >
                          View
                        </Button>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" align="center" sx={{ py: 4 }}>
                  No appointments scheduled for today.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Appointment Status" />
                <CardContent>
                  <Box sx={{ height: 200 }}>
                    <Pie data={appointmentStatusData} options={{ maintainAspectRatio: false }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Service User Care Needs" />
                <CardContent>
                  <Box sx={{ height: 200 }}>
                    <Bar 
                      data={careNeedsData} 
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
