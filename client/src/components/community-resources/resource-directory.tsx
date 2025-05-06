import React, { useState, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  ListFilter,
  Grid, 
  Map,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ResourceDetailView } from './resource-detail-view';
import { ResourceMapView } from './resource-map-view';
import { useQuery } from '@tanstack/react-query';
import type { CommunityResource } from '@shared/schema';

interface ResourceDirectoryProps {}

export function ResourceDirectory({}: ResourceDirectoryProps) {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<CommunityResource | null>(null);
  
  // Query to fetch all community resources
  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['/api/community-resources'],
    queryFn: async () => {
      // In a real application, this would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample data - in a real app, this would come from the API
      return [
        {
          id: 1,
          name: "Central City Food Bank",
          description: "Provides emergency food assistance to individuals and families in need. Offers a range of fresh produce, canned goods, and essential items. Open distribution days three times per week with additional services for seniors and families with children.",
          categories: ["food"],
          locationId: 1,
          address: "123 Main Street, Central City",
          postcode: "CC1 2AB",
          contactPhone: "020-7946-1234",
          contactEmail: "info@centralcityfoodbank.org",
          website: "https://www.centralcityfoodbank.org",
          serviceArea: "Central City and surrounding areas within 10 miles",
          availability: {
            monday: "9:00 - 17:00",
            tuesday: "9:00 - 17:00",
            wednesday: "9:00 - 19:00",
            thursday: "9:00 - 17:00",
            friday: "9:00 - 17:00",
            saturday: "10:00 - 14:00",
            sunday: "Closed"
          },
          isReferralRequired: false,
          isFree: true,
          fundingOptions: ["Donations", "Community grants"],
          languages: ["English", "Spanish", "Polish"],
          accessibilityFeatures: ["Wheelchair accessible", "Ground floor access"],
          eligibilityCriteria: {
            age: "All ages",
            income: "Priority for low-income households",
            residence: "Must live in service area"
          },
          latitude: 51.5074,
          longitude: -0.1278,
          rating: 4.5,
          reviewCount: 28,
          lastUpdated: "2024-04-15"
        },
        {
          id: 2,
          name: "Westside Medical Transport",
          description: "Non-emergency medical transportation service for seniors and disabled individuals. Provides door-to-door transport to medical appointments, pharmacy visits, and therapy sessions with trained staff and accessible vehicles.",
          categories: ["transportation", "health"],
          locationId: 2,
          address: "456 Oak Avenue, West District",
          postcode: "WD3 8CD",
          contactPhone: "020-7946-5678",
          contactEmail: "bookings@westsidetransport.org",
          website: "https://www.westsidetransport.org",
          serviceArea: "West District, Central City, and North Areas",
          availability: {
            monday: "7:00 - 19:00",
            tuesday: "7:00 - 19:00",
            wednesday: "7:00 - 19:00",
            thursday: "7:00 - 19:00",
            friday: "7:00 - 19:00",
            saturday: "8:00 - 15:00",
            sunday: "Closed"
          },
          isReferralRequired: true,
          referralProcess: "Complete the online booking form or call at least 48 hours in advance. Medical provider referrals are prioritized.",
          referralContact: "referrals@westsidetransport.org",
          isFree: false,
          pricing: "£15-£45 depending on distance. Subsidized rates available.",
          fundingOptions: ["NHS vouchers", "Social services funding", "Self-pay"],
          languages: ["English", "Urdu", "Punjabi"],
          accessibilityFeatures: ["Wheelchair accessible vehicles", "Lift assistance", "Door-to-door service"],
          eligibilityCriteria: {
            age: "Adults 18+",
            income: "Any",
            residence: "Must live in service area"
          },
          latitude: 51.4993,
          longitude: -0.1848,
          rating: 4.2,
          reviewCount: 45,
          lastUpdated: "2024-03-28"
        },
        {
          id: 3,
          name: "Eastside Senior Social Club",
          description: "Community center providing social activities, educational workshops, and peer support for older adults. Offers regular meetups, exercise classes, arts and crafts, and community outings to combat isolation and promote wellbeing.",
          categories: ["social", "activities", "mental_health"],
          locationId: 3,
          address: "78 High Street, East Quarter",
          postcode: "EQ5 9FG",
          contactPhone: "020-7946-9012",
          contactEmail: "hello@eastsideseniors.org",
          website: "https://www.eastsideseniors.org",
          serviceArea: "East Quarter and neighboring districts",
          availability: {
            monday: "10:00 - 16:00",
            tuesday: "10:00 - 16:00",
            wednesday: "10:00 - 16:00",
            thursday: "10:00 - 16:00",
            friday: "10:00 - 16:00",
            saturday: "Varies by activity",
            sunday: "Closed"
          },
          isReferralRequired: false,
          isFree: false,
          pricing: "£5 annual membership plus activity fees (£2-10)",
          fundingOptions: ["Local authority grants", "Membership fees", "Charitable donations"],
          languages: ["English"],
          accessibilityFeatures: ["Elevator", "Accessible toilets", "Hearing loops"],
          eligibilityCriteria: {
            age: "55+",
            income: "Any",
            residence: "Priority for East Quarter residents"
          },
          latitude: 51.5314,
          longitude: -0.0548,
          rating: 4.8,
          reviewCount: 63,
          lastUpdated: "2024-04-02"
        },
        {
          id: 4,
          name: "Northside Housing Advisory Service",
          description: "Free housing advice and support service offering guidance on tenancy issues, eviction prevention, homelessness applications, and housing benefit claims. Provides advocacy and representation for vulnerable individuals.",
          categories: ["housing", "legal"],
          locationId: 4,
          address: "210 North Road, North District",
          postcode: "ND7 2HJ",
          contactPhone: "020-7946-3456",
          contactEmail: "advice@northsidehousing.org",
          website: "https://www.northsidehousing.org",
          serviceArea: "North District and Central City",
          availability: {
            monday: "9:30 - 16:30",
            tuesday: "9:30 - 16:30",
            wednesday: "13:00 - 19:00",
            thursday: "9:30 - 16:30",
            friday: "9:30 - 16:30",
            saturday: "Closed",
            sunday: "Closed"
          },
          isReferralRequired: false,
          isFree: true,
          languages: ["English", "Arabic", "Portuguese"],
          accessibilityFeatures: ["Wheelchair accessible", "Ground floor interviews"],
          eligibilityCriteria: {
            age: "16+",
            income: "Any",
            residence: "Priority for local residents"
          },
          latitude: 51.5614,
          longitude: -0.1028,
          rating: 4.6,
          reviewCount: 37,
          lastUpdated: "2024-03-15"
        },
        {
          id: 5,
          name: "Southside Community Learning Center",
          description: "Adult education center offering vocational training, language courses, digital skills, and employment support. Provides accredited qualifications, career counseling, and job application assistance to help individuals improve their career prospects.",
          categories: ["education", "employment"],
          locationId: 5,
          address: "45 South Boulevard, South Area",
          postcode: "SA9 1KL",
          contactPhone: "020-7946-7890",
          contactEmail: "courses@southsidelearning.org",
          website: "https://www.southsidelearning.org",
          serviceArea: "South Area and all surrounding districts",
          availability: {
            monday: "9:00 - 21:00",
            tuesday: "9:00 - 21:00",
            wednesday: "9:00 - 21:00",
            thursday: "9:00 - 21:00",
            friday: "9:00 - 17:00",
            saturday: "10:00 - 16:00",
            sunday: "Closed"
          },
          isReferralRequired: false,
          isFree: false,
          pricing: "Course fees vary from £0-£500 (financial assistance available)",
          fundingOptions: ["Adult Education Budget", "Advanced Learner Loans", "Discretionary Learner Support Fund"],
          languages: ["English", "Bengali", "Romanian"],
          accessibilityFeatures: ["Elevator", "Accessible toilets", "Adapted computer equipment"],
          eligibilityCriteria: {
            age: "19+",
            income: "Any (funding available for low income)",
            residence: "Open to all"
          },
          latitude: 51.4614,
          longitude: -0.0958,
          rating: 4.4,
          reviewCount: 92,
          lastUpdated: "2024-04-10"
        }
      ] as CommunityResource[];
    }
  });
  
  // Filter resources based on search query and category filter
  const filteredResources = React.useMemo(() => {
    if (!resources) return [];
    
    let filtered = resources;
    
    // Apply search query filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.name.toLowerCase().includes(lowerQuery) ||
        resource.description.toLowerCase().includes(lowerQuery) ||
        resource.categories.some(category => category.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(resource => 
        resource.categories.includes(categoryFilter as any)
      );
    }
    
    return filtered;
  }, [resources, searchQuery, categoryFilter]);
  
  // Helper function to get category label from enum value
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      all: 'All Categories',
      health: 'Healthcare',
      housing: 'Housing',
      food: 'Food Assistance',
      clothing: 'Clothing',
      transportation: 'Transportation',
      legal: 'Legal Aid',
      education: 'Education',
      employment: 'Employment',
      mental_health: 'Mental Health',
      social: 'Social Activities',
      financial: 'Financial Support',
      activities: 'Activities',
      other: 'Other Services'
    };
    return labels[category] || category;
  };
  
  // Get unique categories from resources for the filter
  const categories = React.useMemo(() => {
    if (!resources) return [];
    
    // Get all unique categories
    const allCategories = resources.flatMap(r => r.categories);
    return [...new Set(allCategories)].sort();
  }, [resources]);
  
  // Handler for selecting a resource in map view
  const handleSelectResource = useCallback((resource: CommunityResource) => {
    setSelectedResource(resource);
  }, []);
  
  // Handler for closing the detail view
  const handleCloseDetail = useCallback(() => {
    setSelectedResource(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Search and filter section */}
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search resources by name, description, or category..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Tabs 
                value={view} 
                onValueChange={(value) => setView(value as 'list' | 'map')} 
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list" className="flex items-center">
                    <ListFilter className="h-4 w-4 mr-1.5" />
                    <span>List</span>
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center">
                    <Map className="h-4 w-4 mr-1.5" />
                    <span>Map</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Results section */}
      <div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
            <p className="text-gray-500">Loading community resources...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              There was a problem loading the resource directory. Please try again later.
            </AlertDescription>
          </Alert>
        ) : filteredResources.length === 0 ? (
          <div className="text-center p-12 border rounded-lg bg-gray-50">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No resources found</h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto">
              We couldn't find any resources matching your search criteria. Try adjusting your filters or search query.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
            }}>
              Clear Filters
            </Button>
          </div>
        ) : selectedResource ? (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="mb-2"
              onClick={handleCloseDetail}
            >
              &larr; Back to All Resources
            </Button>
            <ResourceDetailView 
              resource={selectedResource} 
              onClose={handleCloseDetail}
            />
          </div>
        ) : view === 'list' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-3 flex-1">
                      <div>
                        <h3 className="font-medium text-lg">{resource.name}</h3>
                        <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
                          {resource.categories.map((category) => (
                            <Badge key={category} variant="outline">
                              {getCategoryLabel(category)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 line-clamp-2">{resource.description}</p>
                      
                      {resource.address && (
                        <div className="flex items-start text-sm text-gray-500">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-1.5 flex-shrink-0" />
                          <span>{resource.address}, {resource.postcode}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-3">
                        <div className="flex items-center">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= Math.round(resource.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="ml-1 text-sm text-gray-500">
                            ({resource.reviewCount})
                          </span>
                        </div>
                        
                        <Button 
                          size="sm"
                          onClick={() => handleSelectResource(resource)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <ResourceMapView 
            resources={filteredResources} 
            onSelectResource={handleSelectResource}
          />
        )}
      </div>
    </div>
  );
}