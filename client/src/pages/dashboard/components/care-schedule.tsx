import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  MoreHorizontalIcon
} from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface Visit {
  id: string;
  serviceUser: {
    id: string;
    name: string;
    profileImage?: string;
  };
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  visitType: string;
  location: string;
}

interface CareScheduleProps {
  data?: Visit[];
}

/**
 * Care schedule component
 *
 * Displays the care schedule for the current day
 */
export function CareSchedule({ data }: CareScheduleProps) {
  if (!data) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-muted-foreground">Loading schedule...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">No visits scheduled for today</p>
        <Button variant="outline" size="sm">
          View Full Schedule
        </Button>
      </div>
    );
  }

  // Get status badge
  const getStatusBadge = (status: Visit['status']) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline"><ClockIcon className="mr-1 h-3 w-3" /> Scheduled</Badge>;
      case 'in-progress':
        return <Badge variant="secondary"><ClockIcon className="mr-1 h-3 w-3" /> In Progress</Badge>;
      case 'completed':
        return <Badge variant="success"><CheckCircleIcon className="mr-1 h-3 w-3" /> Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircleIcon className="mr-1 h-3 w-3" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Service User</TableHead>
            <TableHead>Visit Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((visit) => (
            <TableRow key={visit.id}>
              <TableCell className="font-medium">
                {formatTime(visit.startTime)} - {formatTime(visit.endTime)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {visit.serviceUser.profileImage ? (
                    <div className="h-8 w-8 rounded-full overflow-hidden">
                      <ResponsiveImage
                        src={visit.serviceUser.profileImage}
                        alt={visit.serviceUser.name}
                        className="h-8 w-8 object-cover"
                        aspectRatio={1}
                        objectFit="cover"
                        fallbackSrc="/images/placeholder.svg"
                        lowQualityPlaceholder={true}
                        blurEffect={true}
                        usePicture={true}
                        // Generate WebP version if the original isn't already WebP
                        webpSrcSet={!visit.serviceUser.profileImage.includes('.webp') ?
                          `${visit.serviceUser.profileImage}?format=webp&width=32 32w, ${visit.serviceUser.profileImage}?format=webp&width=64 64w` :
                          undefined}
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                  <span>{visit.serviceUser.name}</span>
                </div>
              </TableCell>
              <TableCell>{visit.visitType}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{visit.location}</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(visit.status)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Start Visit</DropdownMenuItem>
                    <DropdownMenuItem>Complete Visit</DropdownMenuItem>
                    <DropdownMenuItem>Reschedule</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Cancel Visit</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-center">
        <Button variant="outline" size="sm">
          View Full Schedule
        </Button>
      </div>
    </div>
  );
}
