import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './components/layouts/Header';
import ConversationalAIPage from './pages/ConversationalAIPage';
import Sidebar from './components/layouts/Sidebar';
import DashboardPage from './pages/DashboardPage';
import OtolithClassifierPage from './pages/OtolithClassifierPage';
import DataUploadPage from './pages/DataUploadPage';

const ComingSoon = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold">Coming Soon!</h2>
  </div>
);

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavLinkClick = () => {
    if (!isSidebarPinned) {
      setSidebarOpen(false);
    }
  };

  const handlePinToggle = () => {
    const newPinnedState = !isSidebarPinned;
    setIsSidebarPinned(newPinnedState);
    if (newPinnedState) setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    if (!isSidebarPinned) setSidebarOpen(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        onNavLinkClick={handleNavLinkClick}
        isSidebarPinned={isSidebarPinned}
        onPinToggle={handlePinToggle}
        onClose={handleCloseSidebar}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Header */}
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Main Content */}
      <div
        className={`relative transition-all duration-300 pt-16 ${
          sidebarOpen ? 'lg:ml-64' : 'ml-0'
        }`}
      >
        <main className="p-4 lg:p-8 z-0 relative">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/otolith-classifier" element={<OtolithClassifierPage />} />
            {/* <Route path="/edna-browser" element={<ComingSoon />} /> */}
            <Route path="/data-upload" element={<DataUploadPage />} />
            <Route path="/chat" element={<ConversationalAIPage />} />
            <Route path="/workspace" element={<ComingSoon />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
