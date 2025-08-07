"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Interface for menu items with descriptions
interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  description: string;
  onClick?: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const DesktopNav: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAuthenticated = !!user._id;

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredSignIn, setHoveredSignIn] = useState(false);
  const [hoveredTryFree, setHoveredTryFree] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const desktopMenuItems: MenuSection[] = [
    {
      title: "Navigation",
      items: [
        { icon: Home, label: "Home", path: "/", description: "Return to the homepage" },
        { icon: Briefcase, label: "Find Jobs", path: "/jobs", description: "Search for jobs in your area" },
      ],
    },
    ...(isAuthenticated
      ? [
          {
            title: "Job Management",
            items: [
              { icon: PlusCircle, label: "Post a Job", path: "/jobs/create", description: "Hire skilled workers" },
              { icon: FileText, label: "My Posted Jobs", path: "/jobs/my-posted", description: "Manage your job postings" },
              { icon: Briefcase, label: "Applied Jobs", path: "/applied-jobs", description: "Track your applications" },
            ],
          },
          {
            title: "Tools & Resources",
            items: [
              { icon: FileText, label: "CV Maker", path: "/cv-maker", description: "Create your professional CV" },
              { icon: MessageSquare, label: "Messages", path: "/conversations", description: "Chat with employers and workers" },
              { icon: CreditCard, label: "Wallet", path: "/wallet", description: "Manage earnings and payments" },
              { icon: Bell, label: "Notifications", path: "/notifications", description: "View your latest alerts" },
            ],
          },
          {
            title: "Account",
            items: [
              { icon: User, label: "Profile", path: "/profile/my-profile", description: "Edit your personal details" },
              { icon: Settings, label: "Settings", path: "/settings", description: "Customize your preferences" },
              { icon: HelpCircle, label: "Help", path: "/help", description: "Get assistance with any issues" },
              { icon: LogOut, label: "Logout", path: "#", description: "Sign out of your account", onClick: onLogout },
            ],
          },
        ]
      : [
          {
            title: "Account",
            items: [
              { icon: User, label: "Login", path: "/login", description: "Sign in to your account" },
              { icon: FileText, label: "CV Maker", path: "/cv-maker", description: "Create your professional CV" },
              { icon: HelpCircle, label: "Help", path: "/help", description: "Get assistance with any issues" },
            ],
          },
        ]),
  ];

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease forwards;
          }
        `}
      </style>

      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          transition: "all 0.3s ease",
          padding: scrolled ? "8px 0" : "12px 0",
          boxShadow: scrolled ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.1)",
          background: "transparent",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Navigation Items */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
            }}
          >
            {desktopMenuItems.map((section, idx) => (
              <div key={idx} style={{ position: "relative" }}>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === section.title ? null : section.title)}
                  onMouseEnter={() => setHoveredItem(section.title)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: hoveredItem === section.title ? "#E0F2F1" : "#FFFFFF",
                    fontSize: "15px",
                    fontWeight: 500,
                    fontFamily: "'Euclid Circular A', 'Inter', 'Helvetica Neue', Arial, sans-serif",
                    padding: "8px 0",
                    transition: "color 0.2s ease",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <span>{section.title}</span>
                  {activeDropdown === section.title ? (
                    <ChevronUp style={{ width: "14px", height: "14px", color: "#FFFFFF" }} />
                  ) : (
                    <ChevronDown style={{ width: "14px", height: "14px", color: "#FFFFFF" }} />
                  )}
                </button>

                {/* Dropdown */}
                {activeDropdown === section.title && (
                  <div
                    ref={dropdownRef}
                    className="animate-slideDown"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: "8px",
                      background: "#FFFFFF",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      minWidth: "300px",
                      maxWidth: "600px",
                      zIndex: 50,
                    }}
                  >
                    <div
                      style={{
                        padding: "16px",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      {section.items.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (item.onClick) {
                              item.onClick();
                            } else {
                              navigate(item.path);
                            }
                            setActiveDropdown(null);
                          }}
                          onMouseEnter={() => setHoveredItem(`${section.title}-${item.label}`)}
                          onMouseLeave={() => setHoveredItem(null)}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            padding: "12px",
                            borderRadius: "8px",
                            background: hoveredItem === `${section.title}-${item.label}` ? "#E0F2F1" : "transparent",
                            transition: "background 0.2s ease",
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <item.icon
                            style={{
                              width: "20px",
                              height: "20px",
                              flexShrink: 0,
                              color: "#26A69A",
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: item.label === "Logout" ? (hoveredItem === `${section.title}-${item.label}` ? "#DC2626" : "#000000") : (hoveredItem === `${section.title}-${item.label}` ? "#26A69A" : "#000000"),
                                fontFamily: "'Euclid Circular A', 'Inter', 'Helvetica Neue', Arial, sans-serif",
                                transition: "color 0.2s ease",
                              }}
                            >
                              {item.label}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#000000",
                                marginTop: "4px",
                                fontFamily: "'Euclid Circular A', 'Inter', 'Helvetica Neue', Arial, sans-serif",
                              }}
                            >
                              {item.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

interface MenuProps {
  onLogout: () => void;
}

const Menu: React.FC<MenuProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAuthenticated = !!user._id;

  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(false);
  const menuContentRef = useRef<HTMLDivElement>(null);

  // Define handleLogout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload(); // Force reload to update state
  };

  const menuItems = [
    {
      title: "Navigation",
      items: [
        { icon: Home, label: "Home", path: "/" },
        { icon: Briefcase, label: "Find Jobs", path: "/jobs" },
      ],
    },
    ...(isAuthenticated
      ? [
          {
            title: "Job Management",
            items: [
              { icon: PlusCircle, label: "Post a Job", path: "/jobs/create" },
              { icon: FileText, label: "My Posted Jobs", path: "/jobs/my-posted" },
              { icon: Briefcase, label: "Applied Jobs", path: "/applied-jobs" },
            ],
          },
          {
            title: "Tools & Resources",
            items: [
              { icon: FileText, label: "CV Maker", path: "/cv-maker" },
              { icon: MessageSquare, label: "Messages", path: "/conversations" },
              { icon: CreditCard, label: "Wallet", path: "/wallet" },
              { icon: Bell, label: "Notifications", path: "/notifications" },
            ],
          },
          {
            title: "Account",
            items: [
              { icon: User, label: "Profile", path: "/profile/my-profile" },
              { icon: Settings, label: "Settings", path: "/settings" },
              { icon: HelpCircle, label: "Help", path: "/help" },
              { icon: LogOut, label: "Logout", path: "#", onClick: handleLogout },
            ],
          },
        ]
      : [
          {
            title: "Account",
            items: [
              { icon: User, label: "Login", path: "/login" },
              { icon: FileText, label: "CV Maker", path: "/cv-maker" },
              { icon: HelpCircle, label: "Help", path: "/help" },
            ],
          },
        ]),
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopView(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen && !isDesktopView && menuContentRef.current) {
      const contentHeight = menuContentRef.current.offsetHeight;
      const menuElement = document.getElementById("menu");
      if (menuElement) {
        menuElement.style.clipPath = `polygon(0 0, 100% 0, 100% ${contentHeight}px, ${contentHeight * 0.707}px ${contentHeight}px, 0 ${contentHeight}px)`;
      }
    }
  }, [isOpen, isDesktopView]);

  return (
    <div style={{ position: "relative", zIndex: 50 }}>
      {!isDesktopView && (
        <button
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "24px",
            height: "24px",
            cursor: "pointer",
            position: "relative",
            zIndex: 50,
            background: "none",
            border: "none",
          }}
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span style={{ display: "block", height: "2px", width: "100%", background: "#FFFFFF" }}></span>
          <span style={{ display: "block", height: "2px", width: "100%", background: "#FFFFFF" }}></span>
          <span style={{ display: "block", height: "2px", width: "100%", background: "#FFFFFF" }}></span>
        </button>
      )}

      {isDesktopView && <DesktopNav onLogout={handleLogout} />}

      {!isDesktopView && (
        <div
          id="menu"
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "50%",
            height: "100%",
            background: "#FFFFFF",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            transform: isOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease-in-out",
            zIndex: 50,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px",
              borderBottom: "1px solid #E5E7EB",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#1F2937",
              }}
            >
              Menu
            </h2>
            <button
              onClick={toggleMenu}
              style={{
                padding: "8px",
                borderRadius: "50%",
                transition: "background 0.2s ease",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              aria-label="Close menu"
            >
              <X style={{ width: "24px", height: "24px", color: "#4B5563" }} />
            </button>
          </div>

          <div
            ref={menuContentRef}
            style={{
              overflowY: "auto",
              height: "calc(100% - 82px)",
              paddingBottom: "16px",
            }}
          >
            {menuItems.map((section, idx) => (
              <div key={idx} style={{ padding: "24px 0" }}>
                <h3
                  style={{
                    padding: "0 24px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "12px",
                  }}
                >
                  {section.title}
                </h3>
                {section.items.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      } else {
                        navigate(item.path);
                      }
                      toggleMenu();
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 24px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "background 0.2s ease",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: item.label === "Logout" ? "#DC2626" : "#374151",
                    }}
                  >
                    <item.icon style={{ width: "20px", height: "20px" }} />
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {isOpen && !isDesktopView && (
        <div
          onClick={toggleMenu}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(4px)",
            zIndex: 40,
          }}
        />
      )}
    </div>
  );
};

export default Menu;