import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

// Icon path correction for Vite/Webpack build issues
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// --- THE FIX IS HERE: Restoring the detailed satellite layer with labels ---
const tileLayers = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    imagery: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri'
    },
    labels: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      attribution: '' // Attribution is handled by the main imagery layer
    }
  },
  // dark: {
  //   url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  // }
};
// --- END OF FIX ---

// This component receives its data via props and has no internal data fetching logic.
function MapWidget({ sightings, loading, error }) {
  const [activeLayer, setActiveLayer] = useState('standard');
  const initialPosition = [20.5937, 78.9629];

  if (loading) {
    return <div className="h-full min-h-[500px] flex justify-center items-center bg-gray-100 rounded-lg shadow-md"><p>Loading Map...</p></div>;
  }

  if (error) {
    return <div className="h-full min-h-[500px] flex justify-center items-center bg-red-50 text-red-700 rounded-lg shadow-md"><p>{error}</p></div>;
  }

  const validSightings = Array.isArray(sightings) ? sightings : [];

  return (
    <div className="relative h-[500px] w-full rounded-lg shadow-md overflow-hidden">
      <div className="absolute top-2 right-2 z-[1000] bg-white bg-opacity-80 p-1 rounded-lg shadow-md flex space-x-1">
        <button onClick={() => setActiveLayer('standard')} className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${activeLayer === 'standard' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>Standard</button>
        <button onClick={() => setActiveLayer('satellite')} className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${activeLayer === 'satellite' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>Satellite</button>
        {/* <button onClick={() => setActiveLayer('dark')} className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${activeLayer === 'dark' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>Dark</button> */}
      </div>

      <MapContainer center={initialPosition} zoom={5} style={{ height: '100%', width: '100%' }}>
        
        {/* --- THE FIX IS HERE: Logic to render single or multiple layers --- */}
        {activeLayer === 'satellite' ? (
            <>
                <TileLayer
                    key="satellite-imagery"
                    url={tileLayers.satellite.imagery.url}
                    attribution={tileLayers.satellite.imagery.attribution}
                />
                <TileLayer
                    key="satellite-labels"
                    url={tileLayers.satellite.labels.url}
                    attribution={tileLayers.satellite.labels.attribution}
                    pane="overlayPane" // Ensures labels render on top of imagery
                />
            </>
        ) : (
            <TileLayer
                key={activeLayer}
                url={tileLayers[activeLayer].url}
                attribution={tileLayers[activeLayer].attribution}
            />
        )}
        {/* --- END OF FIX --- */}
        
        {validSightings.map(sighting => {
            const isHighTemp = sighting.sea_surface_temp_c > 29;
            const dotColor = isHighTemp ? '#EF4444' : '#22C55E';

            return (
                <CircleMarker
                    key={sighting.sighting_id}
                    center={[sighting.latitude, sighting.longitude]}
                    radius={7}
                    pathOptions={{ color: dotColor, fillColor: dotColor, fillOpacity: 0.8, weight: 1 }}
                >
                    <Popup>
                        <div className="font-sans w-48">
                            <h4 className="font-bold text-base mb-1">{sighting.species.common_name}</h4>
                            <p className="text-sm text-gray-600 italic mb-2">{sighting.species.scientific_name}</p>
                            <ul className="text-xs space-y-1">
                                <li className={isHighTemp ? 'font-bold text-red-600' : ''}>Temp: {sighting.sea_surface_temp_c}°C</li>
                            </ul>
                        </div>
                    </Popup>
                </CircleMarker>
            );
        })}
      </MapContainer>
    </div>
  );
}

export default MapWidget;

