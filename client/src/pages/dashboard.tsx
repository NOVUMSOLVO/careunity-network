import React, { useState } from 'react';
import { 
  Users, 
  FilePlus, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  MapPin, 
  UserCheck, 
  Activity, 
  HeartPulse, 
  Pill,
  BarChart2,
  LineChart,
  PieChart,
  Layers,
  Route,
  Maximize,
  ArrowRight,
  MoveHorizontal
} from 'lucide-react';

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [dateFilter, setDateFilter] = useState('today');
  
  // These would normally be fetched from the API
  const stats = [
    { name: 'Service Users', value: '24', icon: <Users className="h-6 w-6" />, color: 'bg-blue-500' },
    { name: 'Care Staff', value: '18', icon: <UserCheck className="h-6 w-6" />, color: 'bg-indigo-500' },
    { name: 'Care Plans', value: '36', icon: <FilePlus className="h-6 w-6" />, color: 'bg-green-500' },
    { name: 'Appointments Today', value: '12', icon: <Calendar className="h-6 w-6" />, color: 'bg-purple-500' },
    { name: 'Tasks Due', value: '8', icon: <Clock className="h-6 w-6" />, color: 'bg-yellow-500' },
    { name: 'Allocation Rate', value: '92%', icon: <UserCheck className="h-6 w-6" />, color: 'bg-teal-500' },
  ];

  const recentAlerts = [
    { id: 1, type: 'risk', message: 'Medication compliance concern for John Smith', time: '2 hours ago', priority: 'high' },
    { id: 2, type: 'info', message: 'Care plan updated for Sarah Johnson', time: '3 hours ago', priority: 'medium' },
    { id: 3, type: 'task', message: 'New appointment scheduled with Dr. Williams', time: '5 hours ago', priority: 'low' },
    { id: 4, type: 'risk', message: 'Mobility assessment due for Robert Davis', time: '8 hours ago', priority: 'high' },
    { id: 5, type: 'info', message: 'Staff availability updated for next week', time: '10 hours ago', priority: 'medium' },
  ];

  const upcomingAppointments = [
    { 
      id: 1, 
      name: 'John Smith', 
      type: 'Medication Review', 
      time: '10:00 AM', 
      date: 'Today', 
      caregiver: 'Jane Wilson',
      location: '15 Baker St, London',
      status: 'scheduled'
    },
    { 
      id: 2, 
      name: 'Sarah Johnson', 
      type: 'Care Plan Review', 
      time: '11:30 AM', 
      date: 'Today', 
      caregiver: 'Michael Brown',
      location: '45 Park Ave, London',
      status: 'in-transit'
    },
    { 
      id: 3, 
      name: 'Robert Davis', 
      type: 'Physical Assessment', 
      time: '2:00 PM', 
      date: 'Today', 
      caregiver: 'Emily Roberts',
      location: '78 Oak Road, London',
      status: 'unallocated'
    },
    { 
      id: 4, 
      name: 'Emily Wilson', 
      type: 'Home Visit', 
      time: '9:15 AM', 
      date: 'Tomorrow',
      caregiver: 'David Thompson',
      location: '23 Maple St, London',
      status: 'scheduled'
    },
  ];

  const allocationMetrics = {
    staffUtilization: 85, // percentage
    unallocatedVisits: 3,
    travelTimeAverage: 22, // minutes
    skillMatchRate: 94, // percentage
    continuityRate: 78, // percentage
  };

  const staffWorkload = [
    { name: 'Jane Wilson', appointments: 4, capacity: 6, utilizationPercentage: 67 },
    { name: 'Michael Brown', appointments: 6, capacity: 6, utilizationPercentage: 100 },
    { name: 'Emily Roberts', appointments: 3, capacity: 5, utilizationPercentage: 60 },
    { name: 'David Thompson', appointments: 0, capacity: 6, utilizationPercentage: 0 },
    { name: 'Susan White', appointments: 2, capacity: 4, utilizationPercentage: 50 },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'scheduled':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Scheduled</span>;
      case 'in-transit':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">In Transit</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Completed</span>;
      case 'unallocated':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Unallocated</span>;
      default:
        return null;
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch(priority) {
      case 'high':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">High</span>;
      case 'medium':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">Medium</span>;
      case 'low':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">Low</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to CareUnity, your intelligent care management platform.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg overflow-hidden">
            <button 
              className={`px-4 py-2 text-sm font-medium ${viewMode === 'overview' ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}
              onClick={() => setViewMode('overview')}
            >
              Overview
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium ${viewMode === 'detailed' ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}
              onClick={() => setViewMode('detailed')}
            >
              Detailed View
            </button>
          </div>
          <select 
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className={`${stat.color} rounded-full p-3 mr-4 text-white`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.name}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content area - conditional based on view mode */}
      {viewMode === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Recent Alerts</h2>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-gray-200">
                {recentAlerts.map((alert) => (
                  <li key={alert.id} className="py-3 flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {alert.type === 'risk' ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      ) : alert.type === 'task' ? (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                        {getPriorityIndicator(alert.priority)}
                      </div>
                      <p className="text-xs text-gray-500">{alert.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Upcoming appointments */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Upcoming Appointments</h2>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
                View Calendar <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-gray-200">
                {upcomingAppointments.map((appointment) => (
                  <li key={appointment.id} className="py-3">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-800">{appointment.name}</p>
                      <div className="flex items-center">
                        <p className="text-sm text-gray-500 mr-2">{appointment.time}, {appointment.date}</p>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-600">{appointment.type}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <UserCheck className="h-3 w-3 mr-1" />
                        {appointment.caregiver}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {appointment.location}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Staff Allocation */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Staff Workload</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {staffWorkload.map((staff) => (
                  <div key={staff.name} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-800">{staff.name}</p>
                      <p className="text-xs text-gray-500">{staff.appointments}/{staff.capacity} appointments</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          staff.utilizationPercentage > 90 ? 'bg-red-600' : 
                          staff.utilizationPercentage > 70 ? 'bg-yellow-500' : 
                          staff.utilizationPercentage > 0 ? 'bg-green-600' : 'bg-gray-400'
                        }`}
                        style={{ width: `${staff.utilizationPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
                  <UserCheck className="h-4 w-4 mr-1" />
                  View Full Staff Schedule
                </button>
              </div>
            </div>
          </div>

          {/* Allocation Metrics */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Allocation Metrics</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-800">Staff Utilization</p>
                    <p className="text-sm font-medium text-gray-800">{allocationMetrics.staffUtilization}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${allocationMetrics.staffUtilization}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-800">Skill Match Rate</p>
                    <p className="text-sm font-medium text-gray-800">{allocationMetrics.skillMatchRate}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${allocationMetrics.skillMatchRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-800">Continuity of Care</p>
                    <p className="text-sm font-medium text-gray-800">{allocationMetrics.continuityRate}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${allocationMetrics.continuityRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                  <p className="text-sm text-gray-700">Unallocated Visits</p>
                  <p className="text-sm font-medium text-red-600">{allocationMetrics.unallocatedVisits}</p>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                  <p className="text-sm text-gray-700">Avg. Travel Time</p>
                  <p className="text-sm font-medium text-gray-800">{allocationMetrics.travelTimeAverage} min</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  View Detailed Metrics
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Quick Actions</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg flex flex-col items-center justify-center text-center">
                  <Route className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Optimize Routes</span>
                </button>
                <button className="p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg flex flex-col items-center justify-center text-center">
                  <UserCheck className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Auto-Allocate</span>
                </button>
                <button className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex flex-col items-center justify-center text-center">
                  <Layers className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Shift Planner</span>
                </button>
                <button className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg flex flex-col items-center justify-center text-center">
                  <Maximize className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">View Map</span>
                </button>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-800 mb-2">AI Insights</h3>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  <p className="mb-2 font-medium">Recommendations:</p>
                  <ul className="space-y-1 list-disc list-inside text-xs">
                    <li>Consider reallocating Jane Wilson to handle additional appointments</li>
                    <li>Michael Brown is at full capacity - watch for burnout risk</li>
                    <li>3 visits in North London area remain unallocated</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CQC compliance summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-800">CQC Compliance Overview</h2>
          <button className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
            View Full Report <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { name: 'Safe', status: 'good', score: 85 },
            { name: 'Effective', status: 'good', score: 80 },
            { name: 'Caring', status: 'outstanding', score: 92 },
            { name: 'Responsive', status: 'good', score: 78 },
            { name: 'Well-Led', status: 'requires improvement', score: 65 }
          ].map((area, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{area.name}</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  area.status === 'outstanding' ? 'bg-green-100 text-green-800' : 
                  area.status === 'good' ? 'bg-blue-100 text-blue-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {area.status === 'outstanding' ? 'Outstanding' : 
                   area.status === 'good' ? 'Good' : 
                   'Requires Improvement'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    area.status === 'outstanding' ? 'bg-green-600' : 
                    area.status === 'good' ? 'bg-blue-600' : 
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${area.score}%` }}
                ></div>
              </div>
              <div className="mt-1 text-right">
                <span className="text-xs text-gray-500">{area.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}