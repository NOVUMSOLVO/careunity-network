import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { carePlansApi } from '../services/api';
import { CarePlan } from '../types';

const CarePlans: React.FC = () => {
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarePlans = async () => {
      try {
        setLoading(true);
        const data = await carePlansApi.getAll();
        setCarePlans(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching care plans:', error);
        setLoading(false);
      }
    };

    fetchCarePlans();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getFilteredCarePlans = () => {
    if (tabValue === 0) return carePlans;
    if (tabValue === 1) return carePlans.filter(plan => plan.status === 'active');
    if (tabValue === 2) return carePlans.filter(plan => plan.status === 'pending');
    return carePlans.filter(plan => plan.status === 'completed' || plan.status === 'archived');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const calculateProgress = (carePlan: CarePlan) => {
    if (!carePlan.goals || carePlan.goals.length === 0) return 0;
    const totalProgress = carePlan.goals.reduce((sum, goal) => sum + goal.progressPercentage, 0);
    return Math.round(totalProgress / carePlan.goals.length);
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
        <Typography variant="h4">Care Plans</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/care-plans/new')}
        >
          Create Care Plan
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="All Plans" />
        <Tab label="Active" />
        <Tab label="Pending Review" />
        <Tab label="Completed/Archived" />
      </Tabs>

      {getFilteredCarePlans().length === 0 ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          No care plans found in this category.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {getFilteredCarePlans().map((carePlan) => (
            <Grid item xs={12} sm={6} md={4} key={carePlan.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {carePlan.title}
                    </Typography>
                    <Chip 
                      label={carePlan.status} 
                      size="small" 
                      color={getStatusColor(carePlan.status) as any}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {carePlan.description || 'No description provided.'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Start: {carePlan.startDate} | Review: {carePlan.reviewDate}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Overall Progress: {calculateProgress(carePlan)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateProgress(carePlan)} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Goals:</strong> {carePlan.goals ? carePlan.goals.length : 0}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<AssignmentIcon />}
                      onClick={() => navigate(`/care-plans/${carePlan.id}`)}
                    >
                      View Details
                    </Button>
                    
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/care-plans/${carePlan.id}/edit`)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
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
    </Box>
  );
};

export default CarePlans;
