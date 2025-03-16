"use client"

// components/menu.tsx

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  MessageSquare,
  LogOut,
  User,
  Settings,
  HelpCircle,
  PlusCircle,
  FileText,
  CreditCard,
  Briefcase,
  X,
  Home,
} from 'lucide-react';

// Placeholder for DesktopNav (assuming it exists or will be implemented)
const DesktopNav: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!user._id;

  const desktopMenuItems = [
    // Common Items (shown to all)
    {
      title: 'Navigation',
      items: [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Briefcase, label: 'Find Jobs', path: '/jobs' },
      ],
    },
    // Authenticated User Items
    ...(isAuthenticated
      ? [
          {
            title: 'Job Management',
            items: [
              { icon: PlusCircle, label: 'Post a Job', path: '/jobs/create' },
              { icon: FileText, label: 'My Posted Jobs', path: '/jobs/my-posted' },
              { icon: Briefcase, label: 'Applied Jobs', path: '/applied-jobs' },
            ],
          },
          {
            title: 'Tools & Resources',
            items: [
              { icon: FileText, label: 'CV Maker', path: '/cv-maker' },
              { icon: MessageSquare, label: 'Messages', path: '/messages' },
              { icon: CreditCard, label: 'Wallet', path: '/wallet' },
              { icon: Bell, label: 'Notifications', path: '/notifications' },
            ],
          },
          {
            title: 'Account',
            items: [
              { icon: User, label: 'Profile', path: '/profile/my-profile' },
              { icon: Settings, label: 'Settings', path: '/settings' },
              { icon: HelpCircle, label: 'Help', path: '/help' },
            ],
          },
        ]
      : [
          // Non-authenticated User Items
          {
            title: 'Account',
            items: [
              { icon: User, label: 'Login', path: '/login' },
              { icon: FileText, label: 'CV Maker', path: '/cv-maker' },
              { icon: HelpCircle, label: 'Help', path: '/help' },
            ],
          },
        ]),
  ];

  return (
    <nav className="bg-white shadow-md p-4">
      <ul className="flex space-x-6">
        {desktopMenuItems.map((section, idx) =>
          section.items.map((item, index) => (
            <li key={`${idx}-${index}`}>
              <button
                onClick={() => navigate(item.path)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-500"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))
        )}
        {isAuthenticated && (
          <li>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-800"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

interface MenuProps {
  onLogout: () => void;
}

const Menu: React.FC<MenuProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!user._id;

  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(false);
  const menuContentRef = useRef<HTMLDivElement>(null); // Ref for mobile menu content height

  const menuItems = [
    // Common Items (shown to all)
    {
      title: 'Navigation',
      items: [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Briefcase, label: 'Find Jobs', path: '/jobs' },
      ],
    },
    // Authenticated User Items
    ...(isAuthenticated
      ? [
          {
            title: 'Job Management',
            items: [
              { icon: PlusCircle, label: 'Post a Job', path: '/jobs/create' },
              { icon: FileText, label: 'My Posted Jobs', path: '/jobs/my-posted' },
              { icon: Briefcase, label: 'Applied Jobs', path: '/applied-jobs' },
            ],
          },
          {
            title: 'Tools & Resources',
            items: [
              { icon: FileText, label: 'CV Maker', path: '/cv-maker' },
              { icon: MessageSquare, label: 'Messages', path: '/messages' },
              { icon: CreditCard, label: 'Wallet', path: '/wallet' },
              { icon: Bell, label: 'Notifications', path: '/notifications' },
            ],
          },
          {
            title: 'Account',
            items: [
              { icon: User, label: 'Profile', path: '/profile/my-profile' },
              { icon: Settings, label: 'Settings', path: '/settings' },
              { icon: HelpCircle, label: 'Help', path: '/help' },
            ],
          },
        ]
      : [
          // Non-authenticated User Items
          {
            title: 'Account',
            items: [
              { icon: User, label: 'Login', path: '/login' },
              { icon: FileText, label: 'CV Maker', path: '/cv-maker' },
              { icon: HelpCircle, label: 'Help', path: '/help' },
            ],
          },
        ]),
  ];

  // Handle resize to detect desktop view
  useEffect(() => {
    const handleResize = () => {
      setIsDesktopView(window.innerWidth >= 768); // Tailwind 'md' breakpoint
    };

    // Set initial value
    handleResize();

    // Listen for window resize events
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Calculate the height of the menu content to apply the clip-path for mobile
  useEffect(() => {
    if (isOpen && !isDesktopView && menuContentRef.current) {
      const contentHeight = menuContentRef.current.offsetHeight;
      const menuElement = document.getElementById('menu');
      if (menuElement) {
        menuElement.style.clipPath = `polygon(0 0, 100% 0, 100% ${contentHeight}px, ${contentHeight * 0.707}px ${contentHeight}px, 0 ${contentHeight}px)`;
      }
    }
  }, [isOpen, isDesktopView]);

  return (
    <div className="relative z-50">
      {/* Hamburger Icon for Mobile */}
      {!isDesktopView && (
        <button
          className="hamburger flex flex-col justify-between w-6 h-6 cursor-pointer relative z-50"
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span className="block h-1 w-full bg-white"></span>
          <span className="block h-1 w-full bg-white"></span>
          <span className="block h-1 w-full bg-white"></span>
        </button>
      )}

      {/* Desktop Navigation */}
      {isDesktopView && <DesktopNav onLogout={onLogout} />}

      {/* Mobile Slide-out Menu */}
      {!isDesktopView && (
        <div
          id="menu"
          className={`fixed top-0 right-0 w-1/2 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{
            clipPath: isOpen ? 'polygon(0 0, 100% 0, 100% 0, 0 0)' : undefined, // Reset clipPath when closed
          }}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
            <button
              onClick={toggleMenu}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Menu Content */}
          <div ref={menuContentRef} className="overflow-y-auto h-[calc(100%-82px)] pb-safe">
            {menuItems.map((section, idx) => (
              <div key={idx} className="py-6">
                <h3 className="px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                {section.items.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(item.path);
                      toggleMenu();
                    }}
                    className="w-full px-6 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            ))}

            {/* Logout Button */}
            {isAuthenticated && (
              <div className="p-6 border-t">
                <button
                  onClick={() => {
                    onLogout();
                    toggleMenu();
                  }}
                  className="w-full px-4 py-3 flex items-center space-x-3 text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blurred Backdrop for Mobile */}
      {isOpen && !isDesktopView && (
        <div
          onClick={toggleMenu}
          className="fixed top-0 left-0 w-full h-full bg-black/30 backdrop-blur-sm z-40"
        />
      )}
    </div>
  );
};

export default Menu;