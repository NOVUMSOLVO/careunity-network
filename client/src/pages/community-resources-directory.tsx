import React from 'react';
import { 
  Link as LinkIcon,
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