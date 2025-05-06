import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { CommunityResource } from '@shared/schema';

export interface ResourceMapViewProps {
  resources: CommunityResource[];
  onSelectResource: (resource: CommunityResource) => void;
}

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

export function ResourceMapView({ resources, onSelectResource }: ResourceMapViewProps) {
  return (
    <div className="space-y-4">
      <div className="p-8 border border-dashed rounded-lg text-center bg-gray-50">
        <div className="flex flex-col items-center justify-center">
          <MapPin className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">Interactive Map</h3>
          <p className="text-gray-500 mt-2 max-w-md">
            In a production environment, this would display an interactive map showing the locations of all community resources. The map would allow filtering, zooming, and clicking on resources to view details.
          </p>
        </div>
      </div>
      
      <h3 className="text-lg font-medium mt-6 mb-3">Resources in this Area</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium truncate">{resource.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {resource.categories[0] && (
                      <Badge className={getCategoryColor(resource.categories[0])}>
                        {resource.categories[0].replace('_', ' ')}
                      </Badge>
                    )}
                    {resource.categories.length > 1 && (
                      <Badge variant="outline">
                        +{resource.categories.length - 1} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-1.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 line-clamp-1">{resource.address}</span>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => onSelectResource(resource)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}