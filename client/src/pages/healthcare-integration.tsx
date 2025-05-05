import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Code,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  GitMerge,
  Globe,
  HelpCircle,
  History,
  Info,
  List,
  Loader2,
  Lock,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Shuffle,
  Terminal,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';

// Sample integrated patient resources
const patientResources = [
  { 
    id: 'p-001', 
    resourceType: 'Patient', 
    name: 'John Smith', 
    nhsNumber: '9000000001', 
    dateOfBirth: '1945-06-12', 
    gender: 'male',
    status: 'active',
    lastUpdated: '2025-04-23T14:35:22Z',
    source: 'NHS',
    linked: true
  },
  { 
    id: 'p-002', 
    resourceType: 'Patient', 
    name: 'Mary Johnson', 
    nhsNumber: '9000000002', 
    dateOfBirth: '1938-11-28', 
    gender: 'female',
    status: 'active',
    lastUpdated: '2025-04-22T09:15:43Z',
    source: 'NHS',
    linked: true
  },
  { 
    id: 'p-003', 
    resourceType: 'Patient', 
    name: 'Robert Davis', 
    nhsNumber: '9000000003', 
    dateOfBirth: '1952-03-07', 
    gender: 'male',
    status: 'active',
    lastUpdated: '2025-04-21T11:42:05Z',
    source: 'NHS',
    linked: true
  },
  { 
    id: 'p-004', 
    resourceType: 'Patient', 
    name: 'Patricia Miller', 
    nhsNumber: '9000000004', 
    dateOfBirth: '1941-09-15', 
    gender: 'female',
    status: 'active',
    lastUpdated: '2025-04-20T16:30:11Z',
    source: 'NHS',
    linked: false
  },
  { 
    id: 'p-005', 
    resourceType: 'Patient', 
    name: 'James Wilson', 
    nhsNumber: '9000000005', 
    dateOfBirth: '1949-01-22', 
    gender: 'male',
    status: 'active',
    lastUpdated: '2025-04-19T10:05:33Z',
    source: 'NHS',
    linked: false
  }
];

// Sample conditions for the patients
const conditionResources = [
  {
    id: 'c-001',
    resourceType: 'Condition',
    patientId: 'p-001',
    patientName: 'John Smith',
    code: 'I10',
    display: 'Essential (primary) hypertension',
    recordedDate: '2024-11-15',
    clinicalStatus: 'active',
    verificationStatus: 'confirmed',
    source: 'GP Practice',
    lastUpdated: '2025-03-12T09:22:11Z'
  },
  {
    id: 'c-002',
    resourceType: 'Condition',
    patientId: 'p-001',
    patientName: 'John Smith',
    code: 'E11.9',
    display: 'Type 2 diabetes mellitus without complications',
    recordedDate: '2023-06-20',
    clinicalStatus: 'active',
    verificationStatus: 'confirmed',
    source: 'GP Practice',
    lastUpdated: '2025-02-18T11:45:33Z'
  },
  {
    id: 'c-003',
    resourceType: 'Condition',
    patientId: 'p-002',
    patientName: 'Mary Johnson',
    code: 'M17.9',
    display: 'Osteoarthritis of knee',
    recordedDate: '2022-03-10',
    clinicalStatus: 'active',
    verificationStatus: 'confirmed',
    source: 'Hospital',
    lastUpdated: '2025-04-05T14:22:05Z'
  },
  {
    id: 'c-004',
    resourceType: 'Condition',
    patientId: 'p-003',
    patientName: 'Robert Davis',
    code: 'I25.1',
    display: 'Atherosclerotic heart disease',
    recordedDate: '2024-01-05',
    clinicalStatus: 'active',
    verificationStatus: 'confirmed',
    source: 'Hospital',
    lastUpdated: '2025-01-05T16:33:42Z'
  },
  {
    id: 'c-005',
    resourceType: 'Condition',
    patientId: 'p-003',
    patientName: 'Robert Davis',
    code: 'J44.9',
    display: 'Chronic obstructive pulmonary disease',
    recordedDate: '2023-11-12',
    clinicalStatus: 'active',
    verificationStatus: 'confirmed',
    source: 'GP Practice',
    lastUpdated: '2025-01-12T10:15:22Z'
  }
];

// Sample medications for the patients
const medicationResources = [
  {
    id: 'm-001',
    resourceType: 'MedicationStatement',
    patientId: 'p-001',
    patientName: 'John Smith',
    medication: 'Amlodipine 5mg tablets',
    dosage: '1 tablet once daily',
    status: 'active',
    dateAsserted: '2025-01-10',
    source: 'GP Practice',
    lastUpdated: '2025-04-10T08:22:15Z'
  },
  {
    id: 'm-002',
    resourceType: 'MedicationStatement',
    patientId: 'p-001',
    patientName: 'John Smith',
    medication: 'Metformin 500mg tablets',
    dosage: '1 tablet twice daily',
    status: 'active',
    dateAsserted: '2025-01-10',
    source: 'GP Practice',
    lastUpdated: '2025-04-10T08:23:30Z'
  },
  {
    id: 'm-003',
    resourceType: 'MedicationStatement',
    patientId: 'p-002',
    patientName: 'Mary Johnson',
    medication: 'Paracetamol 500mg tablets',
    dosage: '2 tablets up to four times a day when required',
    status: 'active',
    dateAsserted: '2025-02-15',
    source: 'GP Practice',
    lastUpdated: '2025-04-15T09:45:22Z'
  },
  {
    id: 'm-004',
    resourceType: 'MedicationStatement',
    patientId: 'p-003',
    patientName: 'Robert Davis',
    medication: 'Salbutamol 100mcg inhaler',
    dosage: '2 puffs up to four times a day when required',
    status: 'active',
    dateAsserted: '2025-01-20',
    source: 'GP Practice',
    lastUpdated: '2025-04-01T10:12:45Z'
  },
  {
    id: 'm-005',
    resourceType: 'MedicationStatement',
    patientId: 'p-003',
    patientName: 'Robert Davis',
    medication: 'Aspirin 75mg tablets',
    dosage: '1 tablet once daily',
    status: 'active',
    dateAsserted: '2025-01-20',
    source: 'GP Practice',
    lastUpdated: '2025-04-01T10:14:22Z'
  }
];

// Sample allergies for the patients
const allergyResources = [
  {
    id: 'a-001',
    resourceType: 'AllergyIntolerance',
    patientId: 'p-001',
    patientName: 'John Smith',
    substance: 'Penicillin',
    manifestation: 'Rash, difficulty breathing',
    severity: 'severe',
    criticality: 'high',
    status: 'active',
    recordedDate: '2020-05-15',
    source: 'Hospital',
    lastUpdated: '2025-03-05T11:22:33Z'
  },
  {
    id: 'a-002',
    resourceType: 'AllergyIntolerance',
    patientId: 'p-002',
    patientName: 'Mary Johnson',
    substance: 'Shellfish',
    manifestation: 'Hives, swelling',
    severity: 'moderate',
    criticality: 'low',
    status: 'active',
    recordedDate: '2019-11-22',
    source: 'GP Practice',
    lastUpdated: '2025-02-12T09:45:11Z'
  }
];

// Sample observations (measurements) for the patients
const observationResources = [
  {
    id: 'o-001',
    resourceType: 'Observation',
    patientId: 'p-001',
    patientName: 'John Smith',
    code: '8480-6',
    display: 'Systolic blood pressure',
    value: 142,
    unit: 'mmHg',
    effectiveDate: '2025-04-15',
    status: 'final',
    source: 'GP Practice',
    lastUpdated: '2025-04-15T10:30:22Z'
  },
  {
    id: 'o-002',
    resourceType: 'Observation',
    patientId: 'p-001',
    patientName: 'John Smith',
    code: '8462-4',
    display: 'Diastolic blood pressure',
    value: 88,
    unit: 'mmHg',
    effectiveDate: '2025-04-15',
    status: 'final',
    source: 'GP Practice',
    lastUpdated: '2025-04-15T10:30:22Z'
  },
  {
    id: 'o-003',
    resourceType: 'Observation',
    patientId: 'p-001',
    patientName: 'John Smith',
    code: '15074-8',
    display: 'Glucose [Moles/volume] in Blood',
    value: 7.2,
    unit: 'mmol/L',
    effectiveDate: '2025-04-15',
    status: 'final',
    source: 'GP Practice',
    lastUpdated: '2025-04-15T10:32:45Z'
  },
  {
    id: 'o-004',
    resourceType: 'Observation',
    patientId: 'p-003',
    patientName: 'Robert Davis',
    code: '8480-6',
    display: 'Systolic blood pressure',
    value: 135,
    unit: 'mmHg',
    effectiveDate: '2025-04-10',
    status: 'final',
    source: 'GP Practice',
    lastUpdated: '2025-04-10T09:15:33Z'
  },
  {
    id: 'o-005',
    resourceType: 'Observation',
    patientId: 'p-003',
    patientName: 'Robert Davis',
    code: '8462-4',
    display: 'Diastolic blood pressure',
    value: 82,
    unit: 'mmHg',
    effectiveDate: '2025-04-10',
    status: 'final',
    source: 'GP Practice', 
    lastUpdated: '2025-04-10T09:15:33Z'
  },
  {
    id: 'o-006',
    resourceType: 'Observation',
    patientId: 'p-002',
    patientName: 'Mary Johnson',
    code: '29463-7',
    display: 'Body weight',
    value: 68.5,
    unit: 'kg',
    effectiveDate: '2025-04-05',
    status: 'final',
    source: 'GP Practice',
    lastUpdated: '2025-04-05T11:22:44Z'
  }
];

// Sample data for integration status
const integrationStats = [
  { name: 'Connected Systems', value: 5 },
  { name: 'Active Patients', value: 150 },
  { name: 'Resources Synced', value: 1250 },
  { name: 'Data Transfer (MB)', value: 42 }
];

// Sample data for sync activity
const syncActivity = [
  { date: '2025-05-01', resourcesImported: 45, resourcesExported: 12 },
  { date: '2025-05-02', resourcesImported: 32, resourcesExported: 8 },
  { date: '2025-05-03', resourcesImported: 38, resourcesExported: 15 },
  { date: '2025-05-04', resourcesImported: 25, resourcesExported: 6 },
  { date: '2025-05-05', resourcesImported: 42, resourcesExported: 18 }
];

// Supported data types
const supportedDataTypes = [
  { id: 'patient', name: 'Patient Demographics', icon: <User className="h-4 w-4" />, importSupport: true, exportSupport: true },
  { id: 'condition', name: 'Conditions & Diagnoses', icon: <Activity className="h-4 w-4" />, importSupport: true, exportSupport: true },
  { id: 'medication', name: 'Medications', icon: <FileText className="h-4 w-4" />, importSupport: true, exportSupport: true },
  { id: 'allergy', name: 'Allergies & Intolerances', icon: <AlertTriangle className="h-4 w-4" />, importSupport: true, exportSupport: true },
  { id: 'observation', name: 'Observations & Vital Signs', icon: <Activity className="h-4 w-4" />, importSupport: true, exportSupport: true },
  { id: 'immunization', name: 'Immunizations', icon: <Shield className="h-4 w-4" />, importSupport: true, exportSupport: false },
  { id: 'procedure', name: 'Procedures', icon: <List className="h-4 w-4" />, importSupport: true, exportSupport: false },
  { id: 'careplan', name: 'Care Plans', icon: <FileText className="h-4 w-4" />, importSupport: false, exportSupport: true },
  { id: 'appointment', name: 'Appointments', icon: <Clock className="h-4 w-4" />, importSupport: false, exportSupport: true }
];

// Connected systems
const connectedSystems = [
  { 
    id: 'nhs-spine', 
    name: 'NHS Spine', 
    type: 'National Health System', 
    status: 'active', 
    lastSync: '2025-05-05T08:30:22Z',
    resourcesAvailable: 3250,
    dataTypes: ['Patient', 'Condition', 'MedicationStatement', 'AllergyIntolerance', 'Observation', 'Procedure']
  },
  { 
    id: 'emis-web', 
    name: 'EMIS Web', 
    type: 'GP Clinical System', 
    status: 'active', 
    lastSync: '2025-05-05T07:15:11Z',
    resourcesAvailable: 1850,
    dataTypes: ['Patient', 'Condition', 'MedicationStatement', 'AllergyIntolerance', 'Observation', 'Immunization']
  },
  { 
    id: 'systmone', 
    name: 'SystmOne', 
    type: 'GP Clinical System', 
    status: 'active', 
    lastSync: '2025-05-05T06:45:33Z',
    resourcesAvailable: 2100,
    dataTypes: ['Patient', 'Condition', 'MedicationStatement', 'AllergyIntolerance', 'Observation']
  },
  { 
    id: 'hospital-pms', 
    name: 'Local Hospital PMS', 
    type: 'Hospital System', 
    status: 'active', 
    lastSync: '2025-05-04T23:10:45Z',
    resourcesAvailable: 1450,
    dataTypes: ['Patient', 'Encounter', 'Procedure', 'Observation']
  },
  { 
    id: 'community-pharmacy', 
    name: 'Community Pharmacy System', 
    type: 'Pharmacy System', 
    status: 'inactive', 
    lastSync: '2025-05-03T15:22:18Z',
    resourcesAvailable: 750,
    dataTypes: ['Patient', 'MedicationRequest', 'MedicationDispense']
  }
];

// Sample data for error logs
const errorLogs = [
  { 
    id: 'err-001', 
    timestamp: '2025-05-05T07:22:15Z', 
    source: 'NHS Spine', 
    resourceType: 'Patient', 
    resourceId: 'p-008', 
    message: 'Validation error: Missing mandatory field "identifier"', 
    severity: 'error',
    status: 'unresolved'
  },
  { 
    id: 'err-002', 
    timestamp: '2025-05-05T06:45:33Z', 
    source: 'EMIS Web', 
    resourceType: 'Observation', 
    resourceId: 'o-112', 
    message: 'Invalid code system: Code not found in SNOMED CT', 
    severity: 'warning',
    status: 'unresolved'
  },
  { 
    id: 'err-003', 
    timestamp: '2025-05-04T22:15:08Z', 
    source: 'SystmOne', 
    resourceType: 'MedicationStatement', 
    resourceId: 'm-089', 
    message: 'Reference resolution failed: Unable to find referenced Patient resource', 
    severity: 'error',
    status: 'resolved'
  },
  { 
    id: 'err-004', 
    timestamp: '2025-05-04T15:33:21Z', 
    source: 'Local Hospital PMS', 
    resourceType: 'Condition', 
    resourceId: 'c-056', 
    message: 'Data mapping error: Unable to map local code to standard terminology', 
    severity: 'warning',
    status: 'unresolved'
  },
  { 
    id: 'err-005', 
    timestamp: '2025-05-03T12:11:45Z', 
    source: 'NHS Spine', 
    resourceType: 'Patient', 
    resourceId: 'p-022', 
    message: 'Authentication failure: API token expired', 
    severity: 'error',
    status: 'resolved'
  }
];

// FHIR resources by type chart data
const resourcesByTypeData = [
  { name: 'Patient', value: 180 },
  { name: 'Condition', value: 320 },
  { name: 'Medication', value: 245 },
  { name: 'Allergy', value: 95 },
  { name: 'Observation', value: 410 }
];

// COLORS
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function HealthcareIntegration() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceType, setResourceType] = useState('all');
  const [showClinicalRecordsDialog, setShowClinicalRecordsDialog] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [dataTypes, setDataTypes] = useState<string[]>(['patient', 'condition', 'medication', 'allergy', 'observation']);
  const [fhirQuery, setFhirQuery] = useState('');
  const [showFhirQueryDialog, setShowFhirQueryDialog] = useState(false);
  
  // Filter patient resources based on search term
  const filteredPatients = patientResources.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.nhsNumber.includes(searchTerm)
  );
  
  // Get all resources for a specific patient
  const getPatientResources = (patientId: string) => {
    const conditions = conditionResources.filter(resource => resource.patientId === patientId);
    const medications = medicationResources.filter(resource => resource.patientId === patientId);
    const allergies = allergyResources.filter(resource => resource.patientId === patientId);
    const observations = observationResources.filter(resource => resource.patientId === patientId);
    
    return {
      conditions,
      medications,
      allergies,
      observations
    };
  };
  
  // Function to start a sync operation
  const startSync = () => {
    setSyncInProgress(true);
    setSyncProgress(0);
    
    // Simulate sync progress
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSyncInProgress(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };
  
  // Function to toggle selection of resources for import/export
  const toggleResourceSelection = (resourceId: string) => {
    if (selectedResources.includes(resourceId)) {
      setSelectedResources(selectedResources.filter(id => id !== resourceId));
    } else {
      setSelectedResources([...selectedResources, resourceId]);
    }
  };
  
  // Function to toggle data types for import/export
  const toggleDataType = (dataTypeId: string) => {
    if (dataTypes.includes(dataTypeId)) {
      setDataTypes(dataTypes.filter(id => id !== dataTypeId));
    } else {
      setDataTypes([...dataTypes, dataTypeId]);
    }
  };
  
  // Generate sample FHIR query
  const generateSampleQuery = () => {
    const sampleQueries = [
      'GET /Patient?_id=p-001',
      'GET /Condition?patient=p-001&clinical-status=active',
      'GET /MedicationStatement?subject=p-002',
      'GET /Observation?code=8480-6&date=gt2025-01-01',
      'GET /AllergyIntolerance?patient=p-003&criticality=high'
    ];
    
    // Choose a random sample query
    const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
    setFhirQuery(randomQuery);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Healthcare System Integration</h1>
          <p className="text-muted-foreground">Integrate with healthcare systems using HL7 FHIR standards</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowImportDialog(true)}>
            <Download className="h-4 w-4" />
            <span>Import Data</span>
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setShowExportDialog(true)}>
            <Upload className="h-4 w-4" />
            <span>Export Data</span>
          </Button>
          <Button className="gap-2" onClick={startSync} disabled={syncInProgress}>
            {syncInProgress ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Sync Now</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {syncInProgress && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Synchronizing with healthcare systems</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} />
              <div className="text-xs text-muted-foreground mt-1">
                Fetching updated health records from connected systems...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Clinical Resources</TabsTrigger>
          <TabsTrigger value="integration">Integration Status</TabsTrigger>
          <TabsTrigger value="systems">Connected Systems</TabsTrigger>
          <TabsTrigger value="api">FHIR API</TabsTrigger>
        </TabsList>

        {/* CLINICAL RESOURCES TAB */}
        <TabsContent value="resources" className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Clinical Resources Card */}
            <Card className="flex-1">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Integrated Clinical Resources</CardTitle>
                    <CardDescription>
                      Healthcare data linked from external systems
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search by name or NHS number"
                        className="pl-8 w-full md:w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select
                      value={resourceType}
                      onValueChange={setResourceType}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Resource Types</SelectItem>
                        <SelectItem value="patient">Patient Demographics</SelectItem>
                        <SelectItem value="condition">Conditions</SelectItem>
                        <SelectItem value="medication">Medications</SelectItem>
                        <SelectItem value="allergy">Allergies</SelectItem>
                        <SelectItem value="observation">Observations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {/* Patient Resources */}
                    {(resourceType === 'all' || resourceType === 'patient') && (
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <User className="h-4 w-4 mr-2 text-primary" />
                          Patient Demographics
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>NHS Number</TableHead>
                              <TableHead>Date of Birth</TableHead>
                              <TableHead>Gender</TableHead>
                              <TableHead>Source</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredPatients.map(patient => (
                              <TableRow key={patient.id} className={patient.linked ? '' : 'bg-gray-50'}>
                                <TableCell className="font-medium">{patient.name}</TableCell>
                                <TableCell>{patient.nhsNumber}</TableCell>
                                <TableCell>{patient.dateOfBirth}</TableCell>
                                <TableCell>{patient.gender}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    {patient.source}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => {
                                        setSelectedPatient(patient.id);
                                        setShowClinicalRecordsDialog(true);
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            
                            {filteredPatients.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                  No patient resources found matching your search criteria
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    
                    {/* Condition Resources - only show if a patient is selected or we're showing all */}
                    {(resourceType === 'all' || resourceType === 'condition') && (
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <Activity className="h-4 w-4 mr-2 text-primary" />
                          Conditions & Diagnoses
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Patient</TableHead>
                              <TableHead>Condition</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Recorded Date</TableHead>
                              <TableHead>Source</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {conditionResources
                              .filter(condition => 
                                searchTerm === '' || 
                                patientResources.some(p => 
                                  p.id === condition.patientId && 
                                  (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  p.nhsNumber.includes(searchTerm))
                                )
                              )
                              .map(condition => (
                                <TableRow key={condition.id}>
                                  <TableCell>{condition.patientName}</TableCell>
                                  <TableCell className="font-medium">
                                    <div>
                                      <div>{condition.display}</div>
                                      <div className="text-xs text-gray-500">Code: {condition.code}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      className={
                                        condition.clinicalStatus === 'active' 
                                          ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                      }
                                    >
                                      {condition.clinicalStatus}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{condition.recordedDate}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                      {condition.source}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button variant="ghost" size="icon">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            
                            {conditionResources.filter(condition => 
                              searchTerm === '' || 
                              patientResources.some(p => 
                                p.id === condition.patientId && 
                                (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                p.nhsNumber.includes(searchTerm))
                              )
                            ).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                  No condition resources found matching your criteria
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    
                    {/* Medication Resources - only show if we're on the medications tab or showing all */}
                    {(resourceType === 'all' || resourceType === 'medication') && (
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          Medications
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Patient</TableHead>
                              <TableHead>Medication</TableHead>
                              <TableHead>Dosage</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Source</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {medicationResources
                              .filter(medication => 
                                searchTerm === '' || 
                                patientResources.some(p => 
                                  p.id === medication.patientId && 
                                  (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  p.nhsNumber.includes(searchTerm))
                                )
                              )
                              .map(medication => (
                                <TableRow key={medication.id}>
                                  <TableCell>{medication.patientName}</TableCell>
                                  <TableCell className="font-medium">{medication.medication}</TableCell>
                                  <TableCell>{medication.dosage}</TableCell>
                                  <TableCell>
                                    <Badge 
                                      className={
                                        medication.status === 'active' 
                                          ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                      }
                                    >
                                      {medication.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                      {medication.source}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button variant="ghost" size="icon">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            
                            {medicationResources.filter(medication => 
                              searchTerm === '' || 
                              patientResources.some(p => 
                                p.id === medication.patientId && 
                                (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                p.nhsNumber.includes(searchTerm))
                              )
                            ).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                  No medication resources found matching your criteria
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    
                    {/* More resource types would follow similar patterns */}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Resources by Type Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Resources by Type</CardTitle>
              <CardDescription>
                Distribution of integrated healthcare data by resource type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={resourcesByTypeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" name="Resources" fill="#8884d8">
                      {resourcesByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INTEGRATION STATUS TAB */}
        <TabsContent value="integration" className="space-y-4">
          {/* Integration Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrationStats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sync Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sync Activity</CardTitle>
              <CardDescription>
                Healthcare data synchronization activity over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={syncActivity}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="resourcesImported" 
                      name="Resources Imported" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="resourcesExported" 
                      name="Resources Exported" 
                      stroke="#82ca9d" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Supported Data Types */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Data Types</CardTitle>
              <CardDescription>
                Healthcare data types supported for integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Type</TableHead>
                    <TableHead>Import</TableHead>
                    <TableHead>Export</TableHead>
                    <TableHead>FHIR Resource</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supportedDataTypes.map(dataType => (
                    <TableRow key={dataType.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="mr-2">{dataType.icon}</div>
                          <span>{dataType.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {dataType.importSupport ? (
                          <Badge className="bg-green-100 text-green-800">
                            Supported
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100">
                            Not Supported
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {dataType.exportSupport ? (
                          <Badge className="bg-green-100 text-green-800">
                            Supported
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100">
                            Not Supported
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs">
                          {dataType.id.charAt(0).toUpperCase() + dataType.id.slice(1)}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Error Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Error Logs</CardTitle>
              <CardDescription>
                Errors and warnings from healthcare system integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorLogs.map(error => (
                    <TableRow key={error.id}>
                      <TableCell className="text-sm">{new Date(error.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{error.source}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          {error.resourceType}/{error.resourceId}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{error.message}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            error.severity === 'error' 
                              ? "bg-red-100 text-red-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {error.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            error.status === 'resolved' 
                              ? "bg-green-50 text-green-700" 
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {error.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONNECTED SYSTEMS TAB */}
        <TabsContent value="systems" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Connected Systems List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Connected Healthcare Systems</CardTitle>
                <CardDescription>
                  External systems connected via HL7 FHIR
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>System</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead>Resources</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connectedSystems.map(system => (
                      <TableRow key={system.id}>
                        <TableCell className="font-medium">{system.name}</TableCell>
                        <TableCell>{system.type}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              system.status === 'active' 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {system.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(system.lastSync).toLocaleString()}</TableCell>
                        <TableCell>{system.resourcesAvailable.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Sync Now</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Configuration</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Connect New System</span>
                </Button>
              </CardFooter>
            </Card>

            {/* System Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>System Integration Details</CardTitle>
                <CardDescription>
                  Configure FHIR integration endpoints and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fhir-base-url">FHIR Server Base URL</Label>
                  <Input id="fhir-base-url" value="https://fhir.nhs.uk/StructureDefinition/STU3" readOnly />
                  <p className="text-xs text-muted-foreground">
                    The base URL for the FHIR server that this application connects to
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fhir-version">FHIR Version</Label>
                  <Select defaultValue="r4">
                    <SelectTrigger id="fhir-version">
                      <SelectValue placeholder="Select FHIR version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dstu2">DSTU2</SelectItem>
                      <SelectItem value="stu3">STU3</SelectItem>
                      <SelectItem value="r4">R4</SelectItem>
                      <SelectItem value="r5">R5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sync-interval">Sync Interval</Label>
                  <Select defaultValue="hourly">
                    <SelectTrigger id="sync-interval">
                      <SelectValue placeholder="Select sync interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15min">Every 15 minutes</SelectItem>
                      <SelectItem value="30min">Every 30 minutes</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="auth-type">Authentication Method</Label>
                  <Select defaultValue="oauth2">
                    <SelectTrigger id="auth-type">
                      <SelectValue placeholder="Select authentication type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                      <SelectItem value="token">API Token</SelectItem>
                      <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="security-settings">
                    <AccordionTrigger className="text-sm">Security Settings</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="client-id">Client ID</Label>
                          <Input id="client-id" value="careconnect-pro-app-12345" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="client-secret">Client Secret</Label>
                          <Input id="client-secret" type="password" value="••••••••••••••••" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="token-endpoint">Token Endpoint</Label>
                          <Input id="token-endpoint" value="https://auth.nhs.uk/token" />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="pt-2">
                  <Button className="w-full">Save Configuration</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resources per System Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Resources per System</CardTitle>
              <CardDescription>
                Distribution of healthcare resources across connected systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={connectedSystems.filter(s => s.status === 'active').map(s => ({ name: s.name, value: s.resourcesAvailable }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {connectedSystems.filter(s => s.status === 'active').map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value.toLocaleString()} resources`, null]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FHIR API TAB */}
        <TabsContent value="api" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* FHIR API Explorer */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>FHIR API Explorer</CardTitle>
                <CardDescription>
                  Test and execute FHIR API requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="fhir-query">FHIR Query</Label>
                    <Input 
                      id="fhir-query" 
                      value={fhirQuery} 
                      onChange={(e) => setFhirQuery(e.target.value)}
                      placeholder="GET /Patient/p-001"
                    />
                  </div>
                  <Button onClick={generateSampleQuery}>Sample Query</Button>
                  <Button variant="outline" className="gap-2" onClick={() => setShowFhirQueryDialog(true)}>
                    <Code className="h-4 w-4" />
                    <span>Advanced</span>
                  </Button>
                </div>
                
                <div className="bg-gray-900 text-gray-100 p-4 rounded-md min-h-[300px]">
                  <div className="font-mono text-sm overflow-auto max-h-[300px] whitespace-pre">
                    // FHIR resource will appear here after executing a query
                    {fhirQuery && `
// Example response for ${fhirQuery}:
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 1,
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "p-001",
        "meta": {
          "versionId": "1",
          "lastUpdated": "2025-04-23T14:35:22Z"
        },
        "identifier": [
          {
            "system": "https://fhir.nhs.uk/Id/nhs-number",
            "value": "9000000001"
          }
        ],
        "name": [
          {
            "use": "official",
            "family": "Smith",
            "given": [
              "John"
            ]
          }
        ],
        "gender": "male",
        "birthDate": "1945-06-12",
        "address": [
          {
            "use": "home",
            "line": [
              "12 Oak Street"
            ],
            "city": "London",
            "postalCode": "W1T 7TS"
          }
        ]
      }
    }
  ]
}`}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Clear</Button>
                  <Button className="gap-2">
                    <Terminal className="h-4 w-4" />
                    <span>Execute Query</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* FHIR API Documentation */}
            <Card>
              <CardHeader>
                <CardTitle>FHIR API Documentation</CardTitle>
                <CardDescription>
                  Reference for supported FHIR resources and operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="patient">
                    <AccordionTrigger className="text-sm">Patient Resource</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>Endpoints:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                          <li>GET /Patient/[id]</li>
                          <li>GET /Patient?identifier=[system]|[value]</li>
                          <li>GET /Patient?name=[name]</li>
                          <li>POST /Patient</li>
                          <li>PUT /Patient/[id]</li>
                        </ul>
                        <div className="flex justify-end mt-1">
                          <Button variant="link" size="sm" className="gap-1">
                            <span>Full Spec</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="condition">
                    <AccordionTrigger className="text-sm">Condition Resource</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>Endpoints:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                          <li>GET /Condition/[id]</li>
                          <li>GET /Condition?patient=[id]</li>
                          <li>GET /Condition?clinical-status=[status]</li>
                          <li>POST /Condition</li>
                          <li>PUT /Condition/[id]</li>
                        </ul>
                        <div className="flex justify-end mt-1">
                          <Button variant="link" size="sm" className="gap-1">
                            <span>Full Spec</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="medication">
                    <AccordionTrigger className="text-sm">Medication Resources</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>Endpoints:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                          <li>GET /MedicationStatement/[id]</li>
                          <li>GET /MedicationStatement?patient=[id]</li>
                          <li>GET /MedicationStatement?status=[status]</li>
                          <li>POST /MedicationStatement</li>
                          <li>PUT /MedicationStatement/[id]</li>
                        </ul>
                        <div className="flex justify-end mt-1">
                          <Button variant="link" size="sm" className="gap-1">
                            <span>Full Spec</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="observation">
                    <AccordionTrigger className="text-sm">Observation Resource</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>Endpoints:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                          <li>GET /Observation/[id]</li>
                          <li>GET /Observation?patient=[id]</li>
                          <li>GET /Observation?code=[code]</li>
                          <li>POST /Observation</li>
                          <li>PUT /Observation/[id]</li>
                        </ul>
                        <div className="flex justify-end mt-1">
                          <Button variant="link" size="sm" className="gap-1">
                            <span>Full Spec</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mt-4">
                  <h4 className="text-sm font-medium flex items-center text-blue-700">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    FHIR Resources Help
                  </h4>
                  <p className="text-xs text-blue-600 mt-1">
                    Use these standards-based resources to exchange healthcare data with external systems.
                    All API endpoints support JSON and XML formats.
                  </p>
                  <div className="mt-2 flex items-center">
                    <Button variant="link" size="sm" className="text-blue-600 h-auto p-0 gap-1">
                      <span>FHIR Documentation</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FHIR Integration Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>FHIR Integration Benefits</CardTitle>
              <CardDescription>
                Advantages of using healthcare system integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-primary-100">
                      <GitMerge className="h-4 w-4 text-primary-700" />
                    </div>
                    <h3 className="font-medium">Interoperability</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Seamlessly exchange healthcare data between different systems using standardized FHIR resources and profiles, 
                    ensuring consistent data representation across the care continuum.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-primary-100">
                      <Lock className="h-4 w-4 text-primary-700" />
                    </div>
                    <h3 className="font-medium">Data Security</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Implement secure data exchange using OAuth 2.0 authentication, data encryption, and audit logging
                    to protect sensitive patient information while maintaining compliance with healthcare regulations.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-primary-100">
                      <Database className="h-4 w-4 text-primary-700" />
                    </div>
                    <h3 className="font-medium">Comprehensive Data</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Gain access to a complete view of patient health information from multiple sources,
                    enabling better care decisions, reduced documentation burdens, and improved care coordination.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Clinical Records Dialog */}
      <Dialog open={showClinicalRecordsDialog} onOpenChange={setShowClinicalRecordsDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {selectedPatient && patientResources.find(p => p.id === selectedPatient)?.name} - Clinical Records
            </DialogTitle>
            <DialogDescription>
              Integrated healthcare data from external systems
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[600px] p-1">
            {selectedPatient && (
              <div className="space-y-6">
                {/* Patient Demographics */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    Patient Demographics
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {(() => {
                      const patient = patientResources.find(p => p.id === selectedPatient);
                      return (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500">Full Name</div>
                            <div className="font-medium">{patient?.name}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">NHS Number</div>
                            <div className="font-medium">{patient?.nhsNumber}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Date of Birth</div>
                            <div className="font-medium">{patient?.dateOfBirth}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Gender</div>
                            <div className="font-medium">{patient?.gender}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Source</div>
                            <div>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {patient?.source}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Last Updated</div>
                            <div className="font-medium">{new Date(patient?.lastUpdated || '').toLocaleString()}</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Health Conditions */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-primary" />
                    Health Conditions
                  </h3>
                  
                  {(() => {
                    const patientResources = getPatientResources(selectedPatient);
                    return patientResources.conditions.length > 0 ? (
                      <div className="space-y-2">
                        {patientResources.conditions.map(condition => (
                          <div key={condition.id} className="border rounded-md p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{condition.display}</div>
                                <div className="text-xs text-gray-500">Code: {condition.code}</div>
                              </div>
                              <Badge 
                                className={
                                  condition.clinicalStatus === 'active' 
                                    ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                }
                              >
                                {condition.clinicalStatus}
                              </Badge>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                              <div>
                                <span className="text-gray-500">Recorded: </span>
                                {condition.recordedDate}
                              </div>
                              <div>
                                <span className="text-gray-500">Source: </span>
                                {condition.source}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm border rounded-md p-4 text-center bg-gray-50">
                        No condition records found for this patient
                      </div>
                    );
                  })()}
                </div>
                
                {/* Medications */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    Medications
                  </h3>
                  
                  {(() => {
                    const patientResources = getPatientResources(selectedPatient);
                    return patientResources.medications.length > 0 ? (
                      <div className="space-y-2">
                        {patientResources.medications.map(medication => (
                          <div key={medication.id} className="border rounded-md p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{medication.medication}</div>
                                <div className="text-sm">{medication.dosage}</div>
                              </div>
                              <Badge 
                                className={
                                  medication.status === 'active' 
                                    ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                }
                              >
                                {medication.status}
                              </Badge>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                              <div>
                                <span className="text-gray-500">Asserted: </span>
                                {medication.dateAsserted}
                              </div>
                              <div>
                                <span className="text-gray-500">Source: </span>
                                {medication.source}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm border rounded-md p-4 text-center bg-gray-50">
                        No medication records found for this patient
                      </div>
                    );
                  })()}
                </div>
                
                {/* Allergies */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-primary" />
                    Allergies & Intolerances
                  </h3>
                  
                  {(() => {
                    const patientResources = getPatientResources(selectedPatient);
                    return patientResources.allergies.length > 0 ? (
                      <div className="space-y-2">
                        {patientResources.allergies.map(allergy => (
                          <div key={allergy.id} className="border rounded-md p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{allergy.substance}</div>
                                <div className="text-sm">{allergy.manifestation}</div>
                              </div>
                              <Badge 
                                className={
                                  allergy.criticality === 'high' 
                                    ? "bg-red-100 text-red-800 hover:bg-red-200" 
                                    : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                }
                              >
                                {allergy.criticality} risk
                              </Badge>
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                              <div>
                                <span className="text-gray-500">Severity: </span>
                                {allergy.severity}
                              </div>
                              <div>
                                <span className="text-gray-500">Recorded: </span>
                                {allergy.recordedDate}
                              </div>
                              <div>
                                <span className="text-gray-500">Source: </span>
                                {allergy.source}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm border rounded-md p-4 text-center bg-gray-50">
                        No allergy records found for this patient
                      </div>
                    );
                  })()}
                </div>
                
                {/* Observations/Vital Signs */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-primary" />
                    Observations & Vital Signs
                  </h3>
                  
                  {(() => {
                    const patientResources = getPatientResources(selectedPatient);
                    return patientResources.observations.length > 0 ? (
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Observation</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Source</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {patientResources.observations.map(observation => (
                              <TableRow key={observation.id}>
                                <TableCell className="font-medium">{observation.display}</TableCell>
                                <TableCell>{observation.value} {observation.unit}</TableCell>
                                <TableCell>{observation.effectiveDate}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    {observation.source}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm border rounded-md p-4 text-center bg-gray-50">
                        No observation records found for this patient
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="mt-4 flex justify-between">
            <Button variant="outline" className="gap-1" onClick={() => window.open('#', '_blank')}>
              <ExternalLink className="h-4 w-4" />
              <span>View FHIR Record</span>
            </Button>
            <Button onClick={() => setShowClinicalRecordsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Healthcare Data</DialogTitle>
            <DialogDescription>
              Select healthcare systems and data types to import
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Source Systems</h4>
              
              <div className="space-y-2">
                {connectedSystems.filter(system => system.status === 'active').map(system => (
                  <div key={system.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`system-${system.id}`} 
                      checked={selectedResources.includes(system.id)} 
                      onCheckedChange={() => toggleResourceSelection(system.id)}
                    />
                    <Label htmlFor={`system-${system.id}`} className="flex-1">
                      <div>{system.name}</div>
                      <div className="text-xs text-muted-foreground">{system.resourcesAvailable.toLocaleString()} resources available</div>
                    </Label>
                    <Badge variant="outline">{system.type}</Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Data Types</h4>
              
              <div className="space-y-2">
                {supportedDataTypes.filter(dt => dt.importSupport).map(dataType => (
                  <div key={dataType.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`datatype-${dataType.id}`} 
                      checked={dataTypes.includes(dataType.id)} 
                      onCheckedChange={() => toggleDataType(dataType.id)}
                    />
                    <Label htmlFor={`datatype-${dataType.id}`} className="flex-1 flex items-center">
                      <span className="mr-2">{dataType.icon}</span>
                      <span>{dataType.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Import Options</h4>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="option-conflict" defaultChecked />
                  <Label htmlFor="option-conflict">Handle conflicts by preferring more recent data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="option-notify" defaultChecked />
                  <Label htmlFor="option-notify">Notify users of critical updates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="option-log" defaultChecked />
                  <Label htmlFor="option-log">Log all import activities for audit</Label>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-100 rounded-md p-3">
              <h4 className="text-sm font-medium flex items-center text-amber-800">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Data Quality Notice
              </h4>
              <p className="text-xs text-amber-700 mt-1">
                Imported data will be checked for quality and completeness. Errors or inconsistencies 
                will be reported in the integration error log.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button className="gap-2" onClick={() => setShowImportDialog(false)}>
              <Download className="h-4 w-4" />
              <span>Import Data</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Export Healthcare Data</DialogTitle>
            <DialogDescription>
              Select data to export to external healthcare systems
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Target Systems</h4>
              
              <div className="space-y-2">
                {connectedSystems.filter(system => system.status === 'active').map(system => (
                  <div key={system.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`export-system-${system.id}`} 
                      checked={selectedResources.includes(`export-${system.id}`)} 
                      onCheckedChange={() => toggleResourceSelection(`export-${system.id}`)}
                    />
                    <Label htmlFor={`export-system-${system.id}`} className="flex-1">
                      <div>{system.name}</div>
                      <div className="text-xs text-muted-foreground">{system.type}</div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Data Types</h4>
              
              <div className="space-y-2">
                {supportedDataTypes.filter(dt => dt.exportSupport).map(dataType => (
                  <div key={dataType.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`export-datatype-${dataType.id}`} 
                      checked={dataTypes.includes(`export-${dataType.id}`)} 
                      onCheckedChange={() => toggleDataType(`export-${dataType.id}`)}
                    />
                    <Label htmlFor={`export-datatype-${dataType.id}`} className="flex-1 flex items-center">
                      <span className="mr-2">{dataType.icon}</span>
                      <span>{dataType.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Export Options</h4>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="export-option-consent" defaultChecked />
                  <Label htmlFor="export-option-consent">Include consent records with data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="export-option-audit" defaultChecked />
                  <Label htmlFor="export-option-audit">Create audit trail of exported data</Label>
                </div>
                <div className="flex justify-between space-x-2">
                  <Label htmlFor="export-date-range" className="pt-2 text-sm">Date Range:</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="export-date-range" className="w-[180px]">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Data</SelectItem>
                      <SelectItem value="today">Today Only</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
              <h4 className="text-sm font-medium flex items-center text-blue-800">
                <Info className="h-4 w-4 mr-2" />
                Data Privacy Information
              </h4>
              <p className="text-xs text-blue-700 mt-1">
                Ensure that you have the necessary permissions and consent to export patient data 
                to external systems. All exported data is securely transmitted and encrypted.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button className="gap-2" onClick={() => setShowExportDialog(false)}>
              <Upload className="h-4 w-4" />
              <span>Export Data</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FHIR Query Dialog */}
      <Dialog open={showFhirQueryDialog} onOpenChange={setShowFhirQueryDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Advanced FHIR Query</DialogTitle>
            <DialogDescription>
              Construct and execute complex FHIR API queries
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="advanced-fhir-query">FHIR Query</Label>
              <Textarea 
                id="advanced-fhir-query" 
                value={`GET /Condition?patient=p-003&clinical-status=active&_include=Condition:subject
  &_include=Condition:evidence-detail&_format=json`}
                rows={4}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Request Headers</Label>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="font-mono text-xs">
                  <div>Accept: application/fhir+json</div>
                  <div>Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
                  <div>Content-Type: application/fhir+json</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Response Preview</Label>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-auto max-h-[300px]">
                <pre className="font-mono text-xs whitespace-pre">
{`{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 2,
  "link": [
    {
      "relation": "self",
      "url": "https://fhir.nhs.uk/Condition?patient=p-003&clinical-status=active"
    }
  ],
  "entry": [
    {
      "resource": {
        "resourceType": "Condition",
        "id": "c-004",
        "meta": {
          "versionId": "1",
          "lastUpdated": "2025-01-05T16:33:42Z"
        },
        "clinicalStatus": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
              "code": "active"
            }
          ]
        },
        "verificationStatus": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
              "code": "confirmed"
            }
          ]
        },
        "code": {
          "coding": [
            {
              "system": "http://hl7.org/fhir/sid/icd-10",
              "code": "I25.1",
              "display": "Atherosclerotic heart disease"
            }
          ]
        },
        "subject": {
          "reference": "Patient/p-003"
        },
        "recordedDate": "2024-01-05"
      }
    },
    {
      "resource": {
        "resourceType": "Condition",
        "id": "c-005",
        "meta": {
          "versionId": "1",
          "lastUpdated": "2025-01-12T10:15:22Z"
        },
        "clinicalStatus": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
              "code": "active"
            }
          ]
        },
        "verificationStatus": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
              "code": "confirmed"
            }
          ]
        },
        "code": {
          "coding": [
            {
              "system": "http://hl7.org/fhir/sid/icd-10",
              "code": "J44.9",
              "display": "Chronic obstructive pulmonary disease"
            }
          ]
        },
        "subject": {
          "reference": "Patient/p-003"
        },
        "recordedDate": "2023-11-12"
      }
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFhirQueryDialog(false)}>
              Cancel
            </Button>
            <Button className="gap-2" onClick={() => setShowFhirQueryDialog(false)}>
              <Terminal className="h-4 w-4" />
              <span>Execute Query</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}