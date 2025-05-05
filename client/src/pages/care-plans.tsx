import React from 'react';
import { FilePlus, Search, Clipboard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function CarePlans() {
  // Mock data - would come from API in a real app
  const carePlans = [
    {
      id: 1,
      title: 'Daily Living Support Plan',
      serviceUser: 'John Smith',
      lastUpdated: '2023-04-15',
      status: 'active',
      completionPercentage: 75,
      goals: 6,
      tasks: 12,
      assignedTo: 'Jane Wilson'
    },
    {
      id: 2,
      title: 'Medication Management Plan',
      serviceUser: 'Sarah Johnson',
      lastUpdated: '2023-04-10',
      status: 'active',
      completionPercentage: 50,
      goals: 4,
      tasks: 8,
      assignedTo: 'Michael Brown'
    },
    {
      id: 3,
      title: 'Mobility Support Plan',
      serviceUser: 'Robert Davis',
      lastUpdated: '2023-04-05',
      status: 'review',
      completionPercentage: 90,
      goals: 3,
      tasks: 9,
      assignedTo: 'Emily Roberts'
    },
    {
      id: 4,
      title: 'Memory Support Plan',
      serviceUser: 'Emily Wilson',
      lastUpdated: '2023-03-28',
      status: 'draft',
      completionPercentage: 30,
      goals: 5,
      tasks: 15,
      assignedTo: 'David Thompson'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Active</span>;
      case 'review':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Needs Review</span>;
      case 'draft':
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Draft</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Care Plans</h1>
          <p className="text-gray-600">Manage and track care plans for service users</p>
        </div>
        <Link href="/care-plans/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
          <FilePlus size={18} />
          <span>Create Care Plan</span>
        </Link>
      </div>

      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
            placeholder="Search care plans or service users"
          />
        </div>
      </div>

      {/* Care plans list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {carePlans.map(plan => (
          <div key={plan.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{plan.title}</h3>
                  <p className="text-sm text-gray-600">For: {plan.serviceUser}</p>
                </div>
                {getStatusBadge(plan.status)}
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{plan.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${plan.completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4">
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <p className="text-xs text-gray-500">Goals</p>
                  <p className="font-semibold text-gray-700">{plan.goals}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tasks</p>
                  <p className="font-semibold text-gray-700">{plan.tasks}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="font-semibold text-gray-700">{new Date(plan.lastUpdated).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  <span>Assigned to: </span>
                  <span className="font-medium text-gray-700">{plan.assignedTo}</span>
                </div>
                <Link 
                  href={`/care-plans?id=${plan.id}`} 
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}