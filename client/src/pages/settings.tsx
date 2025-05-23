import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, User, Bell, Lock, Database, Shield, Monitor, Users, Globe, Accessibility } from 'lucide-react';
import { AccessibilitySettings } from '@/components/settings/accessibility-settings';
import { LanguageSettings } from '@/components/settings/language-settings';
import { VoiceInput } from '@/components/ui/voice-input';
import { useAccessibility } from '@/contexts/accessibility-context';

export default function Settings() {
  const { t } = useTranslation();
  const { enableVoiceCommands } = useAccessibility();
  const [activeTab, setActiveTab] = useState('profile');

  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    // Tab navigation commands
    if (lowerCommand.includes('profile')) {
      setActiveTab('profile');
    } else if (lowerCommand.includes('notification')) {
      setActiveTab('notifications');
    } else if (lowerCommand.includes('security')) {
      setActiveTab('security');
    } else if (lowerCommand.includes('data')) {
      setActiveTab('data');
    } else if (lowerCommand.includes('privacy')) {
      setActiveTab('privacy');
    } else if (lowerCommand.includes('appearance')) {
      setActiveTab('appearance');
    } else if (lowerCommand.includes('team')) {
      setActiveTab('team');
    } else if (lowerCommand.includes('accessibility')) {
      setActiveTab('accessibility');
    } else if (lowerCommand.includes('language')) {
      setActiveTab('language');
    }
  };

  const tabs = [
    { id: 'profile', label: t('profile.title'), icon: <User className="h-5 w-5" /> },
    { id: 'notifications', label: t('notifications.title'), icon: <Bell className="h-5 w-5" /> },
    { id: 'security', label: 'Security', icon: <Lock className="h-5 w-5" /> },
    { id: 'accessibility', label: t('accessibility.title'), icon: <Accessibility className="h-5 w-5" /> },
    { id: 'language', label: t('settings.language'), icon: <Globe className="h-5 w-5" /> },
    { id: 'data', label: 'Data Management', icon: <Database className="h-5 w-5" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="h-5 w-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Monitor className="h-5 w-5" /> },
    { id: 'team', label: 'Team Settings', icon: <Users className="h-5 w-5" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="font-medium text-gray-800">Profile Picture</h3>
                  <p className="text-sm text-gray-500">This will be displayed on your profile</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-semibold">
                    JD
                  </div>
                  <button className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Change
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                      defaultValue="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                      defaultValue="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    defaultValue="john.doe@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    defaultValue="caregiver"
                  >
                    <option value="caregiver">Caregiver</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    defaultValue="Senior caregiver with 5+ years of experience in elderly care and medication management."
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Save Changes
                </button>
              </div>
            </div>
          </>
        );

      case 'notifications':
        return (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Notification Settings</h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800">Email Notifications</h3>

                <div className="space-y-3">
                  {[
                    { id: 'email-appointments', label: 'Appointment Reminders' },
                    { id: 'email-messages', label: 'New Messages' },
                    { id: 'email-careplans', label: 'Care Plan Updates' },
                    { id: 'email-tasks', label: 'Task Assignments' },
                    { id: 'email-alerts', label: 'Critical Alerts' },
                  ].map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id={item.id}
                          type="checkbox"
                          defaultChecked={true}
                          className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor={item.id} className="ml-2 text-sm font-medium text-gray-700">
                          {item.label}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-800">Push Notifications</h3>

                <div className="space-y-3">
                  {[
                    { id: 'push-appointments', label: 'Appointment Reminders' },
                    { id: 'push-messages', label: 'New Messages' },
                    { id: 'push-careplans', label: 'Care Plan Updates' },
                    { id: 'push-tasks', label: 'Task Assignments' },
                    { id: 'push-alerts', label: 'Critical Alerts' },
                  ].map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id={item.id}
                          type="checkbox"
                          defaultChecked={item.id === 'push-alerts'}
                          className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor={item.id} className="ml-2 text-sm font-medium text-gray-700">
                          {item.label}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Save Changes
                </button>
              </div>
            </div>
          </>
        );

      case 'accessibility':
        return (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('accessibility.title')}</h2>
            <AccessibilitySettings />
          </>
        );

      case 'language':
        return (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('settings.language')}</h2>
            <LanguageSettings />
          </>
        );

      default:
        return (
          <div className="text-center py-16">
            <SettingsIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Coming Soon</h2>
            <p className="text-gray-600">This settings section is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('settings.title')}</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Voice command button for page navigation */}
        {enableVoiceCommands && (
          <VoiceInput
            commandMode
            onCommand={handleVoiceCommand}
            size="default"
            variant="outline"
            placeholder={t('voiceInput.tap')}
            ariaLabel={t('voiceInput.tap')}
          />
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Sidebar */}
          <div className="sm:w-64 bg-gray-50 border-r border-gray-200">
            <ul className="py-2">
              {tabs.map(tab => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 text-left ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Main content */}
          <div className="flex-1 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}