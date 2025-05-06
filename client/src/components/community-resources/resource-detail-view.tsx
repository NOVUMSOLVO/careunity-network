import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  Clock, 
  Calendar,
  Heart, 
  Share2, 
  Bookmark, 
  Star, 
  Info,
  AlertCircle,
  User,
  CreditCard,
  ArrowUpRight,
  MessageSquare,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Languages,
  Accessibility,
  Home,
  FileText
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { ResourceReferralForm } from './resource-referral-form';
import { ResourceReviewList } from './resource-review-list';
import type { CommunityResource } from '@shared/schema';

export interface ResourceDetailViewProps {
  resource: CommunityResource;
  onClose?: () => void;
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

export function ResourceDetailView({ resource, onClose }: ResourceDetailViewProps) {
  const [activeTab, setActiveTab] = useState<string>('details');
  const [showReferralDialog, setShowReferralDialog] = useState<boolean>(false);
  
  // Format availability for display
  const formatAvailability = (availability: any) => {
    if (!availability) return 'No information available';
    
    return Object.entries(availability)
      .map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`)
      .join('\n');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <CardTitle className="text-2xl">{resource.name}</CardTitle>
              <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                {resource.categories.map((category) => (
                  <Badge key={category} className={getCategoryColor(category)}>
                    {getCategoryLabel(category)}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={resource.rating} />
                <span className="text-sm text-gray-500">({resource.reviewCount} reviews)</span>
                
                {resource.isFree ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200 ml-2">
                    Free Service
                  </Badge>
                ) : null}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-1.5">
                <Bookmark className="h-4 w-4" />
                <span>Save</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1.5">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Copy Link</DropdownMenuItem>
                  <DropdownMenuItem>Email</DropdownMenuItem>
                  <DropdownMenuItem>Print</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>Make Referral</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Make a Referral</DialogTitle>
                    <DialogDescription>
                      Refer a service user to {resource.name}
                    </DialogDescription>
                  </DialogHeader>
                  <ResourceReferralForm 
                    resource={resource} 
                    onSuccess={() => setShowReferralDialog(false)} 
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="referrals">Referral Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-8 pt-4">
              <div>
                <h3 className="text-base font-medium mb-2">About</h3>
                <p className="text-gray-600">{resource.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-medium mb-3">Contact Information</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-gray-600">{resource.address}</p>
                        <p className="text-gray-600">{resource.postcode}</p>
                      </div>
                    </div>
                    
                    {resource.contactPhone && (
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-gray-600">{resource.contactPhone}</span>
                      </div>
                    )}
                    
                    {resource.contactEmail && (
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-gray-600">{resource.contactEmail}</span>
                      </div>
                    )}
                    
                    {resource.website && (
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-500 mr-2" />
                        <a 
                          href={resource.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          {resource.website}
                          <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-3">Opening Hours</h3>
                  <div className="bg-gray-50 rounded-md p-3 text-sm leading-relaxed whitespace-pre-line">
                    {formatAvailability(resource.availability)}
                  </div>
                </div>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="eligibility">
                  <AccordionTrigger>Eligibility Criteria</AccordionTrigger>
                  <AccordionContent>
                    {resource.eligibilityCriteria ? (
                      <div className="space-y-2 py-1">
                        {resource.eligibilityCriteria.age && (
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <span className="font-medium">Age: </span>
                              <span>{resource.eligibilityCriteria.age}</span>
                            </div>
                          </div>
                        )}
                        {resource.eligibilityCriteria.income && (
                          <div className="flex items-start gap-2">
                            <CreditCard className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <span className="font-medium">Income: </span>
                              <span>{resource.eligibilityCriteria.income}</span>
                            </div>
                          </div>
                        )}
                        {resource.eligibilityCriteria.residence && (
                          <div className="flex items-start gap-2">
                            <Home className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <span className="font-medium">Residence: </span>
                              <span>{resource.eligibilityCriteria.residence}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>No specific eligibility criteria specified.</div>
                    )}
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="costs">
                  <AccordionTrigger>Costs & Funding</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 py-1">
                      <div className="flex items-start gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="font-medium">Cost: </span>
                          <span>
                            {resource.isFree ? 'Free service' : resource.pricing || 'Cost information not available'}
                          </span>
                        </div>
                      </div>
                      
                      {resource.fundingOptions && resource.fundingOptions.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <span className="font-medium">Funding Options: </span>
                            <span>{resource.fundingOptions.join(', ')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {(resource.languages && resource.languages.length > 0) || 
                 (resource.accessibilityFeatures && resource.accessibilityFeatures.length > 0) ? (
                  <AccordionItem value="accessibility">
                    <AccordionTrigger>Accessibility Information</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 py-1">
                        {resource.languages && resource.languages.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Languages className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <span className="font-medium">Languages: </span>
                              <span>{resource.languages.join(', ')}</span>
                            </div>
                          </div>
                        )}
                        
                        {resource.accessibilityFeatures && resource.accessibilityFeatures.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Accessibility className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <span className="font-medium">Accessibility Features: </span>
                              <span>{resource.accessibilityFeatures.join(', ')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ) : null}
              </Accordion>
              
              <div>
                <h3 className="text-base font-medium mb-3">Service Area</h3>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-600">{resource.serviceArea || 'No information available'}</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="pt-4">
              <ResourceReviewList resourceId={resource.id} />
            </TabsContent>
            
            <TabsContent value="referrals" className="pt-4">
              <div className="space-y-4">
                <div className={`p-4 rounded-md ${resource.isReferralRequired ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
                  <div className="flex items-start">
                    {resource.isReferralRequired ? (
                      <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    )}
                    <div>
                      <h3 className="font-medium">
                        {resource.isReferralRequired ? 'Referral Required' : 'No Referral Required'}
                      </h3>
                      <p className="text-sm mt-1">
                        {resource.isReferralRequired 
                          ? 'This service requires a formal referral before access can be arranged.'
                          : 'This service can be accessed directly without a formal referral process.'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {resource.isReferralRequired && (
                  <div className="space-y-3">
                    <h3 className="text-base font-medium">Referral Process</h3>
                    <p className="text-gray-600">{resource.referralProcess || 'No detailed information available about the referral process.'}</p>
                    
                    {resource.referralContact && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Referral Contact</h4>
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-1.5" />
                          <span>{resource.referralContact}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-base font-medium mb-2">Make a Referral</h3>
                  <p className="text-gray-600 mb-4">
                    You can make a referral to this service for a service user through the CareUnity system.
                  </p>
                  
                  <Button onClick={() => setShowReferralDialog(true)}>
                    Start Referral Process
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}