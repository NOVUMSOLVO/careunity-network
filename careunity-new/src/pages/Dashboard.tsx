import React from 'react';
import { useLanguage } from '../contexts/language-context';
import { useAccessibility } from '../contexts/accessibility-context';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { fontScale } = useAccessibility();

  // Sample data for the dashboard
  const todayVisits = [
    { id: 1, name: 'John Smith', time: '09:00 AM', status: 'Completed' },
    { id: 2, name: 'Mary Johnson', time: '11:30 AM', status: 'In Progress' },
    { id: 3, name: 'Robert Davis', time: '02:00 PM', status: 'Scheduled' },
  ];

  const upcomingVisits = [
    { id: 4, name: 'Sarah Wilson', time: 'Tomorrow, 10:00 AM', status: 'Scheduled' },
    { id: 5, name: 'Michael Brown', time: 'Tomorrow, 01:30 PM', status: 'Scheduled' },
    { id: 6, name: 'Jennifer Lee', time: 'May 15, 11:00 AM', status: 'Scheduled' },
  ];

  // Calculate font size based on accessibility settings
  const getFontSize = (baseSize: number) => {
    return `${baseSize * fontScale}px`;
  };

  return (
    <div className="dashboard">
      <h1 style={{ fontSize: getFontSize(24) }}>{t('welcome')}</h1>
      
      <div className="dashboard-grid">
        {/* Today's Visits */}
        <div className="dashboard-card">
          <h2 style={{ fontSize: getFontSize(18) }}>Today's Visits</h2>
          <div className="visit-list">
            {todayVisits.map((visit) => (
              <div key={visit.id} className="visit-item">
                <div className="visit-info">
                  <div style={{ fontSize: getFontSize(16) }} className="visit-name">{visit.name}</div>
                  <div style={{ fontSize: getFontSize(14) }} className="visit-time">{visit.time}</div>
                </div>
                <div className={`visit-status status-${visit.status.toLowerCase().replace(' ', '-')}`}>
                  {visit.status}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Upcoming Visits */}
        <div className="dashboard-card">
          <h2 style={{ fontSize: getFontSize(18) }}>Upcoming Visits</h2>
          <div className="visit-list">
            {upcomingVisits.map((visit) => (
              <div key={visit.id} className="visit-item">
                <div className="visit-info">
                  <div style={{ fontSize: getFontSize(16) }} className="visit-name">{visit.name}</div>
                  <div style={{ fontSize: getFontSize(14) }} className="visit-time">{visit.time}</div>
                </div>
                <div className={`visit-status status-${visit.status.toLowerCase().replace(' ', '-')}`}>
                  {visit.status}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="dashboard-card">
          <h2 style={{ fontSize: getFontSize(18) }}>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value" style={{ fontSize: getFontSize(24) }}>12</div>
              <div className="stat-label" style={{ fontSize: getFontSize(14) }}>Total Visits Today</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ fontSize: getFontSize(24) }}>45</div>
              <div className="stat-label" style={{ fontSize: getFontSize(14) }}>Active Service Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ fontSize: getFontSize(24) }}>8</div>
              <div className="stat-label" style={{ fontSize: getFontSize(14) }}>Staff On Duty</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ fontSize: getFontSize(24) }}>98%</div>
              <div className="stat-label" style={{ fontSize: getFontSize(14) }}>Completion Rate</div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="dashboard-card">
          <h2 style={{ fontSize: getFontSize(18) }}>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-time" style={{ fontSize: getFontSize(12) }}>10:45 AM</div>
              <div className="activity-description" style={{ fontSize: getFontSize(14) }}>
                Visit completed for John Smith
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-time" style={{ fontSize: getFontSize(12) }}>09:30 AM</div>
              <div className="activity-description" style={{ fontSize: getFontSize(14) }}>
                New care plan created for Sarah Wilson
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-time" style={{ fontSize: getFontSize(12) }}>Yesterday</div>
              <div className="activity-description" style={{ fontSize: getFontSize(14) }}>
                Staff meeting scheduled for May 15
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-time" style={{ fontSize: getFontSize(12) }}>Yesterday</div>
              <div className="activity-description" style={{ fontSize: getFontSize(14) }}>
                New service user added: Michael Brown
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
