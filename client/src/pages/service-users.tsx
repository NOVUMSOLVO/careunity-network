import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { PlusCircle, Search, FileText, UserPlus, AlertCircle, Clock } from 'lucide-react';

// Mock data since we haven't set up auth yet
const mockServiceUsers = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1945-05-10',
    uniqueId: 'SU-001',
    address: '123 Main St, London',
    phoneNumber: '020-1234-5678',
    emailAddress: 'john.smith@example.com',
    medicalConditions: 'Hypertension, Arthritis',
    medications: 'Lisinopril, Ibuprofen',
    emergencyContact: 'Mary Smith, 020-8765-4321',
    notes: 'Prefers morning visits',
    status: 'active'
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1950-09-15',
    uniqueId: 'SU-002',
    address: '45 Park Lane, Manchester',
    phoneNumber: '0161-876-5432',
    emailAddress: 'sarah.j@example.com',
    medicalConditions: 'Diabetes Type 2',
    medications: 'Metformin, Insulin',
    emergencyContact: 'David Johnson, 0161-765-4321',
    notes: 'Needs assistance with medication management',
    status: 'active'
  },
  {
    id: 3,
    firstName: 'Robert',
    lastName: 'Davis',
    dateOfBirth: '1938-03-22',
    uniqueId: 'SU-003',
    address: '78 Oak Street, Birmingham',
    phoneNumber: '0121-987-6543',
    emailAddress: 'robert.davis@example.com',
    medicalConditions: 'COPD, Osteoporosis',
    medications: 'Albuterol, Calcium supplements',
    emergencyContact: 'Jennifer Davis, 0121-345-6789',
    notes: 'Uses oxygen therapy',
    status: 'active'
  },
  {
    id: 4,
    firstName: 'Emily',
    lastName: 'Wilson',
    dateOfBirth: '1942-11-30',
    uniqueId: 'SU-004',
    address: '22 Elm Road, Leeds',
    phoneNumber: '0113-456-7890',
    emailAddress: 'e.wilson@example.com',
    medicalConditions: 'Alzheimer\'s (early stage)',
    medications: 'Donepezil',
    emergencyContact: 'Michael Wilson, 0113-234-5678',
    notes: 'Needs reminders for medication',
    status: 'active'
  },
];

export default function ServiceUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // In a real app, we would fetch from the API:
  // const { data: serviceUsers, isLoading, error } = useQuery({
  //   queryKey: ['/api/service-users'],
  // });
  
  // For now, we'll use mock data
  const serviceUsers = mockServiceUsers;
  const isLoading = false;
  const error = null;

  const filteredUsers = serviceUsers?.filter(user => 
    `${user.firstName} ${user.lastName} ${user.uniqueId}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Service Users</h1>
          <p className="text-gray-600">Manage service user profiles and care plans</p>
        </div>
        <Link href="/service-users/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
          <UserPlus size={18} />
          <span>Add Service User</span>
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
            placeholder="Search service users by name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Service user list */}
      {isLoading ? (
        <div className="text-center py-10">
          <Clock className="animate-spin h-8 w-8 mx-auto text-indigo-600" />
          <p className="mt-2 text-gray-600">Loading service users...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-medium">Error loading service users</h3>
            <p className="text-red-700 text-sm">{'An unknown error occurred'}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers?.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-gray-500">ID: {user.uniqueId}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {user.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{user.address}</p>
                <p className="text-sm text-gray-600">DOB: {new Date(user.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <Link href={`/care-plans?userId=${user.id}`} className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-1" />
                    Care Plans
                  </Link>
                  <Link href={`/service-users/${user.id}`} className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {filteredUsers?.length === 0 && (
            <div className="col-span-full bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-600">No service users found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}