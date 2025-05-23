import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip, 
  Card, 
  CardContent, 
  CardHeader, 
  Avatar, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Divider, 
  CircularProgress,
  Rating,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  DatePicker, 
  TimePicker, 
  LocalizationProvider 
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { 
  Person as PersonIcon, 
  AccessTime as AccessTimeIcon, 
  Check as CheckIcon, 
  Close as CloseIcon, 
  Info as InfoIcon,
  Route as RouteIcon,
  Star as StarIcon,
  DirectionsCar as CarIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { allocationApi, serviceUsersApi, usersApi, appointmentsApi } from '../services/api';
import { ServiceUser, User, AllocationRequest, AllocationSuggestion, Appointment } from '../types';

const CareAllocation: React.FC = () => {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [caregivers, setCaregivers] = useState<User[]>([]);
  const [selectedServiceUser, setSelectedServiceUser] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs().hour(9).minute(0));
  const [endTime, setEndTime] = useState<Dayjs | null>(dayjs().hour(10).minute(0));
  const [visitType, setVisitType] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<AllocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedCaregiver, setSelectedCaregiver] = useState<number | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [appointmentCreated, setAppointmentCreated] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [usersData, caregiversData] = await Promise.all([
          serviceUsersApi.getAll(),
          usersApi.getAll()
        ]);
        
        setServiceUsers(usersData);
        // Filter only caregivers
        setCaregivers(caregiversData.filter(user => user.role === 'caregiver'));
        setInitialLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setInitialLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  const handleGetSuggestions = async () => {
    if (!selectedServiceUser || !selectedDate || !startTime || !endTime || !visitType) {
      return;
    }
    
    try {
      setLoading(true);
      
      const request: AllocationRequest = {
        serviceUserId: selectedServiceUser as number,
        date: selectedDate.format('YYYY-MM-DD'),
        startTime: startTime.format('HH:mm'),
        endTime: endTime.format('HH:mm'),
        visitType,
        requiredSkills
      };
      
      const suggestionsData = await allocationApi.getSuggestions(request);
      setSuggestions(suggestionsData);
      setLoading(false);
    } catch (error) {
      console.error('Error getting allocation suggestions:', error);
      setLoading(false);
    }
  };

  const handleSelectCaregiver = (caregiverId: number) => {
    setSelectedCaregiver(caregiverId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmAllocation = async () => {
    if (!selectedCaregiver || !selectedServiceUser || !selectedDate || !startTime || !endTime || !visitType) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Create appointment
      const appointmentData: Partial<Appointment> = {
        serviceUserId: selectedServiceUser as number,
        caregiverId: selectedCaregiver,
        title: `${visitType} Visit`,
        description: `${visitType} visit with required skills: ${requiredSkills.join(', ')}`,
        date: selectedDate.format('YYYY-MM-DD'),
        startTime: startTime.format('HH:mm'),
        endTime: endTime.format('HH:mm'),
        status: 'scheduled',
        visitType
      };
      
      const createdAppt = await appointmentsApi.create(appointmentData);
      setCreatedAppointment(createdAppt);
      setAppointmentCreated(true);
      setConfirmDialogOpen(false);
      setLoading(false);
      
      // Reset form
      setSelectedServiceUser('');
      setSelectedDate(dayjs());
      setStartTime(dayjs().hour(9).minute(0));
      setEndTime(dayjs().hour(10).minute(0));
      setVisitType('');
      setRequiredSkills([]);
      setSuggestions([]);
      setSelectedCaregiver(null);
    } catch (error) {
      console.error('Error creating appointment:', error);
      setLoading(false);
      setConfirmDialogOpen(false);
    }
  };

  const handleCancelAllocation = () => {
    setConfirmDialogOpen(false);
    setSelectedCaregiver(null);
  };

  const handleCloseSuccessDialog = () => {
    setAppointmentCreated(false);
    setCreatedAppointment(null);
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI-Powered Care Allocation
      </Typography>
      
      <Grid container spacing={3}>
        {/* Allocation Form */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Visit Details
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="service-user-label">Service User</InputLabel>
              <Select
                labelId="service-user-label"
                value={selectedServiceUser}
                label="Service User"
                onChange={(e) => setSelectedServiceUser(e.target.value as number)}
              >
                {serviceUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Visit Date"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                sx={{ width: '100%', mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TimePicker
                  label="Start Time"
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
                  sx={{ width: '50%' }}
                />
                
                <TimePicker
                  label="End Time"
                  value={endTime}
                  onChange={(newValue) => setEndTime(newValue)}
                  sx={{ width: '50%' }}
                />
              </Box>
            </LocalizationProvider>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="visit-type-label">Visit Type</InputLabel>
              <Select
                labelId="visit-type-label"
                value={visitType}
                label="Visit Type"
                onChange={(e) => setVisitType(e.target.value)}
              >
                <MenuItem value="Personal Care">Personal Care</MenuItem>
                <MenuItem value="Medication">Medication</MenuItem>
                <MenuItem value="Mobility Support">Mobility Support</MenuItem>
                <MenuItem value="Meal Preparation">Meal Preparation</MenuItem>
                <MenuItem value="Social Support">Social Support</MenuItem>
                <MenuItem value="Health Check">Health Check</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="required-skills-label">Required Skills</InputLabel>
              <Select
                labelId="required-skills-label"
                multiple
                value={requiredSkills}
                label="Required Skills"
                onChange={(e) => setRequiredSkills(e.target.value as string[])}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="Medication Administration">Medication Administration</MenuItem>
                <MenuItem value="Dementia Care">Dementia Care</MenuItem>
                <MenuItem value="Manual Handling">Manual Handling</MenuItem>
                <MenuItem value="Catheter Care">Catheter Care</MenuItem>
                <MenuItem value="Diabetes Management">Diabetes Management</MenuItem>
                <MenuItem value="Wound Care">Wound Care</MenuItem>
                <MenuItem value="End of Life Care">End of Life Care</MenuItem>
                <MenuItem value="Mental Health Support">Mental Health Support</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleGetSuggestions}
              disabled={!selectedServiceUser || !selectedDate || !startTime || !endTime || !visitType || loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Get AI Suggestions'}
            </Button>
          </Paper>
        </Grid>
        
        {/* Suggestions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI-Suggested Caregivers
            </Typography>
            
            {suggestions.length === 0 && !loading ? (
              <Typography variant="body1" align="center" sx={{ py: 4 }}>
                Fill in the visit details and click "Get AI Suggestions" to see caregiver recommendations.
              </Typography>
            ) : (
              <List>
                {suggestions.map((suggestion) => {
                  const caregiver = caregivers.find(c => c.id === suggestion.caregiverId);
                  
                  return (
                    <React.Fragment key={suggestion.caregiverId}>
                      <Card sx={{ mb: 2, border: selectedCaregiver === suggestion.caregiverId ? '2px solid #2196f3' : 'none' }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={8}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ mr: 2 }}>
                                  {caregiver?.fullName.charAt(0) || 'C'}
                                </Avatar>
                                <Box>
                                  <Typography variant="h6">
                                    {caregiver?.fullName || `Caregiver #${suggestion.caregiverId}`}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                      Match Score:
                                    </Typography>
                                    <Rating 
                                      value={suggestion.matchScore / 20} 
                                      readOnly 
                                      precision={0.5}
                                      icon={<StarIcon fontSize="small" />}
                                    />
                                  </Box>
                                </Box>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Tooltip title="Available for this time slot">
                                  <Chip 
                                    icon={suggestion.availability ? <CheckIcon /> : <CloseIcon />} 
                                    label={suggestion.availability ? "Available" : "Unavailable"} 
                                    color={suggestion.availability ? "success" : "error"}
                                    size="small"
                                    sx={{ mr: 1 }}
                                  />
                                </Tooltip>
                                
                                {suggestion.distance && (
                                  <Tooltip title="Distance from service user">
                                    <Chip 
                                      icon={<CarIcon />} 
                                      label={`${suggestion.distance} miles`} 
                                      size="small"
                                      sx={{ mr: 1 }}
                                    />
                                  </Tooltip>
                                )}
                                
                                {suggestion.travelTime && (
                                  <Tooltip title="Estimated travel time">
                                    <Chip 
                                      icon={<AccessTimeIcon />} 
                                      label={`${suggestion.travelTime} mins`} 
                                      size="small"
                                    />
                                  </Tooltip>
                                )}
                              </Box>
                              
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Reasons for match:</strong>
                              </Typography>
                              
                              <Box sx={{ mb: 1 }}>
                                {suggestion.reasonCodes.map((reason, index) => (
                                  <Chip 
                                    key={index} 
                                    label={reason} 
                                    size="small" 
                                    sx={{ mr: 0.5, mb: 0.5 }} 
                                  />
                                ))}
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleSelectCaregiver(suggestion.caregiverId)}
                                disabled={!suggestion.availability}
                                sx={{ mb: 1, width: '100%' }}
                              >
                                Allocate
                              </Button>
                              
                              <Button
                                variant="outlined"
                                startIcon={<RouteIcon />}
                                sx={{ mb: 1, width: '100%' }}
                                onClick={() => {/* View route */}}
                              >
                                View Route
                              </Button>
                              
                              <Button
                                variant="outlined"
                                startIcon={<AssignmentIcon />}
                                sx={{ width: '100%' }}
                                onClick={() => {/* View schedule */}}
                              >
                                View Schedule
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelAllocation}>
        <DialogTitle>Confirm Allocation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to allocate this visit to {
              caregivers.find(c => c.id === selectedCaregiver)?.fullName || `Caregiver #${selectedCaregiver}`
            }?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAllocation}>Cancel</Button>
          <Button onClick={handleConfirmAllocation} color="primary" variant="contained">
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog open={appointmentCreated} onClose={handleCloseSuccessDialog}>
        <DialogTitle>Appointment Created</DialogTitle>
        <DialogContent>
          <Typography>
            The appointment has been successfully created and allocated to {
              caregivers.find(c => c.id === createdAppointment?.caregiverId)?.fullName || `Caregiver #${createdAppointment?.caregiverId}`
            }.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CareAllocation;
