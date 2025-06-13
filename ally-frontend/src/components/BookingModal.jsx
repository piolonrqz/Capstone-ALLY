import { useState, useEffect } from 'react';
import { X, Clock, Calendar as CalendarIcon, User, Loader2, FileText } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { scheduleService } from '../services/scheduleService.jsx';
import { getAuthData, fetchUserDetails } from '../utils/auth.jsx';

export const BookingModal = ({ lawyer, caseInfo, isOpen, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('in-person');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [error, setError] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  // Available time slots (these will be filtered based on lawyer availability)
  const allTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  // Load user details when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUserDetails();
    }
  }, [isOpen]);

  const loadUserDetails = async () => {
    setLoadingUserDetails(true);
    setError('');
    
    try {
      const authData = getAuthData();
      if (!authData) {
        setError('You must be logged in to book a consultation');
        return;
      }

      // Try to get user details from backend
      try {
        const details = await fetchUserDetails(authData.userId);
        setUserDetails(details);
      } catch (fetchError) {
        console.warn('Could not fetch full user details, using auth data:', fetchError);
        // Fallback to basic auth data
        setUserDetails({
          id: authData.userId,
          email: authData.email,
          fullName: 'User', // Fallback name
          firstName: 'User',
          lastName: '',
          accountType: authData.accountType
        });
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      setError('Failed to load user information');
    } finally {
      setLoadingUserDetails(false);
    }
  };
  // Check availability when date changes
  useEffect(() => {
    if (selectedDate && lawyer?.id) {
      checkAvailabilityForDate();
    } else {
      setAvailableSlots(allTimeSlots);
    }
  }, [selectedDate, lawyer?.id]);
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(null);
      setSelectedTime('');
      setConsultationType('in-person');
      setNotes('');
      setError('');
      setAvailableSlots(allTimeSlots);
    }
  }, [isOpen]);

  const checkAvailabilityForDate = async () => {
    if (!selectedDate || !lawyer?.id) return;
    
    setIsCheckingAvailability(true);
    setError('');
    
    try {
      // OPTIMIZED: Single API call instead of 9 individual calls
      const availabilityData = await scheduleService.getAvailableSlots(lawyer.id, selectedDate);
      
      // Extract just the time slot strings for the existing UI logic
      const availableTimeSlots = availabilityData.availableSlots.map(slot => slot.startTime);
      setAvailableSlots(availableTimeSlots);
      
      // Clear selected time if it's no longer available
      if (selectedTime && !availableTimeSlots.includes(selectedTime)) {
        setSelectedTime('');
      }
      
      // Optional: Store full availability data for enhanced UI features
      // setFullAvailabilityData(availabilityData);
    } catch (error) {
      console.error('Error checking availability:', error);
      setError('Failed to check availability. Please try again.');
      setAvailableSlots(allTimeSlots); // Fallback to all slots
    } finally {
      setIsCheckingAvailability(false);
    }
  };
  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time');
      return;
    }

    if (!userDetails) {
      setError('User information not available. Please try refreshing the page.');
      return;
    }

    if (!lawyer?.id) {
      setError('Invalid lawyer information');
      return;
    }

    setIsLoading(true);
    setError('');    try {
      const bookingData = {
        lawyerId: lawyer.id,
        clientId: userDetails.id,
        date: selectedDate,
        time: selectedTime,
        consultationType,
        notes
      };

      let result;
      if (caseInfo) {
        // Case-based appointment booking
        result = await scheduleService.createCaseAppointment({
          ...bookingData,
          caseId: caseInfo.caseId
        });
      } else {
        // Regular appointment booking
        result = await scheduleService.createAppointment(bookingData);
      }
      
      console.log('Appointment created successfully:', result);
      alert('Consultation booked successfully!');
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError(error.message || 'Failed to book consultation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDateDisabled = (date) => {
    // Disable past dates and weekends
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0 || date.getDay() === 6;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="booking-modal" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="relative inline-block overflow-hidden text-left align-bottom transition-all transform bg-white shadow-xl rounded-xl sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="absolute right-4 top-4">
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-8">            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Schedule Consultation</h2>
              <p className="mt-1 text-gray-600">
                Book an appointment with {lawyer.name}
                {caseInfo && (
                  <span className="block mt-1 text-sm text-blue-600">
                    For Case: {caseInfo.title} (#{caseInfo.caseId})
                  </span>
                )}
              </p>
            </div>            <form onSubmit={handleBooking} className="space-y-6">
              {/* Case Information Display */}
              {caseInfo && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="flex items-center mb-3 text-sm font-medium text-blue-900">
                    <FileText className="w-4 h-4 mr-2" />
                    Case Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-blue-800">Title:</span>
                      <span className="ml-2 text-blue-700">{caseInfo.title}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Case #:</span>
                      <span className="ml-2 text-blue-700">{caseInfo.caseId}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Status:</span>
                      <span className="ml-2 text-green-700 font-medium">{caseInfo.status}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Description:</span>
                      <p className="mt-1 text-blue-700 text-sm leading-relaxed">{caseInfo.description}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {/* Calendar Section */}
                <div>
                  <label className="block mb-3 text-sm font-medium text-gray-700">
                    <CalendarIcon className="inline w-4 h-4 mr-2" />
                    Select Date
                  </label>
                  <div className="flex justify-center p-4 border border-gray-200 rounded-lg">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={isDateDisabled}
                      className="w-full"
                    />
                  </div>
                </div>                {/* Time Slots Section */}
                <div>
                  <label className="block mb-3 text-sm font-medium text-gray-700">
                    <Clock className="inline w-4 h-4 mr-2" />
                    Select Time
                    {isCheckingAvailability && (
                      <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />
                    )}
                  </label>
                  {!selectedDate ? (
                    <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
                      Please select a date first
                    </div>
                  ) : isCheckingAvailability ? (
                    <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
                      <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
                      Checking availability...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
                      No available time slots for this date
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 text-sm border rounded-lg transition-colors ${
                            selectedTime === time
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>              {/* Client Information - Show authenticated user's details */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="flex items-center mb-3 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 mr-2" />
                  Your Information
                </h4>
                {loadingUserDetails ? (
                  <div className="flex items-center text-gray-500">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading your information...
                  </div>
                ) : userDetails ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <p className="text-gray-900">{userDetails.fullName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Email:</span>
                      <p className="text-gray-900">{userDetails.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-600">Unable to load user information</p>
                )}
              </div>

              {/* Consultation Type */}
              <div>
                <label className="block mb-3 text-sm font-medium text-gray-700">
                  Consultation Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="in-person"
                      checked={consultationType === 'in-person'}
                      onChange={(e) => setConsultationType(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">In-Person</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="video"
                      checked={consultationType === 'video'}
                      onChange={(e) => setConsultationType(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Video Call</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="phone"
                      checked={consultationType === 'phone'}
                      onChange={(e) => setConsultationType(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Phone Call</span>
                  </label>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Briefly describe your legal matter or any specific questions you have..."
                />              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}              {/* Booking Summary */}
              {selectedDate && selectedTime && userDetails && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Booking Summary</h4>
                  <div className="mt-2 text-sm text-blue-800">
                    <p><strong>Client:</strong> {userDetails.fullName}</p>
                    <p><strong>Lawyer:</strong> {lawyer.name}</p>
                    <p><strong>Date:</strong> {selectedDate.toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {selectedTime}</p>
                    <p><strong>Type:</strong> {consultationType.charAt(0).toUpperCase() + consultationType.slice(1)}</p>
                    <p><strong>Fee:</strong> {lawyer.fee}</p>
                  </div>
                </div>
              )}{/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>                <button
                  type="submit"
                  disabled={isLoading || !selectedDate || !selectedTime || !userDetails || loadingUserDetails}
                  className="flex-1 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Book Consultation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
