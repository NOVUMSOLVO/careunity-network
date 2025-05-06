import React from 'react';
import { 
  ConnectIcon,
  Building2,
  GraduationCap,
  HeartHandshake,
  Globe,
  Backpack,
  BadgePlus,
  HelpCircle,
  Clock,
  Lightbulb,
  Bookmark,
  History
} from 'lucide-react';
import { ResourceDirectory } from '@/components/community-resources/resource-directory';

export default function CommunityResourcesPage() {
  return (
    <div className="container mx-auto py-6 max-w-7xl px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Community Resources</h1>
        <p className="text-gray-500 max-w-4xl">
          Connect service users with local support services and community resources. Find, review, and make referrals to a wide range of organizations and services that can help meet the needs of those in your care.
        </p>
      </div>
      
      {/* Main Content */}
      <div className="space-y-8">
        <ResourceDirectory />
      </div>
    </div>
  );
}

// Note: This icon is not part of the standard Lucide React package, so we're defining it custom
function ConnectIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}