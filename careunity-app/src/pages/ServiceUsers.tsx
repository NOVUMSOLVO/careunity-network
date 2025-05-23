import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Avatar, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Assignment as AssignmentIcon, 
  EventNote as EventNoteIcon,
  HealthAndSafety as HealthIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { serviceUsersApi } from '../services/api';
import { ServiceUser } from '../types';

const ServiceUsers: React.FC = () => {
  const navigate = useNavigate();
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ServiceUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ServiceUser | null>(null);

  useEffect(() => {
    const fetchServiceUsers = async () => {
      try {
        setLoading(true);
        const data = await serviceUsersApi.getAll();
        setServiceUsers(data);
        setFilteredUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching service users:', error);
        setLoading(false);
      }
    };

    fetchServiceUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = serviceUsers.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.careNeeds && user.careNeeds.some(need => 
          need.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(serviceUsers);
    }
  }, [searchTerm, serviceUsers]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleAddUser = () => {
    navigate('/service-users/new');
  };

  const handleEditUser = (id: number) => {
    navigate(`/service-users/${id}/edit`);
  };

  const handleViewUser = (id: number) => {
    navigate(`/service-users/${id}`);
  };

  const handleViewCarePlans = (id: number) => {
    navigate(`/service-users/${id}/care-plans`);
  };

  const handleViewAppointments = (id: number) => {
    navigate(`/service-users/${id}/appointments`);
  };

  const handleViewRiskAssessments = (id: number) => {
    navigate(`/service-users/${id}/risk-assessments`);
  };

  const handleDeleteClick = (user: ServiceUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        await serviceUsersApi.delete(userToDelete.id);
        setServiceUsers(serviceUsers.filter(user => user.id !== userToDelete.id));
        setFilteredUsers(filteredUsers.filter(user => user.id !== userToDelete.id));
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } catch (error) {
        console.error('Error deleting service user:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
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
        <Typography variant="h4">Service Users</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          Add Service User
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, address, or care needs..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mr: 2 }}
        />
        <Tooltip title="Filter options">
          <IconButton>
            <FilterIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {filteredUsers.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          No service users found. {searchTerm && 'Try a different search term.'}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      src={user.profileImage} 
                      alt={user.fullName}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    >
                      {user.fullName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div">
                        {user.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        DOB: {user.dateOfBirth}
                      </Typography>
                      <Chip 
                        label={user.status} 
                        size="small" 
                        color={
                          user.status === 'active' ? 'success' : 
                          user.status === 'inactive' ? 'error' : 'warning'
                        }
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Address:</strong> {user.address}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Emergency Contact:</strong> {user.emergencyContact} ({user.emergencyPhone})
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Care Needs:</strong>
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    {user.careNeeds.map((need, index) => (
                      <Chip 
                        key={index} 
                        label={need} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                    ))}
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Tooltip title="View Details">
                      <Button 
                        size="small" 
                        onClick={() => handleViewUser(user.id)}
                      >
                        View
                      </Button>
                    </Tooltip>
                    
                    <Box>
                      <Tooltip title="Care Plans">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewCarePlans(user.id)}
                          color="primary"
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Appointments">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewAppointments(user.id)}
                          color="primary"
                        >
                          <EventNoteIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Risk Assessments">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewRiskAssessments(user.id)}
                          color="primary"
                        >
                          <HealthIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditUser(user.id)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(user)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {userToDelete?.fullName}? This action cannot be undone.
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

export default ServiceUsers;
