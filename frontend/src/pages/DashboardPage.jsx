import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // IMPORT NEW: useLocation
import apiClient from '../services/apiClient';

// Import all the dashboard components
import MapWidget from '../components/dashboard/MapWidget';
import InsightsPanel from '../components/dashboard/InsightsPanel';
import FilterPanel from '../components/dashboard/FilterPanel'
import ChartWidget from '../components/dashboard/ChartWidget';

function DashboardPage() {
    const location = useLocation(); // Hook to access current URL details
    // --- Component Logic (UNCHANGED) ---
    const [allSightings, setAllSightings] = useState([]);
    const [filteredSightings, setFilteredSightings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllSightings = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/sightings');
            setAllSightings(response.data);
            setFilteredSightings(response.data);
        } catch (err) {
            setError('Failed to load initial map data.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllSightings();
    }, []);

    const handleFilterChange = (newlyFilteredSightings) => {
        console.log("DashboardPage received filtered data:", newlyFilteredSightings);
        setFilteredSightings(newlyFilteredSightings);
    };
    // --- END Component Logic ---


    // CRUCIAL FIX: Scroll Logic now depends on location.hash to handle navigation correctly
    useEffect(() => {
        const hash = location.hash; // Use location.hash instead of window.location.hash

        if (hash === '#avg-temp-trend') {

            const attemptScroll = () => {
                const elementId = hash.substring(1); // Gets 'avg-temp-trend'
                const element = document.getElementById(elementId);

                if (element) {
                    console.log(`[DashboardPage] Scrolling to element: ${elementId}`);
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start', // Scroll to the top of the element
                    });
                } else {
                    // If element isn't there (e.g., still loading), try again after a pause
                    setTimeout(attemptScroll, 100);
                }
            };

            // Initial attempt after a brief pause
            const scrollTimer = setTimeout(attemptScroll, 200);

            return () => clearTimeout(scrollTimer);
        }
    }, [location.hash, isLoading]); // Dependency array includes hash and loading state

    return (
        <div className="space-y-8 p-4 lg:p-8 bg-gray-900 min-h-screen">
            <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                    TATTVA Species Explorer
                </h1>
                <p className="mt-2 text-lg text-purple-300">
                    Welcome back, SIH USER. Use the filters below to explore the marine biodiversity data.
                </p>
            </div>

            {/* FilterPanel wrapper
            <div className="relative z-[9999]">
                <FilterPanel
                    masterData={allSightings}
                    onFilterChange={handleFilterChange}
                    isFiltering={isLoading}
                />
            </div> */}

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-0">
                <div className="lg:col-span-2 space-y-6">
                    <MapWidget sightings={filteredSightings} loading={isLoading} error={error} />
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
