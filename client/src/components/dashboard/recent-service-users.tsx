import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AvatarWithStatus } from '@/components/ui/avatar-with-status';
import { Link } from 'wouter';

interface ServiceUser {
  id: number;
  fullName: string;
  lastVisit?: string;
  profileImage?: string;
}

interface RecentServiceUsersProps {
  serviceUsers: ServiceUser[];
  isLoading?: boolean;
}

export function RecentServiceUsers({
  serviceUsers,
  isLoading = false
}: RecentServiceUsersProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="px-4 py-5 sm:px-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-4 sm:py-5 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6 animate-pulse sm:border-b sm:border-gray-200 dark:sm:border-gray-700">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="mt-1 sm:mt-0 sm:col-span-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Recent Service Users
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Quickly access your recently visited service users
        </p>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
          {serviceUsers.map((user) => {
            // Generate initials for avatar fallback
            const initials = user.fullName
              .split(' ')
              .map(part => part[0])
              .join('')
              .toUpperCase()
              .substring(0, 2);
              
            return (
              <div 
                key={user.id} 
                className="py-4 sm:py-5 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition"
              >
                <Link href={`/service-users/${user.id}`}>
                  <div className="flex items-center">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      <AvatarWithStatus
                        src={user.profileImage || ''}
                        alt={user.fullName}
                        fallback={initials}
                        size="md"
                      />
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-3 ml-4">
                      <div className="font-medium">{user.fullName}</div>
                      {user.lastVisit && (
                        <div className="text-gray-500 dark:text-gray-400">Last visit: {user.lastVisit}</div>
                      )}
                    </dd>
                  </div>
                </Link>
              </div>
            );
          })}
        </dl>
      </div>
    </Card>
  );
}
