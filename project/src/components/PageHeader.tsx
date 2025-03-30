import React from 'react';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-to-r from-teal-dark to-teal-medium text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-teal-medium rounded-full transition-colors"
            title="Go to Home"
          >
            <Home className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default PageHeader; 