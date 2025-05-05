import React, { useState } from 'react';
import { 
  AlertTriangle, 
  FileText, 
  Filter, 
  Plus, 
  Search, 
  Eye, 
  ArrowUpRight, 
  Clock, 
  CheckCircle,
  XCircle,
  BarChart2,
  AlertCircle,
  UserCheck,
  Heart,
  Pill
} from 'lucide-react';

export default function IncidentReporting() {
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'pending' | 'closed'>('all');
  const [showNewIncidentForm, setShowNewIncidentForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<number | null>(null);
  
  // Sample data for incident categories
  const incidentCategories = [
    { id: 'falls', name: 'Falls', icon: <Heart className="h-5 w-5" /> },
    { id: 'medication', name: 'Medication Errors', icon: <Pill className="h-5 w-5" /> },
    { id: 'behavior', name: 'Behavioral Incidents', icon: <AlertCircle className="h-5 w-5" /> },
    { id: 'equipment', name: 'Equipment Issues', icon: <AlertTriangle className="h-5 w-5" /> },
    { id: 'staff', name: 'Staff-related', icon: <UserCheck className="h-5 w-5" /> },
  ];

  // Sample data for incidents
  const incidentData = [
    {
      id: 1,
      title: 'Medication dosage error',
      category: 'medication',
      serviceUser: 'John Smith',
      date: '2023-04-10',
      time: '09:15 AM',
      severity: 'high',
      status: 'open',
      reporter: 'Jane Wilson',
      description: 'Service user was given 20mg instead of 10mg of their prescribed medication.',
      location: 'Client\'s home - 123 Main St',
      actionTaken: 'Service user\'s GP was contacted immediately. Additional monitoring was implemented.',
      managementReview: null,
      followUp: [
        { id: 1, date: '2023-04-10', note: 'Contacted GP for advice, monitoring vital signs', user: 'Jane Wilson' }
      ],
      cqcReportable: true,
      assignedTo: 'Michael Brown'
    },
    {
      id: 2,
      title: 'Fall in bathroom',
      category: 'falls',
      serviceUser: 'Sarah Johnson',
      date: '2023-04-08',
      time: '07:30 PM',
      severity: 'medium',
      status: 'pending',
      reporter: 'Michael Brown',
      description: 'Service user slipped on wet floor in bathroom. No major injuries but bruising on left hip.',
      location: 'Client\'s home - Bathroom',
      actionTaken: 'Applied first aid, conducted physical assessment, updated risk assessment.',
      managementReview: 'Additional equipment (bath mat, grab rails) to be installed',
      followUp: [
        { id: 1, date: '2023-04-08', note: 'Applied cold compress, conducted mobility check', user: 'Michael Brown' },
        { id: 2, date: '2023-04-09', note: 'Follow-up check - bruising present but no additional pain', user: 'Emily Roberts' }
      ],
      cqcReportable: false,
      assignedTo: 'Emily Roberts'
    },
    {
      id: 3,
      title: 'Service refusal',
      category: 'behavior',
      serviceUser: 'Robert Davis',
      date: '2023-04-12',
      time: '11:20 AM',
      severity: 'low',
      status: 'closed',
      reporter: 'Emily Roberts',
      description: 'Service user refused morning medication and personal care assistance.',
      location: 'Client\'s home - Bedroom',
      actionTaken: 'Attempted alternative approaches, offered choices, spent time talking with service user.',
      managementReview: 'Care plan to be reviewed to adjust approach. Family meeting scheduled.',
      followUp: [
        { id: 1, date: '2023-04-12', note: 'Informed family member of refusal', user: 'Emily Roberts' },
        { id: 2, date: '2023-04-13', note: 'Service user accepted care in afternoon visit', user: 'David Thompson' },
        { id: 3, date: '2023-04-14', note: 'Care plan review completed with new approach documented', user: 'Michael Brown' }
      ],
      cqcReportable: false,
      assignedTo: 'Susan White',
      resolutionDate: '2023-04-14'
    },
    {
      id: 4,
      title: 'Missing medication',
      category: 'medication',
      serviceUser: 'Emily Wilson',
      date: '2023-04-11',
      time: '08:45 AM',
      severity: 'high',
      status: 'open',
      reporter: 'David Thompson',
      description: 'Blood pressure medication blister pack found with 3 days of medication missing without record of administration.',
      location: 'Client\'s home - Kitchen',
      actionTaken: 'Contacted pharmacy for replacement, scheduled GP appointment to assess possible missed doses.',
      managementReview: null,
      followUp: [
        { id: 1, date: '2023-04-11', note: 'GP informed, additional check scheduled', user: 'David Thompson' },
        { id: 2, date: '2023-04-11', note: 'Secured all other medication in locked cabinet', user: 'David Thompson' }
      ],
      cqcReportable: true,
      assignedTo: 'Jane Wilson'
    },
    {
      id: 5,
      title: 'Pressure sore identified',
      category: 'equipment',
      serviceUser: 'Thomas Harris',
      date: '2023-04-09',
      time: '10:30 AM',
      severity: 'medium',
      status: 'pending',
      reporter: 'Susan White',
      description: 'Grade 2 pressure sore identified on sacrum during personal care.',
      location: 'Client\'s home - Bedroom',
      actionTaken: 'Applied prescribed barrier cream, repositioned service user, contacted district nurse.',
      managementReview: 'Air mattress ordered, turning schedule implemented',
      followUp: [
        { id: 1, date: '2023-04-09', note: 'District nurse visited and assessed', user: 'Susan White' },
        { id: 2, date: '2023-04-10', note: 'New care protocol in place for repositioning', user: 'Jane Wilson' }
      ],
      cqcReportable: false,
      assignedTo: 'Michael Brown'
    },
  ];

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'high':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">High</span>;
      case 'medium':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Medium</span>;
      case 'low':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Low</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'open':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Open</span>;
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Pending Review</span>;
      case 'closed':
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Closed</span>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = incidentCategories.find(c => c.id === categoryId);
    if (!category) return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    
    return React.cloneElement(category.icon, { 
      className: `h-5 w-5 ${
        categoryId === 'falls' ? 'text-red-500' : 
        categoryId === 'medication' ? 'text-purple-500' : 
        categoryId === 'behavior' ? 'text-yellow-500' : 
        categoryId === 'equipment' ? 'text-orange-500' : 
        'text-blue-500'
      }` 
    });
  };

  // Filter incidents based on active tab
  const filteredIncidents = incidentData.filter(incident => {
    if (activeTab === 'all') return true;
    return incident.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Incident Reporting</h1>
          <p className="text-gray-600">Track, manage, and report incidents for regulatory compliance</p>
        </div>
        <button 
          onClick={() => setShowNewIncidentForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Report Incident</span>
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total Incidents</p>
              <p className="text-2xl font-semibold">24</p>
            </div>
            <span className="bg-indigo-100 p-2 rounded-full">
              <FileText className="h-5 w-5 text-indigo-600" />
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <span className="text-green-500 font-medium">↓ 12% </span>
            vs previous month
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Open Incidents</p>
              <p className="text-2xl font-semibold">8</p>
            </div>
            <span className="bg-blue-100 p-2 rounded-full">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <span className="text-red-500 font-medium">↑ 3% </span>
            vs previous month
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">High Severity</p>
              <p className="text-2xl font-semibold">5</p>
            </div>
            <span className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <span className="text-green-500 font-medium">↓ 20% </span>
            vs previous month
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">CQC Reportable</p>
              <p className="text-2xl font-semibold">3</p>
            </div>
            <span className="bg-yellow-100 p-2 rounded-full">
              <ArrowUpRight className="h-5 w-5 text-yellow-600" />
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <span className="text-red-500 font-medium">↑ 1 </span>
            vs previous month
          </div>
        </div>
      </div>

      {/* Filters and tabs */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
                placeholder="Search incidents..."
              />
            </div>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
                defaultValue=""
              >
                <option value="">All Categories</option>
                {incidentCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
                defaultValue=""
              >
                <option value="">All Severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
              className={`pb-4 px-1 ${activeTab === 'all' ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('all')}
            >
              All Incidents
            </button>
            <button
              className={`pb-4 px-1 ${activeTab === 'open' ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('open')}
            >
              Open
            </button>
            <button
              className={`pb-4 px-1 ${activeTab === 'pending' ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Review
            </button>
            <button
              className={`pb-4 px-1 ${activeTab === 'closed' ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('closed')}
            >
              Closed
            </button>
          </nav>
        </div>
      </div>

      {/* Incident list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Incident
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredIncidents.map((incident) => (
              <tr 
                key={incident.id} 
                className={`hover:bg-gray-50 ${selectedIncident === incident.id ? 'bg-indigo-50' : ''}`}
                onClick={() => setSelectedIncident(selectedIncident === incident.id ? null : incident.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                      {getCategoryIcon(incident.category)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{incident.title}</div>
                      <div className="text-xs text-gray-500">{incident.reporter}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{incident.serviceUser}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{incident.date}</div>
                  <div className="text-xs text-gray-500">{incident.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getSeverityBadge(incident.severity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(incident.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{incident.assignedTo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                    <Eye className="h-5 w-5" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    <FileText className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected incident details */}
      {selectedIncident && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {(() => {
            const incident = incidentData.find(i => i.id === selectedIncident);
            if (!incident) return null;

            return (
              <>
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">{incident.title}</h3>
                  <div className="flex items-center space-x-2">
                    {getSeverityBadge(incident.severity)}
                    {getStatusBadge(incident.status)}
                    {incident.cqcReportable && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">CQC Reportable</span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Left column */}
                    <div>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                        <p className="text-sm text-gray-900">{incident.description}</p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Action Taken</h4>
                        <p className="text-sm text-gray-900">{incident.actionTaken}</p>
                      </div>

                      {incident.managementReview && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Management Review</h4>
                          <p className="text-sm text-gray-900">{incident.managementReview}</p>
                        </div>
                      )}
                    </div>

                    {/* Right column */}
                    <div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Service User</h4>
                          <p className="text-sm text-gray-900">{incident.serviceUser}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Reported By</h4>
                          <p className="text-sm text-gray-900">{incident.reporter}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h4>
                          <p className="text-sm text-gray-900">{incident.date} at {incident.time}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                          <p className="text-sm text-gray-900">{incident.location}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Follow-up Timeline</h4>
                        <div className="relative border-l border-gray-200 pl-4 space-y-3">
                          {incident.followUp.map(item => (
                            <div key={item.id} className="relative">
                              <div className="absolute -left-6 mt-0.5 h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center border border-white">
                                <Clock className="h-3 w-3 text-gray-500" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">{item.date}</p>
                                <p className="text-sm text-gray-800">{item.note}</p>
                                <p className="text-xs text-gray-500">By {item.user}</p>
                              </div>
                            </div>
                          ))}
                          
                          {incident.status === 'closed' && (
                            <div className="relative">
                              <div className="absolute -left-6 mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center border border-white">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">{incident.resolutionDate}</p>
                                <p className="text-sm font-medium text-green-600">Incident Closed</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <div className="flex space-x-2">
                      <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium py-2 px-4 rounded">
                        Add Follow-up
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded">
                        Generate Report
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      {incident.status !== 'closed' ? (
                        <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {incident.status === 'pending' ? 'Approve & Close' : 'Resolve & Close'}
                        </button>
                      ) : (
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded flex items-center">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reopen Incident
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Incident form - would be implemented as a modal in a real application */}
      {showNewIncidentForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Report New Incident</h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowNewIncidentForm(false)}
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            {/* This would be a full form in a real application */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incident Title
                  </label>
                  <input
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    placeholder="Provide a clear, concise title"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    >
                      <option value="">Select a category</option>
                      {incidentCategories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <select
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    >
                      <option value="">Select severity level</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service User
                    </label>
                    <select
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    >
                      <option value="">Select service user</option>
                      <option value="john-smith">John Smith</option>
                      <option value="sarah-johnson">Sarah Johnson</option>
                      <option value="robert-davis">Robert Davis</option>
                      <option value="emily-wilson">Emily Wilson</option>
                      <option value="thomas-harris">Thomas Harris</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Incident Date & Time
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                      />
                      <input
                        type="time"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    placeholder="Where did the incident occur?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    placeholder="Describe what happened in detail..."
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Taken
                  </label>
                  <textarea
                    rows={3}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    placeholder="What immediate actions did you take?"
                  ></textarea>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="cqc-reportable"
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="cqc-reportable" className="ml-2 text-sm font-medium text-gray-700">
                    This incident is CQC reportable
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                  onClick={() => setShowNewIncidentForm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
                  onClick={() => {
                    alert('In a real app, this would submit the form and create a new incident');
                    setShowNewIncidentForm(false);
                  }}
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}