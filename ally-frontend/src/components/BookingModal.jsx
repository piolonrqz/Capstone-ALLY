import { useState } from 'react';
import { X, Clock, Calendar as CalendarIcon, User } from 'lucide-react';
import { Calendar } from './ui/calendar';

export const BookingModal = ({ lawyer, isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [consultationType, setConsultationType] = useState('in-person');
  const [notes, setNotes] = useState('');

  // Available time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const handleBooking = (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !clientName || !clientEmail) {
      alert('Please fill in all required fields');
      return;
    }

    // Here you would typically send the booking data to your backend
    const bookingData = {
      lawyerId: lawyer.id,
      lawyerName: lawyer.name,
      clientName,
      clientEmail,
      date: selectedDate,
      time: selectedTime,
      type: consultationType,
      notes
    };

    console.log('Booking submitted:', bookingData);
    alert('Consultation booked successfully!');
    onClose();
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
          
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Schedule Consultation</h2>
              <p className="mt-1 text-gray-600">Book an appointment with {lawyer.name}</p>
            </div>

            <form onSubmit={handleBooking} className="space-y-6">
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
                </div>

                {/* Time Slots Section */}
                <div>
                  <label className="block mb-3 text-sm font-medium text-gray-700">
                    <Clock className="inline w-4 h-4 mr-2" />
                    Select Time
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
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
                </div>
              </div>

              {/* Client Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <User className="inline w-4 h-4 mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
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
                />
              </div>

              {/* Booking Summary */}
              {selectedDate && selectedTime && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Booking Summary</h4>
                  <div className="mt-2 text-sm text-blue-800">
                    <p><strong>Lawyer:</strong> {lawyer.name}</p>
                    <p><strong>Date:</strong> {selectedDate.toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {selectedTime}</p>
                    <p><strong>Type:</strong> {consultationType.charAt(0).toUpperCase() + consultationType.slice(1)}</p>
                    <p><strong>Fee:</strong> {lawyer.fee}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book Consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
