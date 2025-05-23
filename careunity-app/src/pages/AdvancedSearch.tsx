import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Description as DocumentIcon,
  Medication as MedicationIcon,
  Note as NoteIcon,
  DateRange as DateRangeIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';

// Search result types
enum ResultType {
  SERVICE_USER = 'service_user',
  APPOINTMENT = 'appointment',
  CARE_PLAN = 'care_plan',
  DOCUMENT = 'document',
  MEDICATION = 'medication',
  NOTE = 'note'
}

// Search result interface
interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  url: string;
  serviceUserId?: number;
  serviceUserName?: string;
  status?: string;
  author?: string;
  relevanceScore: number;
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
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
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

const AdvancedSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [resultType, setResultType] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);
  const [serviceUser, setServiceUser] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Mock search results
  const [searchResults, setSearchResults] = useState<SearchResult[]>([
    {
      id: '1',
      type: ResultType.SERVICE_USER,
      title: 'Alice Johnson',
      description: 'Service user profile',
      tags: ['active'],
      url: '/service-users/1',
      relevanceScore: 95
    },
    {
      id: '2',
      type: ResultType.APPOINTMENT,
      title: 'Personal Care Visit',
      description: 'Scheduled appointment for personal care',
      date: '2023-05-15T10:00:00',
      serviceUserId: 1,
      serviceUserName: 'Alice Johnson',
      status: 'scheduled',
      url: '/appointments/2',
      relevanceScore: 90
    },
    {
      id: '3',
      type: ResultType.CARE_PLAN,
      title: 'Mobility Support Plan',
      description: 'Care plan focusing on mobility improvement',
      date: '2023-04-01T00:00:00',
      serviceUserId: 1,
      serviceUserName: 'Alice Johnson',
      status: 'active',
      url: '/care-plans/3',
      relevanceScore: 85
    },
    {
      id: '4',
      type: ResultType.DOCUMENT,
      title: 'Medical Assessment Report.pdf',
      description: 'Latest medical assessment document',
      date: '2023-04-15T00:00:00',
      serviceUserId: 1,
      serviceUserName: 'Alice Johnson',
      author: 'Dr. Smith',
      url: '/documents/4',
      relevanceScore: 80
    },
    {
      id: '5',
      type: ResultType.MEDICATION,
      title: 'Lisinopril 10mg',
      description: 'Daily medication for blood pressure',
      serviceUserId: 1,
      serviceUserName: 'Alice Johnson',
      status: 'active',
      url: '/medications/5',
      relevanceScore: 75
    },
    {
      id: '6',
      type: ResultType.NOTE,
      title: 'Progress Note',
      description: 'Note regarding progress with mobility exercises',
      date: '2023-05-01T14:30:00',
      serviceUserId: 1,
      serviceUserName: 'Alice Johnson',
      author: 'John Smith',
      url: '/notes/6',
      relevanceScore: 70
    }
  ]);

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleResultTypeChange = (event: any) => {
    setResultType(event.target.value);
  };

  const handleServiceUserChange = (event: any) => {
    setServiceUser(event.target.value);
  };

  const handleSortByChange = (event: any) => {
    setSortBy(event.target.value);
  };

  const handleSortDirectionToggle = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleClearFilters = () => {
    setResultType('all');
    setDateFrom(null);
    setDateTo(null);
    setServiceUser('');
    setSortBy('relevance');
    setSortDirection('desc');
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
      
      // In a real app, this would call an API to search
      // For demo purposes, we'll just use the mock data
    }, 1000);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
  };

  const getFilteredResults = () => {
    let filtered = [...searchResults];
    
    // Filter by type
    if (resultType !== 'all') {
      filtered = filtered.filter(result => result.type === resultType);
    }
    
    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(result => 
        !result.date || new Date(result.date) >= dateFrom.toDate()
      );
    }
    
    if (dateTo) {
      filtered = filtered.filter(result => 
        !result.date || new Date(result.date) <= dateTo.toDate()
      );
    }
    
    // Filter by service user
    if (serviceUser) {
      filtered = filtered.filter(result => 
        result.serviceUserId === parseInt(serviceUser)
      );
    }
    
    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'relevance':
          comparison = b.relevanceScore - a.relevanceScore;
          break;
        case 'date':
          if (a.date && b.date) {
            comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          } else if (a.date) {
            comparison = -1;
          } else if (b.date) {
            comparison = 1;
          }
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = b.relevanceScore - a.relevanceScore;
      }
      
      return sortDirection === 'asc' ? -comparison : comparison;
    });
    
    return filtered;
  };

  const getResultIcon = (type: ResultType) => {
    switch (type) {
      case ResultType.SERVICE_USER:
        return <PersonIcon />;
      case ResultType.APPOINTMENT:
        return <EventIcon />;
      case ResultType.CARE_PLAN:
        return <AssignmentIcon />;
      case ResultType.DOCUMENT:
        return <DocumentIcon />;
      case ResultType.MEDICATION:
        return <MedicationIcon />;
      case ResultType.NOTE:
        return <NoteIcon />;
      default:
        return <SearchIcon />;
    }
  };

  const getResultTypeColor = (type: ResultType) => {
    switch (type) {
      case ResultType.SERVICE_USER:
        return 'primary';
      case ResultType.APPOINTMENT:
        return 'secondary';
      case ResultType.CARE_PLAN:
        return 'success';
      case ResultType.DOCUMENT:
        return 'info';
      case ResultType.MEDICATION:
        return 'warning';
      case ResultType.NOTE:
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const formatResultType = (type: ResultType) => {
    switch (type) {
      case ResultType.SERVICE_USER:
        return 'Service User';
      case ResultType.APPOINTMENT:
        return 'Appointment';
      case ResultType.CARE_PLAN:
        return 'Care Plan';
      case ResultType.DOCUMENT:
        return 'Document';
      case ResultType.MEDICATION:
        return 'Medication';
      case ResultType.NOTE:
        return 'Note';
      default:
        return type;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Advanced Search
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              placeholder="Search for service users, appointments, care plans, documents, medications, notes..."
              value={searchTerm}
              onChange={handleSearchTermChange}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm('')} edge="end">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={!searchTerm.trim() || isSearching}
              startIcon={isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Filters</Typography>
                <Button
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Result Type</InputLabel>
                <Select
                  value={resultType}
                  label="Result Type"
                  onChange={handleResultTypeChange}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value={ResultType.SERVICE_USER}>Service Users</MenuItem>
                  <MenuItem value={ResultType.APPOINTMENT}>Appointments</MenuItem>
                  <MenuItem value={ResultType.CARE_PLAN}>Care Plans</MenuItem>
                  <MenuItem value={ResultType.DOCUMENT}>Documents</MenuItem>
                  <MenuItem value={ResultType.MEDICATION}>Medications</MenuItem>
                  <MenuItem value={ResultType.NOTE}>Notes</MenuItem>
                </Select>
              </FormControl>
              
              <Typography variant="subtitle2" gutterBottom>
                Date Range
              </Typography>
              
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ mb: 2 }}>
                  <DatePicker
                    label="From"
                    value={dateFrom}
                    onChange={(newValue) => setDateFrom(newValue)}
                    slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: 1 } } }}
                  />
                  
                  <DatePicker
                    label="To"
                    value={dateTo}
                    onChange={(newValue) => setDateTo(newValue)}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Box>
              </LocalizationProvider>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Service User</InputLabel>
                <Select
                  value={serviceUser}
                  label="Service User"
                  onChange={handleServiceUserChange}
                >
                  <MenuItem value="">All Service Users</MenuItem>
                  <MenuItem value="1">Alice Johnson</MenuItem>
                  <MenuItem value="2">Bob Smith</MenuItem>
                  <MenuItem value="3">Carol Williams</MenuItem>
                </Select>
              </FormControl>
              
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Sort
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormControl fullWidth sx={{ mr: 1 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={handleSortByChange}
                  >
                    <MenuItem value="relevance">Relevance</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                  </Select>
                </FormControl>
                
                <Tooltip title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}>
                  <IconButton onClick={handleSortDirectionToggle}>
                    {sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          {!hasSearched ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <SearchIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Start searching
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Enter your search terms and use the filters to find what you're looking for.
              </Typography>
            </Paper>
          ) : isSearching ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6">
                Searching...
              </Typography>
            </Paper>
          ) : getFilteredResults().length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <SearchIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No results found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search terms or filters.
              </Typography>
            </Paper>
          ) : (
            <Paper>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="search result tabs">
                  <Tab label={`All Results (${getFilteredResults().length})`} />
                  <Tab label={`Service Users (${getFilteredResults().filter(r => r.type === ResultType.SERVICE_USER).length})`} />
                  <Tab label={`Appointments (${getFilteredResults().filter(r => r.type === ResultType.APPOINTMENT).length})`} />
                  <Tab label={`Care Plans (${getFilteredResults().filter(r => r.type === ResultType.CARE_PLAN).length})`} />
                  <Tab label={`Documents (${getFilteredResults().filter(r => r.type === ResultType.DOCUMENT).length})`} />
                </Tabs>
              </Box>
              
              <TabPanel value={tabValue} index={0}>
                <List>
                  {getFilteredResults().map((result) => (
                    <React.Fragment key={result.id}>
                      <ListItemButton onClick={() => handleResultClick(result)}>
                        <ListItemIcon>
                          {getResultIcon(result.type)}
                        </ListItemIcon>
                        
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="subtitle1">
                                {result.title}
                              </Typography>
                              <Chip 
                                label={formatResultType(result.type)} 
                                size="small" 
                                color={getResultTypeColor(result.type) as any}
                                sx={{ ml: 1 }}
                              />
                              {result.status && (
                                <Chip 
                                  label={result.status} 
                                  size="small" 
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.primary">
                                {result.description}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 0.5 }}>
                                {result.serviceUserName && (
                                  <Typography variant="caption" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                                    <PersonIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                                    {result.serviceUserName}
                                  </Typography>
                                )}
                                
                                {result.date && (
                                  <Typography variant="caption" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                                    <DateRangeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                                    {formatDate(result.date)}
                                  </Typography>
                                )}
                                
                                {result.author && (
                                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                                    By: {result.author}
                                  </Typography>
                                )}
                              </Box>
                              
                              {result.tags && result.tags.length > 0 && (
                                <Box sx={{ mt: 0.5 }}>
                                  {result.tags.map((tag, index) => (
                                    <Chip
                                      key={index}
                                      label={tag}
                                      size="small"
                                      sx={{ mr: 0.5, mb: 0.5 }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <List>
                  {getFilteredResults()
                    .filter(result => result.type === ResultType.SERVICE_USER)
                    .map((result) => (
                      <React.Fragment key={result.id}>
                        <ListItemButton onClick={() => handleResultClick(result)}>
                          <ListItemIcon>
                            <PersonIcon />
                          </ListItemIcon>
                          
                          <ListItemText
                            primary={result.title}
                            secondary={result.description}
                          />
                        </ListItemButton>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                </List>
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <List>
                  {getFilteredResults()
                    .filter(result => result.type === ResultType.APPOINTMENT)
                    .map((result) => (
                      <React.Fragment key={result.id}>
                        <ListItemButton onClick={() => handleResultClick(result)}>
                          <ListItemIcon>
                            <EventIcon />
                          </ListItemIcon>
                          
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle1">
                                  {result.title}
                                </Typography>
                                {result.status && (
                                  <Chip 
                                    label={result.status} 
                                    size="small" 
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.primary">
                                  {result.description}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', mt: 0.5 }}>
                                  {result.serviceUserName && (
                                    <Typography variant="caption" sx={{ mr: 2 }}>
                                      Service User: {result.serviceUserName}
                                    </Typography>
                                  )}
                                  
                                  {result.date && (
                                    <Typography variant="caption">
                                      Date: {formatDate(result.date)}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItemButton>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                </List>
              </TabPanel>
              
              <TabPanel value={tabValue} index={3}>
                <List>
                  {getFilteredResults()
                    .filter(result => result.type === ResultType.CARE_PLAN)
                    .map((result) => (
                      <React.Fragment key={result.id}>
                        <ListItemButton onClick={() => handleResultClick(result)}>
                          <ListItemIcon>
                            <AssignmentIcon />
                          </ListItemIcon>
                          
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle1">
                                  {result.title}
                                </Typography>
                                {result.status && (
                                  <Chip 
                                    label={result.status} 
                                    size="small" 
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.primary">
                                  {result.description}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', mt: 0.5 }}>
                                  {result.serviceUserName && (
                                    <Typography variant="caption" sx={{ mr: 2 }}>
                                      Service User: {result.serviceUserName}
                                    </Typography>
                                  )}
                                  
                                  {result.date && (
                                    <Typography variant="caption">
                                      Date: {formatDate(result.date)}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItemButton>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                </List>
              </TabPanel>
              
              <TabPanel value={tabValue} index={4}>
                <List>
                  {getFilteredResults()
                    .filter(result => result.type === ResultType.DOCUMENT)
                    .map((result) => (
                      <React.Fragment key={result.id}>
                        <ListItemButton onClick={() => handleResultClick(result)}>
                          <ListItemIcon>
                            <DocumentIcon />
                          </ListItemIcon>
                          
                          <ListItemText
                            primary={result.title}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.primary">
                                  {result.description}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', mt: 0.5 }}>
                                  {result.serviceUserName && (
                                    <Typography variant="caption" sx={{ mr: 2 }}>
                                      Service User: {result.serviceUserName}
                                    </Typography>
                                  )}
                                  
                                  {result.date && (
                                    <Typography variant="caption" sx={{ mr: 2 }}>
                                      Date: {formatDate(result.date)}
                                    </Typography>
                                  )}
                                  
                                  {result.author && (
                                    <Typography variant="caption">
                                      Author: {result.author}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItemButton>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                </List>
              </TabPanel>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedSearch;
