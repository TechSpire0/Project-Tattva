//src/components/layouts/Header.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import Teamlogo from "../../assets/TechSpire.png";

function Header({ sidebarOpen, onToggleSidebar }) {
  const linkStyle =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";

  return (
    <header
      className={`
        fixed top-0 h-16
        bg-white p-4 border-b border-gray-200 
        flex justify-between items-center z-40
        transition-all duration-300
        ${sidebarOpen ? "lg:left-64 left-0 right-0" : "left-0 right-0"}
      `}
    >
      <div className="flex items-center">
        {/* Hamburger Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
          title="Toggle sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        <h1 className="text-xl font-semibold text-gray-800 ml-4">
          Species Explorer
        </h1>

        {/* Top Nav */}
        <nav className="hidden md:flex ml-8 space-x-4">
          {[
            { to: "/", label: "Dashboard" },
            // { to: "/edna-browser", label: "eDNA Browser" },
            { to: "/otolith-classifier", label: "Otolith Classifier" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${linkStyle} ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-gray-600 hidden md:block">TechSpire</span>
        <div className="w-10 h-10 flex-shrink-0">
          <img src={Teamlogo} alt="Team Logo" />
        </div>
      </div>
    </header>
  );
}

export default Header;
