import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Clock,
  User,
  Users,
  Heart,
  Share2,
  Star,
  StarHalf,
  FileText,
  AlertCircle,
  Accessibility,
  Languages,
  BadgeCheck,
  RefreshCcw,
  PlusCircle,
  MoreVertical,
  ChevronDown,
  Check,
  Home,
  DollarSign,
  ThumbsUp,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Define Types
interface ResourceLocation {
  id: number;
  name: string;
  city: string;
  region?: string;
  postcode?: string;
  latitude?: string;
  longitude?: string;
  isVirtual: boolean;
  distance?: number;
}

interface CommunityResource {
  id: number;
  name: string;
  description: string;
  categories: string[];
  locationId?: number;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  address?: string;
  postcode?: string;
  availability: any; // JSON object
  isReferralRequired: boolean;
  referralProcess?: string;
  referralContact?: string;
  isFree: boolean;
  pricing?: string;
  fundingOptions?: string[];
  eligibilityCriteria?: any; // JSON object
  languages?: string[];
  accessibilityFeatures?: string[];
  serviceArea?: string;
  status: 'active' | 'inactive' | 'pending';
  rating?: number;
  reviewCount: number;
  lastUpdated: string;
  location?: ResourceLocation;
  // UI helpers
  isFavorite?: boolean;
}

interface ResourceReferral {
  id: number;
  resourceId: number;
  serviceUserId: number;
  referrerId: number;
  date: string;
  status: string;
  notes?: string;
  followUpDate?: string;
  outcome?: string;
  // UI helpers
  resourceName?: string;
  serviceUserName?: string;
  referrerName?: string;
}

interface ResourceReview {
  id: number;
  resourceId: number;
  userId: number;
  rating: number;
  comment?: string;
  date: string;
  helpfulCount: number;
  // UI helpers
  userName?: string;
  userRole?: string;
  isHelpful?: boolean;
}

interface ResourceBookmark {
  id: number;
  resourceId: number;
  userId: number;
  dateAdded: string;
  notes?: string;
}

interface ServiceUser {
  id: number;
  uniqueId: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber?: string;
  emergencyContact?: string;
}

// Category definitions with icons
const resourceCategories = [
  { id: 'health', name: 'Health', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'housing', name: 'Housing', icon: <Home className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'food', name: 'Food & Nutrition', icon: <FileText className="h-4 w-4" />, color: 'bg-green-100 text-green-800 border-green-200' },
  { id: 'clothing', name: 'Clothing', icon: <FileText className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'transportation', name: 'Transportation', icon: <FileText className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { id: 'legal', name: 'Legal Services', icon: <FileText className="h-4 w-4" />, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'education', name: 'Education', icon: <FileText className="h-4 w-4" />, color: 'bg-pink-100 text-pink-800 border-pink-200' },
  { id: 'employment', name: 'Employment', icon: <FileText className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800 border-gray-200' },
  { id: 'mental_health', name: 'Mental Health', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { id: 'social', name: 'Social Activities', icon: <Users className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'financial', name: 'Financial Support', icon: <DollarSign className="h-4 w-4" />, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'activities', name: 'Activities', icon: <Users className="h-4 w-4" />, color: 'bg-violet-100 text-violet-800 border-violet-200' },
  { id: 'other', name: 'Other', icon: <FileText className="h-4 w-4" />, color: 'bg-slate-100 text-slate-800 border-slate-200' },
];

export default function CommunityResourcesDirectory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // UI State
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
  
  // Selected items
  const [selectedResource, setSelectedResource] = useState<CommunityResource | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<ResourceReferral | null>(null);
  
  // Form data
  const [newReferral, setNewReferral] = useState({
    serviceUserId: '',
    serviceUserName: '',
    notes: ''
  });
  
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  
  // Fetch resources
  const { 
    data: resources = [], 
    isLoading: isLoadingResources,
    error: resourcesError 
  } = useQuery<CommunityResource[]>({
    queryKey: ['/api/community-resources'],
    // Using default queryFn
  });
  
  // Fetch resource locations
  const { 
    data: locations = [], 
    isLoading: isLoadingLocations 
  } = useQuery<ResourceLocation[]>({
    queryKey: ['/api/resource-locations'],
    // Using default queryFn
  });
  
  // Fetch user's referrals
  const { 
    data: referrals = [], 
    isLoading: isLoadingReferrals 
  } = useQuery<ResourceReferral[]>({
    queryKey: ['/api/resource-referrals'],
    // Using default queryFn
  });
  
  // Fetch service users (for referrals)
  const { 
    data: serviceUsers = [], 
    isLoading: isLoadingServiceUsers 
  } = useQuery<ServiceUser[]>({
    queryKey: ['/api/service-users'],
    // Using default queryFn
  });
  
  // Fetch user's bookmarks
  const { 
    data: bookmarks = [], 
    isLoading: isLoadingBookmarks 
  } = useQuery<ResourceBookmark[]>({
    queryKey: ['/api/resource-bookmarks'],
    // Using default queryFn
  });
  
  // Create referral mutation
  const createReferralMutation = useMutation({
    mutationFn: async (referralData: any) => {
      const response = await apiRequest('POST', '/api/resource-referrals', referralData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resource-referrals'] });
      toast({
        title: "Referral created",
        description: "The referral has been created successfully."
      });
      setShowReferralDialog(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error creating referral",
        description: error.message || "An error occurred while creating the referral."
      });
    }
  });
  
  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      const response = await apiRequest('POST', '/api/resource-reviews', reviewData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community-resources'] });
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!"
      });
      setShowReviewDialog(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error submitting review",
        description: error.message || "An error occurred while submitting your review."
      });
    }
  });
  
  // Toggle bookmark mutation
  const toggleBookmarkMutation = useMutation({
    mutationFn: async ({ resourceId, action }: { resourceId: number, action: 'add' | 'remove' }) => {
      if (action === 'add') {
        const response = await apiRequest('POST', '/api/resource-bookmarks', { resourceId });
        return await response.json();
      } else {
        // Find bookmark ID
        const bookmark = bookmarks.find(b => b.resourceId === resourceId);
        if (!bookmark) throw new Error('Bookmark not found');
        
        await apiRequest('DELETE', `/api/resource-bookmarks/${bookmark.id}`);
        return { success: true };
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/resource-bookmarks'] });
      
      // Update the resources with the new favorite status
      queryClient.setQueryData(['/api/community-resources'], (oldData: CommunityResource[] | undefined) => {
        if (!oldData) return [];
        
        return oldData.map(resource => {
          if (resource.id === variables.resourceId) {
            return { 
              ...resource, 
              isFavorite: variables.action === 'add' 
            };
          }
          return resource;
        });
      });
      
      toast({
        title: variables.action === 'add' ? "Added to favorites" : "Removed from favorites",
        description: `Resource has been ${variables.action === 'add' ? "added to" : "removed from"} your favorites.`
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error updating favorites",
        description: error.message || "An error occurred while updating your favorites."
      });
    }
  });
  
  // Filter resources
  const filteredResources = resources.filter(resource => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Categories filter
    const matchesCategory = selectedCategories.length === 0 || 
      resource.categories.some(cat => selectedCategories.includes(cat));
    
    // Location filter
    const matchesLocation = selectedLocation === 'all' || 
      (resource.location && resource.location.id.toString() === selectedLocation);
    
    // Distance filter (if applicable)
    const matchesDistance = !filterDistance || 
      (resource.location?.distance && resource.location.distance <= filterDistance);
    
    // Rating filter
    const matchesRating = !filterRating || 
      (resource.rating && resource.rating >= filterRating);
    
    // Free filter
    const matchesFree = filterFree === null || resource.isFree === filterFree;
    
    // Referral required filter
    const matchesReferral = filterReferralRequired === null || 
      resource.isReferralRequired === filterReferralRequired;
    
    return matchesSearch && matchesCategory && matchesLocation && 
      matchesDistance && matchesRating && matchesFree && matchesReferral;
  });
  
  // Get category badge
  const getCategoryBadge = (categoryId: string) => {
    const category = resourceCategories.find(cat => cat.id === categoryId);
    if (!category) return null;
    
    return (
      <Badge key={categoryId} variant="outline" className={`${category.color} mr-1 mb-1`}>
        {category.icon}
        <span className="ml-1">{category.name}</span>
      </Badge>
    );
  };
  
  // Format rating
  const renderRating = (rating?: number) => {
    if (!rating) return 'No ratings yet';
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)} ({resource.reviewCount})</span>
      </div>
    );
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    }).format(date);
  };
  
  // Handle category selection toggle
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
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
  
  // Open review dialog
  const openReviewDialog = (resource: CommunityResource) => {
    setSelectedResource(resource);
    setNewReview({
      rating: 5,
      comment: ''
    });
    setShowReviewDialog(true);
  };
  
  // Submit referral
  const submitReferral = () => {
    if (!selectedResource) return;
    
    if (!newReferral.serviceUserId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a service user"
      });
      return;
    }
    
    createReferralMutation.mutate({
      resourceId: selectedResource.id,
      serviceUserId: parseInt(newReferral.serviceUserId),
      notes: newReferral.notes,
      date: new Date().toISOString().split('T')[0]
    });
  };
  
  // Submit review
  const submitReview = () => {
    if (!selectedResource) return;
    
    createReviewMutation.mutate({
      resourceId: selectedResource.id,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0]
    });
  };
  
  // Toggle favorite status
  const toggleFavorite = (resource: CommunityResource) => {
    toggleBookmarkMutation.mutate({
      resourceId: resource.id,
      action: resource.isFavorite ? 'remove' : 'add'
    });
  };
  
  // Check if resource is already in user bookmarks
  useEffect(() => {
    if (!bookmarks.length || !resources.length) return;
    
    const resourcesWithFavorites = resources.map(resource => ({
      ...resource,
      isFavorite: bookmarks.some(b => b.resourceId === resource.id)
    }));
    
    queryClient.setQueryData(['/api/community-resources'], resourcesWithFavorites);
  }, [bookmarks, resources, queryClient]);
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedLocation('all');
    setFilterDistance(null);
    setFilterRating(null);
    setFilterFree(null);
    setFilterReferralRequired(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Community Resources Directory</h1>
          <p className="text-muted-foreground">Find and refer service users to local support services</p>
        </div>
        
        <Tabs defaultValue="all" className="w-[300px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all"></TabsContent>
          <TabsContent value="favorites"></TabsContent>
          <TabsContent value="referrals"></TabsContent>
        </Tabs>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="lg:w-1/4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Filters</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search resources..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium mb-2">Categories</h3>
                <div className="flex flex-wrap gap-1">
                  {resourceCategories.map(category => (
                    <Badge
                      key={category.id}
                      variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCategory(category.id)}
                    >
                      {category.icon}
                      <span className="ml-1">{category.name}</span>
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Location */}
              <div>
                <h3 className="text-sm font-medium mb-2">Location</h3>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name} {location.city && `(${location.city})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Distance */}
              <div>
                <h3 className="text-sm font-medium mb-2">Maximum Distance</h3>
                <Select
                  value={filterDistance?.toString() || ''}
                  onValueChange={(value) => setFilterDistance(value ? parseInt(value) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any distance</SelectItem>
                    <SelectItem value="5">Within 5 miles</SelectItem>
                    <SelectItem value="10">Within 10 miles</SelectItem>
                    <SelectItem value="20">Within 20 miles</SelectItem>
                    <SelectItem value="50">Within 50 miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Rating */}
              <div>
                <h3 className="text-sm font-medium mb-2">Minimum Rating</h3>
                <Select
                  value={filterRating?.toString() || ''}
                  onValueChange={(value) => setFilterRating(value ? parseInt(value) : null)}
                >
                  <SelectTrigger>
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
              
              {/* Cost */}
              <div>
                <h3 className="text-sm font-medium mb-2">Cost</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="free-only" 
                    checked={filterFree === true}
                    onCheckedChange={(checked) => 
                      setFilterFree(checked ? true : null)
                    }
                  />
                  <label
                    htmlFor="free-only"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Free services only
                  </label>
                </div>
              </div>
              
              {/* Referral */}
              <div>
                <h3 className="text-sm font-medium mb-2">Referral Required</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={filterReferralRequired === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterReferralRequired(
                      filterReferralRequired === false ? null : false
                    )}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    No
                  </Button>
                  <Button 
                    variant={filterReferralRequired === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterReferralRequired(
                      filterReferralRequired === true ? null : true
                    )}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Yes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Resources list */}
        <div className="lg:w-3/4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">
                {filteredResources.length} {filteredResources.length === 1 ? 'Resource' : 'Resources'} Found
              </h2>
            </div>
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="lg:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          {isLoadingResources ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading resources...</p>
            </div>
          ) : resourcesError ? (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <h3 className="font-medium text-destructive">Error loading resources</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please try again later or contact support if the problem persists.
                  </p>
                  <Button className="mt-4" onClick={() => 
                    queryClient.invalidateQueries({ queryKey: ['/api/community-resources'] })
                  }>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredResources.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-medium">No resources found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your filters or search criteria.
                  </p>
                  <Button className="mt-4" onClick={resetFilters}>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Reset filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map(resource => (
                <Card key={resource.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg line-clamp-1" title={resource.name}>{resource.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={resource.isFavorite ? "text-red-500" : "text-muted-foreground"}
                        onClick={() => toggleFavorite(resource)}
                      >
                        <Heart className={resource.isFavorite ? "fill-current" : ""} />
                      </Button>
                    </div>
                    {resource.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        <span>{resource.location.name}, {resource.location.city}</span>
                        {resource.location.distance && (
                          <span className="ml-1">({resource.location.distance} miles)</span>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="mb-2 text-sm line-clamp-2" title={resource.description}>
                      {resource.description}
                    </div>
                    
                    <div className="flex flex-wrap mb-2">
                      {resource.categories.slice(0, 3).map(cat => getCategoryBadge(cat))}
                      {resource.categories.length > 3 && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          +{resource.categories.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center mt-1 text-sm">
                      {renderRating(resource.rating)}
                    </div>
                    
                    {resource.isFree ? (
                      <Badge variant="outline" className="mt-2 bg-green-100 text-green-800">Free Service</Badge>
                    ) : (
                      <Badge variant="outline" className="mt-2 bg-blue-100 text-blue-800">Paid Service</Badge>
                    )}
                    
                    {resource.isReferralRequired && (
                      <Badge variant="outline" className="mt-2 ml-2 bg-orange-100 text-orange-800">Referral Required</Badge>
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-1 pb-3 flex justify-between">
                    <Button 
                      variant="outline" 
                      className="text-sm h-8 px-3 py-1" 
                      onClick={() => openResourceDetails(resource)}
                    >
                      View Details
                    </Button>
                    <Button 
                      className="text-sm h-8 px-3 py-1" 
                      onClick={() => openReferralDialog(resource)}
                    >
                      Refer Client
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Resource details dialog */}
      {selectedResource && (
        <Dialog open={showResourceDetailsDialog} onOpenChange={setShowResourceDetailsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center justify-between">
                <span>{selectedResource.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={selectedResource.isFavorite ? "text-red-500" : "text-muted-foreground"}
                  onClick={() => toggleFavorite(selectedResource)}
                >
                  <Heart className={selectedResource.isFavorite ? "fill-current" : ""} />
                </Button>
              </DialogTitle>
              <DialogDescription>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {selectedResource.location?.name}, {selectedResource.location?.city}
                    {selectedResource.location?.distance && (
                      <span className="ml-1">({selectedResource.location.distance} miles)</span>
                    )}
                  </span>
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-md font-medium mb-1">Description</h3>
                  <p className="text-sm">{selectedResource.description}</p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-1">Categories</h3>
                  <div className="flex flex-wrap">
                    {selectedResource.categories.map(cat => getCategoryBadge(cat))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-1">Rating</h3>
                  <div className="flex items-center">
                    {renderRating(selectedResource.rating)}
                    <Button variant="ghost" size="sm" className="ml-auto" onClick={() => {
                      setShowResourceDetailsDialog(false);
                      setTimeout(() => openReviewDialog(selectedResource), 100);
                    }}>
                      Add Review
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-1">Availability</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {selectedResource.availability?.monday && (
                      <div>
                        <span className="font-medium">Monday:</span> {selectedResource.availability.monday}
                      </div>
                    )}
                    {selectedResource.availability?.tuesday && (
                      <div>
                        <span className="font-medium">Tuesday:</span> {selectedResource.availability.tuesday}
                      </div>
                    )}
                    {selectedResource.availability?.wednesday && (
                      <div>
                        <span className="font-medium">Wednesday:</span> {selectedResource.availability.wednesday}
                      </div>
                    )}
                    {selectedResource.availability?.thursday && (
                      <div>
                        <span className="font-medium">Thursday:</span> {selectedResource.availability.thursday}
                      </div>
                    )}
                    {selectedResource.availability?.friday && (
                      <div>
                        <span className="font-medium">Friday:</span> {selectedResource.availability.friday}
                      </div>
                    )}
                    {selectedResource.availability?.saturday && (
                      <div>
                        <span className="font-medium">Saturday:</span> {selectedResource.availability.saturday}
                      </div>
                    )}
                    {selectedResource.availability?.sunday && (
                      <div>
                        <span className="font-medium">Sunday:</span> {selectedResource.availability.sunday}
                      </div>
                    )}
                  </div>
                  {selectedResource.availability?.notes && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Notes:</span> {selectedResource.availability.notes}
                    </div>
                  )}
                </div>
                
                {selectedResource.eligibilityCriteria && (
                  <div>
                    <h3 className="text-md font-medium mb-1">Eligibility Criteria</h3>
                    <div className="text-sm space-y-1">
                      {selectedResource.eligibilityCriteria.ageGroups && (
                        <div>
                          <span className="font-medium">Age Groups:</span> {Array.isArray(selectedResource.eligibilityCriteria.ageGroups) 
                            ? selectedResource.eligibilityCriteria.ageGroups.join(', ') 
                            : selectedResource.eligibilityCriteria.ageGroups}
                        </div>
                      )}
                      {selectedResource.eligibilityCriteria.conditions && (
                        <div>
                          <span className="font-medium">Conditions:</span> {Array.isArray(selectedResource.eligibilityCriteria.conditions) 
                            ? selectedResource.eligibilityCriteria.conditions.join(', ') 
                            : selectedResource.eligibilityCriteria.conditions}
                        </div>
                      )}
                      {selectedResource.eligibilityCriteria.otherCriteria && (
                        <div>
                          <span className="font-medium">Other Criteria:</span> {selectedResource.eligibilityCriteria.otherCriteria}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedResource.languages && selectedResource.languages.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium mb-1">Languages Supported</h3>
                    <div className="flex flex-wrap">
                      {selectedResource.languages.map((lang, index) => (
                        <Badge key={index} variant="outline" className="bg-purple-100 text-purple-800 mr-1 mb-1">
                          <Languages className="h-3 w-3 mr-1" />
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedResource.accessibilityFeatures && selectedResource.accessibilityFeatures.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium mb-1">Accessibility Features</h3>
                    <div className="flex flex-wrap">
                      {selectedResource.accessibilityFeatures.map((feature, index) => (
                        <Badge key={index} variant="outline" className="bg-teal-100 text-teal-800 mr-1 mb-1">
                          <Accessibility className="h-3 w-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedResource.isReferralRequired && (
                  <div>
                    <h3 className="text-md font-medium mb-1">Referral Information</h3>
                    <div className="text-sm space-y-1">
                      <div className="font-medium text-orange-700">This service requires a referral</div>
                      {selectedResource.referralProcess && (
                        <div>{selectedResource.referralProcess}</div>
                      )}
                      {selectedResource.referralContact && (
                        <div>
                          <span className="font-medium">Contact:</span> {selectedResource.referralContact}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium mb-1">Contact Information</h3>
                  <div className="text-sm space-y-2">
                    {selectedResource.contactPhone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <a href={`tel:${selectedResource.contactPhone}`} className="hover:underline">
                          {selectedResource.contactPhone}
                        </a>
                      </div>
                    )}
                    {selectedResource.contactEmail && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <a href={`mailto:${selectedResource.contactEmail}`} className="hover:underline">
                          {selectedResource.contactEmail}
                        </a>
                      </div>
                    )}
                    {selectedResource.website && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-gray-500" />
                        <a 
                          href={selectedResource.website.startsWith('http') ? selectedResource.website : `https://${selectedResource.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {selectedResource.website}
                        </a>
                      </div>
                    )}
                    {selectedResource.address && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                        <div>
                          {selectedResource.address}
                          {selectedResource.postcode && <div>{selectedResource.postcode}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-1">Cost Information</h3>
                  <div className="text-sm space-y-1">
                    <div>
                      <Badge variant={selectedResource.isFree ? "outline" : "secondary"} className={selectedResource.isFree ? "bg-green-100 text-green-800" : ""}>
                        {selectedResource.isFree ? "Free Service" : "Paid Service"}
                      </Badge>
                    </div>
                    {!selectedResource.isFree && selectedResource.pricing && (
                      <div>
                        <span className="font-medium">Pricing:</span> {selectedResource.pricing}
                      </div>
                    )}
                    {selectedResource.fundingOptions && selectedResource.fundingOptions.length > 0 && (
                      <div>
                        <span className="font-medium">Funding Options:</span> {selectedResource.fundingOptions.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedResource.serviceArea && (
                  <div>
                    <h3 className="text-md font-medium mb-1">Service Area</h3>
                    <div className="text-sm">{selectedResource.serviceArea}</div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-md font-medium mb-1">Last Updated</h3>
                  <div className="text-sm">{formatDate(selectedResource.lastUpdated)}</div>
                </div>
                
                <div className="pt-4">
                  <Button className="w-full" onClick={() => {
                    setShowResourceDetailsDialog(false);
                    setTimeout(() => openReferralDialog(selectedResource), 100);
                  }}>
                    Refer Client
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Referral dialog */}
      {selectedResource && (
        <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Refer Client to {selectedResource.name}</DialogTitle>
              <DialogDescription>
                Create a referral record for a service user
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="service-user" className="block text-sm font-medium mb-1">
                  Service User
                </label>
                <Select
                  value={newReferral.serviceUserId}
                  onValueChange={(value) => {
                    const user = serviceUsers.find(u => u.id.toString() === value);
                    setNewReferral({
                      ...newReferral,
                      serviceUserId: value,
                      serviceUserName: user ? user.fullName : ''
                    });
                  }}
                >
                  <SelectTrigger id="service-user">
                    <SelectValue placeholder="Select a service user" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceUsers.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  value={newReferral.notes}
                  onChange={(e) => setNewReferral({ ...newReferral, notes: e.target.value })}
                  placeholder="Add any additional notes about this referral"
                  className="resize-none"
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReferralDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitReferral}
                disabled={createReferralMutation.isPending || !newReferral.serviceUserId}
              >
                {createReferralMutation.isPending && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                )}
                Create Referral
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Review dialog */}
      {selectedResource && (
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review {selectedResource.name}</DialogTitle>
              <DialogDescription>
                Share your experience with this resource
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="icon"
                      className={newReview.rating >= star ? "text-yellow-400" : "text-gray-300"}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    >
                      <Star className={newReview.rating >= star ? "fill-current" : ""} />
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="review-comment" className="block text-sm font-medium mb-1">
                  Comments
                </label>
                <Textarea
                  id="review-comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your experience with this resource"
                  className="resize-none"
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitReview}
                disabled={createReviewMutation.isPending}
              >
                {createReviewMutation.isPending && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                )}
                Submit Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}