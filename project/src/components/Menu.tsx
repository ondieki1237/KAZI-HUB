import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, LogOut, User, Settings, HelpCircle, PlusCircle, FileText, CreditCard } from 'lucide-react';

interface MenuProps {
  onLogout: () => void;
}

const Menu: React.FC<MenuProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!user._id; // Check if user is logged in

  const menuItems = isAuthenticated ? [
    // Show these items only when logged in
    {
      icon: User,
      label: 'Profile',
      path: '/profile/my-profile'
    },
    {
      icon: FileText,
      label: 'CV Maker',
      path: '/cv-maker'
    },
    {
      icon: PlusCircle,
      label: 'Create a Job',
      path: '/jobs/create'
    },
    {
      icon: FileText,
      label: 'Created Jobs',
      path: '/jobs/my-posted'
    },
    {
      icon: CreditCard,
      label: 'My Wallet',
      path: '/wallet'
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings'
    },
    {
      icon: HelpCircle,
      label: 'Help',
      path: '/help'
    }
  ] : [
    // Show these items when not logged in
    {
      icon: FileText,
      label: 'CV Maker',
      path: '/cv-maker'
    },
    {
      icon: User,
      label: 'Login',
      path: '/login'
    },
    {
      icon: HelpCircle,
      label: 'Help',
      path: '/help'
    }
  ];

  return (
    <div className="relative">
      {/* Hamburger Icon */}
      <button
        className="hamburger flex flex-col justify-between w-6 h-6 cursor-pointer"
        onClick={() => document.getElementById('menu')?.classList.toggle('hidden')}
      >
        <span className="block h-1 w-full bg-gray-800"></span>
        <span className="block h-1 w-full bg-gray-800"></span>
        <span className="block h-1 w-full bg-gray-800"></span>
      </button>

      {/* Dropdown Menu */}
      <div id="menu" className="absolute top-8 left-0 bg-white shadow-lg rounded-md py-2 hidden w-48 z-50">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              navigate(item.path);
              document.getElementById('menu')?.classList.add('hidden');
            }}
            className="w-full px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 transition-colors"
          >
            <item.icon className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">{item.label}</span>
          </button>
        ))}
        {isAuthenticated && (
          <button
            onClick={() => {
              onLogout();
              document.getElementById('menu')?.classList.add('hidden');
            }}
            className="w-full px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 text-red-500"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Menu;