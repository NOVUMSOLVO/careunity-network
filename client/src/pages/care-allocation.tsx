import React, { useState } from 'react';
import { Users2, Calendar, Filter, ArrowDown, ArrowUp, Clock, MapPin, Route, Brain, ChevronDown, ChevronUp, Layers, BarChart2 } from 'lucide-react';
import { Link } from 'wouter';

export default function CareAllocation() {
  const [showAllocationTools, setShowAllocationTools] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<number | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [allocationAlgorithm, setAllocationAlgorithm] = useState<'proximity' | 'skills' | 'continuity' | 'balanced'>('balanced');
  
  // Sample caregiver data with expanded properties to match requirements
  const caregivers = [
    { 
      id: 1, 
      name: 'Jane Wilson', 
      role: 'Senior Caregiver',
      availability: 'Full-time', 
      status: 'available', 
      appointments: 4,
      skills: ['Medication Management', 'Dementia Care', 'First Aid'],
      location: { lat: 51.5074, lng: -0.1278, address: '15 Baker St, London' },
      travelRadius: 5, // in miles
      workingHours: { start: '08:00', end: '16:00' },
      preferredServiceUsers: [101, 104],
      currentLoad: 70, // percentage of capacity
    },
    { 
      id: 2, 
      name: 'Michael Brown', 
      role: 'Caregiver',
      availability: 'Part-time', 
      status: 'busy', 
      appointments: 6,
      skills: ['Personal Care', 'Mobility Assistance'],
      location: { lat: 51.5137, lng: -0.1171, address: '42 Oxford St, London' },
      travelRadius: 3,
      workingHours: { start: '10:00', end: '18:00' },
      preferredServiceUsers: [102],
      currentLoad: 90,
    },
    { 
      id: 3, 
      name: 'Emily Roberts', 
      role: 'Senior Caregiver',
      availability: 'Full-time', 
      status: 'available', 
      appointments: 3,
      skills: ['Medication Management', 'Wound Care', 'Diabetes Management'],
      location: { lat: 51.4975, lng: -0.1357, address: '8 Victoria St, London' },
      travelRadius: 7,
      workingHours: { start: '07:00', end: '15:00' },
      preferredServiceUsers: [103],
      currentLoad: 50,
    },
    { 
      id: 4, 
      name: 'David Thompson', 
      role: 'Caregiver',
      availability: 'Full-time', 
      status: 'off', 
      appointments: 0,
      skills: ['Personal Care', 'Meal Preparation', 'Companionship'],
      location: { lat: 51.5194, lng: -0.1270, address: '23 Euston Rd, London' },
      travelRadius: 4,
      workingHours: { start: '09:00', end: '17:00' },
      preferredServiceUsers: [],
      currentLoad: 0,
    },
    { 
      id: 5, 
      name: 'Susan White', 
      role: 'Caregiver',
      availability: 'Part-time', 
      status: 'available', 
      appointments: 2,
      skills: ['Personal Care', 'Mobility Assistance', 'Housekeeping'],
      location: { lat: 51.5015, lng: -0.1268, address: '17 Westminster Bridge Rd, London' },
      travelRadius: 5,
      workingHours: { start: '12:00', end: '20:00' },
      preferredServiceUsers: [104, 105],
      currentLoad: 40,
    },
  ];

  // Sample service users with expanded properties
  const serviceUsers = [
    {
      id: 101,
      name: 'Thomas Harris',
      careNeeds: ['Personal Care', 'Medication Management', 'Mobility Assistance'],
      location: { lat: 51.5125, lng: -0.1258, address: '123 Main St, London' },
      preferences: { preferredCarers: [1, 3], preferredTimes: ['Morning', 'Evening'] },
      medicalRequirements: ['Diabetes Management', 'Blood Pressure Monitoring'],
    },
    {
      id: 102,
      name: 'Patricia Young',
      careNeeds: ['Medication Management', 'Meal Preparation'],
      location: { lat: 51.5109, lng: -0.1217, address: '45 Park Ave, London' },
      preferences: { preferredCarers: [2], preferredTimes: ['Afternoon'] },
      medicalRequirements: ['Medication Review', 'Arthritis Care'],
    },
    {
      id: 103,
      name: 'George Miller',
      careNeeds: ['Personal Care', 'Wound Care', 'Mobility Assistance'],
      location: { lat: 51.5200, lng: -0.1300, address: '78 Oak Road, London' },
      preferences: { preferredCarers: [3], preferredTimes: ['Morning'] },
      medicalRequirements: ['Wound Dressing', 'Physical Assessment'],
    },
  ];

  // Sample appointment data
  const unallocatedAppointments = [
    { 
      id: 1, 
      time: '09:00 AM', 
      client: 'Thomas Harris',
      clientId: 101,
      type: 'Home Visit', 
      duration: '45 min', 
      address: '123 Main St, London',
      requiredSkills: ['Personal Care', 'Medication Management'],
      priority: 'high',
      matchScore: {
        caregiver1: 95,
        caregiver2: 60,
        caregiver3: 80,
        caregiver4: 50,
        caregiver5: 70,
      }
    },
    { 
      id: 2, 
      time: '11:30 AM', 
      client: 'Patricia Young',
      clientId: 102,
      type: 'Medication Review', 
      duration: '30 min', 
      address: '45 Park Ave, London',
      requiredSkills: ['Medication Management'],
      priority: 'medium',
      matchScore: {
        caregiver1: 85,
        caregiver2: 90,
        caregiver3: 75,
        caregiver4: 40,
        caregiver5: 50,
      }
    },
    { 
      id: 3, 
      time: '02:00 PM', 
      client: 'George Miller',
      clientId: 103,
      type: 'Physical Assessment', 
      duration: '60 min', 
      address: '78 Oak Road, London',
      requiredSkills: ['Wound Care', 'Physical Assessment'],
      priority: 'high',
      matchScore: {
        caregiver1: 70,
        caregiver2: 40,
        caregiver3: 98,
        caregiver4: 30,
        caregiver5: 45,
      }
    },
  ];

  // Allocation recommendations based on algorithm
  const getRecommendation = (appointmentId: number, algorithmType: string) => {
    const appointment = unallocatedAppointments.find(a => a.id === appointmentId);
    if (!appointment) return null;
    
    // Get caregiver IDs sorted by match score
    const caregiverMatchRanking = Object.entries(appointment.matchScore)
      .map(([key, value]) => {
        const caregiverId = parseInt(key.replace('caregiver', ''));
        return { id: caregiverId, score: value };
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.id);
    
    // Return the best match caregiver ID
    return caregiverMatchRanking[0];
  };

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

  const handleAutomaticAllocation = () => {
    // This function would call the backend to perform automatic allocation
    alert(`Performing automatic allocation using ${allocationAlgorithm} algorithm`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Care Allocation</h1>
          <p className="text-gray-600">Assign caregivers to appointments and service users</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setShowMap(!showMap)}
          >
            <MapPin size={18} />
            <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
          </button>
          <Link href="/calendar" className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
            <Calendar size={18} />
            <span>View Schedule</span>
          </Link>
        </div>
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
          <div className="flex-1">
            <label htmlFor="filterSkills" className="block text-sm font-medium text-gray-700 mb-1">Filter by Skills</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
              <select
                id="filterSkills"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
              >
                <option value="">All Skills</option>
                <option value="medication">Medication Management</option>
                <option value="personal">Personal Care</option>
                <option value="mobility">Mobility Assistance</option>
                <option value="dementia">Dementia Care</option>
                <option value="wound">Wound Care</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Map View (togglable) */}
      {showMap && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Location Map</h2>
          </div>
          <div className="p-4">
            <div className="bg-gray-100 rounded-lg border border-gray-300 h-80 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive map would show staff and service user locations</p>
                <p className="text-sm text-gray-500">Staff locations shown as blue pins, service users as red pins</p>
                <p className="text-sm text-gray-500 mt-2">Routes between locations would be displayed for optimized journeys</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Automatic Allocation Tools */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div 
          className="px-4 py-3 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => setShowAllocationTools(!showAllocationTools)}
        >
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-800">Intelligent Allocation Tools</h2>
          </div>
          <div>
            {showAllocationTools ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
        
        {showAllocationTools && (
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Use our AI-powered tools to automatically allocate staff based on various criteria
            </p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="algorithm" className="block text-sm font-medium text-gray-700 mb-1">Allocation Algorithm</label>
                <select
                  id="algorithm"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  value={allocationAlgorithm}
                  onChange={(e) => setAllocationAlgorithm(e.target.value as any)}
                >
                  <option value="proximity">Geographic Proximity</option>
                  <option value="skills">Skills Matching</option>
                  <option value="continuity">Continuity of Care</option>
                  <option value="balanced">Balanced (Default)</option>
                </select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="prioritize" className="block text-sm font-medium text-gray-700 mb-1">Prioritize</label>
                <select
                  id="prioritize"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                >
                  <option value="travel">Minimize Travel Time</option>
                  <option value="workload">Balance Workload</option>
                  <option value="preferences">Service User Preferences</option>
                  <option value="efficiency">Maximum Efficiency</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                onClick={handleAutomaticAllocation}
              >
                <Brain className="h-4 w-4" />
                <span>Auto-Allocate All</span>
              </button>
              
              <button 
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2"
                onClick={() => alert('Optimizing routes based on proximity and travel time')}
              >
                <Route className="h-4 w-4" />
                <span>Optimize Routes</span>
              </button>
              
              <button 
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2"
                onClick={() => alert('Advanced allocation options will be available in the next release')}
              >
                <Layers className="h-4 w-4" />
                <span>Advanced Options</span>
              </button>
              
              <button 
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2"
                onClick={() => alert('AI prediction report will be available in the next release')}
              >
                <BarChart2 className="h-4 w-4" />
                <span>View Predictions</span>
              </button>
            </div>
          </div>
        )}
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
              <div 
                key={caregiver.id} 
                className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedCaregiver === caregiver.id ? 'bg-indigo-50' : ''}`}
                onClick={() => setSelectedCaregiver(selectedCaregiver === caregiver.id ? null : caregiver.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                      {caregiver.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{caregiver.name}</h3>
                      <p className="text-sm text-gray-600">{caregiver.role} • {caregiver.availability}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {caregiver.skills.slice(0, 2).map(skill => (
                          <span key={skill} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                        {caregiver.skills.length > 2 && (
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                            +{caregiver.skills.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {getStatusBadge(caregiver.status)}
                    <p className="text-xs text-gray-500 mt-1">{caregiver.appointments} appointments today</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {caregiver.location.address.split(',')[0]}
                    </p>
                  </div>
                </div>
                
                {selectedCaregiver === caregiver.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">Skills & Qualifications</h4>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {caregiver.skills.map(skill => (
                        <span key={skill} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Working Hours:</span> {caregiver.workingHours.start} - {caregiver.workingHours.end}
                      </div>
                      <div>
                        <span className="font-medium">Travel Radius:</span> {caregiver.travelRadius} miles
                      </div>
                      <div>
                        <span className="font-medium">Current Load:</span> {caregiver.currentLoad}%
                      </div>
                      <div>
                        <span className="font-medium">Preferred Service Users:</span> {caregiver.preferredServiceUsers.length}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <Link 
                        href={`/staff-management?id=${caregiver.id}`} 
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Full Profile
                      </Link>
                      <Link 
                        href={`/calendar?staffId=${caregiver.id}`} 
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Schedule
                      </Link>
                    </div>
                  </div>
                )}
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
            <p className="text-sm text-gray-600 mb-4">Select an appointment and a caregiver to allocate, or use automatic allocation</p>
            <div className="space-y-3">
              {unallocatedAppointments.map(appointment => (
                <div 
                  key={appointment.id} 
                  className={`bg-gray-50 p-3 rounded-lg border ${selectedAppointment === appointment.id ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-200 hover:border-indigo-300'} cursor-pointer`}
                  onClick={() => setSelectedAppointment(selectedAppointment === appointment.id ? null : appointment.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-800">{appointment.time}</span>
                        <span className="mx-1.5 text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{appointment.duration}</span>
                        <span className="mx-1.5 text-gray-500">•</span>
                        <span className={`text-xs font-medium ${appointment.priority === 'high' ? 'text-red-600' : 'text-orange-500'}`}>
                          {appointment.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-800 mt-1">{appointment.client}</h3>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {appointment.address}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      {selectedCaregiver && selectedAppointment === appointment.id ? (
                        <button 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Successfully allocated appointment for ${appointment.client} to ${caregivers.find(c => c.id === selectedCaregiver)?.name}`);
                            setSelectedAppointment(null);
                            setSelectedCaregiver(null);
                          }}
                        >
                          Confirm Allocation
                        </button>
                      ) : (
                        <button 
                          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            const recommendedCaregiverId = getRecommendation(appointment.id, allocationAlgorithm);
                            setSelectedAppointment(appointment.id);
                            setSelectedCaregiver(recommendedCaregiverId);
                          }}
                        >
                          Auto-Suggest
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {selectedAppointment === appointment.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-800 mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {appointment.requiredSkills.map(skill => (
                          <span key={skill} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <h4 className="text-sm font-medium text-gray-800 mb-2">Best Matches</h4>
                      <ul className="space-y-1 text-xs">
                        {Object.entries(appointment.matchScore)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 3)
                          .map(([key, score]) => {
                            const caregiverId = parseInt(key.replace('caregiver', ''));
                            const caregiver = caregivers.find(c => c.id === caregiverId);
                            return (
                              <li key={key} className="flex justify-between">
                                <span>{caregiver?.name}</span>
                                <span className={`font-medium ${score > 80 ? 'text-green-600' : score > 60 ? 'text-orange-500' : 'text-red-500'}`}>
                                  {score}% match
                                </span>
                              </li>
                            );
                          })}
                      </ul>
                      
                      <div className="mt-3 flex gap-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Service user details for ${appointment.client} will be displayed in the next release`);
                          }}
                        >
                          View Service User Details
                        </button>
                        <button 
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Care plan for ${appointment.client} will be displayed in the next release`);
                          }}
                        >
                          View Care Plan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}