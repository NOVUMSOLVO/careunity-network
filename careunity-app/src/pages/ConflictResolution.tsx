import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Paper, Box, Container } from '@mui/material';
import ConflictResolutionComponent from '../components/ConflictResolution';

const ConflictResolutionPage: React.FC = () => {
  const { conflictId } = useParams<{ conflictId: string }>();
  const navigate = useNavigate();
  
  // Handle conflict resolution completion
  const handleResolved = () => {
    // Navigate back to the previous page or dashboard
    navigate(-1);
  };
  
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Conflict Resolution
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Resolve conflicts between offline changes and server data
        </Typography>
      </Paper>
      
      {conflictId ? (
        <ConflictResolutionComponent 
          conflictId={parseInt(conflictId, 10)} 
          onResolved={handleResolved} 
        />
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="error">
            No conflict ID provided
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please access this page through the offline status bar
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ConflictResolutionPage;
