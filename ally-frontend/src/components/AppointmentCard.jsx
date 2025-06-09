import React from 'react';
import { Calendar, MapPin, User, FileText, Edit, Trash2 } from 'lucide-react';

export const AppointmentCard = ({ appointment, onEdit, onCancel }) => {
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    };
  };

  const { date, time } = formatDateTime(appointment.bookingStartTime);
  const endTime = formatDateTime(appointment.bookingEndTime).time;

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-start justify-between">
        {/* Main Information */}
        <div className="flex-1">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {appointment.appointmentType || 'Legal Consultation'}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{date} | {time} - {endTime}</span>
            </div>
          </div>

          <div className="space-y-2 text-sm">            <div className="flex">
              <User className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
              <div>
                <span className="text-gray-600">Attorney: </span>
                <span className="text-gray-900">
                  {appointment.lawyer.Fname} {appointment.lawyer.Lname}
                </span>
              </div>
            </div>

            <div className="flex">
              <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
              <div>
                <span className="text-gray-600">Location: </span>
                <span className="text-gray-900">
                  {appointment.location || 'Main Office, Room 203'}
                </span>
              </div>
            </div>

            {appointment.notes && (
              <div className="flex">
                <FileText className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <span className="text-gray-600">Notes: </span>
                  <span className="text-gray-900">{appointment.notes}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status and Actions */}
        <div className="ml-6 flex flex-col items-end space-y-3">
          {/* Status Badge */}
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
            <span className="text-xs font-semibold">
              {appointment.status || 'Scheduled'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(appointment)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-blue-500 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button
              onClick={() => onCancel(appointment)}
              className="flex items-center px-4 py-2 text-sm text-red-700 bg-red-50 border border-red-500 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
