/**
 * Visits Page
 * 
 * A mobile-optimized page for viewing and managing care visits.
 */

import React, { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { 
  Clock, 
  Calendar, 
  User, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { useVisitsApi } from '@/hooks/use-visits-api';
import { useDevice } from '@/hooks/use-mobile';
import { MobileCard, MobileCardDelete, MobileCardEdit } from '@/components/ui/mobile-card';
import { TouchButton } from '@/components/ui/touch-button';
import { MobileForm, MobileFormField } from '@/components/ui/mobile-form';
import { Visit, VisitStatus } from '@shared/api-client/services/visit-api';
import { cn } from '@/lib/utils';

export default function VisitsPage() {
  const [searchParams, setSearchParams] = useState({
    date: '',
    status: '',
    caregiverId: '',
    serviceUserId: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { useVisits, useCancelVisit } = useVisitsApi();
  const { data: visits, isLoading, error } = useVisits(searchParams);
  const cancelVisit = useCancelVisit();
  const { isMobile } = useDevice();
  const [, navigate] = useLocation();

  // Group visits by date
  const groupedVisits = React.useMemo(() => {
    if (!visits) return {};
    
    return visits.reduce((acc, visit) => {
      const date = visit.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(visit);
      return acc;
    }, {} as Record<string, Visit[]>);
  }, [visits]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d');
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    return format(parseISO(timeString), 'h:mm a');
  };

  // Get status badge color
  const getStatusColor = (status: VisitStatus) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'in-progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'missed': return 'error';
      default: return 'primary';
    }
  };

  // Get status icon
  const getStatusIcon = (status: VisitStatus) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'missed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Handle visit cancellation
  const handleCancelVisit = async (visitId: number) => {
    if (confirm('Are you sure you want to cancel this visit?')) {
      try {
        await cancelVisit.mutateAsync({ 
          id: visitId, 
          reason: 'Cancelled by user' 
        });
      } catch (error) {
        console.error('Error cancelling visit:', error);
      }
    }
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Reset filters
  const resetFilters = () => {
    setSearchParams({
      date: '',
      status: '',
      caregiverId: '',
      serviceUserId: ''
    });
    setShowFilters(false);
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold">Visits</h1>
        <TouchButton
          variant="primary"
          size="sm"
          startIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/visits/new')}
        >
          New Visit
        </TouchButton>
      </div>

      {/* Search and filters */}
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <MobileFormField
            label=""
            name="search"
            type="search"
            placeholder="Search visits..."
            className="flex-1"
            inputClassName="pl-10"
            onChange={handleSearchChange}
          />
          <TouchButton
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && 'bg-gray-100')}
          >
            <Filter className="w-5 h-5" />
          </TouchButton>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4 animate-fade-in">
            <h3 className="font-medium mb-3">Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MobileFormField
                label="Date"
                name="date"
                type="date"
                value={searchParams.date}
                onChange={handleSearchChange}
                compact
              />
              <MobileFormField
                label="Status"
                name="status"
                type="select"
                value={searchParams.status}
                onChange={handleSearchChange}
                compact
              />
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <TouchButton
                variant="outline"
                size="sm"
                onClick={resetFilters}
              >
                Reset
              </TouchButton>
              <TouchButton
                variant="primary"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                Apply
              </TouchButton>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">
          <p>Error loading visits. Please try again.</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && visits && visits.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No visits found</h3>
          <p className="text-gray-500 mb-4">There are no visits matching your criteria.</p>
          <TouchButton
            variant="outline"
            onClick={() => navigate('/visits/new')}
            startIcon={<Plus className="w-4 h-4" />}
          >
            Create a new visit
          </TouchButton>
        </div>
      )}

      {/* Visits list */}
      {!isLoading && visits && visits.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedVisits).map(([date, dateVisits]) => (
            <div key={date}>
              <h2 className="text-lg font-semibold mb-2">{formatDate(date)}</h2>
              <div className="space-y-3">
                {dateVisits.map((visit) => (
                  <MobileCard
                    key={visit.id}
                    title={visit.visitType}
                    subtitle={`${formatTime(visit.startTime)} - ${formatTime(visit.endTime)}`}
                    icon={getStatusIcon(visit.status)}
                    clickable
                    onClick={() => navigate(`/visits/${visit.id}`)}
                    badge={visit.status}
                    badgeColor={getStatusColor(visit.status)}
                    leftSwipeActions={
                      visit.status === 'scheduled' && (
                        <MobileCardDelete
                          onDelete={() => handleCancelVisit(visit.id)}
                          confirmLabel="Cancel"
                        />
                      )
                    }
                    rightSwipeActions={
                      visit.status === 'scheduled' && (
                        <MobileCardEdit
                          onEdit={() => navigate(`/visits/${visit.id}/edit`)}
                        />
                      )
                    }
                  >
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>{visit.serviceUser?.fullName || 'Unknown service user'}</span>
                      </div>
                      {visit.caregiver && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{visit.caregiver.fullName}</span>
                        </div>
                      )}
                    </div>
                  </MobileCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add button for mobile */}
      {isMobile && (
        <div className="fixed right-4 bottom-20 z-10">
          <TouchButton
            variant="primary"
            size="icon"
            className="rounded-full shadow-lg w-14 h-14"
            onClick={() => navigate('/visits/new')}
          >
            <Plus className="w-6 h-6" />
          </TouchButton>
        </div>
      )}
    </div>
  );
}
