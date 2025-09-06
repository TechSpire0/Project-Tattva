import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";

function Sidebar({ sidebarOpen, onNavLinkClick, onToggleSidebar }) {
  const linkStyle =
    "flex items-center p-2 rounded-md text-gray-300 transition-colors duration-200";

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen w-64 bg-slate-900 p-4 z-50
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Top Section with Hamburger + Logo */}
      <div className="flex items-center justify-between mb-6">
        {/* Logo */}
        <div className="w-28 h-12 flex items-center">
          <img src={logo} alt="Logo" className="object-contain" />
        </div>

        {/* Close / Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md text-gray-400 hover:bg-slate-800 hover:text-white transition-colors"
          title="Close sidebar"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Title */}
      <div className="text-center my-4">
        <h2 className="text-lg font-bold text-white">TATTVA PLATFORM</h2>
        <p className="text-xs text-gray-400">SIH 2025 - ID25041</p>
      </div>

      {/* Sidebar Links */}
      <nav>
        <ul>
          {[
            { to: "/chat", label: "Chat" },
            { to: "/workspace", label: "Workspace" },
          ].map((item) => (
            <li className="mb-2" key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `${linkStyle} ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "hover:bg-slate-800 hover:text-white"
                  }`
                }
                onClick={onNavLinkClick}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
