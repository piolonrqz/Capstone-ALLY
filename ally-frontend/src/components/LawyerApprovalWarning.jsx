import React from 'react';
import { AlertCircle } from 'lucide-react';

const LawyerApprovalWarning = ({ status }) => {
  const getMessage = () => {
    if (status === 'pending') {
      return 'Your lawyer account is pending admin approval. This usually takes 1-2 business days. You can still upload documents in Settings while you wait.';
    } else if (status === 'rejected') {
      return 'Your lawyer account has been rejected. Please contact support or check your credentials in Settings.';
    }
    return 'Your lawyer account is pending approval.';
  };

  const getBackgroundColor = () => {
    if (status === 'rejected') {
      return 'bg-red-50 border-red-200';
    }
    return 'bg-amber-50 border-amber-200';
  };

  const getTextColor = () => {
    if (status === 'rejected') {
      return 'text-red-800';
    }
    return 'text-amber-800';
  };

  const getIconColor = () => {
    if (status === 'rejected') {
      return 'text-red-600';
    }
    return 'text-amber-600';
  };

  return (
    <div className={`${getBackgroundColor()} border-b ${getTextColor()} px-4 py-3 w-full`}>
      <div className="container max-w-7xl mx-auto flex items-center gap-3">
        <AlertCircle className={`w-5 h-5 flex-shrink-0 ${getIconColor()}`} />
        <p className="text-sm font-medium">{getMessage()}</p>
      </div>
    </div>
  );
};

export default LawyerApprovalWarning;

