import React, { useState, useEffect } from 'react';
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Check,
  ChevronDown,
  Edit,
  ExternalLink,
  Heart,
  HelpCircle,
  Info,
  ListFilter,
  Loader2,
  MapPin,
  MessageSquare,
  Minus,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  SendHorizontal,
  Share2,
  Star,
  ThumbsUp,
  Trash2,
  Undo2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

// Types for resources
interface ResourceCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface ResourceLocation {
  id: string;
  name: string;
  city: string;
  distance?: number;
}

interface ResourceContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  postcode?: string;
}

interface ResourceAvailability {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  notes?: string;
}

interface ResourceReferral {
  required: boolean;
  process?: string;
  contactName?: string;
  contactInfo?: string;
}

interface ResourceCost {
  isFree: boolean;
  pricing?: string;
  fundingOptions?: string[];
}

interface ResourceEligibility {
  ageGroups?: string[];
  conditions?: string[];
  otherCriteria?: string;
}

interface CommunityResource {
  id: string;
  name: string;
  description: string;
  categories: string[];
  location: ResourceLocation;
  contactInfo: ResourceContactInfo;
  availability: ResourceAvailability;
  referral: ResourceReferral;
  cost: ResourceCost;
  eligibility: ResourceEligibility;
  rating: number;
  reviewCount: number;
  isFavorite: boolean;
  lastUpdated: string;
  languages?: string[];
  accessibilityFeatures?: string[];
  serviceArea?: string;
  status: 'active' | 'inactive' | 'pending';
}

interface ResourceReview {
  id: string;
  resourceId: string;
  userId: string;
  userName: string;
  userRole: string;
  rating: number;
  comment: string;
  date: string;
  helpfulCount: number;
  isHelpful: boolean;
}

interface ReferralRecord {
  id: string;
  resourceId: string;
  resourceName: string;
  serviceUserId: string;
  serviceUserName: string;
  referrerName: string;
  date: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  notes?: string;
  followUpDate?: string;
}

// Sample data for community resources
const resourceCategories: ResourceCategory[] = [
  { id: 'health', name: 'Health Services', icon: <Activity className="h-4 w-4" />, color: 'bg-red-100 text-red-800' },
  { id: 'mental-health', name: 'Mental Health', icon: <Brain className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' },
  { id: 'housing', name: 'Housing Support', icon: <Home className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
  { id: 'food', name: 'Food Assistance', icon: <Utensils className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
  { id: 'transportation', name: 'Transportation', icon: <Bus className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'education', name: 'Education & Training', icon: <GraduationCap className="h-4 w-4" />, color: 'bg-indigo-100 text-indigo-800' },
  { id: 'employment', name: 'Employment Support', icon: <Briefcase className="h-4 w-4" />, color: 'bg-pink-100 text-pink-800' },
  { id: 'financial', name: 'Financial Assistance', icon: <PoundSterling className="h-4 w-4" />, color: 'bg-emerald-100 text-emerald-800' },
  { id: 'social', name: 'Social Activities', icon: <Users className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' },
  { id: 'legal', name: 'Legal Services', icon: <Scale className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800' },
  { id: 'disability', name: 'Disability Support', icon: <Accessibility className="h-4 w-4" />, color: 'bg-cyan-100 text-cyan-800' },
  { id: 'caregiver', name: 'Caregiver Support', icon: <Heart className="h-4 w-4" />, color: 'bg-rose-100 text-rose-800' },
];

const locations: ResourceLocation[] = [
  { id: 'london-central', name: 'Central London', city: 'London', distance: 0 },
  { id: 'london-north', name: 'North London', city: 'London', distance: 5.3 },
  { id: 'london-east', name: 'East London', city: 'London', distance: 6.7 },
  { id: 'london-south', name: 'South London', city: 'London', distance: 4.9 },
  { id: 'london-west', name: 'West London', city: 'London', distance: 5.5 },
  { id: 'manchester', name: 'Manchester', city: 'Manchester', distance: 162 },
  { id: 'birmingham', name: 'Birmingham', city: 'Birmingham', distance: 126 },
  { id: 'bristol', name: 'Bristol', city: 'Bristol', distance: 118 },
  { id: 'leeds', name: 'Leeds', city: 'Leeds', distance: 195 },
  { id: 'virtual', name: 'Virtual/Online', city: 'Online', distance: 0 },
];

// Import Lucide icons needed for categories
function Activity(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  );
}

function Brain(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.96-4.03 2.5 2.5 0 0 1 3.8-2.75Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.96-4.03 2.5 2.5 0 0 0-3.8-2.75Z"/></svg>
  );
}

function Home(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  );
}

function Utensils(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
  );
}

function Bus(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8 6v6"/><path d="M16 6v6"/><path d="M2 12h20"/><path d="M18 18h2a2 2 0 0 0 2-2v-6a8 8 0 0 0-16 0v6a2 2 0 0 0 2 2h2"/><path d="M9 22h6"/><path d="M14 18v4"/><path d="M10 18v4"/></svg>
  );
}

function GraduationCap(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
  );
}

function Briefcase(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  );
}

function PoundSterling(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 7c0-5.333-8-5.333-8 0"/><path d="M10 7v14"/><path d="M6 21h12"/><path d="M6 13h10"/></svg>
  );
}

function Scale(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
  );
}

function Accessibility(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5 5"/><path d="M6 19a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/></svg>
  );
}

// Generate sample community resources
const generateCommunityResources = (): CommunityResource[] => {
  return [
    {
      id: 'res-001',
      name: 'Northside Health Clinic',
      description: 'A community health clinic offering primary care services, health screenings, vaccinations, and chronic disease management for all ages. Sliding scale fees available based on income.',
      categories: ['health'],
      location: locations.find(loc => loc.id === 'london-north') || locations[0],
      contactInfo: {
        phone: '020-7123-4567',
        email: 'info@northsideclinic.org',
        website: 'www.northsideclinic.org',
        address: '45 High Street, North London',
        postcode: 'N1 7QP'
      },
      availability: {
        monday: '8:00 - 18:00',
        tuesday: '8:00 - 18:00',
        wednesday: '8:00 - 20:00',
        thursday: '8:00 - 18:00',
        friday: '8:00 - 18:00',
        saturday: '9:00 - 13:00',
        sunday: 'Closed',
        notes: 'Extended hours on Wednesdays. Walk-ins accepted in the mornings.'
      },
      referral: {
        required: false
      },
      cost: {
        isFree: false,
        pricing: 'Sliding scale fees based on income',
        fundingOptions: ['NHS', 'Private Insurance']
      },
      eligibility: {
        ageGroups: ['All ages'],
        conditions: ['Any'],
        otherCriteria: 'Residents of North London area preferred but not required'
      },
      rating: 4.7,
      reviewCount: 125,
      isFavorite: true,
      lastUpdated: '2025-04-15',
      languages: ['English', 'Polish', 'Urdu'],
      accessibilityFeatures: ['Wheelchair accessible', 'Hearing loop'],
      serviceArea: 'North London',
      status: 'active'
    },
    {
      id: 'res-002',
      name: 'Mind Wellness Centre',
      description: 'Community mental health center offering counseling, therapy sessions, support groups, and mental health education. Focus on anxiety, depression, and stress management.',
      categories: ['mental-health'],
      location: locations.find(loc => loc.id === 'london-central') || locations[0],
      contactInfo: {
        phone: '020-7789-5432',
        email: 'support@mindwellness.org',
        website: 'www.mindwellness.org',
        address: '27 Welbeck Street, Central London',
        postcode: 'W1G 8EN'
      },
      availability: {
        monday: '9:00 - 17:00',
        tuesday: '9:00 - 17:00',
        wednesday: '9:00 - 17:00',
        thursday: '9:00 - 19:00',
        friday: '9:00 - 17:00',
        saturday: 'Closed',
        sunday: 'Closed',
        notes: 'Evening appointments available on Thursdays'
      },
      referral: {
        required: true,
        process: 'Self-referral or GP referral accepted',
        contactName: 'Intake Coordinator',
        contactInfo: 'intake@mindwellness.org'
      },
      cost: {
        isFree: false,
        pricing: '£40-£90 per session',
        fundingOptions: ['NHS referral (free)', 'Sliding scale available']
      },
      eligibility: {
        ageGroups: ['16+'],
        conditions: ['Anxiety', 'Depression', 'Stress', 'Trauma', 'Grief'],
        otherCriteria: 'Priority for local residents'
      },
      rating: 4.9,
      reviewCount: 87,
      isFavorite: true,
      lastUpdated: '2025-05-01',
      languages: ['English', 'Spanish', 'French'],
      accessibilityFeatures: ['Wheelchair accessible', 'Sensory room'],
      serviceArea: 'Greater London',
      status: 'active'
    },
    {
      id: 'res-003',
      name: 'Housing Support Network',
      description: 'Organization providing housing assistance, homelessness prevention services, tenant rights advocacy, and emergency accommodation referrals.',
      categories: ['housing'],
      location: locations.find(loc => loc.id === 'london-east') || locations[0],
      contactInfo: {
        phone: '020-3456-7890',
        email: 'help@housingsupport.org',
        website: 'www.housingsupport.org',
        address: '52 Commercial Road, East London',
        postcode: 'E1 1LP'
      },
      availability: {
        monday: '9:00 - 17:00',
        tuesday: '9:00 - 17:00',
        wednesday: '9:00 - 17:00',
        thursday: '9:00 - 17:00',
        friday: '9:00 - 16:00',
        saturday: 'Closed',
        sunday: 'Closed',
        notes: 'Emergency after-hours phone service available for crisis situations'
      },
      referral: {
        required: false,
        process: 'Drop-in or appointment',
        contactName: 'Housing Team',
        contactInfo: '020-3456-7890'
      },
      cost: {
        isFree: true,
        fundingOptions: ['Council funded', 'Charitable donations']
      },
      eligibility: {
        ageGroups: ['18+'],
        conditions: ['Any'],
        otherCriteria: 'Priority for those at risk of homelessness'
      },
      rating: 4.5,
      reviewCount: 63,
      isFavorite: false,
      lastUpdated: '2025-04-22',
      languages: ['English', 'Bengali', 'Romanian'],
      accessibilityFeatures: ['Wheelchair accessible', 'Documents in large print'],
      serviceArea: 'East London',
      status: 'active'
    },
    {
      id: 'res-004',
      name: 'Community Food Bank',
      description: 'Food assistance program providing weekly food packages, meal deliveries for elderly and disabled individuals, and nutrition education.',
      categories: ['food'],
      location: locations.find(loc => loc.id === 'london-south') || locations[0],
      contactInfo: {
        phone: '020-8765-4321',
        email: 'info@communityfoodbank.org',
        website: 'www.communityfoodbank.org',
        address: '123 High Street, South London',
        postcode: 'SE17 1JL'
      },
      availability: {
        monday: 'Closed',
        tuesday: '10:00 - 16:00',
        wednesday: '10:00 - 16:00',
        thursday: '10:00 - 16:00',
        friday: '10:00 - 16:00',
        saturday: '10:00 - 14:00',
        sunday: 'Closed',
        notes: 'Food distribution on Tuesdays, Thursdays, and Saturdays'
      },
      referral: {
        required: true,
        process: 'Referral from social worker, GP, or community partner required',
        contactName: 'Referral Team',
        contactInfo: 'referrals@communityfoodbank.org'
      },
      cost: {
        isFree: true
      },
      eligibility: {
        ageGroups: ['All ages'],
        conditions: ['Any'],
        otherCriteria: 'Must demonstrate financial need'
      },
      rating: 4.8,
      reviewCount: 112,
      isFavorite: true,
      lastUpdated: '2025-05-03',
      languages: ['English', 'Portuguese', 'Turkish'],
      accessibilityFeatures: ['Ground floor access', 'Home delivery available'],
      serviceArea: 'South London',
      status: 'active'
    },
    {
      id: 'res-005',
      name: 'Community Transport Service',
      description: 'Provides accessible transport services for elderly and disabled individuals who cannot use public transportation, including medical appointment transport.',
      categories: ['transportation'],
      location: locations.find(loc => loc.id === 'london-west') || locations[0],
      contactInfo: {
        phone: '020-9876-5432',
        email: 'bookings@communitytransport.org',
        website: 'www.communitytransport.org',
        address: '78 King Street, West London',
        postcode: 'W6 0QA'
      },
      availability: {
        monday: '8:00 - 18:00',
        tuesday: '8:00 - 18:00',
        wednesday: '8:00 - 18:00',
        thursday: '8:00 - 18:00',
        friday: '8:00 - 18:00',
        saturday: '9:00 - 15:00',
        sunday: 'Emergency only',
        notes: 'Bookings must be made at least 24 hours in advance'
      },
      referral: {
        required: false,
        process: 'Registration and assessment required before first use',
        contactName: 'Transport Coordinator',
        contactInfo: 'bookings@communitytransport.org'
      },
      cost: {
        isFree: false,
        pricing: '£3-£15 per journey depending on distance',
        fundingOptions: ['Council subsidies for eligible individuals']
      },
      eligibility: {
        ageGroups: ['65+', 'Adults with disabilities'],
        conditions: ['Mobility issues', 'Visual impairment', 'Other disabilities'],
        otherCriteria: 'Must be unable to use regular public transport'
      },
      rating: 4.6,
      reviewCount: 78,
      isFavorite: false,
      lastUpdated: '2025-03-15',
      languages: ['English'],
      accessibilityFeatures: ['Wheelchair accessible vehicles', 'Door-to-door service'],
      serviceArea: 'West London',
      status: 'active'
    },
    {
      id: 'res-006',
      name: 'Skills Training Center',
      description: 'Education and vocational training center offering courses in digital skills, language learning, job readiness, and career development.',
      categories: ['education', 'employment'],
      location: locations.find(loc => loc.id === 'london-central') || locations[0],
      contactInfo: {
        phone: '020-2345-6789',
        email: 'courses@skillstraining.org',
        website: 'www.skillstraining.org',
        address: '250 Oxford Street, Central London',
        postcode: 'W1D 1BS'
      },
      availability: {
        monday: '9:00 - 20:00',
        tuesday: '9:00 - 20:00',
        wednesday: '9:00 - 20:00',
        thursday: '9:00 - 20:00',
        friday: '9:00 - 17:00',
        saturday: '10:00 - 16:00',
        sunday: 'Closed',
        notes: 'Evening classes available Monday-Thursday'
      },
      referral: {
        required: false
      },
      cost: {
        isFree: false,
        pricing: '£50-£500 per course',
        fundingOptions: ['Means-tested scholarships', 'Government training grants']
      },
      eligibility: {
        ageGroups: ['16+'],
        conditions: ['Any'],
        otherCriteria: 'Some courses have specific prerequisites'
      },
      rating: 4.4,
      reviewCount: 156,
      isFavorite: false,
      lastUpdated: '2025-04-05',
      languages: ['English', 'Arabic', 'Chinese'],
      accessibilityFeatures: ['Wheelchair accessible', 'Assistive technology'],
      serviceArea: 'Greater London',
      status: 'active'
    },
    {
      id: 'res-007',
      name: 'Financial Advice Hub',
      description: 'Financial counseling service offering debt management advice, benefits assistance, budgeting support, and financial literacy education.',
      categories: ['financial'],
      location: locations.find(loc => loc.id === 'virtual') || locations[0],
      contactInfo: {
        phone: '020-6543-2109',
        email: 'advice@financialhub.org',
        website: 'www.financialhub.org',
        address: 'Online service with occasional in-person appointments'
      },
      availability: {
        monday: '9:00 - 17:00',
        tuesday: '9:00 - 17:00',
        wednesday: '9:00 - 19:00',
        thursday: '9:00 - 17:00',
        friday: '9:00 - 17:00',
        saturday: 'Closed',
        sunday: 'Closed',
        notes: 'Virtual appointments available outside regular hours by arrangement'
      },
      referral: {
        required: false
      },
      cost: {
        isFree: true
      },
      eligibility: {
        ageGroups: ['18+'],
        conditions: ['Any'],
        otherCriteria: 'Priority for those with financial hardship'
      },
      rating: 4.9,
      reviewCount: 92,
      isFavorite: true,
      lastUpdated: '2025-05-01',
      languages: ['English', 'Welsh', 'Urdu'],
      accessibilityFeatures: ['Screen reader compatible website', 'Text relay service'],
      serviceArea: 'United Kingdom',
      status: 'active'
    },
    {
      id: 'res-008',
      name: 'Senior Social Club',
      description: 'Social activities and companionship for seniors, including group outings, hobby classes, games, and intergenerational programs to reduce isolation.',
      categories: ['social', 'caregiver'],
      location: locations.find(loc => loc.id === 'london-north') || locations[0],
      contactInfo: {
        phone: '020-8765-1234',
        email: 'hello@seniorsocialclub.org',
        website: 'www.seniorsocialclub.org',
        address: '17 Parkfield Road, North London',
        postcode: 'N14 6PS'
      },
      availability: {
        monday: '10:00 - 16:00',
        tuesday: '10:00 - 16:00',
        wednesday: '10:00 - 16:00',
        thursday: '10:00 - 16:00',
        friday: '10:00 - 15:00',
        saturday: 'Special events only',
        sunday: 'Closed',
        notes: 'Different activities scheduled each day'
      },
      referral: {
        required: false
      },
      cost: {
        isFree: false,
        pricing: '£5 daily attendance fee, £30 monthly membership',
        fundingOptions: ['Fee waivers available', 'Council subsidies']
      },
      eligibility: {
        ageGroups: ['60+'],
        conditions: ['Any'],
        otherCriteria: 'Must be able to participate in group activities'
      },
      rating: 4.8,
      reviewCount: 67,
      isFavorite: false,
      lastUpdated: '2025-04-18',
      languages: ['English'],
      accessibilityFeatures: ['Wheelchair accessible', 'Hearing loop', 'Ground floor facilities'],
      serviceArea: 'North London',
      status: 'active'
    },
    {
      id: 'res-009',
      name: 'Legal Aid Centre',
      description: 'Free legal advice and representation for low-income individuals on housing, employment, immigration, family, and benefits issues.',
      categories: ['legal'],
      location: locations.find(loc => loc.id === 'london-east') || locations[0],
      contactInfo: {
        phone: '020-3333-4444',
        email: 'helpdesk@legalaidcentre.org',
        website: 'www.legalaidcentre.org',
        address: '85 Whitechapel Road, East London',
        postcode: 'E1 1DU'
      },
      availability: {
        monday: '9:00 - 17:00',
        tuesday: '9:00 - 17:00',
        wednesday: '9:00 - 17:00',
        thursday: '9:00 - 19:00',
        friday: '9:00 - 17:00',
        saturday: 'Closed',
        sunday: 'Closed',
        notes: 'Drop-in advice sessions on Tuesdays 10:00-12:00'
      },
      referral: {
        required: false
      },
      cost: {
        isFree: true
      },
      eligibility: {
        ageGroups: ['18+'],
        conditions: ['Any'],
        otherCriteria: 'Must meet low-income criteria'
      },
      rating: 4.7,
      reviewCount: 103,
      isFavorite: false,
      lastUpdated: '2025-03-30',
      languages: ['English', 'Bengali', 'Somali', 'Polish'],
      accessibilityFeatures: ['Wheelchair accessible', 'Documents in alternative formats'],
      serviceArea: 'East London',
      status: 'active'
    },
    {
      id: 'res-010',
      name: 'Disability Resource Center',
      description: 'Comprehensive support service for people with disabilities, offering equipment loans, independent living skills training, benefits advice, and peer support.',
      categories: ['disability', 'health'],
      location: locations.find(loc => loc.id === 'london-south') || locations[0],
      contactInfo: {
        phone: '020-7777-8888',
        email: 'info@disabilityresource.org',
        website: 'www.disabilityresource.org',
        address: '42 Newington Causeway, South London',
        postcode: 'SE1 6DR'
      },
      availability: {
        monday: '9:00 - 17:00',
        tuesday: '9:00 - 17:00',
        wednesday: '9:00 - 17:00',
        thursday: '9:00 - 17:00',
        friday: '9:00 - 16:00',
        saturday: 'Closed',
        sunday: 'Closed',
        notes: 'Home visits available by appointment'
      },
      referral: {
        required: false,
        process: 'Self-referral or professional referral accepted',
        contactName: 'Intake Team',
        contactInfo: 'intake@disabilityresource.org'
      },
      cost: {
        isFree: true,
        pricing: 'Some equipment loans may have a small fee',
        fundingOptions: ['Personal budget', 'Charitable funding']
      },
      eligibility: {
        ageGroups: ['All ages'],
        conditions: ['Physical disabilities', 'Sensory impairments', 'Learning disabilities'],
        otherCriteria: 'Open to people with all types of disabilities'
      },
      rating: 4.9,
      reviewCount: 128,
      isFavorite: true,
      lastUpdated: '2025-04-25',
      languages: ['English', 'BSL'],
      accessibilityFeatures: ['Fully accessible building', 'Adapted computer equipment', 'Sensory room'],
      serviceArea: 'South London',
      status: 'active'
    },
    {
      id: 'res-011',
      name: 'Caregiver Support Network',
      description: 'Support services for unpaid caregivers including respite care, support groups, training workshops, and one-to-one emotional support.',
      categories: ['caregiver', 'mental-health'],
      location: locations.find(loc => loc.id === 'london-west') || locations[0],
      contactInfo: {
        phone: '020-9999-0000',
        email: 'support@caregivernetwork.org',
        website: 'www.caregivernetwork.org',
        address: "65 Shepherd's Bush Road, West London",
        postcode: 'W6 7PH'
      },
      availability: {
        monday: '9:00 - 17:00',
        tuesday: '9:00 - 17:00',
        wednesday: '9:00 - 19:00',
        thursday: '9:00 - 17:00',
        friday: '9:00 - 17:00',
        saturday: '10:00 - 13:00',
        sunday: 'Closed',
        notes: 'Evening support group on Wednesdays'
      },
      referral: {
        required: false
      },
      cost: {
        isFree: true
      },
      eligibility: {
        ageGroups: ['18+'],
        conditions: ['Any'],
        otherCriteria: 'Must be providing unpaid care to a family member or friend'
      },
      rating: 4.9,
      reviewCount: 85,
      isFavorite: true,
      lastUpdated: '2025-05-02',
      languages: ['English', 'Hindi', 'Arabic'],
      accessibilityFeatures: ['Wheelchair accessible', 'Childcare available during support groups'],
      serviceArea: 'West London',
      status: 'active'
    },
    {
      id: 'res-012',
      name: 'National Crisis Helpline',
      description: 'Telephone and online crisis support for people experiencing suicidal thoughts, emotional distress, or mental health crisis. Available 24/7.',
      categories: ['mental-health'],
      location: locations.find(loc => loc.id === 'virtual') || locations[0],
      contactInfo: {
        phone: '0800-123-4567',
        email: 'info@crisishelp.org',
        website: 'www.crisishelp.org'
      },
      availability: {
        monday: '24 hours',
        tuesday: '24 hours',
        wednesday: '24 hours',
        thursday: '24 hours',
        friday: '24 hours',
        saturday: '24 hours',
        sunday: '24 hours',
        notes: 'Available 24/7, 365 days a year'
      },
      referral: {
        required: false
      },
      cost: {
        isFree: true
      },
      eligibility: {
        ageGroups: ['All ages'],
        conditions: ['Mental health crisis', 'Suicidal thoughts', 'Emotional distress'],
        otherCriteria: 'Open to anyone in crisis'
      },
      rating: 4.8,
      reviewCount: 243,
      isFavorite: true,
      lastUpdated: '2025-04-10',
      languages: ['English', 'Welsh', 'Urdu', 'Polish', 'Hindi', 'Punjabi'],
      accessibilityFeatures: ['Text-based support available', 'TTY compatible'],
      serviceArea: 'United Kingdom',
      status: 'active'
    }
  ];
};

// Sample data for referral records
const generateReferralRecords = (): ReferralRecord[] => {
  return [
    {
      id: 'ref-001',
      resourceId: 'res-002',
      resourceName: 'Mind Wellness Centre',
      serviceUserId: 'su-003',
      serviceUserName: 'Robert Davis',
      referrerName: 'Sarah Johnson',
      date: '2025-04-10',
      status: 'accepted',
      notes: 'Experiencing increased anxiety and difficulty sleeping. Initial appointment scheduled for 25/04/2025.',
      followUpDate: '2025-05-01'
    },
    {
      id: 'ref-002',
      resourceId: 'res-004',
      resourceName: 'Community Food Bank',
      serviceUserId: 'su-007',
      serviceUserName: 'Elizabeth Brown',
      referrerName: 'James Wilson',
      date: '2025-04-15',
      status: 'completed',
      notes: 'Temporary food assistance needed due to recent hospitalization affecting income. Food package provided for 2 weeks.',
      followUpDate: '2025-04-29'
    },
    {
      id: 'ref-003',
      resourceId: 'res-010',
      resourceName: 'Disability Resource Center',
      serviceUserId: 'su-002',
      serviceUserName: 'Mary Johnson',
      referrerName: 'Sarah Johnson',
      date: '2025-04-18',
      status: 'pending',
      notes: 'Assessment for mobility equipment needed after recent fall. Requires walker and bathroom modifications.',
      followUpDate: '2025-05-02'
    },
    {
      id: 'ref-004',
      resourceId: 'res-007',
      resourceName: 'Financial Advice Hub',
      serviceUserId: 'su-005',
      serviceUserName: 'James Wilson',
      referrerName: 'Emma Wilson',
      date: '2025-04-22',
      status: 'accepted',
      notes: 'Needs assistance with benefits application and debt management advice. Virtual appointment scheduled.',
      followUpDate: '2025-05-06'
    },
    {
      id: 'ref-005',
      resourceId: 'res-011',
      resourceName: 'Caregiver Support Network',
      serviceUserId: 'su-008',
      serviceUserName: 'Margaret Turner',
      referrerName: 'David Thompson',
      date: '2025-04-25',
      status: 'pending',
      notes: 'Caregiver showing signs of burnout. Would benefit from respite services and support group.',
      followUpDate: '2025-05-09'
    }
  ];
};

// Sample resource reviews
const generateResourceReviews = (): ResourceReview[] => {
  return [
    {
      id: 'rev-001',
      resourceId: 'res-002',
      userId: 'user-005',
      userName: 'Sarah Johnson',
      userRole: 'Care Coordinator',
      rating: 5,
      comment: 'Mind Wellness Centre has been an excellent resource for our service users experiencing anxiety and depression. Their staff are compassionate and professional, and they provide timely appointments. The feedback from clients has been overwhelmingly positive.',
      date: '2025-03-15',
      helpfulCount: 12,
      isHelpful: false
    },
    {
      id: 'rev-002',
      resourceId: 'res-002',
      userId: 'user-008',
      userName: 'David Thompson',
      userRole: 'Caregiver',
      rating: 5,
      comment: "I referred one of my clients here who was struggling with severe anxiety. The intake process was smooth, and they were able to see her quickly. She's reported significant improvement after just a few sessions. Highly recommend!",
      date: '2025-04-02',
      helpfulCount: 8,
      isHelpful: true
    },
    {
      id: 'rev-003',
      resourceId: 'res-004',
      userId: 'user-003',
      userName: 'James Wilson',
      userRole: 'Care Manager',
      rating: 4,
      comment: 'The Community Food Bank provides an essential service for our clients facing food insecurity. The food packages are substantial and include good quality items. The only drawback is the limited operating hours which can be difficult for working people to access.',
      date: '2025-02-28',
      helpfulCount: 15,
      isHelpful: false
    },
    {
      id: 'rev-004',
      resourceId: 'res-010',
      userId: 'user-012',
      userName: 'Patricia Miller',
      userRole: 'Occupational Therapist',
      rating: 5,
      comment: 'The Disability Resource Center has been invaluable for my clients. Their equipment loan program is excellent, and the staff are knowledgeable about a wide range of disabilities. They go above and beyond to ensure people get the support they need.',
      date: '2025-04-10',
      helpfulCount: 20,
      isHelpful: true
    },
    {
      id: 'rev-005',
      resourceId: 'res-007',
      userId: 'user-009',
      userName: 'Michael Brown',
      userRole: 'Social Worker',
      rating: 5,
      comment: 'The Financial Advice Hub provides outstanding support for people navigating complex financial situations. Their benefits advisors are extremely knowledgeable, and the debt management advice has helped several of my clients avoid eviction. Their virtual service makes them accessible to everyone.',
      date: '2025-03-22',
      helpfulCount: 17,
      isHelpful: false
    }
  ];
};

// State for community resources page
export default function CommunityResources() {
  const { toast } = useToast();
  const [resources, setResources] = useState<CommunityResource[]>(generateCommunityResources());
  const [referrals, setReferrals] = useState<ReferralRecord[]>(generateReferralRecords());
  const [reviews, setReviews] = useState<ResourceReview[]>(generateResourceReviews());
  const [selectedResource, setSelectedResource] = useState<CommunityResource | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<ReferralRecord | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [filterDistance, setFilterDistance] = useState<number | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterFree, setFilterFree] = useState<boolean | null>(null);
  const [filterReferralRequired, setFilterReferralRequired] = useState<boolean | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Dialogs
  const [showResourceDetailsDialog, setShowResourceDetailsDialog] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  
  // New referral state
  const [newReferral, setNewReferral] = useState({
    serviceUserId: '',
    serviceUserName: '',
    notes: ''
  });
  
  // New review state
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  
  // Filter resources based on applied filters
  const filteredResources = resources.filter(resource => {
    // Search filter
    const matchesSearch = 
      searchTerm === '' || 
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = 
      selectedCategories.length === 0 || 
      resource.categories.some(cat => selectedCategories.includes(cat));
    
    // Location filter
    const matchesLocation = 
      selectedLocation === 'all' || 
      resource.location.id === selectedLocation;
    
    // Distance filter
    const matchesDistance = 
      filterDistance === null || 
      (resource.location.distance !== undefined && resource.location.distance <= filterDistance);
    
    // Rating filter
    const matchesRating = 
      filterRating === null || 
      resource.rating >= filterRating;
    
    // Free filter
    const matchesFree = 
      filterFree === null || 
      resource.cost.isFree === filterFree;
    
    // Referral required filter
    const matchesReferralRequired = 
      filterReferralRequired === null || 
      resource.referral.required === filterReferralRequired;
    
    return matchesSearch && matchesCategory && matchesLocation && 
           matchesDistance && matchesRating && matchesFree && 
           matchesReferralRequired;
  });
  
  // Filter referrals by search term
  const filteredReferrals = referrals.filter(referral => 
    searchTerm === '' || 
    referral.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.serviceUserName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group resources by category for dashboard stats
  const resourcesByCategory = resourceCategories.map(category => {
    const count = resources.filter(resource => 
      resource.categories.includes(category.id)
    ).length;
    
    return {
      ...category,
      count
    };
  });
  
  // Toggle a category in the filter
  const toggleCategoryFilter = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedLocation('all');
    setFilterDistance(null);
    setFilterRating(null);
    setFilterFree(null);
    setFilterReferralRequired(null);
  };
  
  // Toggle favorite status for a resource
  const toggleFavorite = (resourceId: string) => {
    setResources(resources.map(resource => 
      resource.id === resourceId
        ? { ...resource, isFavorite: !resource.isFavorite }
        : resource
    ));
    
    const resource = resources.find(r => r.id === resourceId);
    toast({
      title: resource?.isFavorite ? "Removed from favorites" : "Added to favorites",
      description: `${resource?.name} has been ${resource?.isFavorite ? "removed from" : "added to"} your favorites`,
    });
  };
  
  // Open resource details dialog
  const openResourceDetails = (resource: CommunityResource) => {
    setSelectedResource(resource);
    setShowResourceDetailsDialog(true);
  };
  
  // Open referral dialog
  const openReferralDialog = (resource: CommunityResource) => {
    setSelectedResource(resource);
    setNewReferral({
      serviceUserId: '',
      serviceUserName: '',
      notes: ''
    });
    setShowReferralDialog(true);
  };
  
  // Submit a new referral
  const submitReferral = () => {
    if (!selectedResource) return;
    
    if (!newReferral.serviceUserName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a service user"
      });
      return;
    }
    
    const newReferralRecord: ReferralRecord = {
      id: `ref-${Date.now()}`,
      resourceId: selectedResource.id,
      resourceName: selectedResource.name,
      serviceUserId: newReferral.serviceUserId || `su-${Date.now()}`,
      serviceUserName: newReferral.serviceUserName,
      referrerName: 'Current User',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: newReferral.notes,
      followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    setReferrals([newReferralRecord, ...referrals]);
    setShowReferralDialog(false);
    
    toast({
      title: "Referral submitted",
      description: `Referral to ${selectedResource.name} has been successfully submitted`
    });
  };
  
  // Open review dialog
  const openReviewDialog = (resource: CommunityResource) => {
    setSelectedResource(resource);
    setNewReview({
      rating: 5,
      comment: ''
    });
    setShowReviewDialog(true);
  };
  
  // Submit a new review
  const submitReview = () => {
    if (!selectedResource) return;
    
    if (!newReview.comment) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a review comment"
      });
      return;
    }
    
    const newReviewRecord: ResourceReview = {
      id: `rev-${Date.now()}`,
      resourceId: selectedResource.id,
      userId: 'current-user',
      userName: 'Current User',
      userRole: 'Care Coordinator',
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
      isHelpful: false
    };
    
    setReviews([newReviewRecord, ...reviews]);
    
    // Update resource rating
    const resourceReviews = [...reviews, newReviewRecord].filter(
      review => review.resourceId === selectedResource.id
    );
    
    const averageRating = resourceReviews.reduce(
      (sum, review) => sum + review.rating, 0
    ) / resourceReviews.length;
    
    setResources(resources.map(resource => 
      resource.id === selectedResource.id
        ? { 
            ...resource, 
            rating: parseFloat(averageRating.toFixed(1)), 
            reviewCount: resource.reviewCount + 1 
          }
        : resource
    ));
    
    setShowReviewDialog(false);
    
    toast({
      title: "Review submitted",
      description: `Your review for ${selectedResource.name} has been successfully submitted`
    });
  };
  
  // Mark a review as helpful
  const markReviewHelpful = (reviewId: string, isCurrentlyHelpful: boolean) => {
    setReviews(reviews.map(review => 
      review.id === reviewId
        ? { 
            ...review, 
            helpfulCount: isCurrentlyHelpful 
              ? review.helpfulCount - 1 
              : review.helpfulCount + 1,
            isHelpful: !isCurrentlyHelpful 
          }
        : review
    ));
  };
  
  // Get reviews for a specific resource
  const getResourceReviews = (resourceId: string) => {
    return reviews.filter(review => review.resourceId === resourceId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  // Get category by ID
  const getCategoryById = (categoryId: string) => {
    return resourceCategories.find(cat => cat.id === categoryId) || null;
  };
  
  // Get Icon for category
  const getCategoryIcon = (categoryId: string) => {
    const category = getCategoryById(categoryId);
    return category ? category.icon : null;
  };
  
  // Format availability days from an availability object
  const formatAvailability = (availability: ResourceAvailability) => {
    if (!availability) return "Information not available";
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
    
    const availableDays = days
      .filter(day => availability[day] && availability[day] !== 'Closed')
      .map(day => {
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        return `${dayName}: ${availability[day]}`;
      })
      .join('\n');
    
    return availableDays || "No regular hours listed";
  };
  
  // Format address from contact info
  const formatAddress = (contactInfo: ResourceContactInfo) => {
    if (!contactInfo.address) return "No address available";
    
    return contactInfo.postcode
      ? `${contactInfo.address}, ${contactInfo.postcode}`
      : contactInfo.address;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Community Resources</h1>
          <p className="text-muted-foreground">Connect service users with local support services and resources</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search resources..."
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <ListFilter className="h-4 w-4" />
            <span>Filters</span>
            <Badge className="ml-1">{
              (selectedCategories.length > 0 ? 1 : 0) +
              (selectedLocation !== 'all' ? 1 : 0) +
              (filterDistance !== null ? 1 : 0) +
              (filterRating !== null ? 1 : 0) +
              (filterFree !== null ? 1 : 0) +
              (filterReferralRequired !== null ? 1 : 0)
            }</Badge>
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Filter Resources</CardTitle>
              <Button size="sm" variant="ghost" onClick={clearFilters}>Clear All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Categories */}
              <div>
                <Label className="mb-2 block">Resource Categories</Label>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-2">
                    {resourceCategories.map(category => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category.id}`} 
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategoryFilter(category.id)}
                        />
                        <Label 
                          htmlFor={`category-${category.id}`}
                          className="flex items-center cursor-pointer"
                        >
                          <span className={`inline-flex items-center justify-center p-1.5 rounded-full mr-2 ${category.color}`}>
                            {category.icon}
                          </span>
                          <span>{category.name}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Location & Distance */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location" className="mb-2 block">Location</Label>
                  <Select 
                    value={selectedLocation} 
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                          {location.distance !== undefined && location.distance > 0 && 
                            ` (${location.distance} mi)`
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="distance" className="mb-2 block">Maximum Distance</Label>
                  <Select 
                    value={filterDistance?.toString() || ''} 
                    onValueChange={(value) => setFilterDistance(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger id="distance">
                      <SelectValue placeholder="Any distance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any distance</SelectItem>
                      <SelectItem value="5">Within 5 miles</SelectItem>
                      <SelectItem value="10">Within 10 miles</SelectItem>
                      <SelectItem value="25">Within 25 miles</SelectItem>
                      <SelectItem value="50">Within 50 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Other Filters */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rating" className="mb-2 block">Minimum Rating</Label>
                  <Select 
                    value={filterRating?.toString() || ''} 
                    onValueChange={(value) => setFilterRating(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger id="rating">
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any rating</SelectItem>
                      <SelectItem value="3">3+ stars</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="5">5 stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="free-services" 
                      checked={filterFree === true}
                      onCheckedChange={(checked) => setFilterFree(checked === true ? true : null)}
                    />
                    <Label htmlFor="free-services">Free services only</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="no-referral" 
                      checked={filterReferralRequired === false}
                      onCheckedChange={(checked) => setFilterReferralRequired(checked === true ? false : null)}
                    />
                    <Label htmlFor="no-referral">No referral required</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        {/* RESOURCES TAB */}
        <TabsContent value="resources" className="space-y-4">
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map(resource => (
                <Card key={resource.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{resource.name}</CardTitle>
                        <div className="flex items-center mt-1 space-x-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="ml-1 text-sm font-medium">{resource.rating}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ({resource.reviewCount} reviews)
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(resource.id)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Heart className={`h-5 w-5 ${resource.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-1">
                      {resource.categories.map(categoryId => {
                        const category = getCategoryById(categoryId);
                        if (!category) return null;
                        
                        return (
                          <Badge key={categoryId} className={`${category.color}`}>
                            <span className="flex items-center">
                              <span className="mr-1">{category.icon}</span>
                              <span className="hidden sm:inline">{category.name}</span>
                            </span>
                          </Badge>
                        );
                      })}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm line-clamp-3 text-gray-600">{resource.description}</p>
                    
                    <div className="mt-4 space-y-2 text-sm">
                      {resource.location?.name && (
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                          <span>
                            {resource.location.name}
                            {resource.location.distance !== undefined && resource.location.distance > 0 && 
                              ` (${resource.location.distance} miles)`
                            }
                          </span>
                        </div>
                      )}
                      
                      {resource.contactInfo?.phone && (
                        <div className="flex items-start">
                          <Phone className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                          <span>{resource.contactInfo.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-start">
                        <div className={`h-2 w-2 rounded-full mt-1.5 mr-2 ${resource.cost.isFree ? 'bg-green-500' : 'bg-blue-500'}`} />
                        <span>
                          {resource.cost.isFree 
                            ? 'Free service' 
                            : resource.cost.pricing || 'Paid service'
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-start">
                        <div className={`h-2 w-2 rounded-full mt-1.5 mr-2 ${resource.referral.required ? 'bg-amber-500' : 'bg-green-500'}`} />
                        <span>
                          {resource.referral.required 
                            ? 'Referral required' 
                            : 'No referral needed'
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openResourceDetails(resource)}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => openReferralDialog(resource)}
                    >
                      Make Referral
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border rounded-md bg-gray-50">
              <div className="mx-auto flex justify-center text-gray-400 mb-4">
                <Search className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No resources found</h3>
              <p className="mt-2 text-gray-500">
                Try adjusting your search or filters to find what you're looking for
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </TabsContent>

        {/* REFERRALS TAB */}
        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Referrals</CardTitle>
                <Badge>{referrals.length}</Badge>
              </div>
              <CardDescription>
                Track referrals to community resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredReferrals.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service User</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Follow-Up</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReferrals.map(referral => (
                      <TableRow key={referral.id}>
                        <TableCell className="font-medium">{referral.serviceUserName}</TableCell>
                        <TableCell>{referral.resourceName}</TableCell>
                        <TableCell>{referral.date}</TableCell>
                        <TableCell>
                          <Badge className={
                            referral.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            referral.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            referral.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{referral.followUpDate}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedReferral(referral)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <div className="mx-auto flex justify-center text-gray-400 mb-4">
                    <Search className="h-8 w-8" />
                  </div>
                  <p className="text-gray-500">
                    No referrals found matching your search
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referral Details Dialog */}
          {selectedReferral && (
            <Dialog open={!!selectedReferral} onOpenChange={() => setSelectedReferral(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Referral Details</DialogTitle>
                  <DialogDescription>
                    Referral to {selectedReferral.resourceName} for {selectedReferral.serviceUserName}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Status:</span>
                    <Badge className={
                      selectedReferral.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      selectedReferral.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      selectedReferral.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {selectedReferral.status.charAt(0).toUpperCase() + selectedReferral.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div>
                    <span className="font-medium">Date Referred:</span>
                    <p className="text-sm">{selectedReferral.date}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium">Referred By:</span>
                    <p className="text-sm">{selectedReferral.referrerName}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium">Follow-Up Date:</span>
                    <p className="text-sm">{selectedReferral.followUpDate || 'Not set'}</p>
                  </div>
                  
                  {selectedReferral.notes && (
                    <div>
                      <span className="font-medium">Notes:</span>
                      <p className="text-sm mt-1 p-2 border rounded-md bg-gray-50">
                        {selectedReferral.notes}
                      </p>
                    </div>
                  )}
                </div>
                
                <DialogFooter className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedReferral(null)}>
                    Close
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Update Status</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0">
                      <div className="flex flex-col">
                        {['pending', 'accepted', 'declined', 'completed'].map(status => (
                          <Button
                            key={status}
                            variant="ghost"
                            className="justify-start"
                            onClick={() => {
                              setReferrals(referrals.map(ref => 
                                ref.id === selectedReferral.id
                                  ? { ...ref, status: status as any }
                                  : ref
                              ));
                              setSelectedReferral({
                                ...selectedReferral,
                                status: status as any
                              });
                              
                              toast({
                                title: "Status updated",
                                description: `Referral status changed to ${status}`
                              });
                            }}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        {/* DASHBOARD TAB */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Resources by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resourcesByCategory
                    .filter(cat => cat.count > 0)
                    .sort((a, b) => b.count - a.count)
                    .map(category => (
                      <div key={category.id} className="flex items-center">
                        <div className={`rounded-full p-1.5 mr-3 ${category.color}`}>
                          {category.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{category.name}</span>
                            <span className="text-sm font-medium">{category.count}</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div 
                              className={`h-full ${category.color.replace('bg-', 'bg-').replace('text-', '')}`}
                              style={{ width: `${(category.count / resources.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Resources by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locations
                    .map(location => ({
                      ...location,
                      count: resources.filter(r => r.location.id === location.id).length
                    }))
                    .filter(loc => loc.count > 0)
                    .sort((a, b) => b.count - a.count)
                    .map(location => (
                      <div key={location.id} className="flex items-center">
                        <div className="bg-blue-100 text-blue-800 rounded-full p-1.5 mr-3">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{location.name}</span>
                            <span className="text-sm font-medium">{location.count}</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div 
                              className="h-full bg-blue-500"
                              style={{ width: `${(location.count / resources.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Referral Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                      <div className="text-2xl font-bold">{referrals.length}</div>
                      <div className="text-sm text-gray-500">Total Referrals</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                      <div className="text-2xl font-bold">
                        {referrals.filter(r => r.status === 'pending').length}
                      </div>
                      <div className="text-sm text-gray-500">Pending</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed</span>
                      <span className="text-sm font-medium">
                        {referrals.filter(r => r.status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Accepted</span>
                      <span className="text-sm font-medium">
                        {referrals.filter(r => r.status === 'accepted').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Declined</span>
                      <span className="text-sm font-medium">
                        {referrals.filter(r => r.status === 'declined').length}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Status Distribution</h4>
                    <div className="h-4 rounded-full bg-gray-200 overflow-hidden flex">
                      {[
                        { status: 'completed', color: 'bg-blue-500' },
                        { status: 'accepted', color: 'bg-green-500' },
                        { status: 'pending', color: 'bg-amber-500' },
                        { status: 'declined', color: 'bg-red-500' },
                      ].map(item => {
                        const count = referrals.filter(r => r.status === item.status).length;
                        const percentage = (count / referrals.length) * 100;
                        return (
                          <div 
                            key={item.status} 
                            className={`h-full ${item.color}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>Completed</span>
                      <span>Accepted</span>
                      <span>Pending</span>
                      <span>Declined</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top-Rated Resources</CardTitle>
              <CardDescription>
                Highest-rated community resources based on staff reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Reviews</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 5)
                    .map(resource => (
                      <TableRow key={resource.id}>
                        <TableCell className="font-medium">{resource.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {resource.categories.map(categoryId => {
                              const category = getCategoryById(categoryId);
                              if (!category) return null;
                              
                              return (
                                <Badge key={categoryId} className={`${category.color}`}>
                                  <span className="flex items-center">
                                    <span className="mr-1">{category.icon}</span>
                                    <span className="hidden sm:inline">{category.name}</span>
                                  </span>
                                </Badge>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                            <span>{resource.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>{resource.reviewCount}</TableCell>
                        <TableCell>{resource.location.name}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openResourceDetails(resource)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>
                Latest staff feedback on community resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 3)
                  .map(review => {
                    const resource = resources.find(r => r.id === review.resourceId);
                    return (
                      <div key={review.id} className="border p-4 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{resource?.name || "Unknown Resource"}</h4>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                                />
                              ))}
                              <span className="ml-2 text-sm text-gray-500">
                                {review.date}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {review.userRole}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                          {review.comment}
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            By {review.userName}
                          </div>
                          <div className="flex items-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => markReviewHelpful(review.id, review.isHelpful)}
                            >
                              <ThumbsUp className={`h-4 w-4 mr-1 ${review.isHelpful ? 'fill-blue-500 text-blue-500' : ''}`} />
                              <span>{review.helpfulCount}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resource Details Dialog */}
      {selectedResource && (
        <Dialog open={showResourceDetailsDialog} onOpenChange={setShowResourceDetailsDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{selectedResource.name}</DialogTitle>
              <DialogDescription>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedResource.categories.map(categoryId => {
                    const category = getCategoryById(categoryId);
                    if (!category) return null;
                    
                    return (
                      <Badge key={categoryId} className={`${category.color} mt-1`}>
                        <span className="flex items-center">
                          <span className="mr-1">{category.icon}</span>
                          <span>{category.name}</span>
                        </span>
                      </Badge>
                    );
                  })}
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-2">
              <Tabs defaultValue="details">
                <TabsList className="mb-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Reviews 
                    <Badge className="ml-1 text-xs">{getResourceReviews(selectedResource.id).length}</Badge>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <ScrollArea className="pr-3 h-[400px]">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">About</h3>
                        <p className="text-gray-700">{selectedResource.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Contact Information</h4>
                          <div className="space-y-2">
                            {selectedResource.contactInfo.address && (
                              <div className="flex items-start text-sm">
                                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                                <span>{formatAddress(selectedResource.contactInfo)}</span>
                              </div>
                            )}
                            
                            {selectedResource.contactInfo.phone && (
                              <div className="flex items-start text-sm">
                                <Phone className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                                <span>{selectedResource.contactInfo.phone}</span>
                              </div>
                            )}
                            
                            {selectedResource.contactInfo.email && (
                              <div className="flex items-start text-sm">
                                <MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                                <span>{selectedResource.contactInfo.email}</span>
                              </div>
                            )}
                            
                            {selectedResource.contactInfo.website && (
                              <div className="flex items-start text-sm">
                                <ExternalLink className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                                <span>{selectedResource.contactInfo.website}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Availability</h4>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <pre className="text-sm whitespace-pre-line">
                              {formatAvailability(selectedResource.availability)}
                            </pre>
                            
                            {selectedResource.availability.notes && (
                              <div className="mt-2 text-sm">
                                <span className="font-medium">Notes: </span>
                                {selectedResource.availability.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Cost Information</h4>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="text-sm flex items-center">
                              <div className={`h-2 w-2 rounded-full mr-2 ${selectedResource.cost.isFree ? 'bg-green-500' : 'bg-blue-500'}`} />
                              <span className="font-medium">
                                {selectedResource.cost.isFree 
                                  ? 'Free service' 
                                  : 'Paid service'
                                }
                              </span>
                            </div>
                            
                            {selectedResource.cost.pricing && (
                              <div className="mt-2 text-sm">
                                <span className="font-medium">Pricing: </span>
                                {selectedResource.cost.pricing}
                              </div>
                            )}
                            
                            {selectedResource.cost.fundingOptions && selectedResource.cost.fundingOptions.length > 0 && (
                              <div className="mt-2 text-sm">
                                <span className="font-medium">Funding options: </span>
                                {selectedResource.cost.fundingOptions.join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Referral Process</h4>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="text-sm flex items-center">
                              <div className={`h-2 w-2 rounded-full mr-2 ${selectedResource.referral.required ? 'bg-amber-500' : 'bg-green-500'}`} />
                              <span className="font-medium">
                                {selectedResource.referral.required 
                                  ? 'Referral required' 
                                  : 'No referral needed - direct access'
                                }
                              </span>
                            </div>
                            
                            {selectedResource.referral.process && (
                              <div className="mt-2 text-sm">
                                <span className="font-medium">Process: </span>
                                {selectedResource.referral.process}
                              </div>
                            )}
                            
                            {selectedResource.referral.contactName && (
                              <div className="mt-2 text-sm">
                                <span className="font-medium">Contact: </span>
                                {selectedResource.referral.contactName}
                                {selectedResource.referral.contactInfo && ` (${selectedResource.referral.contactInfo})`}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Eligibility</h4>
                        <div className="bg-gray-50 p-3 rounded-md">
                          {selectedResource.eligibility.ageGroups && selectedResource.eligibility.ageGroups.length > 0 && (
                            <div className="text-sm">
                              <span className="font-medium">Age groups: </span>
                              {selectedResource.eligibility.ageGroups.join(", ")}
                            </div>
                          )}
                          
                          {selectedResource.eligibility.conditions && selectedResource.eligibility.conditions.length > 0 && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Conditions: </span>
                              {selectedResource.eligibility.conditions.join(", ")}
                            </div>
                          )}
                          
                          {selectedResource.eligibility.otherCriteria && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Other criteria: </span>
                              {selectedResource.eligibility.otherCriteria}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {selectedResource.languages && selectedResource.languages.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Languages</h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedResource.languages.map(language => (
                                <Badge key={language} variant="outline">
                                  {language}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {selectedResource.accessibilityFeatures && selectedResource.accessibilityFeatures.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Accessibility</h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedResource.accessibilityFeatures.map(feature => (
                                <Badge key={feature} variant="outline" className="bg-purple-50 text-purple-800">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-5 w-5 ${i < Math.round(selectedResource.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-lg font-medium">
                          {selectedResource.rating}
                        </span>
                        <span className="ml-2 text-gray-500">
                          ({selectedResource.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openReviewDialog(selectedResource)}
                    >
                      Write Review
                    </Button>
                  </div>
                  
                  <ScrollArea className="pr-3 h-[350px]">
                    <div className="space-y-4">
                      {getResourceReviews(selectedResource.id).length > 0 ? (
                        getResourceReviews(selectedResource.id).map(review => (
                          <div key={review.id} className="border p-4 rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                  <span className="ml-2 text-sm text-gray-500">
                                    {review.date}
                                  </span>
                                </div>
                                <div className="font-medium mt-1">{review.userName}</div>
                              </div>
                              <Badge variant="outline">
                                {review.userRole}
                              </Badge>
                            </div>
                            <p className="mt-2 text-gray-700">{review.comment}</p>
                            <div className="mt-3 flex justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => markReviewHelpful(review.id, review.isHelpful)}
                              >
                                <ThumbsUp className={`h-4 w-4 mr-1 ${review.isHelpful ? 'fill-blue-500 text-blue-500' : ''}`} />
                                <span>{review.helpfulCount}</span>
                                <span className="ml-1">Helpful</span>
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <div className="mx-auto flex justify-center mb-3">
                            <MessageSquare className="h-8 w-8 text-gray-400" />
                          </div>
                          <p>No reviews yet for this resource</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => openReviewDialog(selectedResource)}
                          >
                            Be the first to write a review
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
            
            <DialogFooter className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => toggleFavorite(selectedResource.id)}
                className="gap-2"
              >
                <Heart className={`h-4 w-4 ${selectedResource.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{selectedResource.isFavorite ? "Remove from Favorites" : "Add to Favorites"}</span>
              </Button>
              <Button
                onClick={() => {
                  setShowResourceDetailsDialog(false);
                  openReferralDialog(selectedResource);
                }}
              >
                Make Referral
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Referral Dialog */}
      {selectedResource && (
        <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Refer to {selectedResource.name}</DialogTitle>
              <DialogDescription>
                Create a new referral to this community resource
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="service-user">Service User</Label>
                <Select 
                  value={newReferral.serviceUserId} 
                  onValueChange={(value) => {
                    const userName = value === 'su-003' ? 'Robert Davis' :
                                    value === 'su-007' ? 'Elizabeth Brown' :
                                    value === 'su-002' ? 'Mary Johnson' :
                                    value === 'su-005' ? 'James Wilson' :
                                    value === 'su-008' ? 'Margaret Turner' : '';
                    
                    setNewReferral({
                      ...newReferral,
                      serviceUserId: value,
                      serviceUserName: userName
                    });
                  }}
                >
                  <SelectTrigger id="service-user">
                    <SelectValue placeholder="Select service user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="su-003">Robert Davis</SelectItem>
                    <SelectItem value="su-007">Elizabeth Brown</SelectItem>
                    <SelectItem value="su-002">Mary Johnson</SelectItem>
                    <SelectItem value="su-005">James Wilson</SelectItem>
                    <SelectItem value="su-008">Margaret Turner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="referral-notes">Referral Notes</Label>
                <Textarea
                  id="referral-notes"
                  placeholder="Add notes about the reason for referral, specific needs, etc."
                  rows={4}
                  value={newReferral.notes}
                  onChange={(e) => setNewReferral({ ...newReferral, notes: e.target.value })}
                />
              </div>
              
              {selectedResource.referral.required && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm">
                  <div className="flex">
                    <Info className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0" />
                    <div>
                      <strong>Referral Required</strong>
                      <p className="mt-1">
                        This resource requires a formal referral. 
                        {selectedResource.referral.process && ` ${selectedResource.referral.process}.`}
                      </p>
                      {(selectedResource.referral.contactName || selectedResource.referral.contactInfo) && (
                        <p className="mt-1">
                          Contact: {selectedResource.referral.contactName}
                          {selectedResource.referral.contactInfo && ` (${selectedResource.referral.contactInfo})`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowReferralDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={submitReferral}>
                Submit Referral
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Dialog */}
      {selectedResource && (
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Review {selectedResource.name}</DialogTitle>
              <DialogDescription>
                Share your experience with this community resource
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Your Rating</Label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="icon"
                      type="button"
                      className={`h-10 w-10 ${newReview.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    >
                      <Star className={`h-6 w-6 ${newReview.rating >= star ? 'fill-yellow-500' : ''}`} />
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="review-comment">Your Review</Label>
                <Textarea
                  id="review-comment"
                  placeholder="Share your experiences and insights about this resource..."
                  rows={5}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-md text-sm">
                <div className="flex">
                  <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" />
                  <div>
                    <p>
                      Your review will help other staff members make informed referral decisions. 
                      Focus on service quality, responsiveness, and outcomes for service users.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowReviewDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={submitReview}>
                Submit Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}