import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Button,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Alert,
  TextField,
  IconButton
} from '@mui/material';
import {
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
  Note as NoteIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  InsertPhoto as PhotoIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/auth-context';
import { serviceUsersApi, appointmentsApi, carePlansApi } from '../services/api';
import { ServiceUser, Appointment, CarePlan, Note } from '../types';
import { format } from 'date-fns';

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
      id={`family-tabpanel-${index}`}
      aria-labelledby={`family-tab-${index}`}
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

const FamilyPortal: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [serviceUser, setServiceUser] = useState<ServiceUser | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // In a real application, you would fetch the service user associated with this family member
  // For demo purposes, we'll use a mock service user ID
  const serviceUserId = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch service user details
        const userData = await serviceUsersApi.getById(serviceUserId);
        setServiceUser(userData);
        
        // Fetch appointments
        const appointmentsData = await appointmentsApi.getByServiceUser(serviceUserId);
        setAppointments(appointmentsData);
        
        // Fetch care plans
        const carePlansData = await carePlansApi.getByServiceUser(serviceUserId);
        setCarePlans(carePlansData);
        
        // In a real app, you would fetch notes as well
        // For demo purposes, we'll use mock data
        setNotes([
          {
            id: 1,
            serviceUserId: serviceUserId,
            authorId: 2,
            title: 'Daily Visit Note',
            content: 'Alice had a good day today. She ate well and participated in all activities.',
            createdAt: '2023-05-01T10:30:00',
            category: 'Visit',
            isPrivate: false
          },
          {
            id: 2,
            serviceUserId: serviceUserId,
            authorId: 3,
            title: 'Medication Update',
            content: 'Medication schedule adjusted as per doctor\'s recommendation.',
            createdAt: '2023-05-02T14:15:00',
            category: 'Medication',
            isPrivate: false
          },
          {
            id: 3,
            serviceUserId: serviceUserId,
            authorId: 2,
            title: 'Weekly Progress',
            content: 'Alice is making good progress with her mobility exercises.',
            createdAt: '2023-05-05T11:00:00',
            category: 'Progress',
            isPrivate: false
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching family portal data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // In a real app, you would send the message to the backend
    console.log('Sending message:', newMessage);
    
    // Clear the input field
    setNewMessage('');
  };

  const getUpcomingAppointments = () => {
    const today = new Date();
    return appointments
      .filter(appointment => new Date(appointment.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const getRecentNotes = () => {
    return notes
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const formatAppointmentTime = (appointment: Appointment) => {
    return `${appointment.startTime} - ${appointment.endTime}`;
  };

  const formatNoteDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  if (loading || !serviceUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Family Portal
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={serviceUser.profileImage}
            alt={serviceUser.fullName}
            sx={{ width: 100, height: 100, mr: 3 }}
          >
            {serviceUser.fullName.charAt(0)}
          </Avatar>
          
          <Box>
            <Typography variant="h5">{serviceUser.fullName}</Typography>
            <Typography variant="body1" color="text.secondary">
              Date of Birth: {serviceUser.dateOfBirth}
            </Typography>
            <Chip 
              label={serviceUser.status} 
              size="small" 
              color={
                serviceUser.status === 'active' ? 'success' : 
                serviceUser.status === 'inactive' ? 'error' : 'warning'
              }
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
      </Paper>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="family portal tabs">
          <Tab icon={<EventIcon />} iconPosition="start" label="Appointments" />
          <Tab icon={<AssignmentIcon />} iconPosition="start" label="Care Plans" />
          <Tab icon={<NoteIcon />} iconPosition="start" label="Notes" />
          <Tab icon={<MessageIcon />} iconPosition="start" label="Messages" />
          <Tab icon={<MedicalIcon />} iconPosition="start" label="Medications" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Upcoming Appointments
        </Typography>
        
        {getUpcomingAppointments().length === 0 ? (
          <Alert severity="info">No upcoming appointments scheduled.</Alert>
        ) : (
          <Grid container spacing={3}>
            {getUpcomingAppointments().map((appointment) => (
              <Grid item xs={12} md={6} key={appointment.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {appointment.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {appointment.date}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {formatAppointmentTime(appointment)}
                      </Typography>
                    </Box>
                    
                    {appointment.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {appointment.location}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        Caregiver: {appointment.caregiverId ? 'Assigned' : 'Not yet assigned'}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body2" color="text.secondary">
                      {appointment.description || 'No additional details provided.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Active Care Plans
        </Typography>
        
        {carePlans.length === 0 ? (
          <Alert severity="info">No active care plans found.</Alert>
        ) : (
          <Grid container spacing={3}>
            {carePlans.map((carePlan) => (
              <Grid item xs={12} key={carePlan.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {carePlan.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Start Date: {carePlan.startDate}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Review Date: {carePlan.reviewDate}
                      </Typography>
                      <Chip 
                        label={carePlan.status} 
                        size="small" 
                        color={
                          carePlan.status === 'active' ? 'success' : 
                          carePlan.status === 'completed' ? 'info' : 
                          carePlan.status === 'pending' ? 'warning' : 'default'
                        }
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {carePlan.description || 'No description provided.'}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Goals:
                    </Typography>
                    
                    {carePlan.goals && carePlan.goals.length > 0 ? (
                      <List dense>
                        {carePlan.goals.map((goal) => (
                          <ListItem key={goal.id}>
                            <ListItemIcon>
                              <CheckCircleIcon color={goal.status === 'completed' ? 'success' : 'action'} />
                            </ListItemIcon>
                            <ListItemText
                              primary={goal.title}
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="caption" display="block">
                                    Progress: {goal.progressPercentage}%
                                  </Typography>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={goal.progressPercentage} 
                                    sx={{ height: 6, borderRadius: 3 }}
                                  />
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No goals defined for this care plan.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Recent Notes
        </Typography>
        
        {getRecentNotes().length === 0 ? (
          <Alert severity="info">No notes available.</Alert>
        ) : (
          <Grid container spacing={3}>
            {getRecentNotes().map((note) => (
              <Grid item xs={12} md={6} key={note.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6">
                        {note.title}
                      </Typography>
                      <Chip label={note.category} size="small" />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      {formatNoteDate(note.createdAt)}
                    </Typography>
                    
                    <Typography variant="body2">
                      {note.content}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Messages" />
              <Divider />
              <CardContent sx={{ height: 400, overflowY: 'auto' }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  This is the beginning of your conversation with the care team.
                </Alert>
                
                {/* Message thread would go here */}
                <Typography variant="body2" color="text.secondary" align="center">
                  No messages yet. Start a conversation with the care team.
                </Typography>
              </CardContent>
              <Divider />
              <Box sx={{ p: 2, display: 'flex' }}>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  variant="outlined"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  sx={{ mr: 2 }}
                />
                <IconButton color="primary" sx={{ mr: 1 }}>
                  <AttachFileIcon />
                </IconButton>
                <IconButton color="primary" sx={{ mr: 1 }}>
                  <PhotoIcon />
                </IconButton>
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  Send
                </Button>
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Care Team" />
              <Divider />
              <CardContent>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar>JD</Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Jane Doe"
                      secondary="Care Manager"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar>JS</Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="John Smith"
                      secondary="Primary Caregiver"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar>SJ</Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Sarah Johnson"
                      secondary="Nurse"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={4}>
        <Typography variant="h6" gutterBottom>
          Medication Schedule
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          This section shows the current medication schedule for {serviceUser.fullName}.
        </Alert>
        
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" align="center">
              Medication management features will be implemented in a future update.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default FamilyPortal;
