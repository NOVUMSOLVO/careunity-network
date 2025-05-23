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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  FilterList as FilterIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { usersApi } from '../services/api';
import { User, UserRole } from '../types';

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
      id={`staff-tabpanel-${index}`}
      aria-labelledby={`staff-tab-${index}`}
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

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<User | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const data = await usersApi.getAll();
        // Filter out service users and family members
        const staffMembers = data.filter(user => 
          user.role === UserRole.CAREGIVER || 
          user.role === UserRole.MANAGER || 
          user.role === UserRole.ADMIN
        );
        setStaff(staffMembers);
        setFilteredStaff(staffMembers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching staff:', error);
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  useEffect(() => {
    let filtered = staff;
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phoneNumber && user.phoneNumber.includes(searchTerm))
      );
    }
    
    setFilteredStaff(filtered);
  }, [searchTerm, staff, roleFilter]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleRoleFilterChange = (event: any) => {
    setRoleFilter(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddStaff = () => {
    // Navigate to add staff page
  };

  const handleEditStaff = (id: number) => {
    // Navigate to edit staff page
  };

  const handleViewStaff = (id: number) => {
    // Navigate to view staff page
  };

  const handleDeleteClick = (user: User) => {
    setStaffToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (staffToDelete) {
      try {
        await usersApi.delete(staffToDelete.id);
        setStaff(staff.filter(user => user.id !== staffToDelete.id));
        setFilteredStaff(filteredStaff.filter(user => user.id !== staffToDelete.id));
        setDeleteDialogOpen(false);
        setStaffToDelete(null);
      } catch (error) {
        console.error('Error deleting staff member:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStaffToDelete(null);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'fullName', 
      headerName: 'Name', 
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={params.row.profileImage} 
            alt={params.row.fullName}
            sx={{ mr: 1, width: 32, height: 32 }}
          >
            {params.row.fullName.charAt(0)}
          </Avatar>
          {params.row.fullName}
        </Box>
      )
    },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phoneNumber', headerName: 'Phone', width: 150 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === UserRole.ADMIN ? 'error' : 
            params.value === UserRole.MANAGER ? 'warning' : 
            'primary'
          }
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              onClick={() => handleEditStaff(params.row.id)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              onClick={() => handleDeleteClick(params.row)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    },
  ];

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
        <Typography variant="h4">Staff Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddStaff}
        >
          Add Staff Member
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mr: 2, flexGrow: 1 }}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="role-filter-label">Role</InputLabel>
          <Select
            labelId="role-filter-label"
            value={roleFilter}
            label="Role"
            onChange={handleRoleFilterChange}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value={UserRole.CAREGIVER}>Caregivers</MenuItem>
            <MenuItem value={UserRole.MANAGER}>Managers</MenuItem>
            <MenuItem value={UserRole.ADMIN}>Admins</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="staff management tabs">
          <Tab label="Grid View" />
          <Tab label="Table View" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {filteredStaff.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ mt: 4 }}>
            No staff members found. {searchTerm && 'Try a different search term.'}
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredStaff.map((user) => (
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
                        <Chip 
                          label={user.role} 
                          size="small" 
                          color={
                            user.role === UserRole.ADMIN ? 'error' : 
                            user.role === UserRole.MANAGER ? 'warning' : 
                            'primary'
                          }
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{user.email}</Typography>
                    </Box>
                    
                    {user.phoneNumber && (
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{user.phoneNumber}</Typography>
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button 
                        size="small" 
                        onClick={() => handleViewStaff(user.id)}
                      >
                        View Profile
                      </Button>
                      
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditStaff(user.id)}
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
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredStaff}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>
      </TabPanel>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {staffToDelete?.fullName}? This action cannot be undone.
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

export default StaffManagement;
