import React from 'react';
import { Users, FilePlus, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  // These would normally be fetched from the API
  const stats = [
    { name: 'Service Users', value: '24', icon: <Users className="h-6 w-6" />, color: 'bg-blue-500' },
    { name: 'Care Plans', value: '36', icon: <FilePlus className="h-6 w-6" />, color: 'bg-green-500' },
    { name: 'Appointments Today', value: '12', icon: <Calendar className="h-6 w-6" />, color: 'bg-purple-500' },
    { name: 'Upcoming Tasks', value: '8', icon: <Clock className="h-6 w-6" />, color: 'bg-yellow-500' },
  ];

  const recentAlerts = [
    { id: 1, type: 'risk', message: 'Medication compliance concern for John Smith', time: '2 hours ago' },
    { id: 2, type: 'info', message: 'Care plan updated for Sarah Johnson', time: '3 hours ago' },
    { id: 3, type: 'task', message: 'New appointment scheduled with Dr. Williams', time: '5 hours ago' },
    { id: 4, type: 'risk', message: 'Mobility assessment due for Robert Davis', time: '8 hours ago' },
  ];

  const upcomingAppointments = [
    { id: 1, name: 'John Smith', type: 'Medication Review', time: '10:00 AM', date: 'Today' },
    { id: 2, name: 'Sarah Johnson', type: 'Care Plan Review', time: '11:30 AM', date: 'Today' },
    { id: 3, name: 'Robert Davis', type: 'Physical Assessment', time: '2:00 PM', date: 'Today' },
    { id: 4, name: 'Emily Wilson', type: 'Home Visit', time: '9:15 AM', date: 'Tomorrow' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to CareUnity, your care management platform.</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Recent Alerts</h2>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-200">
              {recentAlerts.map((alert) => (
                <li key={alert.id} className="py-3 flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    {alert.type === 'risk' ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Upcoming Appointments</h2>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-200">
              {upcomingAppointments.map((appointment) => (
                <li key={appointment.id} className="py-3">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-800">{appointment.name}</p>
                    <p className="text-sm text-gray-500">{appointment.time}, {appointment.date}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{appointment.type}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* CQC compliance summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-gray-800 mb-3">CQC Compliance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {['Safe', 'Effective', 'Caring', 'Responsive', 'Well-Led'].map((area, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{area}</span>
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Good</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}