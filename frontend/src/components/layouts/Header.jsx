import React from 'react';
import { NavLink } from 'react-router-dom';
import Teamlogo from "../../assets/Teamlog.png";
import Logo from "../../assets/logo.png";

function Header() {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' }, 
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Data Upload', path: '/data-upload' },
    { name: 'AI Modules', path: '/otolith-classifier' }, 
  ];

  const linkStyle =
    "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200";

  return (
    // Added extra padding on large screens to account for sidebar
    <header
      className="
        fixed top-0 h-16 w-full
        bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 
        flex justify-between items-center z-50
        px-6 lg:pl-68
      "
    >
      {/* Logo/Title (Left Side) */}
      <div className="flex items-center">
        <div className="w-8 h-8 flex-shrink-0">
          <img src={Logo} alt="Team Logo" className="rounded-full" />
        </div>
        
        <h1 className="text-lg font-bold ml-2">
          <span className="text-white">Project TATTVA</span>
        </h1>
        <p className="text-xs text-gray-400 ml-2 mt-1 hidden sm:block">
          AI-Driven Marine Data Platform
        </p>
      </div>

      {/* Navigation Links (Center) */}
      <nav className="hidden md:flex space-x-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${linkStyle} ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-purple-900/30 hover:text-purple-300'
              }`
            }
          >
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* Right side - placeholder for user/settings */}
      <div className="w-8 h-8 rounded-full bg-gray-700">
                  <img src={Teamlogo} alt="Team Logo" className="rounded-full" />

      </div>
    </header>
  );
}

export default Header;
