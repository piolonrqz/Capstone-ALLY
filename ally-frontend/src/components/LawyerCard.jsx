import { Star, MapPin } from 'lucide-react';

export const LawyerCard = ({ lawyer, onClick }) => (
  <div className="p-4 mb-4 transition-shadow bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md" onClick={() => onClick(lawyer)}>
    <div className="flex items-start space-x-3">
      <div className="flex items-center justify-center w-12 h-12 font-semibold text-white bg-blue-500 rounded-full">
        {lawyer.image}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{lawyer.name}</h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium">{lawyer.rating}</span>
          </div>
        </div>
        <p className="text-sm font-medium text-blue-600">{lawyer.specialty}</p>
        <p className="flex items-center mt-1 text-sm text-gray-600">
          <MapPin className="w-3 h-3 mr-1" />
          {lawyer.location}
        </p>
        <p className="mt-2 text-sm text-gray-700">{lawyer.experience} of experience handling {lawyer.caseType.toLowerCase()}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-blue-600">{lawyer.fee} case</span>
          <button className="px-4 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
            View Profile
          </button>
        </div>
      </div>
    </div>
  </div>
);
