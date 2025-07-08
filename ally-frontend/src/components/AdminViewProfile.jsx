import React, { useState } from 'react';
import { 
    X, 
    MapPin, 
    Mail, 
    Phone, 
    Calendar, 
    Shield, 
    Briefcase, 
    Award, 
    FileText, 
    CheckCircle, 
    AlertTriangle, 
    User, 
    Building, 
    Clock,
    Edit,
    Key,
    Ban,
    UserCheck,
    Trash2
} from 'lucide-react';
import AdminDocumentViewer from './AdminDocumentViewer';

// Text formatting helpers
const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatName = (firstName, lastName, fullName) => {
  if (fullName) {
    return fullName.split(' ')
      .map(word => capitalizeFirstLetter(word))
      .join(' ');
  }
  const formattedFirst = capitalizeFirstLetter(firstName || '');
  const formattedLast = capitalizeFirstLetter(lastName || '');
  return [formattedFirst, formattedLast].filter(Boolean).join(' ') || 'No Name Provided';
};

const formatPracticeArea = (area) => {
  if (!area) return '';
  return area.split(/(?=[A-Z])/).map(word => capitalizeFirstLetter(word)).join(' ');
};

const AdminViewProfile = ({ user, onClose, onEdit, onDelete, onStatusChange, onResetPassword }) => {
    if (!user) return null;

    const [activeTab, setActiveTab] = useState('basic');
    const [selectedDocument, setSelectedDocument] = useState(null);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'inactive':
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'bg-purple-500';
            case 'lawyer':
                return 'bg-blue-500';
            case 'client':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    const Section = ({ title, icon: Icon, children }) => (
        <div className="mb-8 last:mb-0">
            <div className="flex items-center mb-4">
                <Icon className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
                {children}
            </div>
        </div>
    );

    const InfoRow = ({ label, value, className = "" }) => (
        <div className={className}>
            <label className="text-sm text-gray-500 block mb-1">{label}</label>
            <p className="font-medium text-gray-900">{value || 'Not provided'}</p>
        </div>
    );

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${activeTab === id 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-600 hover:bg-gray-100'}`}
        >
            <Icon className="w-4 h-4 mr-2" />
            {label}
        </button>
    );

    const renderCredentialsSection = () => {
        if (!user.credentials) {
            return (
                <div className="flex items-center justify-center p-6 bg-white rounded border border-gray-200">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                    <p className="text-gray-600">No Credentials Uploaded</p>
                </div>
            );
        }

        if (typeof user.credentials === 'string') {
            // Single document case
            return (
                <div 
                    className="p-4 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedDocument({
                        name: 'Credentials.pdf',
                        url: user.credentials,
                        size: 0,
                        uploadedAt: user.createdAt
                    })}
                >
                    <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                            <h4 className="font-medium text-gray-900">Credentials Document</h4>
                            <p className="text-sm text-gray-600">Click to view document</p>
                        </div>
                    </div>
                </div>
            );
        }

        // Multiple documents case
        return (
            <div className="space-y-4">
                {Object.entries(user.credentials).map(([key, value]) => (
                    <div
                        key={key}
                        className="p-4 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedDocument({
                            name: `${key}.pdf`,
                            url: value,
                            size: 0,
                            uploadedAt: user.createdAt
                        })}
                    >
                        <div className="flex items-center">
                            <FileText className="w-5 h-5 text-gray-400 mr-2" />
                            <div>
                                <h4 className="font-medium text-gray-900">{key}</h4>
                                <p className="text-sm text-gray-600">Click to view document</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'basic':
                return (
                    <Section title="Basic Information" icon={User}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoRow 
                                label="Full Name" 
                                value={formatName(user.firstName, user.lastName, user.fullName)} 
                            />
                            <InfoRow 
                                label="Email Address" 
                                value={user.email} 
                            />
                            <InfoRow 
                                label="Phone Number" 
                                value={user.phone || user.phoneNumber} 
                            />
                            <InfoRow 
                                label="Complete Address" 
                                value={[
                                    user.address,
                                    user.city,
                                    user.province,
                                    user.zipCode
                                ].filter(Boolean).map(capitalizeFirstLetter).join(', ')}
                            />
                        </div>
                    </Section>
                );
            case 'account':
                return (
                    <Section title="Account Information" icon={Shield}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoRow 
                                label="Account Created" 
                                value={new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })} 
                            />
                            <InfoRow label="Account Status" value={capitalizeFirstLetter(user.status)} />
                            <InfoRow label="Account Type" value={capitalizeFirstLetter(user.role)} />
                            <InfoRow label="Verification Status" value={user.isVerified ? 'Verified' : 'Not Verified'} />
                        </div>
                    </Section>
                );
            case 'professional':
                return user.role?.toLowerCase() === 'lawyer' ? (
                    <Section title="Professional Information" icon={Briefcase}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoRow label="Bar Number" value={user.barNumber} />
                            <InfoRow label="Years of Experience" value={user.yearsOfExperience} />
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-500 block mb-2">Practice Areas</label>
                                <div className="flex flex-wrap gap-2">
                                    {user.practiceAreas?.length > 0 ? (
                                        user.practiceAreas.map((area, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                            >
                                                {formatPracticeArea(area)}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-600">No Practice Areas Specified</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Section>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Professional information is only available for lawyers.
                    </div>
                );
            case 'credentials':
                return user.role?.toLowerCase() === 'lawyer' ? (
                    <Section title="Credentials & Documentation" icon={FileText}>
                        {renderCredentialsSection()}
                    </Section>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Credentials information is only available for lawyers.
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-6 sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                <div className="relative inline-block w-full text-left align-middle transition-all transform bg-white rounded-lg shadow-xl sm:max-w-2xl">
                    <div className="absolute right-4 top-4">
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Profile Header */}
                        <div className="flex items-start space-x-4 mb-6 pb-4 border-b border-gray-200">
                            <div className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 text-2xl font-semibold text-white rounded-full ${getRoleColor(user.role)}`}>
                                {user.image ? (
                                    <img src={user.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase() || 
                                    (user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U')
                                )}
                            </div>
                            <div className="flex-1 min-h-[60px]">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                        {formatName(user.firstName, user.lastName, user.fullName)}
                                    </h2>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                                        {capitalizeFirstLetter(user.status) || 'Unknown'}
                                    </span>
                                </div>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                    user.role?.toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-800' :
                                    user.role?.toLowerCase() === 'lawyer' ? 'bg-blue-100 text-blue-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {capitalizeFirstLetter(user.role)}
                                </span>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex space-x-1 mb-4 border-b border-gray-200 pb-1 overflow-x-auto">
                            <TabButton id="basic" label="Basic Information" icon={User} />
                            <TabButton id="account" label="Account" icon={Shield} />
                            <TabButton id="professional" label="Professional" icon={Briefcase} />
                            <TabButton id="credentials" label="Credentials" icon={FileText} />
                        </div>

                        {/* Tab Content */}
                        <div className="mt-4 min-h-[300px]">
                            {renderTabContent()}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2 justify-end">
                                <button
                                    onClick={() => onEdit?.(user)}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Edit className="w-4 h-4 mr-1.5" />
                                    Edit Profile
                                </button>

                                <button
                                    onClick={() => onResetPassword?.(user)}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Key className="w-4 h-4 mr-1.5" />
                                    Reset Password
                                </button>

                                {user.status === 'active' || user.status === 'approved' ? (
                                    <button
                                        onClick={() => onStatusChange?.(user, 'inactive')}
                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-transparent rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        <Ban className="w-4 h-4 mr-1.5" />
                                        Deactivate
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onStatusChange?.(user, 'active')}
                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-transparent rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <UserCheck className="w-4 h-4 mr-1.5" />
                                        Activate
                                    </button>
                                )}

                                <button
                                    onClick={() => onDelete?.(user)}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    <Trash2 className="w-4 h-4 mr-1.5" />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Viewer Modal */}
            {selectedDocument && (
                <AdminDocumentViewer
                    document={selectedDocument}
                    onClose={() => setSelectedDocument(null)}
                />
            )}
        </div>
    );
};

export default AdminViewProfile; 