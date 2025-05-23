/**
 * Visit Detail Page
 * 
 * A mobile-optimized page for viewing and managing a specific care visit.
 */

import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { 
  Clock, 
  Calendar, 
  User, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Edit,
  ArrowLeft,
  MapPin,
  MessageSquare,
  Star,
  ChevronRight
} from 'lucide-react';
import { useVisitsApi } from '@/hooks/use-visits-api';
import { useDevice } from '@/hooks/use-mobile';
import { TouchButton } from '@/components/ui/touch-button';
import { MobileForm, MobileFormField, MobileFormTextArea } from '@/components/ui/mobile-form';
import { Visit, VisitStatus } from '@shared/api-client/services/visit-api';
import { cn } from '@/lib/utils';

export default function VisitDetailPage() {
  const [, params] = useRoute<{ id: string }>('/visits/:id');
  const [, navigate] = useLocation();
  const visitId = params ? parseInt(params.id, 10) : 0;
  
  const { useVisit, useCompleteVisit, useCancelVisit } = useVisitsApi();
  const { data: visit, isLoading, error } = useVisit(visitId);
  const completeVisit = useCompleteVisit();
  const cancelVisit = useCancelVisit();
  
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completeFormData, setCompleteFormData] = useState({
    notes: '',
    feedback: '',
    feedbackRating: 5
  });
  
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  const { isMobile } = useDevice();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    return format(parseISO(timeString), 'h:mm a');
  };

  // Get status color
  const getStatusColor = (status: VisitStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'missed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle complete form change
  const handleCompleteFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompleteFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle complete visit
  const handleCompleteVisit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await completeVisit.mutateAsync({
        id: visitId,
        data: completeFormData
      });
      setShowCompleteForm(false);
    } catch (error) {
      console.error('Error completing visit:', error);
    }
  };

  // Handle cancel visit
  const handleCancelVisit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await cancelVisit.mutateAsync({
        id: visitId,
        reason: cancelReason
      });
      setShowCancelForm(false);
    } catch (error) {
      console.error('Error cancelling visit:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error || !visit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <p>Error loading visit. Please try again.</p>
          <TouchButton
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/visits')}
            startIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Visits
          </TouchButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex items-center py-4">
        <TouchButton
          variant="ghost"
          size="icon"
          onClick={() => navigate('/visits')}
          className="mr-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </TouchButton>
        <h1 className="text-xl font-bold">Visit Details</h1>
      </div>

      {/* Visit status */}
      <div className={cn(
        "px-4 py-2 rounded-lg mb-4 flex items-center",
        getStatusColor(visit.status)
      )}>
        {visit.status === 'scheduled' && <Clock className="w-5 h-5 mr-2" />}
        {visit.status === 'in-progress' && <AlertCircle className="w-5 h-5 mr-2" />}
        {visit.status === 'completed' && <CheckCircle className="w-5 h-5 mr-2" />}
        {visit.status === 'cancelled' && <XCircle className="w-5 h-5 mr-2" />}
        {visit.status === 'missed' && <XCircle className="w-5 h-5 mr-2" />}
        <span className="font-medium capitalize">{visit.status}</span>
      </div>

      {/* Visit details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">{visit.visitType}</h2>
        
        <div className="space-y-4">
          {/* Date and time */}
          <div className="flex items-start">
            <Calendar className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="font-medium">{formatDate(visit.date)}</p>
              <p className="text-gray-600">{formatTime(visit.startTime)} - {formatTime(visit.endTime)}</p>
            </div>
          </div>
          
          {/* Service user */}
          <div className="flex items-start">
            <User className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="font-medium">Service User</p>
              <p className="text-gray-600">{visit.serviceUser?.fullName || 'Unknown'}</p>
              <TouchButton
                variant="ghost"
                size="sm"
                className="mt-1 -ml-2 text-primary"
                onClick={() => navigate(`/service-users/${visit.serviceUserId}`)}
              >
                View Profile
              </TouchButton>
            </div>
          </div>
          
          {/* Caregiver */}
          {visit.caregiver && (
            <div className="flex items-start">
              <Users className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium">Caregiver</p>
                <p className="text-gray-600">{visit.caregiver.fullName}</p>
              </div>
            </div>
          )}
          
          {/* Priority */}
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="font-medium">Priority</p>
              <p className="capitalize text-gray-600">{visit.priority}</p>
            </div>
          </div>
          
          {/* Notes */}
          {visit.notes && (
            <div className="flex items-start">
              <MessageSquare className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium">Notes</p>
                <p className="text-gray-600 whitespace-pre-line">{visit.notes}</p>
              </div>
            </div>
          )}
          
          {/* Feedback (if completed) */}
          {visit.status === 'completed' && visit.feedback && (
            <div className="flex items-start">
              <Star className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium">Feedback</p>
                <div className="flex items-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < (visit.feedbackRating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <p className="text-gray-600">{visit.feedback}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {visit.status === 'scheduled' && (
        <div className="flex flex-col gap-3">
          <TouchButton
            variant="primary"
            onClick={() => setShowCompleteForm(true)}
            startIcon={<CheckCircle className="w-5 h-5" />}
          >
            Complete Visit
          </TouchButton>
          
          <TouchButton
            variant="outline"
            onClick={() => navigate(`/visits/${visit.id}/edit`)}
            startIcon={<Edit className="w-5 h-5" />}
          >
            Edit Visit
          </TouchButton>
          
          <TouchButton
            variant="destructive"
            onClick={() => setShowCancelForm(true)}
            startIcon={<XCircle className="w-5 h-5" />}
          >
            Cancel Visit
          </TouchButton>
        </div>
      )}

      {/* Complete visit form */}
      {showCompleteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4 lg:items-center animate-fade-in">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-swipe-right">
            <MobileForm
              title="Complete Visit"
              description="Please provide details about the completed visit."
              onSubmit={handleCompleteVisit}
              onCancel={() => setShowCompleteForm(false)}
              submitText="Complete Visit"
              isSubmitting={completeVisit.isPending}
              card={false}
            >
              <MobileFormTextArea
                label="Notes"
                name="notes"
                value={completeFormData.notes}
                onChange={handleCompleteFormChange}
                placeholder="Enter any notes about the visit..."
                rows={3}
              />
              
              <MobileFormTextArea
                label="Feedback"
                name="feedback"
                value={completeFormData.feedback}
                onChange={handleCompleteFormChange}
                placeholder="Enter any feedback from the service user..."
                rows={3}
              />
              
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCompleteFormData(prev => ({ ...prev, feedbackRating: i + 1 }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={cn(
                          "w-8 h-8 transition-colors",
                          i < completeFormData.feedbackRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </MobileForm>
          </div>
        </div>
      )}

      {/* Cancel visit form */}
      {showCancelForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4 lg:items-center animate-fade-in">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-swipe-right">
            <MobileForm
              title="Cancel Visit"
              description="Please provide a reason for cancelling this visit."
              onSubmit={handleCancelVisit}
              onCancel={() => setShowCancelForm(false)}
              submitText="Cancel Visit"
              isSubmitting={cancelVisit.isPending}
              card={false}
            >
              <MobileFormTextArea
                label="Reason"
                name="reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                rows={3}
                required
              />
            </MobileForm>
          </div>
        </div>
      )}
    </div>
  );
}
