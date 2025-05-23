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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Tooltip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  CloudUpload as UploadIcon,
  FilterList as FilterIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/auth-context';

// Mock document types
enum DocumentType {
  PDF = 'pdf',
  IMAGE = 'image',
  DOCUMENT = 'document',
  SPREADSHEET = 'spreadsheet',
  OTHER = 'other'
}

// Mock document categories
enum DocumentCategory {
  CARE_PLAN = 'care_plan',
  MEDICAL = 'medical',
  ASSESSMENT = 'assessment',
  CONSENT = 'consent',
  REPORT = 'report',
  OTHER = 'other'
}

// Mock document interface
interface Document {
  id: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  tags: string[];
  serviceUserId?: number;
  description?: string;
  url: string;
}

const Documents: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Mock documents data
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Care Plan - Alice Johnson.pdf',
      type: DocumentType.PDF,
      category: DocumentCategory.CARE_PLAN,
      size: 2500000, // 2.5 MB
      uploadedBy: 'John Smith',
      uploadedAt: '2023-05-01T10:30:00',
      lastModified: '2023-05-01T10:30:00',
      tags: ['care plan', 'active'],
      serviceUserId: 1,
      description: 'Current care plan for Alice Johnson',
      url: '/documents/care-plan-alice.pdf'
    },
    {
      id: '2',
      name: 'Medical Assessment.docx',
      type: DocumentType.DOCUMENT,
      category: DocumentCategory.MEDICAL,
      size: 1800000, // 1.8 MB
      uploadedBy: 'Sarah Johnson',
      uploadedAt: '2023-04-15T14:20:00',
      lastModified: '2023-04-15T14:20:00',
      tags: ['assessment', 'medical'],
      serviceUserId: 1,
      description: 'Medical assessment report',
      url: '/documents/medical-assessment.docx'
    },
    {
      id: '3',
      name: 'Consent Form.pdf',
      type: DocumentType.PDF,
      category: DocumentCategory.CONSENT,
      size: 500000, // 0.5 MB
      uploadedBy: 'Michael Brown',
      uploadedAt: '2023-03-20T09:15:00',
      lastModified: '2023-03-20T09:15:00',
      tags: ['consent', 'signed'],
      serviceUserId: 1,
      description: 'Signed consent form for care services',
      url: '/documents/consent-form.pdf'
    },
    {
      id: '4',
      name: 'Progress Photos.jpg',
      type: DocumentType.IMAGE,
      category: DocumentCategory.ASSESSMENT,
      size: 3500000, // 3.5 MB
      uploadedBy: 'Emily Davis',
      uploadedAt: '2023-05-05T11:45:00',
      lastModified: '2023-05-05T11:45:00',
      tags: ['photos', 'progress'],
      serviceUserId: 1,
      description: 'Progress photos for mobility assessment',
      url: '/documents/progress-photos.jpg'
    },
    {
      id: '5',
      name: 'Monthly Report - April.xlsx',
      type: DocumentType.SPREADSHEET,
      category: DocumentCategory.REPORT,
      size: 1200000, // 1.2 MB
      uploadedBy: 'Robert Wilson',
      uploadedAt: '2023-05-02T16:30:00',
      lastModified: '2023-05-02T16:30:00',
      tags: ['report', 'monthly'],
      description: 'Monthly care report for April',
      url: '/documents/monthly-report-april.xlsx'
    }
  ]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event: any) => {
    setSelectedCategory(event.target.value);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, document: Document) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUploadDialogOpen = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedDocument(null);
  };

  const handleDeleteDocument = () => {
    if (selectedDocument) {
      setDocuments(documents.filter(doc => doc.id !== selectedDocument.id));
      handleDeleteDialogClose();
    }
  };

  const handleUploadDocument = () => {
    // Simulate upload progress
    setIsUploading(true);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            handleUploadDialogClose();
            // Add a mock document
            const newDocument: Document = {
              id: (documents.length + 1).toString(),
              name: 'New Uploaded Document.pdf',
              type: DocumentType.PDF,
              category: DocumentCategory.OTHER,
              size: 1500000, // 1.5 MB
              uploadedBy: user?.fullName || 'Current User',
              uploadedAt: new Date().toISOString(),
              lastModified: new Date().toISOString(),
              tags: ['new'],
              description: 'Newly uploaded document',
              url: '/documents/new-document.pdf'
            };
            setDocuments([newDocument, ...documents]);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleDownloadDocument = () => {
    // In a real app, this would trigger a download
    console.log('Downloading document:', selectedDocument?.name);
    handleMenuClose();
  };

  const handleViewDocument = () => {
    // In a real app, this would open the document viewer
    console.log('Viewing document:', selectedDocument?.name);
    handleMenuClose();
  };

  const handleShareDocument = () => {
    // In a real app, this would open a sharing dialog
    console.log('Sharing document:', selectedDocument?.name);
    handleMenuClose();
  };

  const getFilteredDocuments = () => {
    return documents.filter(doc => {
      // Apply category filter
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          doc.name.toLowerCase().includes(searchLower) ||
          doc.description?.toLowerCase().includes(searchLower) ||
          doc.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  };

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.PDF:
        return <PdfIcon color="error" />;
      case DocumentType.IMAGE:
        return <ImageIcon color="primary" />;
      case DocumentType.DOCUMENT:
        return <DocumentIcon color="info" />;
      case DocumentType.SPREADSHEET:
        return <FileIcon color="success" />;
      default:
        return <FileIcon />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Document Management
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search documents..."
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
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value={DocumentCategory.CARE_PLAN}>Care Plans</MenuItem>
                <MenuItem value={DocumentCategory.MEDICAL}>Medical</MenuItem>
                <MenuItem value={DocumentCategory.ASSESSMENT}>Assessments</MenuItem>
                <MenuItem value={DocumentCategory.CONSENT}>Consent Forms</MenuItem>
                <MenuItem value={DocumentCategory.REPORT}>Reports</MenuItem>
                <MenuItem value={DocumentCategory.OTHER}>Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={handleUploadDialogOpen}
            >
              Upload Document
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Documents ({getFilteredDocuments().length})
          </Typography>
          
          <Box>
            <Tooltip title="Filter options">
              <IconButton size="small" sx={{ mr: 1 }}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Sort options">
              <IconButton size="small">
                <SortIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Divider />
        
        {getFilteredDocuments().length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <FolderIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No documents found
            </Typography>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={handleUploadDialogOpen}
              sx={{ mt: 2 }}
            >
              Upload Document
            </Button>
          </Box>
        ) : (
          <List>
            {getFilteredDocuments().map((document) => (
              <React.Fragment key={document.id}>
                <ListItem>
                  <ListItemIcon>
                    {getDocumentIcon(document.type)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={document.name}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {formatFileSize(document.size)} • Uploaded by {document.uploadedBy} on {formatDate(document.uploadedAt)}
                        </Typography>
                        
                        <Typography variant="caption" display="block" color="text.secondary">
                          {document.description}
                        </Typography>
                        
                        <Box sx={{ mt: 0.5 }}>
                          {document.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={(e) => handleMenuOpen(e, document)}>
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Document Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDocument}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleDownloadDocument}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleShareDocument}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleDeleteDialogOpen}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleUploadDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select a file to upload. Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG.
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ mt: 1, p: 2, border: '1px dashed' }}
            >
              Choose File or Drag & Drop
              <input type="file" hidden />
            </Button>
          </Box>
          
          {isUploading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Uploading: {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Document Name"
                fullWidth
                variant="outlined"
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                variant="outlined"
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select label="Category">
                  <MenuItem value={DocumentCategory.CARE_PLAN}>Care Plan</MenuItem>
                  <MenuItem value={DocumentCategory.MEDICAL}>Medical</MenuItem>
                  <MenuItem value={DocumentCategory.ASSESSMENT}>Assessment</MenuItem>
                  <MenuItem value={DocumentCategory.CONSENT}>Consent Form</MenuItem>
                  <MenuItem value={DocumentCategory.REPORT}>Report</MenuItem>
                  <MenuItem value={DocumentCategory.OTHER}>Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Related Service User</InputLabel>
                <Select label="Related Service User">
                  <MenuItem value={1}>Alice Johnson</MenuItem>
                  <MenuItem value={2}>Bob Smith</MenuItem>
                  <MenuItem value={3}>Carol Williams</MenuItem>
                  <MenuItem value={0}>None</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Tags (comma separated)"
                fullWidth
                variant="outlined"
                margin="normal"
                placeholder="e.g. care plan, assessment, important"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUploadDocument}
            disabled={isUploading}
          >
            Upload
          </Button>
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
            Are you sure you want to delete the document "{selectedDocument?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteDocument} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Documents;
