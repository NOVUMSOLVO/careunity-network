import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AvatarWithStatus } from '@/components/ui/avatar-with-status';
import { Button } from '@/components/ui/button';
import { Printer, Edit } from 'lucide-react';

interface Preference {
  likes: string[];
  dislikes: string[];
}

interface ServiceUserDetailProps {
  id: number;
  fullName: string;
  uniqueId: string;
  dateOfBirth: string;
  address: string;
  phoneNumber?: string;
  emergencyContact?: string;
  profileImage?: string;
  preferences?: Preference;
  lifeStory?: string;
  isLoading?: boolean;
}

export function ServiceUserDetail({
  id,
  fullName,
  uniqueId,
  dateOfBirth,
  address,
  phoneNumber,
  emergencyContact,
  profileImage,
  preferences,
  lifeStory,
  isLoading = false
}: ServiceUserDetailProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="px-4 py-5 sm:px-6 animate-pulse flex justify-between">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="ml-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'Unknown';
    
    try {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) return 'Unknown';
      
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      return age;
    } catch (e) {
      return 'Unknown';
    }
  };

  // Generate initials for avatar fallback
  const initials = fullName 
    ? fullName
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'SU';

  // Parse preferences if they exist
  const parsedPreferences = preferences || { likes: [], dislikes: [] };

  return (
    <Card>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <AvatarWithStatus
            src={profileImage || ''}
            alt={fullName}
            fallback={initials}
            size="lg"
          />
          <div className="ml-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {fullName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID: {uniqueId || 'Unknown'} {dateOfBirth ? `• ${calculateAge(dateOfBirth)} years` : ''}
            </p>
          </div>
        </div>
        <div className="flex">
          <Button variant="outline" className="mr-3 flex items-center">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" className="flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Life Story & Preferences
        </h3>
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">{lifeStory}</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Likes</h4>
              <ul className="mt-2 list-disc list-inside">
                {parsedPreferences.likes.map((like, index) => (
                  <li key={index}>{like}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Dislikes</h4>
              <ul className="mt-2 list-disc list-inside">
                {parsedPreferences.dislikes.map((dislike, index) => (
                  <li key={index}>{dislike}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
