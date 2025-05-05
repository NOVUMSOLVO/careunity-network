import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AvatarWithStatus } from '@/components/ui/avatar-with-status';
import { MapPin, Phone, Calendar } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

export interface ServiceUserCardProps {
  id: number;
  name: string;
  uniqueId: string;
  age: string;
  address: string;
  phoneNumber?: string;
  nextVisit?: string;
  profileImage?: string;
  categories: { label: string; color: string }[];
  className?: string;
}

export function ServiceUserCard({
  id,
  name,
  uniqueId,
  age,
  address,
  phoneNumber,
  nextVisit,
  profileImage,
  categories,
  className
}: ServiceUserCardProps) {
  // Generate initials for avatar fallback
  const initials = name
    ? name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'SU';
    
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AvatarWithStatus
              src={profileImage || ''}
              alt={name}
              fallback={initials}
              size="lg"
            />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID: {uniqueId} • {age}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {categories.map((category, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline"
                  className={cn(
                    "px-2 text-xs leading-5 font-semibold rounded-full",
                    `bg-${category.color}-100 text-${category.color}-800 dark:bg-${category.color}-900 dark:text-${category.color}-200`
                  )}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <p>{address}</p>
          </div>
          
          {phoneNumber && (
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <p>{phoneNumber}</p>
            </div>
          )}
          
          {nextVisit && (
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <p>Next visit: {nextVisit}</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex">
          <Link href={`/service-users/${id}`} className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium">
            View Details
          </Link>
          <span className="text-gray-500 dark:text-gray-400 mx-2">•</span>
          <Link href={`/care-plans/${id}`} className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium">
            Care Plan
          </Link>
          <span className="text-gray-500 dark:text-gray-400 mx-2">•</span>
          <Link href={`/service-users/${id}/notes`} className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium">
            Notes
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
