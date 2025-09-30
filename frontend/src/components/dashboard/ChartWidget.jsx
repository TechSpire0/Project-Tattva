// src/components/dashboard/DataCharts.jsx

import React, { useMemo } from "react";
import Plot from "react-plotly.js"; // The Plotly component
import useApi from "../../hooks/useApi";
import apiClient from "../../services/apiClient";

// Define the API call to fetch the sightings data.
const getSightingsData = () => apiClient.get("/sightings");

function ChartWidget() {
  const { data: sightings, loading, error } = useApi(getSightingsData);

  console.log("[DataCharts] Raw data from useApi:", {
    sightings,
    loading,
    error,
  });

  const chartData = useMemo(() => {
    if (!Array.isArray(sightings) || sightings.length === 0) {
      return null;
    }

    // Aggregate the data by species (your backend model → scientific_name is safest)
    const speciesData = sightings.reduce((acc, sighting) => {
      const speciesName =
        sighting.species.common_name || sighting.species.scientific_name;
      const temp = sighting.sea_surface_temp_c;

      if (!acc[speciesName]) {
        acc[speciesName] = { temps: [], count: 0 };
      }

      acc[speciesName].temps.push(temp);
      acc[speciesName].count++;

      return acc;
    }, {});

    console.log("[DataCharts] Aggregated species data:", speciesData);

    const labels = Object.keys(speciesData);
    const values = labels.map((label) => {
      const { temps, count } = speciesData[label];
      const sum = temps.reduce((a, b) => a + b, 0);
      return sum / count;
    });

    console.log("[DataCharts] Final data for Plotly:", { labels, values });

    return {
      x: labels,
      y: values,
      type: "bar",
      marker: { color: "rgb(147, 51, 234)" }, // purple theme
    };
  }, [sightings]);

  if (loading) {
    return (
      <div className="bg-gray-800/60 backdrop-blur-sm p-6 h-96 rounded-xl shadow-2xl border border-gray-700/50 flex justify-center items-center text-purple-300">
        Loading chart data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 p-6 h-96 rounded-xl shadow-2xl border border-red-500/50 flex justify-center items-center text-red-300">
        Error loading chart data.
      </div>
    );
  }

  return (
    <div
      id="avg-temp-trend"
      className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-gray-700/50"
    >
      <h1 className="text-xl font-bold mb-4 text-white">
        Average Sea Surface Temperature by Species
      </h1>
      {chartData ? (
        <Plot
          data={[chartData]}
          layout={{
            title: "Average Sea Surface Temperature by Species",
            titlefont: { color: "#E4E4E7" },
            yaxis: {
              title: "Temperature (°C)",
              gridcolor: "#4B5563",
              linecolor: "#4B5563",
              tickfont: { color: "#A1A1AA" },
              zerolinecolor: "#4B5563",
              titlefont: { color: "#E4E4E7" },
            },
            xaxis: {
              gridcolor: "#4B5563",
              linecolor: "#4B5563",
              tickfont: { color: "#A1A1AA" },
              titlefont: { color: "#E4E4E7" },
            },
            font: { family: "Inter, sans-serif", color: "#E4E4E7" },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            margin: { t: 50, r: 10, b: 80, l: 60 },
          }}
          config={{ responsive: true, displayModeBar: false }}
          className="w-full h-full"
          style={{ minHeight: "384px" }}
        />
      ) : (
        <div className="h-96 flex justify-center items-center text-gray-500">
          No data available to display chart.
        </div>
      )}
    </div>
  );
}

export default ChartWidget;
