import { Search } from 'lucide-react';

export const AIMatching = ({ lawyers, onLawyerSelect }) => (
  <div className="p-8 bg-white shadow-sm rounded-xl">
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-2xl font-bold text-gray-900">AI Lawyer Matching</h2>
        <p className="mb-6 text-gray-600">Let our AI find the perfect lawyer for your specific case. Describe your situation and we'll match you with the most qualified attorneys.</p>
      </div>

      <div>
        <label className="block mb-2 font-medium text-gray-700">Title</label>
        <input 
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Brief title for your case..."
        />
      </div>

      <div>
        <label className="block mb-2 font-medium text-gray-700">Description</label>
        <textarea 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="4"
          placeholder="Describe your legal situation and what you need help with..."
        ></textarea>
      </div>

      <div className="grid gap-4 mt-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 font-medium text-gray-700">Case Type</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>Family Law</option>
            <option>Criminal Law</option>
            <option>Civil Law</option>
            <option>Corporate Law</option>
            <option>Labor Law</option>
            <option>Real Estate Law</option>
            <option>Personal Injury</option>
            <option>Immigration Law</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-medium text-gray-700">Urgency</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      <button className="w-full px-6 py-3 mt-6 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
        Find Matching Lawyers
      </button>

      {/* Results Section - Initially Hidden */}
      <div className="pt-8 mt-8 border-t border-gray-200">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Matches for Your Case</h3>
        <p className="mb-6 text-gray-600">Based on your requirements, here are the most suitable lawyers for your case:</p>
        <div className="space-y-4">
          {lawyers.slice(0, 3).map((lawyer) => (
            <div 
              key={lawyer.id}
              className="p-4 transition-shadow border border-gray-200 rounded-lg cursor-pointer hover:shadow-md"
              onClick={() => onLawyerSelect(lawyer)}
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 text-lg font-semibold text-white bg-blue-500 rounded-full">
                  {lawyer.image}
                </div>
                <div className="flex-1">
                  <h4 className="mb-1 font-semibold text-gray-900">{lawyer.name}</h4>
                  <p className="mb-2 text-sm text-gray-600">{lawyer.specialty}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Match Score: 95%</span>
                    <span>•</span>
                    <span>{lawyer.experience}</span>
                    <span>•</span>
                    <span>{lawyer.fee}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);