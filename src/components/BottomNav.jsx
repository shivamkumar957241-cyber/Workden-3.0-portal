import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Briefcase, User, Wallet, Trophy } from "lucide-react";

export default function BottomNav({ currentPage, userRole, sidebarOpen, referralEnabled }) {
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Hide bottom nav temporarily when navigation occurs
    setIsVisible(false);
    
    // Show it again after a brief delay (modern app behavior)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const navItems = [
    { 
      icon: Home, 
      label: "Home", 
      page: "Dashboard",
      activeColor: "text-orange-500",
      inactiveColor: "text-gray-400"
    },
    { 
      icon: Briefcase, 
      label: "Tasks", 
      page: "Tasks",
      activeColor: "text-blue-500",
      inactiveColor: "text-gray-400"
    },
    { 
      icon: Wallet, 
      label: "Wallet", 
      page: "Wallet",
      activeColor: "text-green-500",
      inactiveColor: "text-gray-400"
    },
    { 
      icon: Trophy, 
      label: "Training", 
      page: "TrainingModule",
      activeColor: "text-amber-500",
      inactiveColor: "text-gray-400"
    },
    { 
      icon: User, 
      label: "Profile", 
      page: "Profile",
      activeColor: "text-purple-500",
      inactiveColor: "text-gray-400"
    }
  ];

  // Hide bottom nav when sidebar is open
  if (sidebarOpen) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 rounded-lg transition-colors min-w-0"
            >
              <Icon 
                className={`w-6 h-6 mb-1 transition-colors ${
                  isActive ? item.activeColor : item.inactiveColor
                }`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-xs font-medium transition-colors ${
                isActive ? item.activeColor : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
