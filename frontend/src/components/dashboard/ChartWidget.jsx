// src/components/dashboard/DataCharts.jsx

import React, { useMemo } from 'react';
import Plot from 'react-plotly.js'; // The Plotly component
import useApi from '../../hooks/useApi';
import apiClient from '../../services/apiClient';

// Define the API call to fetch the sightings data.
const getSightingsData = () => apiClient.get('/sightings');

function ChartWidget() {
    const { data: sightings, loading, error } = useApi(getSightingsData);

    // --- LOGS (UNCHANGED) ---
    console.log('[DataCharts] Raw data from useApi:', { sightings, loading, error });

    // --- Data Transformation ---
    const chartData = useMemo(() => {
        if (!Array.isArray(sightings) || sightings.length === 0) {
            return null;
        }

        // Step 1: Aggregate the data. (Logic Unchanged)
        const speciesData = sightings.reduce((acc, sighting) => {
            const speciesName = sighting.species.common_name;
            const temp = sighting.sea_surface_temp_c;

            if (!acc[speciesName]) {
                acc[speciesName] = { temps: [], count: 0 };
            }

            acc[speciesName].temps.push(temp);
            acc[speciesName].count++;

            return acc;
        }, {});

        console.log('[DataCharts] Aggregated species data:', speciesData);

        // Step 2: Transform the aggregated data into the format Plotly needs. (Logic Unchanged)
        const labels = Object.keys(speciesData);
        const values = labels.map(label => {
            const { temps, count } = speciesData[label];
            const sum = temps.reduce((a, b) => a + b, 0);
            return sum / count; // Calculate the average
        });

        console.log('[DataCharts] Final data for Plotly:', { labels, values });

        return {
            x: labels,
            y: values,
            type: 'bar',
            // Change bar color to match the new purple/pink theme (using a specific purple shade)
            marker: { color: 'rgb(147, 51, 234)' }, // Tailwind purple-600/700 equivalent
        };
    }, [sightings]);


    if (loading) {
        // APPLY NEW STYLING
        return <div className="bg-gray-800/60 backdrop-blur-sm p-6 h-96 rounded-xl shadow-2xl border border-gray-700/50 flex justify-center items-center text-purple-300">Loading chart data...</div>;
    }

    if (error) {
        // APPLY NEW STYLING
        return <div className="bg-red-900/50 p-6 h-96 rounded-xl shadow-2xl border border-red-500/50 flex justify-center items-center text-red-300">Error loading chart data.</div>;
    }

    return (
        // The target scroll ID is placed here
        <div
            id="avg-temp-trend"
            className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-gray-700/50"
        >
            <h1 className="text-xl font-bold mb-4 text-white">Average Temperature Trend</h1>
            {chartData ? (
                <Plot
                    data={[chartData]}
                    layout={{
                        // --- APPLY PLOTLY DARK THEME STYLES ---
                        title: 'Average Sea Surface Temperature by Species',
                        titlefont: { color: '#E4E4E7' }, // White/Light Gray for title
                        yaxis: {
                            title: 'Temperature (°C)',
                            gridcolor: '#4B5563', // Dark grid lines (gray-600)
                            linecolor: '#4B5563',
                            tickfont: { color: '#A1A1AA' }, // Tick labels color (gray-400)
                            zerolinecolor: '#4B5563',
                            titlefont: { color: '#E4E4E7' }
                        },
                        xaxis: {
                            gridcolor: '#4B5563',
                            linecolor: '#4B5563',
                            tickfont: { color: '#A1A1AA' },
                            titlefont: { color: '#E4E4E7' }
                        },
                        font: { family: 'Inter, sans-serif', color: '#E4E4E7' }, // Global text color
                        paper_bgcolor: 'rgba(0,0,0,0)', // Transparent background
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        margin: { t: 50, r: 10, b: 80, l: 60 },
                    }}
                    config={{ responsive: true, displayModeBar: false }}
                    className="w-full h-full"
                    style={{ minHeight: '384px' }} // Increased height slightly (h-96)
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
