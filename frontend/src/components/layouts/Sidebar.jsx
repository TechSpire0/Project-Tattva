import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// import { MessageCircle, Users } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const sidebarItems = [
    { name: 'Conversational AI', path: '/chat',  }, 
    { name: 'Collaborative Workspace', path: '/workspace', }, 
  ];

  return (
    // Fixed position and permanent visibility for desktop screens
    <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-900/95 backdrop-blur-md border-r border-gray-800 p-6 z-40 hidden lg:block">
      
      {/* Navigation Items */}
      <div className="mt-20 space-y-2">
        {sidebarItems.map((item) => {
        //   const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600/70 to-pink-600/70 text-white shadow-xl border border-purple-500/50 transform translate-x-1'
                  : 'text-gray-400 hover:bg-purple-900/50 hover:text-purple-300'
              }`}
            >
              {/* {Icon && <Icon className="h-5 w-5" />} */}
              <span className="text-base font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
