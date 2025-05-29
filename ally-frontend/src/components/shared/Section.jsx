import React from 'react';
import { Edit } from 'lucide-react';
import Button from './Button';

const Section = ({ title, children, onEdit }) => (
  <div className="p-6 mb-6 bg-white border border-gray-200 rounded-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {onEdit && (
        <Button onClick={onEdit} variant="secondary">
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      )}
    </div>
    {children}
  </div>
);

export default Section;