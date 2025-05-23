import React, { useState } from 'react';
import {
  Box,
  Snackbar,
  Alert,
  Button,
  Badge,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  CloudOff as CloudOffIcon,
  CloudDone as CloudDoneIcon,
  Sync as SyncIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useOffline } from '../../contexts/offline-context';

const OfflineStatus: React.FC = () => {
  const { 
    isOnline, 
    hasPendingChanges, 
    pendingChangesCount, 
    syncPendingChanges 
  } = useOffline();
  
  const [showOfflineSnackbar, setShowOfflineSnackbar] = useState(false);
  const [showOnlineSnackbar, setShowOnlineSnackbar] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);

  // Show snackbar when offline status changes
  React.useEffect(() => {
    if (!isOnline) {
      setShowOfflineSnackbar(true);
      setShowOnlineSnackbar(false);
    } else {
      setShowOfflineSnackbar(false);
      setShowOnlineSnackbar(true);
    }
  }, [isOnline]);

  const handleSyncClick = () => {
    if (hasPendingChanges) {
      setShowSyncDialog(true);
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      return;
    }
    
    setSyncing(true);
    setSyncSuccess(null);
    
    try {
      await syncPendingChanges();
      setSyncSuccess(true);
      
      // Close dialog after successful sync if no more pending changes
      if (!hasPendingChanges) {
        setTimeout(() => {
          setShowSyncDialog(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error syncing changes:', error);
      setSyncSuccess(false);
    } finally {
      setSyncing(false);
    }
  };

  // Mock pending changes for demo purposes
  const pendingChangesList = [
    { id: 1, type: 'Visit Note', description: 'New visit note for Alice Johnson', timestamp: '2023-05-10T10:30:00' },
    { id: 2, type: 'Medication Record', description: 'Medication administered for Bob Smith', timestamp: '2023-05-10T11:15:00' },
    { id: 3, type: 'Care Plan Update', description: 'Updated mobility goals for Carol Williams', timestamp: '2023-05-10T14:45:00' },
  ];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
  };

  return (
    <>
      {/* Offline status icon */}
      <Tooltip title={isOnline ? 'Online' : 'Offline'}>
        <IconButton color={isOnline ? 'primary' : 'error'} size="small">
          {isOnline ? <CloudDoneIcon /> : <CloudOffIcon />}
        </IconButton>
      </Tooltip>
      
      {/* Sync button with badge showing pending changes count */}
      {hasPendingChanges && (
        <Tooltip title={`${pendingChangesCount} pending changes to sync`}>
          <IconButton 
            color="primary" 
            onClick={handleSyncClick}
            disabled={!isOnline || syncing}
            size="small"
          >
            <Badge badgeContent={pendingChangesCount} color="error">
              <SyncIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      )}
      
      {/* Offline snackbar */}
      <Snackbar
        open={showOfflineSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowOfflineSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity="warning" 
          icon={<CloudOffIcon />}
          onClose={() => setShowOfflineSnackbar(false)}
        >
          You are offline. Changes will be saved locally and synced when you're back online.
        </Alert>
      </Snackbar>
      
      {/* Online snackbar */}
      <Snackbar
        open={showOnlineSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowOnlineSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity="success" 
          icon={<CloudDoneIcon />}
          onClose={() => setShowOnlineSnackbar(false)}
        >
          You are back online.
          {hasPendingChanges && (
            <Button 
              size="small" 
              color="inherit" 
              onClick={() => {
                setShowOnlineSnackbar(false);
                setShowSyncDialog(true);
              }}
              sx={{ ml: 1 }}
            >
              Sync Changes
            </Button>
          )}
        </Alert>
      </Snackbar>
      
      {/* Sync dialog */}
      <Dialog
        open={showSyncDialog}
        onClose={() => !syncing && setShowSyncDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Sync Pending Changes
        </DialogTitle>
        <DialogContent>
          {syncSuccess === true ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Changes synced successfully!
            </Alert>
          ) : syncSuccess === false ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Some changes failed to sync. Please try again.
            </Alert>
          ) : null}
          
          <Typography variant="body1" paragraph>
            You have {pendingChangesCount} pending changes that need to be synced with the server.
          </Typography>
          
          <Box sx={{ mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InfoIcon fontSize="small" sx={{ mr: 1 }} />
              These changes were made while you were offline:
            </Typography>
            
            <List dense>
              {pendingChangesList.map((change) => (
                <React.Fragment key={change.id}>
                  <ListItem>
                    <ListItemText
                      primary={change.type}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {change.description}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {formatTimestamp(change.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Syncing will upload these changes to the server. Make sure you have a stable internet connection.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowSyncDialog(false)} 
            disabled={syncing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSync} 
            variant="contained" 
            disabled={syncing || !isOnline}
            startIcon={syncing ? <CircularProgress size={20} /> : <SyncIcon />}
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OfflineStatus;
