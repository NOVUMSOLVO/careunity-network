import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'wouter';

export default function Calendar() {
  // Mock data - would come from API in a real app
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const appointments = [
    { id: 1, time: '09:00 AM', client: 'John Smith', type: 'Medication Review', duration: '30 min' },
    { id: 2, time: '10:30 AM', client: 'Sarah Johnson', type: 'Care Plan Review', duration: '45 min' },
    { id: 3, time: '01:00 PM', client: 'Robert Davis', type: 'Physical Assessment', duration: '60 min' },
    { id: 4, time: '03:15 PM', client: 'Emily Wilson', type: 'Follow-up Check', duration: '30 min' },
  ];

  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
          <p className="text-gray-600">Manage appointments and schedule</p>
        </div>
        <button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => {
            setShowAppointmentForm(true);
            alert('New Appointment form will be displayed in the next release');
          }}
        >
          <CalendarIcon size={18} />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => alert('Previous month will be displayed in the next release')}
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">{currentMonth}</h2>
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => alert('Next month will be displayed in the next release')}
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-lg">
          <CalendarIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Full calendar implementation coming soon</p>
          <p className="text-sm text-gray-500 mt-1">This is a placeholder for the calendar component</p>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Today's Appointments</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {appointments.map(appointment => (
            <div key={appointment.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{appointment.time}</p>
                    <p className="text-gray-600">{appointment.client}</p>
                    <p className="text-sm text-gray-500 mt-1">{appointment.type} • {appointment.duration}</p>
                  </div>
                </div>
                <div>
                  <button 
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                    onClick={() => alert(`Details for appointment with ${appointment.client} will be displayed in the next release`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}