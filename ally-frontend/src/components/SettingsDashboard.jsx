import React, { useState } from 'react';
import { Shield, Mail, Bell, Key, Database, Clock, Globe, AlertTriangle } from 'lucide-react';

const SettingsDashboard = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [emailNotifications, setEmailNotifications] = useState({
    newUser: true,
    lawyerVerification: true,
    systemAlerts: true,
    reports: false
  });
  
  // Sample settings states
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotification: true,
    sessionTimeout: "30"
  });

  const [systemSettings, setSystemSettings] = useState({
    language: "en",
    timezone: "UTC+8",
    dateFormat: "MM/DD/YYYY"
  });

  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleEmailSettingChange = (setting) => {
    setEmailNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Security Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    className="sr-only peer"
                    checked={securitySettings.twoFactorAuth}
                    onChange={() => setSecuritySettings(prev => ({
                      ...prev,
                      twoFactorAuth: !prev.twoFactorAuth
                    }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Login Notifications</h4>
                  <p className="text-sm text-gray-500">Get notified of new login attempts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    className="sr-only peer"
                    checked={securitySettings.loginNotification}
                    onChange={() => setSecuritySettings(prev => ({
                      ...prev,
                      loginNotification: !prev.loginNotification
                    }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Session Timeout</h4>
                  <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                </div>
                <select 
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings(prev => ({
                    ...prev,
                    sessionTimeout: e.target.value
                  }))}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Email Notifications</h3>
            
            <div className="space-y-4">
              {[
                { id: 'newUser', label: 'New User Registration', desc: 'Get notified when a new user registers' },
                { id: 'lawyerVerification', label: 'Lawyer Verification Requests', desc: 'Receive alerts for new verification requests' },
                { id: 'systemAlerts', label: 'System Alerts', desc: 'Important system notifications and updates' },
                { id: 'reports', label: 'Weekly Reports', desc: 'Receive weekly summary reports' }
              ].map(setting => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{setting.label}</h4>
                    <p className="text-sm text-gray-500">{setting.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      className="sr-only peer"
                      checked={emailNotifications[setting.id]}
                      onChange={() => handleEmailSettingChange(setting.id)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">System Preferences</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <select 
                    value={systemSettings.language}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      language: e.target.value
                    }))}
                    className="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Timezone</label>
                  <select 
                    value={systemSettings.timezone}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      timezone: e.target.value
                    }))}
                    className="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC+0">UTC</option>
                    <option value="UTC+8">Asia/Manila (UTC+8)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Format</label>
                  <select 
                    value={systemSettings.dateFormat}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      dateFormat: e.target.value
                    }))}
                    className="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'maintenance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">System Maintenance</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                  <h4 className="font-medium text-yellow-800">Maintenance Mode</h4>
                </div>
                <p className="mt-1 text-sm text-yellow-700">
                  Enabling maintenance mode will temporarily disable access to the platform for all users except administrators.
                </p>
                <div className="mt-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      className="sr-only peer"
                      checked={maintenanceMode}
                      onChange={() => setMaintenanceMode(!maintenanceMode)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    <span className="ml-3 text-sm font-medium text-yellow-800">
                      {maintenanceMode ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>

              <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Backup Database
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 mt-8">Settings</h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4">
          {/* Settings Navigation */}
          <div className="border-r border-gray-200">
            <nav className="p-4 space-y-1">
              {[
                { id: 'security', icon: Shield, label: 'Security' },
                { id: 'notifications', icon: Bell, label: 'Notifications' },
                { id: 'system', icon: Globe, label: 'System' },
                { id: 'maintenance', icon: Database, label: 'Maintenance' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-md ${
                    activeTab === item.id 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="p-6 md:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
