// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import apiClient from "../services/apiClient";

// Dashboard components
import MapWidget from "../components/dashboard/MapWidget";
import InsightsPanel from "../components/dashboard/InsightsPanel";
// import FilterPanel from "../components/dashboard/FilterPanel"; // optional, enable later
import ChartWidget from "../components/dashboard/ChartWidget";

function DashboardPage() {
  const location = useLocation();

  // --- data & UI state ---
  const [allSightings, setAllSightings] = useState([]);
  const [filteredSightings, setFilteredSightings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sightings from backend (preserve your working API)
  const fetchAllSightings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/sightings", {
        params: { limit: 1000 }, // keep a reasonable default; tune as needed
      });
      setAllSightings(response.data || []);
      setFilteredSightings(response.data || []);
      console.log(
        "[DashboardPage] fetched sightings:",
        (response.data || []).length
      );
    } catch (err) {
      console.error("[DashboardPage] fetchAllSightings error:", err);
      setError("Failed to load initial map data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSightings();
  }, []);

  // Receive filtered data from child filter panel (if/when enabled)
  const handleFilterChange = (newlyFilteredSightings) => {
    console.log(
      "[DashboardPage] received filtered data:",
      newlyFilteredSightings?.length ?? 0
    );
    setFilteredSightings(
      Array.isArray(newlyFilteredSightings) ? newlyFilteredSightings : []
    );
  };

  /**
   * Robust scroll-to-hash behavior:
   * If someone navigates with #avg-temp-trend (or clicks a link),
   * try to scroll. If element not ready (due to async load), retry a few times.
   */
  useEffect(() => {
    const hash = location.hash; // e.g. "#avg-temp-trend"
    if (!hash) return;

    const elementId = hash.replace(/^#/, "");
    let attempts = 0;
    const maxAttempts = 15;
    const attemptScroll = () => {
      attempts += 1;
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (attempts < maxAttempts) {
        // try again shortly (gives time for chart/map to render)
        setTimeout(attemptScroll, 150);
      } else {
        console.warn(
          `[DashboardPage] could not find element to scroll: ${elementId}`
        );
      }
    };

    // small initial delay to let layout settle
    const timer = setTimeout(attemptScroll, 200);
    return () => clearTimeout(timer);
  }, [location.hash, isLoading]); // re-run if hash changes or loading completes

  return (
    <div className="space-y-8 p-4 lg:p-8 bg-gray-900 min-h-screen">
      {/* Page Header - unified with other pages */}
      <div className="relative overflow-hidden rounded-xl">
        {/* Gradient animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-xl"></div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-purple-300/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>

        {/* Title + subtitle */}
        <div className="relative p-6 text-center space-y-4">
          <h1 className="text-4xl lg:text-4xl font-extrabold bg-clip-text text-transparent pb-2 bg-gradient-to-r from-purple-400 to-pink-500">
            TATTVA Species Explorer
          </h1>
          <p className="mt-2 text-lg text-purple-300 max-w-3xl mx-auto">
            Welcome back, Researcher. Explore the marine biodiversity data.
          </p>
        </div>
      </div>

      {/* Optional FilterPanel (toggle in/out as needed) */}
      {/*
      <div className="relative z-[9999]">
        <FilterPanel
          masterData={allSightings}
          onFilterChange={handleFilterChange}
          isFiltering={isLoading}
        />
      </div>
      */}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-0">
        <div className="lg:col-span-2 space-y-6">
          <MapWidget
            sightings={filteredSightings}
            loading={isLoading}
            error={error}
          />

          {/* ChartWidget must include id="avg-temp-trend" inside it (ChartWidget from design already sets that id) */}
          <ChartWidget sightings={filteredSightings} />
        </div>

        <div className="lg:col-span-1">
          <InsightsPanel />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
