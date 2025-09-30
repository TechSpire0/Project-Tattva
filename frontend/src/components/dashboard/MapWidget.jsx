// src/components/dashboard/MapWidget.jsx

import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import apiClient from "../../services/apiClient";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const tileLayers = {
  standard: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    imagery: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles © Esri",
    },
    labels: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      attribution: "Labels © Esri",
    },
  },
};

// Fetch sightings dynamically on map movement
function FetchSightings({ setSightings }) {
  useMapEvents({
    moveend: async (map) => {
      const bounds = map.target.getBounds();
      const minLat = bounds.getSouth();
      const maxLat = bounds.getNorth();
      const minLon = bounds.getWest();
      const maxLon = bounds.getEast();

      try {
        const res = await apiClient.get("/sightings", {
          params: {
            min_lat: minLat,
            min_lon: minLon,
            max_lat: maxLat,
            max_lon: maxLon,
            limit: 2000,
          },
        });
        setSightings(res.data);
      } catch (err) {
        console.error("Failed to fetch sightings", err);
      }
    },
  });
  return null;
}

function MapWidget() {
  const [activeLayer, setActiveLayer] = useState("satellite");
  const [sightings, setSightings] = useState([]);
  const initialPosition = [20.5937, 78.9629]; // India center

  return (
    <div className="relative h-[600px] w-full rounded-xl shadow-2xl border border-purple-300/30 bg-gray-900 overflow-hidden">
      {/* Layer Toggle */}
      <div className="absolute top-4 right-4 z-[1000] bg-gray-800/70 backdrop-blur-sm p-2 rounded-xl shadow-xl flex space-x-2 border border-gray-700/50">
        {["satellite", "standard"].map((layer) => (
          <button
            key={layer}
            onClick={() => setActiveLayer(layer)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeLayer === layer
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
            }`}
          >
            {layer.charAt(0).toUpperCase() + layer.slice(1)}
          </button>
        ))}
      </div>

      <MapContainer
        center={initialPosition}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Base Layers */}
        {activeLayer === "satellite" ? (
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
            url={tileLayers.standard.url}
            attribution={tileLayers.standard.attribution}
          />
        )}

        {/* API data fetch */}
        <FetchSightings setSightings={setSightings} />

        {/* Markers */}
        {sightings.map((sighting) => (
          <Marker
            key={sighting.sighting_id}
            position={[sighting.latitude, sighting.longitude]}
          >
            <Popup className="custom-popup">
              <div className="font-sans w-56 bg-gray-800/95 text-gray-100 p-3 rounded-lg shadow-lg border border-purple-500/40">
                {/* Scientific Name */}
                <h4 className="font-bold text-base mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {sighting.species.scientific_name}
                </h4>

                {/* Values */}
                <ul className="text-sm space-y-1">
                  <li className="flex items-center space-x-2">
                    <span className="text-pink-400">🌡</span>
                    <span>Temp: {sighting.sea_surface_temp_c} °C</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-400">🌊</span>
                    <span>Salinity: {sighting.salinity_psu} PSU</span>
                  </li>
                </ul>

                {/* ID */}
                <p className="text-xs text-gray-400 mt-3 border-t border-gray-700 pt-1">
                  ID: {sighting.sighting_id}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapWidget;
