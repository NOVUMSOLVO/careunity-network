import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  Theme,
  SwipeableDrawer,
  Fab
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Assignment as AssignmentIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Report as ReportIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Route as RouteIcon,
  Favorite as FavoriteIcon,
  LocalHospital as LocalHospitalIcon,
  Public as PublicIcon,
  NotificationsActive as AlertsIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { UserRole } from '../../types';
import NotificationCenter from '../notifications/NotificationCenter';
import OfflineStatus from '../offline/OfflineStatus';
import OfflineStatusBar from '../OfflineStatusBar';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles?: UserRole[];
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems: NavItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Service Users', icon: <PeopleIcon />, path: '/service-users', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CAREGIVER] },
    { text: 'Calendar', icon: <EventNoteIcon />, path: '/calendar' },
    { text: 'Care Plans', icon: <AssignmentIcon />, path: '/care-plans', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CAREGIVER] },
    { text: 'Care Allocation', icon: <BarChartIcon />, path: '/care-allocation', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { text: 'Staff Management', icon: <PeopleIcon />, path: '/staff-management', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { text: 'Messages', icon: <MessageIcon />, path: '/messages' },
    { text: 'Incident Reporting', icon: <ReportIcon />, path: '/incident-reporting' },
    { text: 'Route Optimizer', icon: <RouteIcon />, path: '/route-optimizer', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CAREGIVER] },
    { text: 'Predictive Health', icon: <HealthAndSafetyIcon />, path: '/predictive-health', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { text: 'Healthcare Integration', icon: <LocalHospitalIcon />, path: '/healthcare-integration', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { text: 'Community Resources', icon: <PublicIcon />, path: '/community-resources' },
    { text: 'Family Portal', icon: <FavoriteIcon />, path: '/family-portal', roles: [UserRole.FAMILY, UserRole.SERVICE_USER] },
    { text: 'Alerts', icon: <AlertsIcon />, path: '/alerts' },
    { text: 'Reports', icon: <BarChartIcon />, path: '/reports', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true; // Items without roles are visible to everyone
    return user && item.roles.includes(user.role);
  });

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          CareUnity
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // State to track scroll position
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Add scroll event listener
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            {filteredNavItems.find(item => item.path === location.pathname)?.text || 'CareUnity'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Search button for mobile */}
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={() => navigate('/search')}
                sx={{ mr: 1 }}
              >
                <SearchIcon />
              </IconButton>
            )}

            <OfflineStatus />
            <NotificationCenter />

            <Tooltip title="Profile">
              <IconButton
                size={isMobile ? "medium" : "large"}
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar
                  alt={user?.fullName}
                  src={user?.profileImage}
                  sx={{
                    width: isMobile ? 28 : 32,
                    height: isMobile ? 28 : 32
                  }}
                >
                  {user?.fullName?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { handleProfileMenuClose(); handleLogout(); }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {isMobile ? (
          <SwipeableDrawer
            variant="temporary"
            open={mobileOpen}
            onOpen={() => setMobileOpen(true)}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </SwipeableDrawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          overflowX: 'hidden' // Prevent horizontal scrolling on mobile
        }}
      >
        <Toolbar />
        {children}

        {/* Scroll to top button */}
        {showScrollTop && (
          <Fab
            color="primary"
            size="small"
            aria-label="scroll back to top"
            onClick={scrollToTop}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000
            }}
          >
            <KeyboardArrowUpIcon />
          </Fab>
        )}

        {/* Offline status bar */}
        <OfflineStatusBar onSyncComplete={() => {
          // Refresh data after sync
          window.dispatchEvent(new CustomEvent('sync-completed'));
        }} />
      </Box>
    </Box>
  );
};

export default Layout;
