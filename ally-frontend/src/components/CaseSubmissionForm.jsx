import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, AlertCircle, Loader2 } from 'lucide-react';
import { caseService } from '../services/caseService.jsx';
import { getAuthData } from '../utils/auth.jsx';

const CaseSubmissionForm = ({ onClose, onSuccess, selectedLawyer }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [lawyers, setLawyers] = useState([]);
  const [lawyerId, setLawyerId] = useState('');
  useEffect(() => {
  const token = localStorage.getItem('token');

  fetch('http://localhost:8080/lawyers/verified', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(setLawyers)
    .catch(() => setLawyers([]));
}, []);
  useEffect(() => {
    // Pre-select lawyer if provided
    if (selectedLawyer && selectedLawyer.id) {
      setLawyerId(selectedLawyer.id.toString());
    }
  }, [selectedLawyer]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Case title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Case title must be at least 5 characters long';
    }
      if (!formData.description.trim()) {
      newErrors.description = 'Case description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Case description must be at least 20 characters long';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Case description must be less than 1000 characters';
    }if (!lawyerId) {
      newErrors.lawyerId = 'Please select a lawyer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const authData = getAuthData();
      if (!authData) {
        throw new Error('You must be logged in to submit a case');
      }      const caseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        lawyerId: Number(lawyerId)
      };      await caseService.createCase(authData.userId, caseData);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Navigate to My Cases page
      navigate('/my-cases');
    } catch (err) {
      console.error('Error submitting case:', err);
      setError(err.message || 'Failed to submit case. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Submit New Legal Case
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">          {/* Lawyer Selection */}
          <div>
            <label htmlFor="lawyerId" className="block text-sm font-medium text-gray-700 mb-2">
              Select a Lawyer *
            </label>
            <select
              id="lawyerId"
              name="lawyerId"
              value={lawyerId}
              onChange={e => setLawyerId(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.lawyerId ? 'border-red-300' : 'border-gray-300'}`}
              disabled={isSubmitting || lawyers.length === 0 || selectedLawyer}
            >
              <option value="">-- Select a lawyer --</option>
              {lawyers.map(lawyer => (
                <option key={lawyer.userId} value={lawyer.userId}>
                  {lawyer.Fname} {lawyer.Lname} ({lawyer.specialization && lawyer.specialization.length > 0 ? lawyer.specialization.join(', ') : 'No specialty'})
                </option>
              ))}
            </select>
            {selectedLawyer && (
              <p className="mt-1 text-sm text-blue-600">
                Submitting case to: {selectedLawyer.name}
              </p>
            )}
            {errors.lawyerId && (
              <p className="mt-1 text-sm text-red-600">{errors.lawyerId}</p>
            )}
          </div>

          {/* Case Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Case Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief title describing your legal issue"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Case Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Case Description *
            </label>            <textarea
              id="description"
              name="description"
              rows={6}
              maxLength={1000}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide detailed information about your legal situation. Include relevant facts, dates, and any specific legal questions you have. The more detail you provide, the better we can match you with the right lawyer."
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}            <p className="mt-2 text-xs text-gray-500">
              {formData.description.length}/1000 characters maximum
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Privacy Notice</h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              Your case information will be shared with qualified lawyers in our network for the purpose of 
              case evaluation and assignment. We maintain strict confidentiality standards and your personal 
              information is protected according to our privacy policy.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Case
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaseSubmissionForm;
