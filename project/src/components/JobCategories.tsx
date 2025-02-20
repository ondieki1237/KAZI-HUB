import React from 'react';
import { Wrench, Zap, Paintbrush, Home, Truck, PenTool as Tool } from 'lucide-react';

const categories = [
  { id: '1', name: 'Plumbing', icon: Wrench },
  { id: '2', name: 'Electrical', icon: Zap },
  { id: '3', name: 'Painting', icon: Paintbrush },
  { id: '4', name: 'Cleaning', icon: Home },
  { id: '5', name: 'Moving', icon: Truck },
  { id: '6', name: 'Repair', icon: Tool },
];

function JobCategories() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <button
            key={category.id}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-teal-dark to-teal-medium rounded-full text-white mb-2">
              <Icon className="h-6 w-6" />
            </div>
            <span className="text-sm text-gray-700">{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default JobCategories;