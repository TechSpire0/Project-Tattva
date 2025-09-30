import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// --- Tile Layer Definitions ---
const tileLayers = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    imagery: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri',
    },
    labels: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      attribution: '',
    },
  },
  // dark: {
  //   url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  //   attribution:
  //     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  // },
};

function MapWidget({ sightings, loading, error }) {
  const [activeLayer, setActiveLayer] = useState('standard');
  const initialPosition = [20.5937, 78.9629]; // India

  if (loading) {
    return (
      <div className="h-full min-h-[600px] flex justify-center items-center bg-gray-900/60 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 text-purple-300 animate-pulse">
        <p>Loading Interactive Map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full min-h-[600px] flex justify-center items-center bg-red-900/50 text-red-300 rounded-xl shadow-2xl border border-red-500/50">
        <p>{error}</p>
      </div>
    );
  }

  const validSightings = Array.isArray(sightings) ? sightings : [];

  // Layer names for buttons
  const layers = ['standard', 'satellite',];

  return (
    // FIX: Removed overflow-hidden; container styling is correct
    <div className="relative h-[600px] w-full rounded-xl shadow-2xl border border-purple-300/30 bg-gray-900">
      {/* Layer Control */}
      <div className="absolute top-4 right-4 z-[1000] bg-gray-800/70 backdrop-blur-sm p-2 rounded-xl shadow-xl flex space-x-2 border border-gray-700/50">
        {layers.map((layer) => (
          <button
            key={layer}
            onClick={() => setActiveLayer(layer)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeLayer === layer
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            {layer.charAt(0).toUpperCase() + layer.slice(1)}
          </button>
        ))}
      </div>

      {/* Map */}
      <MapContainer center={initialPosition} zoom={5} style={{ height: '100%', width: '100%' }}>
        {activeLayer === 'satellite' ? (
          <>
            <TileLayer
              url={tileLayers.satellite.imagery.url}
              attribution={tileLayers.satellite.imagery.attribution}
            />
            <TileLayer
              url={tileLayers.satellite.labels.url}
              attribution={tileLayers.satellite.labels.attribution}
              pane="overlayPane"
            />
          </>
        ) : (
          <TileLayer
            url={tileLayers[activeLayer].url}
            attribution={tileLayers[activeLayer].attribution}
          />
        )}

        {/* Circle Markers */}
        {validSightings.map((sighting) => {
          const isHighTemp = sighting.sea_surface_temp_c > 29;
          const dotColor = isHighTemp ? '#EC4899' : '#10B981';

          return (
            <CircleMarker
              key={sighting.sighting_id}
              center={[sighting.latitude, sighting.longitude]}
              radius={7}
              pathOptions={{ color: dotColor, fillColor: dotColor, fillOpacity: 0.8, weight: 1 }}
            >
              <Popup>
                <div className="font-sans w-48 bg-gray-900 text-white p-2 rounded-md shadow-lg border border-purple-500/50">
                  <h4 className="font-bold text-base mb-1">
                    {sighting.species?.common_name || 'Unknown Species'}
                  </h4>
                  <p className="text-sm text-gray-400 italic mb-2">
                    {sighting.species?.scientific_name || 'N/A'}
                  </p>
                  <ul className="text-xs space-y-1">
                    <li
                      className={
                        isHighTemp ? 'font-bold text-pink-400' : 'font-semibold text-emerald-400'
                      }
                    >
                      Temp: {sighting.sea_surface_temp_c}°C
                    </li>
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
