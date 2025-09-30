import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/layouts/Header";
import ConversationalAIPage from "./pages/ConversationalAIPage";
import DashboardPage from "./pages/DashboardPage";
import OtolithClassifierPage from "./pages/OtolithClassifierPage";
import DataUploadPage from "./pages/DataUploadPage";
import { Homepage } from "./components/layouts/Home";
import { About } from "./components/layouts/About";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/80 to-gray-800 text-white">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="relative transition-all duration-300 pt-16">
        <main className="p-4 lg:p-6 relative z-0">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/otolith-classifier"
              element={<OtolithClassifierPage />}
            />
            <Route path="/data-upload" element={<DataUploadPage />} />
            <Route path="/chat" element={<ConversationalAIPage />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
