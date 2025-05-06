import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  Clock, 
  Heart, 
  Share2, 
  Bookmark, 
  Star, 
  Filter, 
  AlertCircle,
  User,
  CreditCard,
  Calendar,
  FileText,
  Info,
  CheckCircle,
  ChevronDown
} from 'lucide-react';
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { ResourceDetailView } from './resource-detail-view';
import { ResourceMapView } from './resource-map-view';
import { ResourceReferralForm } from './resource-referral-form';
import { ResourceReviewList } from './resource-review-list';
import type { CommunityResource } from '@shared/schema';

export interface ResourceDirectoryProps {
  className?: string;
}

// Helper function to get category label from enum value
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
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

// Helper function to get category color
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    health: 'bg-red-100 text-red-800 border-red-200',
    housing: 'bg-blue-100 text-blue-800 border-blue-200',
    food: 'bg-green-100 text-green-800 border-green-200',
    clothing: 'bg-purple-100 text-purple-800 border-purple-200',
    transportation: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    legal: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    education: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    employment: 'bg-teal-100 text-teal-800 border-teal-200',
    mental_health: 'bg-pink-100 text-pink-800 border-pink-200',
    social: 'bg-orange-100 text-orange-800 border-orange-200',
    financial: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    activities: 'bg-amber-100 text-amber-800 border-amber-200',
    other: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Star rating component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

export function ResourceDirectory({ className }: ResourceDirectoryProps) {
  const [viewType, setViewType] = useState<string>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, boolean>>({
    freeOnly: false,
    hasReferrals: false,
    inPerson: true,
    virtual: true,
  });
  const [selectedResource, setSelectedResource] = useState<CommunityResource | null>(null);
  
  // Fetch community resources
  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['/api/community-resources', searchQuery, selectedCategory, selectedLocation, selectedFilters],
    queryFn: async () => {
      // Simulate API call - in a real app this would get data from the backend
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sample data - in a real app, this would come from the API
      const sampleResources: CommunityResource[] = [
        {
          id: 1,
          name: 'Community Health Clinic',
          description: 'Low-cost healthcare services for individuals and families, including primary care, preventative care, and chronic disease management. Services are offered on a sliding scale based on income.',
          categories: ['health', 'mental_health'],
          locationId: 1,
          contactPhone: '01234 567890',
          contactEmail: 'info@communityhealthclinic.org',
          website: 'https://communityhealthclinic.org',
          address: '123 Main Street, London',
          postcode: 'SW1A 1AA',
          availability: {
            monday: '9:00-17:00',
            tuesday: '9:00-17:00',
            wednesday: '9:00-17:00',
            thursday: '9:00-19:00',
            friday: '9:00-17:00',
            saturday: '10:00-14:00',
            sunday: 'Closed'
          },
          isReferralRequired: false,
          referralProcess: null,
          referralContact: null,
          isFree: false,
          pricing: 'Sliding scale fees based on income',
          fundingOptions: ['NHS', 'Private Insurance', 'Self-Pay'],
          eligibilityCriteria: {
            age: 'All ages',
            income: 'All income levels',
            residence: 'Local residents only'
          },
          languages: ['English', 'Spanish', 'Polish'],
          accessibilityFeatures: ['Wheelchair Access', 'Hearing Loop', 'Accessible Toilet'],
          serviceArea: 'London Borough of Westminster',
          status: 'active',
          rating: 4.5,
          reviewCount: 28,
          lastUpdated: '2024-04-15'
        },
        {
          id: 2,
          name: 'Housing Support Network',
          description: 'Provides advice, information, and advocacy for individuals experiencing housing issues or homelessness. Services include housing benefit advice, tenancy support, and emergency accommodation referrals.',
          categories: ['housing', 'legal'],
          locationId: 2,
          contactPhone: '01234 123456',
          contactEmail: 'help@housingsupport.org',
          website: 'https://housingsupportnetwork.org',
          address: '45 Queen Street, Manchester',
          postcode: 'M2 5HX',
          availability: {
            monday: '10:00-16:00',
            tuesday: '10:00-16:00',
            wednesday: '10:00-16:00',
            thursday: '10:00-16:00',
            friday: '10:00-16:00',
            saturday: 'Closed',
            sunday: 'Closed'
          },
          isReferralRequired: false,
          referralProcess: null,
          referralContact: null,
          isFree: true,
          pricing: null,
          fundingOptions: ['Government Funded', 'Charity'],
          eligibilityCriteria: {
            age: '18+',
            income: 'All income levels',
            residence: 'Manchester residents priority'
          },
          languages: ['English', 'Urdu', 'Arabic'],
          accessibilityFeatures: ['Wheelchair Access', 'Accessible Toilet'],
          serviceArea: 'Greater Manchester',
          status: 'active',
          rating: 4.2,
          reviewCount: 15,
          lastUpdated: '2024-03-22'
        },
        {
          id: 3,
          name: 'Meals on Wheels',
          description: 'Delivers nutritious meals to elderly and disabled individuals who are unable to prepare their own meals. Special dietary requirements can be accommodated.',
          categories: ['food'],
          locationId: 3,
          contactPhone: '01234 765432',
          contactEmail: 'info@mealsonwheels.org',
          website: 'https://mealsonwheels.org',
          address: '78 High Street, Birmingham',
          postcode: 'B1 1TS',
          availability: {
            monday: '8:00-18:00',
            tuesday: '8:00-18:00',
            wednesday: '8:00-18:00',
            thursday: '8:00-18:00',
            friday: '8:00-18:00',
            saturday: '9:00-15:00',
            sunday: '9:00-15:00'
          },
          isReferralRequired: true,
          referralProcess: 'GP or social worker referral required',
          referralContact: 'referrals@mealsonwheels.org',
          isFree: false,
          pricing: '£5 per meal, subsidies available',
          fundingOptions: ['Local Authority Funding', 'Self-Pay'],
          eligibilityCriteria: {
            age: '65+ or disabled',
            income: 'All income levels',
            residence: 'Within Birmingham city limits'
          },
          languages: ['English'],
          accessibilityFeatures: [],
          serviceArea: 'Birmingham',
          status: 'active',
          rating: 4.8,
          reviewCount: 42,
          lastUpdated: '2024-04-02'
        },
        {
          id: 4,
          name: 'Community Transport Service',
          description: 'Provides accessible transportation for elderly and disabled individuals who cannot use public transport. Services include shopping trips, medical appointments, and social outings.',
          categories: ['transportation'],
          locationId: 4,
          contactPhone: '01234 987654',
          contactEmail: 'bookings@communitytransport.org',
          website: 'https://communitytransport.org',
          address: '12 Station Road, Leeds',
          postcode: 'LS1 5DL',
          availability: {
            monday: '7:00-19:00',
            tuesday: '7:00-19:00',
            wednesday: '7:00-19:00',
            thursday: '7:00-19:00',
            friday: '7:00-19:00',
            saturday: '8:00-17:00',
            sunday: 'Closed'
          },
          isReferralRequired: false,
          referralProcess: null,
          referralContact: null,
          isFree: false,
          pricing: '£3-£10 per journey depending on distance',
          fundingOptions: ['Local Authority Funding', 'Self-Pay'],
          eligibilityCriteria: {
            age: '60+ or disabled',
            income: 'All income levels',
            residence: 'Leeds area residents'
          },
          languages: ['English'],
          accessibilityFeatures: ['Wheelchair Accessible Vehicles', 'Passenger Assistance'],
          serviceArea: 'Leeds and surrounding areas',
          status: 'active',
          rating: 4.6,
          reviewCount: 31,
          lastUpdated: '2024-03-15'
        },
        {
          id: 5,
          name: 'Mental Health Support Group',
          description: 'Weekly support groups for individuals experiencing anxiety, depression, and other mental health challenges. Run by trained facilitators with lived experience.',
          categories: ['mental_health', 'social'],
          locationId: 5,
          contactPhone: '01234 456789',
          contactEmail: 'support@mhsupportgroup.org',
          website: 'https://mentalhealthsupportgroup.org',
          address: '34 Church Street, Bristol',
          postcode: 'BS1 5AB',
          availability: {
            monday: 'Closed',
            tuesday: '18:00-20:00',
            wednesday: 'Closed',
            thursday: '18:00-20:00',
            friday: 'Closed',
            saturday: '10:00-12:00',
            sunday: 'Closed'
          },
          isReferralRequired: false,
          referralProcess: null,
          referralContact: null,
          isFree: true,
          pricing: null,
          fundingOptions: ['Charity'],
          eligibilityCriteria: {
            age: '18+',
            income: 'All income levels',
            residence: 'All welcome'
          },
          languages: ['English'],
          accessibilityFeatures: ['Wheelchair Access', 'Accessible Toilet', 'Hearing Loop'],
          serviceArea: 'Bristol',
          status: 'active',
          rating: 4.7,
          reviewCount: 23,
          lastUpdated: '2024-04-10'
        },
      ];
      
      // Filter resources based on search, category, location, and other filters
      return sampleResources.filter(resource => {
        // Search filter
        if (searchQuery && !resource.name.toLowerCase().includes(searchQuery.toLowerCase()) && !resource.description.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Category filter
        if (selectedCategory !== 'all' && !resource.categories.includes(selectedCategory)) {
          return false;
        }
        
        // Location filter (in a real app, we'd filter by location)
        // For now we're just passing this
        
        // Other filters
        if (selectedFilters.freeOnly && !resource.isFree) {
          return false;
        }
        
        if (selectedFilters.hasReferrals && !resource.isReferralRequired) {
          return false;
        }
        
        return true;
      });
    }
  });
  
  // Function to open resource detail
  const openResourceDetail = (resource: CommunityResource) => {
    setSelectedResource(resource);
  };
  
  // Filter categories from all resources
  const categories = ['all', 'health', 'housing', 'food', 'transportation', 'mental_health', 'social', 'legal', 'education', 'employment', 'financial', 'activities', 'clothing', 'other'];
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Community Resource Directory</CardTitle>
            <CardDescription>
              Find local support services and resources for service users
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewType === 'list' ? 'default' : 'outline'}
              onClick={() => setViewType('list')}
              className="px-3"
            >
              <FileText className="h-4 w-4 mr-2" />
              List View
            </Button>
            <Button
              variant={viewType === 'map' ? 'default' : 'outline'}
              onClick={() => setViewType('map')}
              className="px-3"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Map View
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search resources..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : getCategoryLabel(category)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-1.5">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px]">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Filter Options</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-free" 
                      checked={selectedFilters.freeOnly}
                      onCheckedChange={(checked) => 
                        setSelectedFilters({...selectedFilters, freeOnly: !!checked})
                      }
                    />
                    <label htmlFor="filter-free" className="text-sm">Free services only</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-referrals" 
                      checked={selectedFilters.hasReferrals}
                      onCheckedChange={(checked) => 
                        setSelectedFilters({...selectedFilters, hasReferrals: !!checked})
                      }
                    />
                    <label htmlFor="filter-referrals" className="text-sm">Referral required</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-in-person" 
                      checked={selectedFilters.inPerson}
                      onCheckedChange={(checked) => 
                        setSelectedFilters({...selectedFilters, inPerson: !!checked})
                      }
                    />
                    <label htmlFor="filter-in-person" className="text-sm">In-person services</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-virtual" 
                      checked={selectedFilters.virtual}
                      onCheckedChange={(checked) => 
                        setSelectedFilters({...selectedFilters, virtual: !!checked})
                      }
                    />
                    <label htmlFor="filter-virtual" className="text-sm">Virtual services</label>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => setSelectedFilters({
                    freeOnly: false,
                    hasReferrals: false,
                    inPerson: true,
                    virtual: true,
                  })}
                >
                  Reset Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Results */}
        {selectedResource ? (
          <div className="mt-4">
            <Button 
              variant="ghost" 
              className="mb-4" 
              onClick={() => setSelectedResource(null)}
            >
              ← Back to results
            </Button>
            <ResourceDetailView 
              resource={selectedResource} 
              onClose={() => setSelectedResource(null)} 
            />
          </div>
        ) : viewType === 'map' ? (
          <ResourceMapView resources={resources || []} onSelectResource={openResourceDetail} />
        ) : (
          <>
            {/* List View */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center p-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Error loading resources</h3>
                <p className="text-gray-500 mt-2">
                  There was a problem loading community resources. Please try again later.
                </p>
              </div>
            ) : resources && resources.length > 0 ? (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row">
                      <div className="p-4 sm:p-6 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{resource.name}</h3>
                            <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                              {resource.categories.map((category) => (
                                <Badge key={category} className={getCategoryColor(category)}>
                                  {getCategoryLabel(category)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <StarRating rating={resource.rating} />
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{resource.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                          <div className="flex items-center text-gray-500">
                            <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{resource.address}</span>
                          </div>
                          {resource.contactPhone && (
                            <div className="flex items-center text-gray-500">
                              <Phone className="h-4 w-4 mr-1.5 flex-shrink-0" />
                              <span>{resource.contactPhone}</span>
                            </div>
                          )}
                          {resource.isFree ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1.5 flex-shrink-0" />
                              <span>Free service</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <CreditCard className="h-4 w-4 mr-1.5 flex-shrink-0" />
                              <span className="truncate">Fees may apply</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-500">
                            <Clock className="h-4 w-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">
                              Updated {new Date(resource.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border-t sm:border-t-0 sm:border-l bg-gray-50 flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-stretch gap-4 sm:w-[180px]">
                        <Button 
                          className="w-full" 
                          onClick={() => openResourceDetail(resource)}
                        >
                          View Details
                        </Button>
                        
                        <div className="flex sm:flex-col gap-2">
                          <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                            <Bookmark className="h-[18px] w-[18px]" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                                <Share2 className="h-[18px] w-[18px]" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Copy Link</DropdownMenuItem>
                              <DropdownMenuItem>Email</DropdownMenuItem>
                              <DropdownMenuItem>Print</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            ) : (
              <div className="text-center p-8">
                <Info className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No resources found</h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search criteria to find more resources.
                </p>
                <Button className="mt-4" onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedFilters({
                    freeOnly: false,
                    hasReferrals: false,
                    inPerson: true,
                    virtual: true,
                  });
                }}>
                  Reset Filters
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}