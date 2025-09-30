// src/components/layouts/Header.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import Teamlogo from "../../assets/TechSpire.png";
import Logo from "../../assets/Tattva.png";

function Header() {
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Data Upload", path: "/data-upload" },
    { name: "AI Modules", path: "/otolith-classifier" },
    { name: "Chat", path: "/chat" },
    { name: "About", path: "/about" },
  ];

  const linkStyle =
    "px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200";

  return (
    <header
      className="
        fixed top-0 left-0 w-full h-20
        bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50
        flex items-center justify-between
        px-6 lg:px-12 z-50
      "
    >
      {/* Left logo + title */}
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden">
          <img
            src={Logo}
            alt="App Logo"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col leading-tight">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            TATTVA
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            AI-Driven Marine Data Platform
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center space-x-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${linkStyle} ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "text-gray-300 hover:bg-purple-900/30 hover:text-purple-300"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Right-side team logo */}
      <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-600">
        <img
          src={Teamlogo}
          alt="Team Logo"
          className="h-full w-full object-cover"
        />
      </div>
    </header>
  );
}

export default Header;
