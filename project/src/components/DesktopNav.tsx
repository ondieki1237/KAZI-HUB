"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import {
  Bell,
  MessageSquare,
  LogOut,
  User,
  Settings,
  HelpCircle,
  PlusCircle,
  FileText,
  Briefcase,
  Home,
  ChevronDown,
} from "lucide-react"

interface DesktopNavProps {
  onLogout: () => void
}

const DesktopNav: React.FC<DesktopNavProps> = ({ onLogout }) => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const isAuthenticated = !!user._id

  const primaryNavItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
    },
    {
      icon: Briefcase,
      label: "Find Jobs",
      path: "/jobs",
    },
    {
      icon: FileText,
      label: "CV Maker",
      path: "/cv-maker",
    },
  ]

  const accountDropdownItems = isAuthenticated
    ? [
        {
          icon: User,
          label: "Profile",
          path: "/profile/my-profile",
        },
        {
          icon: MessageSquare,
          label: "Messages",
          path: "/messages",
        },
        {
          icon: Bell,
          label: "Notifications",
          path: "/notifications",
        },
        {
          icon: Settings,
          label: "Settings",
          path: "/settings",
        },
        {
          icon: HelpCircle,
          label: "Help",
          path: "/help",
        },
        {
          icon: LogOut,
          label: "Logout",
          path: "#",
          onClick: onLogout,
          className: "text-red-600 hover:bg-red-50",
        },
      ]
    : [
        {
          icon: User,
          label: "Login",
          path: "/login",
        },
        {
          icon: HelpCircle,
          label: "Help",
          path: "/help",
        },
      ]

  return (
    <nav className="flex items-center space-x-6">
      {primaryNavItems.map((item) => (
        <button
          key={item.label}
          onClick={() => navigate(item.path)}
          className="text-white hover:text-teal-200 transition-colors flex items-center space-x-1 text-sm font-medium"
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </button>
      ))}

      {isAuthenticated && (
        <button
          onClick={() => navigate("/jobs/create")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Post Job</span>
        </button>
      )}

      <div className="relative group">
        <button className="text-white hover:text-teal-200 transition-colors flex items-center space-x-1 text-sm font-medium">
          <User className="h-4 w-4" />
          <span>Account</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-50">
          {accountDropdownItems.map((item) => (
            <button
              key={item.label}
              onClick={() => (item.onClick ? item.onClick() : navigate(item.path))}
              className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center ${item.className || ""}`}
            >
              <item.icon className="h-4 w-4 mr-2" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default DesktopNav
