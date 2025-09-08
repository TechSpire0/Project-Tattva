import React, { useState, useEffect } from "react";
import apiClient from "../services/apiClient";

// Import all the dashboard components
import MapWidget from "../components/dashboard/MapWidget";
import InsightsPanel from "../components/dashboard/InsightsPanel";
import ChatWidget from "../components/dashboard/ChartWidget";
import FilterPanel from "../components/dashboard/FilterPanel";
import ChartWidget from "../components/dashboard/ChartWidget";

function DashboardPage() {
  // --- This page now manages all the data for its children ---
  const [allSightings, setAllSightings] = useState([]); // Holds the original, full dataset
  const [filteredSightings, setFilteredSightings] = useState([]); // Holds the data to be displayed
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // This function fetches all sightings when the page first loads.
  const fetchAllSightings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/sightings");
      setAllSightings(response.data);
      setFilteredSightings(response.data); // Initially, show all data
    } catch (err) {
      setError("Failed to load initial map data.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run the initial fetch on component mount.
  useEffect(() => {
    fetchAllSightings();
  }, []);

  // --- This is the key function that connects the components ---
  // It receives the filtered data from FilterPanel and updates the state.
  // This automatically re-renders the MapWidget with the new data.
  const handleFilterChange = (newlyFilteredSightings) => {
    console.log(
      "DashboardPage received filtered data:",
      newlyFilteredSightings
    );
    setFilteredSightings(newlyFilteredSightings);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          CMLRE Species Explorer
        </h1>
        <p className="mt-1 text-gray-600">
          Welcome back, Jayanth. Use the filters below to explore the marine
          biodiversity data.
        </p>
      </div>

      {/* The Filter Panel is positioned here, above the map. */}
      {/* It will call handleFilterChange when the user clicks "Go". */}
      {/* We pass it the original full dataset to perform its filtering on. */}
      <FilterPanel
        masterData={allSightings}
        onFilterChange={handleFilterChange}
        isFiltering={isLoading}
      />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* The MapWidget now receives the filtered sightings as a prop */}
          <MapWidget
            sightings={filteredSightings}
            loading={isLoading}
            error={error}
          />
          {/* The DataCharts can also use the filtered sightings */}
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
