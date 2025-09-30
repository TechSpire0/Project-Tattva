import React from "react";
import useApi from "../../hooks/useApi";
import apiClient from "../../services/apiClient";
import { useNavigate } from "react-router-dom";

const LightbulbIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-purple-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.03-7.03l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707.707M12 21v-1m0-16a4 4 0 00-4 4h8a4 4 0 00-4-4z"
    />
  </svg>
);

const getHypothesis = () => apiClient.get("/hypotheses");

function InsightsPanel() {
  const { data: hypothesisData, loading, error } = useApi(getHypothesis);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-gray-800/60 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-700/50 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
        <div className="space-y-1">
          <div className="h-3 bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          <div className="h-3 bg-gray-700 rounded w-3/4 mt-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("[InsightsPanel] API Error:", error);
    return (
      <div className="bg-red-900/50 text-red-300 p-2 rounded-xl border border-red-500/50 shadow-sm">
        Error loading insights. Please check the console.
      </div>
    );
  }

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-700/50 h-auto">
      {/* Header */}
      <div className="flex items-center mb-2 text-white">
        <LightbulbIcon />
        <h3 className="text-md font-bold ml-2">AI-Generated Insight</h3>
        <button
          className="ml-2 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md shadow-sm hover:from-purple-600 hover:to-pink-600 transition-all"
          onClick={() => navigate("/chat")}
        >
          Chatbot
        </button>
      </div>

      {/* Hypothesis text */}
      {hypothesisData ? (
        <div className="animate-fade-in">
          <p className="text-sm text-purple-300 italic leading-snug break-words">
            "{hypothesisData.hypothesis || "No hypothesis available."}"
          </p>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-2">
          <p>No new insights available at this time.</p>
        </div>
      )}
    </div>
  );
}

export default InsightsPanel;
