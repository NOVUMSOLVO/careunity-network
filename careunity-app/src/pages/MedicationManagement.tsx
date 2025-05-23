import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  Alert,
  Switch,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Medication as MedicationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Info as InfoIcon,
  LocalPharmacy as PharmacyIcon,
  EventNote as EventNoteIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

// Medication frequency types
enum FrequencyType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  AS_NEEDED = 'as_needed',
  SPECIFIC_DAYS = 'specific_days',
  SPECIFIC_TIMES = 'specific_times'
}

// Medication status
enum MedicationStatus {
  ACTIVE = 'active',
  DISCONTINUED = 'discontinued',
  PENDING = 'pending',
  COMPLETED = 'completed'
}

// Medication interface
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: FrequencyType;
  frequencyDetails?: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  status: MedicationStatus;
  prescribedBy?: string;
  pharmacy?: string;
  lastRefill?: string;
  nextRefill?: string;
  serviceUserId: number;
  notes?: string;
  sideEffects?: string[];
  interactions?: string[];
  requiresWitness: boolean;
}

// Medication administration record
interface MedicationAdministration {
  id: string;
  medicationId: string;
  administeredBy: string;
  administeredAt: string;
  status: 'administered' | 'missed' | 'refused' | 'held';
  notes?: string;
  witnessedBy?: string;
}

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
      id={`medication-tabpanel-${index}`}
      aria-labelledby={`medication-tab-${index}`}
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

const MedicationManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [selectedServiceUser, setSelectedServiceUser] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock medications data
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: FrequencyType.DAILY,
      frequencyDetails: 'Once daily in the morning',
      startDate: '2023-01-15',
      instructions: 'Take with food',
      status: MedicationStatus.ACTIVE,
      prescribedBy: 'Dr. Smith',
      pharmacy: 'City Pharmacy',
      lastRefill: '2023-04-15',
      nextRefill: '2023-05-15',
      serviceUserId: 1,
      notes: 'For blood pressure control',
      sideEffects: ['Dizziness', 'Cough'],
      interactions: ['Potassium supplements'],
      requiresWitness: false
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: FrequencyType.DAILY,
      frequencyDetails: 'Twice daily with meals',
      startDate: '2023-02-10',
      instructions: 'Take with meals',
      status: MedicationStatus.ACTIVE,
      prescribedBy: 'Dr. Johnson',
      pharmacy: 'City Pharmacy',
      lastRefill: '2023-04-10',
      nextRefill: '2023-05-10',
      serviceUserId: 1,
      notes: 'For diabetes management',
      sideEffects: ['Nausea', 'Diarrhea'],
      interactions: ['Alcohol'],
      requiresWitness: false
    },
    {
      id: '3',
      name: 'Warfarin',
      dosage: '5mg',
      frequency: FrequencyType.DAILY,
      frequencyDetails: 'Once daily in the evening',
      startDate: '2023-03-05',
      instructions: 'Take at the same time each day',
      status: MedicationStatus.ACTIVE,
      prescribedBy: 'Dr. Williams',
      pharmacy: 'Central Pharmacy',
      lastRefill: '2023-04-05',
      nextRefill: '2023-05-05',
      serviceUserId: 1,
      notes: 'Blood thinner',
      sideEffects: ['Bleeding', 'Bruising'],
      interactions: ['NSAIDs', 'Aspirin'],
      requiresWitness: true
    },
    {
      id: '4',
      name: 'Ibuprofen',
      dosage: '400mg',
      frequency: FrequencyType.AS_NEEDED,
      frequencyDetails: 'As needed for pain, not to exceed 3 times per day',
      startDate: '2023-04-01',
      instructions: 'Take with food or milk',
      status: MedicationStatus.ACTIVE,
      prescribedBy: 'Dr. Smith',
      pharmacy: 'City Pharmacy',
      lastRefill: '2023-04-01',
      nextRefill: '2023-05-01',
      serviceUserId: 1,
      notes: 'For pain relief',
      sideEffects: ['Stomach upset', 'Heartburn'],
      interactions: ['Blood thinners', 'Aspirin'],
      requiresWitness: false
    },
    {
      id: '5',
      name: 'Amoxicillin',
      dosage: '500mg',
      frequency: FrequencyType.DAILY,
      frequencyDetails: 'Three times daily',
      startDate: '2023-04-10',
      endDate: '2023-04-17',
      instructions: 'Complete full course of antibiotics',
      status: MedicationStatus.COMPLETED,
      prescribedBy: 'Dr. Johnson',
      pharmacy: 'Central Pharmacy',
      lastRefill: '2023-04-10',
      serviceUserId: 1,
      notes: 'For respiratory infection',
      sideEffects: ['Diarrhea', 'Rash'],
      interactions: ['Birth control pills'],
      requiresWitness: false
    }
  ]);

  // Mock medication administration records
  const [administrationRecords, setAdministrationRecords] = useState<MedicationAdministration[]>([
    {
      id: '1',
      medicationId: '1',
      administeredBy: 'John Smith',
      administeredAt: '2023-05-01T08:30:00',
      status: 'administered',
      notes: 'Taken without issues'
    },
    {
      id: '2',
      medicationId: '2',
      administeredBy: 'John Smith',
      administeredAt: '2023-05-01T08:30:00',
      status: 'administered',
      notes: 'Taken with breakfast'
    },
    {
      id: '3',
      medicationId: '2',
      administeredBy: 'Sarah Johnson',
      administeredAt: '2023-05-01T18:00:00',
      status: 'administered',
      notes: 'Taken with dinner'
    },
    {
      id: '4',
      medicationId: '3',
      administeredBy: 'Sarah Johnson',
      administeredAt: '2023-05-01T20:00:00',
      status: 'administered',
      notes: 'Taken as scheduled',
      witnessedBy: 'Michael Brown'
    },
    {
      id: '5',
      medicationId: '1',
      administeredBy: 'Emily Davis',
      administeredAt: '2023-05-02T08:30:00',
      status: 'administered',
      notes: 'Taken without issues'
    }
  ]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
  };

  const handleServiceUserChange = (event: any) => {
    setSelectedServiceUser(event.target.value);
  };

  const handleAddDialogOpen = () => {
    setAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
  };

  const handleDeleteDialogOpen = (medication: Medication) => {
    setSelectedMedication(medication);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedMedication(null);
  };

  const handleDeleteMedication = () => {
    if (selectedMedication) {
      setMedications(medications.filter(med => med.id !== selectedMedication.id));
      handleDeleteDialogClose();
    }
  };

  const handleAddMedication = () => {
    // In a real app, this would add a new medication
    handleAddDialogClose();
  };

  const getFilteredMedications = () => {
    return medications.filter(med => {
      // Apply service user filter
      if (selectedServiceUser && med.serviceUserId !== selectedServiceUser) {
        return false;
      }
      
      // Apply status filter
      if (statusFilter !== 'all' && med.status !== statusFilter) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          med.name.toLowerCase().includes(searchLower) ||
          med.dosage.toLowerCase().includes(searchLower) ||
          med.instructions?.toLowerCase().includes(searchLower) ||
          med.notes?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  };

  const getStatusColor = (status: MedicationStatus) => {
    switch (status) {
      case MedicationStatus.ACTIVE:
        return 'success';
      case MedicationStatus.DISCONTINUED:
        return 'error';
      case MedicationStatus.PENDING:
        return 'warning';
      case MedicationStatus.COMPLETED:
        return 'info';
      default:
        return 'default';
    }
  };

  const getAdministrationStatusColor = (status: string) => {
    switch (status) {
      case 'administered':
        return 'success';
      case 'missed':
        return 'error';
      case 'refused':
        return 'warning';
      case 'held':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Medication Management
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search medications..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Service User</InputLabel>
              <Select
                value={selectedServiceUser}
                label="Service User"
                onChange={handleServiceUserChange}
              >
                <MenuItem value="">All Service Users</MenuItem>
                <MenuItem value={1}>Alice Johnson</MenuItem>
                <MenuItem value={2}>Bob Smith</MenuItem>
                <MenuItem value={3}>Carol Williams</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value={MedicationStatus.ACTIVE}>Active</MenuItem>
                <MenuItem value={MedicationStatus.DISCONTINUED}>Discontinued</MenuItem>
                <MenuItem value={MedicationStatus.PENDING}>Pending</MenuItem>
                <MenuItem value={MedicationStatus.COMPLETED}>Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddDialogOpen}
            >
              Add Medication
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="medication tabs">
          <Tab label="Current Medications" icon={<MedicationIcon />} iconPosition="start" />
          <Tab label="Administration Records" icon={<EventNoteIcon />} iconPosition="start" />
          <Tab label="Medication History" icon={<HistoryIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        {getFilteredMedications().length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <MedicationIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No medications found
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddDialogOpen}
              sx={{ mt: 2 }}
            >
              Add Medication
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {getFilteredMedications().map((medication) => (
              <Grid item xs={12} md={6} key={medication.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MedicationIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {medication.name} {medication.dosage}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Chip 
                          label={medication.status} 
                          size="small" 
                          color={getStatusColor(medication.status) as any}
                          sx={{ mr: 1 }}
                        />
                        
                        {medication.requiresWitness && (
                          <Tooltip title="Requires witness for administration">
                            <Chip 
                              icon={<WarningIcon />}
                              label="Witness Required" 
                              size="small" 
                              color="warning"
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Frequency:</strong> {medication.frequencyDetails}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Instructions:</strong> {medication.instructions || 'None provided'}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Start Date:</strong> {formatDate(medication.startDate)}
                      {medication.endDate && ` | End Date: ${formatDate(medication.endDate)}`}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Prescribed By:</strong> {medication.prescribedBy || 'Unknown'}
                      {medication.pharmacy && ` | Pharmacy: ${medication.pharmacy}`}
                    </Typography>
                    
                    {medication.nextRefill && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Next Refill:</strong> {formatDate(medication.nextRefill)}
                      </Typography>
                    )}
                    
                    {medication.notes && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Notes:</strong> {medication.notes}
                      </Typography>
                    )}
                    
                    {medication.sideEffects && medication.sideEffects.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" component="span">
                          <strong>Side Effects:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {medication.sideEffects.map((effect, index) => (
                            <Chip
                              key={index}
                              label={effect}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteDialogOpen(medication)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Alert severity="info" sx={{ mb: 3 }}>
          This tab shows the medication administration records. You can record when medications are given, missed, or refused.
        </Alert>
        
        <Paper>
          <List>
            {administrationRecords.map((record) => {
              const medication = medications.find(med => med.id === record.medicationId);
              
              return (
                <React.Fragment key={record.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Badge color="primary" variant="dot" invisible={record.status !== 'administered'}>
                        <MedicationIcon />
                      </Badge>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
                            {medication?.name} {medication?.dosage}
                          </Typography>
                          <Chip 
                            label={record.status} 
                            size="small" 
                            color={getAdministrationStatusColor(record.status) as any}
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            Administered by {record.administeredBy} at {formatDateTime(record.administeredAt)}
                          </Typography>
                          {record.witnessedBy && (
                            <Typography variant="body2" component="div">
                              Witnessed by: {record.witnessedBy}
                            </Typography>
                          )}
                          {record.notes && (
                            <Typography variant="body2" component="div">
                              Notes: {record.notes}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Alert severity="info" sx={{ mb: 3 }}>
          This tab shows the medication history, including discontinued and completed medications.
        </Alert>
        
        <Typography variant="body2" color="text.secondary" align="center">
          Medication history features will be implemented in a future update.
        </Typography>
      </TabPanel>
      
      {/* Add Medication Dialog */}
      <Dialog open={addDialogOpen} onClose={handleAddDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Add New Medication</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Medication Name"
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Dosage"
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Frequency</InputLabel>
                <Select label="Frequency">
                  <MenuItem value={FrequencyType.DAILY}>Daily</MenuItem>
                  <MenuItem value={FrequencyType.WEEKLY}>Weekly</MenuItem>
                  <MenuItem value={FrequencyType.MONTHLY}>Monthly</MenuItem>
                  <MenuItem value={FrequencyType.AS_NEEDED}>As Needed (PRN)</MenuItem>
                  <MenuItem value={FrequencyType.SPECIFIC_DAYS}>Specific Days</MenuItem>
                  <MenuItem value={FrequencyType.SPECIFIC_TIMES}>Specific Times</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Frequency Details"
                fullWidth
                placeholder="e.g. Once daily in the morning"
              />
            </Grid>
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={dayjs()}
                  onChange={() => {}}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date (if applicable)"
                  value={null}
                  onChange={() => {}}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </LocalizationProvider>
            
            <Grid item xs={12}>
              <TextField
                label="Instructions"
                fullWidth
                multiline
                rows={2}
                placeholder="e.g. Take with food"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Prescribed By"
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Pharmacy"
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Service User</InputLabel>
                <Select label="Service User">
                  <MenuItem value={1}>Alice Johnson</MenuItem>
                  <MenuItem value={2}>Bob Smith</MenuItem>
                  <MenuItem value={3}>Carol Williams</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select label="Status" defaultValue={MedicationStatus.ACTIVE}>
                  <MenuItem value={MedicationStatus.ACTIVE}>Active</MenuItem>
                  <MenuItem value={MedicationStatus.PENDING}>Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Side Effects (comma separated)"
                fullWidth
                placeholder="e.g. Dizziness, Nausea, Headache"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Interactions (comma separated)"
                fullWidth
                placeholder="e.g. Alcohol, Grapefruit, Aspirin"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox />}
                label="Requires witness for administration"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleAddMedication}>Add Medication</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography>
            Are you sure you want to delete the medication "{selectedMedication?.name} {selectedMedication?.dosage}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteMedication} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedicationManagement;
