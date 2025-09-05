// src/components/dashboard/InsightsPanel.jsx

import React from "react";
import useApi from "../../hooks/useApi";
import apiClient from "../../services/apiClient";

// A simple lightbulb icon for the header
const LightbulbIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
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

// Define the API call to fetch the hypotheses.
const getHypothesis = () => apiClient.get("/hypotheses");

function InsightsPanel() {
  // We rename 'data' to 'hypothesisData' for clarity.
  const { data: hypothesisData, loading, error } = useApi(getHypothesis);

  // --- LOG #1: Check the raw output from the useApi hook ---
  console.log("[InsightsPanel] Data from useApi hook:", {
    hypothesisData,
    loading,
    error,
  });

  // Render a loading state while the data is being fetched.
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mt-4"></div>
        </div>
      </div>
    );
  }

  // Render an error message if the API call fails.
  if (error) {
    console.error("[InsightsPanel] API Error:", error);
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md">
        Error loading insights. Please check the console.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <div className="flex items-center mb-4 text-gray-800">
        <LightbulbIcon />
        <h3 className="text-lg font-semibold ml-2">AI-Generated Insight</h3>
      </div>

      {/* --- THE FIX IS HERE --- */}
      {/* We now check if the single 'hypothesisData' object exists, instead of mapping an array. */}
      {hypothesisData ? (
        <div className="animate-fade-in">
          <p className="text-lg text-gray-700 italic">
            "{hypothesisData.hypothesis}"
          </p>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Source Data Finding
            </h5>
            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <p>
                A correlation of{" "}
                <strong>
                  {hypothesisData.source_finding.correlation.toFixed(2)}
                </strong>{" "}
                was found between
                <span className="font-semibold text-indigo-600">
                  {" "}
                  {hypothesisData.source_finding.variable}
                </span>{" "}
                and the population of
                <span className="font-semibold text-indigo-600">
                  {" "}
                  {hypothesisData.source_finding.species_name}
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      ) : (
        // This will be shown if the API returns no data.
        <div className="text-center text-gray-500 py-8">
          <p>No new insights available at this time.</p>
        </div>
      )}
    </div>
  );
}

export default InsightsPanel;
