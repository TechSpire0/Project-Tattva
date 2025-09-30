import React from 'react'; // useState and related functions removed
import { Routes, Route } from 'react-router-dom';
import { About } from './components/layouts/About';
import Header from './components/layouts/Header';
import ConversationalAIPage from './pages/ConversationalAIPage';
import Sidebar from './components/layouts/Sidebar';
import DashboardPage from './pages/DashboardPage';
import OtolithClassifierPage from './pages/OtolithClassifierPage';
import DataUploadPage from './pages/DataUploadPage';
import { Homepage } from './components/layouts/Home';

// Component with new dark theme styles
const ComingSoon = () => (
    <div className="p-8 bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-white">Coming Soon!</h2>
    </div>
);

function App() {
    // --- State Management REMOVED ---
    // All state and handlers are removed as per the static design request.
    // --- END State Management ---

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/80 to-gray-800 dark text-white">

            {/* Sidebar (Fixed) - No props needed */}
            <Sidebar />

            {/* Header (Fixed) - No props needed */}
            <Header />

            {/* Main Content Wrapper (Fixed offset) */}
            <div
                className={`relative transition-all duration-300 pt-16 lg:ml-64`} // Always offset by 64px on large screens
            >
                <main className="p-4 lg:p-6 z-0 relative">
                    <Routes>
                        <Route path="/" element={< Homepage />} />
                        {/* <Route path="/about" element={<About />} /> */}
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/otolith-classifier" element={<OtolithClassifierPage />} />
                        <Route path="/data-upload" element={<DataUploadPage />} />
                        <Route path="/chat" element={<ConversationalAIPage />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

export default App;
