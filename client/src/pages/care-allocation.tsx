import React from 'react';
import { Users2, Calendar, Filter, ArrowDown, ArrowUp, Clock } from 'lucide-react';

export default function CareAllocation() {
  // Mock data - would come from API in a real app
  const caregivers = [
    { id: 1, name: 'Jane Wilson', role: 'Senior Caregiver', availability: 'Full-time', status: 'available', appointments: 4 },
    { id: 2, name: 'Michael Brown', role: 'Caregiver', availability: 'Part-time', status: 'busy', appointments: 6 },
    { id: 3, name: 'Emily Roberts', role: 'Senior Caregiver', availability: 'Full-time', status: 'available', appointments: 3 },
    { id: 4, name: 'David Thompson', role: 'Caregiver', availability: 'Full-time', status: 'off', appointments: 0 },
    { id: 5, name: 'Susan White', role: 'Caregiver', availability: 'Part-time', status: 'available', appointments: 2 },
  ];

  const unallocatedAppointments = [
    { id: 1, time: '09:00 AM', client: 'Thomas Harris', type: 'Home Visit', duration: '45 min', address: '123 Main St, London' },
    { id: 2, time: '11:30 AM', client: 'Patricia Young', type: 'Medication Review', duration: '30 min', address: '45 Park Ave, London' },
    { id: 3, time: '02:00 PM', client: 'George Miller', type: 'Physical Assessment', duration: '60 min', address: '78 Oak Road, London' },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'available':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Available</span>;
      case 'busy':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Busy</span>;
      case 'off':
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Off Duty</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Care Allocation</h1>
          <p className="text-gray-600">Assign caregivers to appointments and service users</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Calendar size={18} />
          <span>View Schedule</span>
        </button>
      </div>

      {/* Date selection and filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              id="date"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="filterCaregiver" className="block text-sm font-medium text-gray-700 mb-1">Filter Caregivers</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
              <select
                id="filterCaregiver"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
              >
                <option value="">All Caregivers</option>
                <option value="available">Available Only</option>
                <option value="senior">Senior Caregivers</option>
                <option value="part-time">Part-time</option>
                <option value="full-time">Full-time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Caregivers list */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Available Caregivers</h2>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded hover:bg-gray-100">
                <ArrowUp className="h-4 w-4 text-gray-500" />
              </button>
              <button className="p-1 rounded hover:bg-gray-100">
                <ArrowDown className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {caregivers.map(caregiver => (
              <div key={caregiver.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                      {caregiver.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{caregiver.name}</h3>
                      <p className="text-sm text-gray-600">{caregiver.role} • {caregiver.availability}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {getStatusBadge(caregiver.status)}
                    <p className="text-xs text-gray-500 mt-1">{caregiver.appointments} appointments today</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unallocated appointments */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Unallocated Appointments</h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">Drag appointments to allocate them to caregivers</p>
            <div className="space-y-3">
              {unallocatedAppointments.map(appointment => (
                <div 
                  key={appointment.id} 
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 cursor-move"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-800">{appointment.time}</span>
                        <span className="mx-1.5 text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{appointment.duration}</span>
                      </div>
                      <h3 className="font-medium text-gray-800 mt-1">{appointment.client}</h3>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                      <p className="text-xs text-gray-500 mt-1">{appointment.address}</p>
                    </div>
                    <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded">
                      Allocate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}