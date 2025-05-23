import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { 
  DatePicker, 
  TimePicker, 
  LocalizationProvider 
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon, 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Event as EventIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { appointmentsApi, serviceUsersApi, usersApi } from '../services/api';
import { Appointment, ServiceUser, User } from '../types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const appointmentSchema = z.object({
  serviceUserId: z.number().min(1, 'Service user is required'),
  caregiverId: z.number().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.any().refine(val => val !== null, 'Date is required'),
  startTime: z.any().refine(val => val !== null, 'Start time is required'),
  endTime: z.any().refine(val => val !== null, 'End time is required'),
  location: z.string().optional(),
  visitType: z.string().min(1, 'Visit type is required'),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [caregivers, setCaregivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  const { control, handleSubmit, reset, formState: { errors } } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      serviceUserId: 0,
      caregiverId: undefined,
      title: '',
      description: '',
      date: currentDate,
      startTime: dayjs().hour(9).minute(0),
      endTime: dayjs().hour(10).minute(0),
      location: '',
      visitType: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appts, users, staff] = await Promise.all([
          appointmentsApi.getAll(),
          serviceUsersApi.getAll(),
          usersApi.getAll(),
        ]);
        
        setAppointments(appts);
        setServiceUsers(users);
        setCaregivers(staff.filter(user => user.role === 'caregiver'));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handlePrevious = () => {
    if (viewMode === 'day') {
      setCurrentDate(currentDate.subtract(1, 'day'));
    } else if (viewMode === 'week') {
      setCurrentDate(currentDate.subtract(1, 'week'));
    } else {
      setCurrentDate(currentDate.subtract(1, 'month'));
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      setCurrentDate(currentDate.add(1, 'day'));
    } else if (viewMode === 'week') {
      setCurrentDate(currentDate.add(1, 'week'));
    } else {
      setCurrentDate(currentDate.add(1, 'month'));
    }
  };

  const handleToday = () => {
    setCurrentDate(dayjs());
  };

  const handleViewModeChange = (mode: 'day' | 'week' | 'month') => {
    setViewMode(mode);
  };

  const handleAddAppointment = () => {
    setEditingAppointment(null);
    reset({
      serviceUserId: 0,
      caregiverId: undefined,
      title: '',
      description: '',
      date: currentDate,
      startTime: dayjs().hour(9).minute(0),
      endTime: dayjs().hour(10).minute(0),
      location: '',
      visitType: '',
    });
    setDialogOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    reset({
      serviceUserId: appointment.serviceUserId,
      caregiverId: appointment.caregiverId,
      title: appointment.title,
      description: appointment.description || '',
      date: dayjs(appointment.date),
      startTime: dayjs(`2023-01-01T${appointment.startTime}`),
      endTime: dayjs(`2023-01-01T${appointment.endTime}`),
      location: appointment.location || '',
      visitType: appointment.visitType,
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (appointmentToDelete) {
      try {
        await appointmentsApi.delete(appointmentToDelete.id);
        setAppointments(appointments.filter(a => a.id !== appointmentToDelete.id));
        setDeleteDialogOpen(false);
        setAppointmentToDelete(null);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAppointmentToDelete(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const appointmentData = {
        ...data,
        date: data.date.format('YYYY-MM-DD'),
        startTime: data.startTime.format('HH:mm'),
        endTime: data.endTime.format('HH:mm'),
        status: 'scheduled',
      };
      
      if (editingAppointment) {
        const updatedAppointment = await appointmentsApi.update(editingAppointment.id, appointmentData);
        setAppointments(appointments.map(a => a.id === editingAppointment.id ? updatedAppointment : a));
      } else {
        const newAppointment = await appointmentsApi.create(appointmentData);
        setAppointments([...appointments, newAppointment]);
      }
      
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const getVisibleDays = () => {
    if (viewMode === 'day') {
      return [currentDate];
    } else if (viewMode === 'week') {
      const startOfWeek = currentDate.startOf('week');
      return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
    } else {
      const startOfMonth = currentDate.startOf('month');
      const daysInMonth = currentDate.daysInMonth();
      return Array.from({ length: daysInMonth }, (_, i) => startOfMonth.add(i, 'day'));
    }
  };

  const getAppointmentsForDay = (day: Dayjs) => {
    const dayStr = day.format('YYYY-MM-DD');
    return appointments.filter(a => a.date === dayStr);
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  const getServiceUserName = (id: number) => {
    const serviceUser = serviceUsers.find(u => u.id === id);
    return serviceUser ? serviceUser.fullName : 'Unknown';
  };

  const getCaregiverName = (id?: number) => {
    if (!id) return 'Unassigned';
    const caregiver = caregivers.find(c => c.id === id);
    return caregiver ? caregiver.fullName : 'Unknown';
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Calendar</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddAppointment}
        >
          Add Appointment
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handlePrevious}>
              <ChevronLeftIcon />
            </IconButton>
            <Button onClick={handleToday} sx={{ mx: 1 }}>
              Today
            </Button>
            <IconButton onClick={handleNext}>
              <ChevronRightIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2 }}>
              {viewMode === 'day' && currentDate.format('MMMM D, YYYY')}
              {viewMode === 'week' && `${currentDate.startOf('week').format('MMM D')} - ${currentDate.endOf('week').format('MMM D, YYYY')}`}
              {viewMode === 'month' && currentDate.format('MMMM YYYY')}
            </Typography>
          </Box>
          <Box>
            <Button 
              variant={viewMode === 'day' ? 'contained' : 'outlined'} 
              onClick={() => handleViewModeChange('day')}
              sx={{ mr: 1 }}
            >
              Day
            </Button>
            <Button 
              variant={viewMode === 'week' ? 'contained' : 'outlined'} 
              onClick={() => handleViewModeChange('week')}
              sx={{ mr: 1 }}
            >
              Week
            </Button>
            <Button 
              variant={viewMode === 'month' ? 'contained' : 'outlined'} 
              onClick={() => handleViewModeChange('month')}
            >
              Month
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {getVisibleDays().map((day) => (
            <Grid 
              item 
              xs={viewMode === 'day' ? 12 : viewMode === 'week' ? 12/7 : 12/7} 
              key={day.format('YYYY-MM-DD')}
            >
              <Paper 
                sx={{ 
                  p: 1, 
                  height: viewMode === 'month' ? 120 : 'auto',
                  bgcolor: day.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD') ? 'primary.50' : 'background.paper',
                  overflow: 'auto'
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    textAlign: 'center', 
                    mb: 1,
                    fontWeight: day.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD') ? 'bold' : 'normal'
                  }}
                >
                  {day.format('ddd, MMM D')}
                </Typography>
                
                {getAppointmentsForDay(day).map((appointment) => (
                  <Card 
                    key={appointment.id} 
                    sx={{ 
                      mb: 1, 
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 3 }
                    }}
                    onClick={() => handleEditAppointment(appointment)}
                  >
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <Typography variant="body2" fontWeight="bold">
                        {appointment.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <TimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem', color: 'text.secondary' }} />
                        <Typography variant="caption">
                          {formatTimeRange(appointment.startTime, appointment.endTime)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <PersonIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem', color: 'text.secondary' }} />
                        <Typography variant="caption">
                          {getServiceUserName(appointment.serviceUserId)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Appointment Form Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAppointment ? 'Edit Appointment' : 'Add Appointment'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Title"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="serviceUserId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.serviceUserId}>
                      <InputLabel>Service User</InputLabel>
                      <Select
                        {...field}
                        label="Service User"
                        value={field.value || ''}
                      >
                        <MenuItem value={0} disabled>Select Service User</MenuItem>
                        {serviceUsers.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.fullName}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.serviceUserId && (
                        <Typography variant="caption" color="error">
                          {errors.serviceUserId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="caregiverId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Caregiver</InputLabel>
                      <Select
                        {...field}
                        label="Caregiver"
                        value={field.value || ''}
                      >
                        <MenuItem value="">Unassigned</MenuItem>
                        {caregivers.map((caregiver) => (
                          <MenuItem key={caregiver.id} value={caregiver.id}>
                            {caregiver.fullName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="visitType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.visitType}>
                      <InputLabel>Visit Type</InputLabel>
                      <Select
                        {...field}
                        label="Visit Type"
                      >
                        <MenuItem value="Personal Care">Personal Care</MenuItem>
                        <MenuItem value="Medication">Medication</MenuItem>
                        <MenuItem value="Mobility Support">Mobility Support</MenuItem>
                        <MenuItem value="Meal Preparation">Meal Preparation</MenuItem>
                        <MenuItem value="Social Support">Social Support</MenuItem>
                        <MenuItem value="Health Check">Health Check</MenuItem>
                      </Select>
                      {errors.visitType && (
                        <Typography variant="caption" color="error">
                          {errors.visitType.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Location"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Date"
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.date,
                            helperText: errors.date?.message as string
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="startTime"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        label="Start Time"
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.startTime,
                            helperText: errors.startTime?.message as string
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="endTime"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        label="End Time"
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.endTime,
                            helperText: errors.endTime?.message as string
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
              </LocalizationProvider>
              
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            {editingAppointment && (
              <Button 
                color="error" 
                onClick={() => {
                  handleDialogClose();
                  handleDeleteClick(editingAppointment);
                }}
                sx={{ mr: 'auto' }}
              >
                Delete
              </Button>
            )}
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this appointment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar;
