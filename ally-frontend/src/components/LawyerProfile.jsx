import { useState } from 'react';
import { Star, MapPin, MessageCircle, X } from 'lucide-react';
import { BookingModal } from './BookingModal';

export const LawyerProfile = ({ lawyer, onClose }) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
  <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
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
          <div className="flex items-start mb-6 space-x-4">
            <div className="flex items-center justify-center w-20 h-20 text-2xl font-semibold text-white bg-blue-500 rounded-full">
              {/* Show initials if no image, else show image */}
              {lawyer?.image ? (
                <img src={lawyer.image} alt="Profile" className="object-cover w-full h-full rounded-full" />
              ) : (
                ((lawyer?.firstName?.charAt(0) || lawyer?.name?.charAt(0) || '') + (lawyer?.lastName?.charAt(0) || '')).toUpperCase() || 'L'
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{lawyer?.name || (lawyer?.firstName && lawyer?.lastName ? `${lawyer.firstName} ${lawyer.lastName}` : 'Lawyer')}</h2>
              {lawyer?.specialty && (
                <span className="inline-block px-3 py-1 mt-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                  {lawyer.specialty}
                </span>
              )}
              <p className="flex items-center mt-2 text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {lawyer?.location || lawyer?.city || ''}
                {lawyer?.rating && (
                  <>
                    <Star className="w-4 h-4 ml-4 mr-1 text-yellow-400 fill-yellow-400" />
                    {lawyer.rating}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">About</h3>
              <p className="text-sm text-gray-700">{lawyer?.about || ''}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Case Rate</h3>
              <p className="font-semibold text-blue-600">{lawyer?.fee || ''}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Experience</h3>
              <p className="text-gray-700">{lawyer?.experience || ''}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Availability</h3>
              <p className="text-gray-700">Available</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Education</h3>
              <p className="text-gray-700">{lawyer?.education || ''}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 font-semibold">Areas of Practice</h3>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(lawyer?.areas) && lawyer.areas.length > 0 ? (
                lawyer.areas.map((area, index) => (
                  <span key={index} className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-full">
                    {area}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">No areas listed</span>
              )}
            </div>
          </div>
          <div className="flex space-x-4">
            <button className="flex items-center justify-center flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </button>
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="flex-1 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </div>    {/* Booking Modal */}
    <BookingModal
      lawyer={lawyer}
      isOpen={isBookingModalOpen}
      onClose={() => setIsBookingModalOpen(false)}
    />
  </div>
);
};

export default LawyerProfile;