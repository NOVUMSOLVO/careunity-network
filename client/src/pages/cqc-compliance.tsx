import React, { useState } from 'react';
import { BarChart3, FileText, CheckCircle, AlertCircle, HelpCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export default function CQCCompliance() {
  const [expandedSection, setExpandedSection] = useState<string | null>('safe');

  // Mock data - would come from API in a real app
  const cqcAreas = [
    {
      id: 'safe',
      name: 'Safe',
      status: 'good',
      score: 85,
      description: 'People are protected from abuse and avoidable harm.',
      evidenceCount: 12,
      requirementsCount: 15,
      lastReviewed: '2023-04-10',
      keyRequirements: [
        { id: 1, name: 'Risk assessments are comprehensive and up-to-date', completed: true },
        { id: 2, name: 'Safeguarding policies are regularly reviewed', completed: true },
        { id: 3, name: 'Medication management procedures are followed', completed: true },
        { id: 4, name: 'Staff know how to raise and report concerns', completed: true },
        { id: 5, name: 'Infection control measures are in place and effective', completed: false },
      ]
    },
    {
      id: 'effective',
      name: 'Effective',
      status: 'good',
      score: 80,
      description: "People's care, treatment and support achieves good outcomes, promotes a good quality of life and is based on the best available evidence.",
      evidenceCount: 10,
      requirementsCount: 12,
      lastReviewed: '2023-04-05',
      keyRequirements: [
        { id: 1, name: 'Care plans are person-centered and outcome-focused', completed: true },
        { id: 2, name: 'Staff receive appropriate training and support', completed: true },
        { id: 3, name: 'Health monitoring is in place and effective', completed: false },
        { id: 4, name: 'Care is delivered in line with best practice and guidance', completed: true },
        { id: 5, name: 'Consent is properly sought and documented', completed: true },
      ]
    },
    {
      id: 'caring',
      name: 'Caring',
      status: 'outstanding',
      score: 92,
      description: 'Staff involve and treat people with compassion, kindness, dignity and respect.',
      evidenceCount: 15,
      requirementsCount: 15,
      lastReviewed: '2023-04-12',
      keyRequirements: [
        { id: 1, name: 'Privacy and dignity are respected', completed: true },
        { id: 2, name: 'People are treated with kindness and compassion', completed: true },
        { id: 3, name: 'People are supported to express their views', completed: true },
        { id: 4, name: "People's independence is promoted", completed: true },
        { id: 5, name: 'Family and carers are appropriately involved', completed: true },
      ]
    },
    {
      id: 'responsive',
      name: 'Responsive',
      status: 'good',
      score: 78,
      description: "Services are organised so that they meet people's needs.",
      evidenceCount: 8,
      requirementsCount: 12,
      lastReviewed: '2023-03-28',
      keyRequirements: [
        { id: 1, name: 'Care is planned to meet individual needs', completed: true },
        { id: 2, name: "People's preferences and choices are respected", completed: true },
        { id: 3, name: 'Complaints and concerns are properly addressed', completed: true },
        { id: 4, name: "End of life care meets people's needs and preferences", completed: false },
        { id: 5, name: 'Activities and engagement are person-centered', completed: false },
      ]
    },
    {
      id: 'well-led',
      name: 'Well-Led',
      status: 'requires improvement',
      score: 65,
      description: 'Leadership, management and governance of the organisation assures the delivery of high-quality and person-centred care, supports learning and innovation, and promotes an open, fair culture.',
      evidenceCount: 6,
      requirementsCount: 10,
      lastReviewed: '2023-04-01',
      keyRequirements: [
        { id: 1, name: 'Clear vision and values guide the service', completed: true },
        { id: 2, name: 'Governance processes ensure quality and safety', completed: false },
        { id: 3, name: 'Staff feel supported and valued', completed: true },
        { id: 4, name: 'Learning from incidents and feedback drives improvement', completed: false },
        { id: 5, name: 'Robust quality assurance processes are in place', completed: false },
      ]
    },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'outstanding':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Outstanding</span>;
      case 'good':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Good</span>;
      case 'requires improvement':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Requires Improvement</span>;
      case 'inadequate':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Inadequate</span>;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'outstanding':
        return 'bg-green-600';
      case 'good':
        return 'bg-blue-600';
      case 'requires improvement':
        return 'bg-yellow-500';
      case 'inadequate':
        return 'bg-red-600';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">CQC Compliance</h1>
          <p className="text-gray-600">Monitor and improve compliance with CQC standards</p>
        </div>
        <button 
          onClick={() => {
            // Generate a full PDF report with all the CQC compliance data
            const htmlContent = `
              <html>
                <head>
                  <title>CQC Compliance Report - ${new Date().toLocaleDateString()}</title>
                  <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #4f46e5; }
                    h2 { margin-top: 20px; color: #374151; }
                    .section { margin-bottom: 30px; }
                    .requirement { display: flex; margin: 8px 0; }
                    .status { margin-right: 10px; }
                    .complete { color: green; }
                    .incomplete { color: orange; }
                  </style>
                </head>
                <body>
                  <h1>CQC Compliance Full Report</h1>
                  <p>Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                  ${cqcAreas.map(area => `
                    <div class="section">
                      <h2>${area.name} - ${area.status.charAt(0).toUpperCase() + area.status.slice(1)}</h2>
                      <p>${area.description}</p>
                      <p>Score: ${area.score}% - ${area.evidenceCount}/${area.requirementsCount} Requirements Met</p>
                      <p>Last Reviewed: ${new Date(area.lastReviewed).toLocaleDateString()}</p>
                      <h3>Key Requirements:</h3>
                      ${area.keyRequirements.map(req => `
                        <div class="requirement">
                          <span class="status ${req.completed ? 'complete' : 'incomplete'}">${req.completed ? '✓' : '!'}</span>
                          <span>${req.name}</span>
                        </div>
                      `).join('')}
                    </div>
                  `).join('')}
                </body>
              </html>
            `;
            
            // Create a Blob with the HTML content
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            // Open the report in a new tab
            window.open(url, '_blank');
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <BarChart3 size={18} />
          <span>View Full Report</span>
        </button>
      </div>

      {/* Overall summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-gray-800 mb-4">Overall CQC Rating</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {cqcAreas.map(area => (
            <div key={area.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-800">{area.name}</h3>
                {getStatusBadge(area.status)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className={`${getStatusColor(area.status)} h-2.5 rounded-full`}
                  style={{ width: `${area.score}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{area.evidenceCount}/{area.requirementsCount} Requirements</span>
                <span>{area.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed sections */}
      <div className="space-y-4">
        {cqcAreas.map(area => (
          <div key={area.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div 
              className="px-4 py-3 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedSection(expandedSection === area.id ? null : area.id)}
            >
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(area.status)} mr-3`}></div>
                <h2 className="font-semibold text-gray-800">{area.name}</h2>
                {getStatusBadge(area.status)}
                <span className="ml-3 text-sm text-gray-500">Last reviewed: {new Date(area.lastReviewed).toLocaleDateString()}</span>
              </div>
              <div>
                {expandedSection === area.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
            
            {expandedSection === area.id && (
              <div className="p-4">
                <p className="text-gray-600 mb-4">{area.description}</p>
                
                <h3 className="font-medium text-gray-800 mb-2">Key Requirements</h3>
                <ul className="space-y-2 mb-4">
                  {area.keyRequirements.map(req => (
                    <li key={req.id} className="flex items-start">
                      {req.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                      )}
                      <span className={req.completed ? "text-gray-700" : "text-gray-800 font-medium"}>
                        {req.name}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex justify-between">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent collapse when clicking button
                      // Show a prompt to add evidence
                      const evidenceDescription = prompt(`Add evidence for ${area.name}:`, '');
                      if (evidenceDescription) {
                        // In a real application, this would send data to an API
                        // For now, we just show an alert that the evidence was added
                        alert(`Evidence added to ${area.name}:\n${evidenceDescription}`);
                      }
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Evidence
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent collapse when clicking this button
                      // Create a requirements report for this specific area
                      const htmlContent = `
                        <html>
                          <head>
                            <title>${area.name} Requirements Report</title>
                            <style>
                              body { font-family: Arial, sans-serif; padding: 20px; }
                              h1 { color: #4f46e5; }
                              .section { margin-bottom: 15px; }
                              .requirement { margin: 8px 0; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; }
                              .complete { color: green; }
                              .incomplete { color: orange; }
                            </style>
                          </head>
                          <body>
                            <h1>${area.name} Requirements Report</h1>
                            <p>Description: ${area.description}</p>
                            <p>Current Status: ${area.status.charAt(0).toUpperCase() + area.status.slice(1)}</p>
                            <p>Score: ${area.score}%</p>
                            <p>Requirements Met: ${area.evidenceCount}/${area.requirementsCount}</p>
                            <div class="section">
                              <h2>Key Requirements:</h2>
                              ${area.keyRequirements.map(req => `
                                <div class="requirement">
                                  <h3 class="${req.completed ? 'complete' : 'incomplete'}">
                                    ${req.completed ? '✓' : '!'} ${req.name}
                                  </h3>
                                  <p>Status: ${req.completed ? 'Completed' : 'Pending'}</p>
                                </div>
                              `).join('')}
                            </div>
                          </body>
                        </html>
                      `;
                      
                      const blob = new Blob([htmlContent], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      window.open(url, '_blank');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View All Requirements
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}