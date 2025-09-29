// src/components/dashboard/DataCharts.jsx

import React, { useMemo } from "react";
import Plot from "react-plotly.js"; // The Plotly component
import useApi from "../../hooks/useApi";
import apiClient from "../../services/apiClient";

// Define the API call to fetch the sightings data.
const getSightingsData = () => apiClient.get("/sightings");

function ChartWidget() {
  const { data: sightings, loading, error } = useApi(getSightingsData);

  // --- LOG #1: Check the raw data coming from the API hook ---
  console.log("[DataCharts] Raw data from useApi:", {
    sightings,
    loading,
    error,
  });

  // --- THE FIX IS HERE: Data Transformation ---
  // We use `useMemo` to ensure this complex calculation only runs when `sightings` data changes.
  const chartData = useMemo(() => {
    if (!Array.isArray(sightings) || sightings.length === 0) {
      return null;
    }

    // Step 1: Aggregate the data.
    // We group all temperature readings by species name.
    const speciesData = sightings.reduce((acc, sighting) => {
      const speciesName = sighting.species.scientific_name;
      const temp = sighting.sea_surface_temp_c;

      if (!acc[speciesName]) {
        acc[speciesName] = { temps: [], count: 0 };
      }

      acc[speciesName].temps.push(temp);
      acc[speciesName].count++;

      return acc;
    }, {});

    // --- LOG #2: Check the aggregated data structure ---
    console.log("[DataCharts] Aggregated species data:", speciesData);

    // Step 2: Transform the aggregated data into the format Plotly needs.
    // We need an array for x-axis labels (species names) and an array for y-axis values (average temps).
    const labels = Object.keys(speciesData);
    const values = labels.map((label) => {
      const { temps, count } = speciesData[label];
      const sum = temps.reduce((a, b) => a + b, 0);
      return sum / count; // Calculate the average
    });

    // --- LOG #3: Check the final arrays being sent to Plotly ---
    console.log("[DataCharts] Final data for Plotly:", { labels, values });

    return {
      x: labels,
      y: values,
      type: "bar",
      marker: { color: "#4F46E5" }, // A nice indigo color for the bars
    };
  }, [sightings]); // This dependency array ensures the calculation re-runs if `sightings` changes.

  if (loading) {
    return (
      <div className="bg-white p-4 h-80 rounded-lg shadow-md flex justify-center items-center text-gray-500">
        Loading chart data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 h-80 rounded-lg shadow-md flex justify-center items-center text-red-700">
        Error loading chart data.
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h1 className="text-lg font-semibold mb-4 text-gray-800">
        Average Sea Surface Temperature by Species
      </h1>
      {chartData ? (
        <Plot
          data={[chartData]}
          layout={{
            title: "Average Sea Surface Temperature by Species",
            yaxis: { title: "Temperature (°C)" },
            font: { family: "Inter, sans-serif" },
            paper_bgcolor: "rgba(0,0,0,0)", // Transparent background
            plot_bgcolor: "rgba(0,0,0,0)",
          }}
          config={{ responsive: true, displayModeBar: false }}
          className="w-full h-full"
          style={{ minHeight: "320px" }}
        />
      ) : (
        <div className="h-80 flex justify-center items-center text-gray-500">
          No data available to display chart.
        </div>
      )}
    </div>
  );
}

export default ChartWidget;
