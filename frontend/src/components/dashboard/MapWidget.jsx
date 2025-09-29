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

// Fix Leaflet icon paths
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

// Component that listens for map moves and fetches sightings
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
            limit: 2000, // you can adjust depending on performance
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
  const [activeLayer, setActiveLayer] = useState("standard");
  const [sightings, setSightings] = useState([]);
  const initialPosition = [20.5937, 78.9629]; // India center

  return (
    <div className="relative h-[500px] w-full rounded-lg shadow-md overflow-hidden">
      {/* Toggle Buttons */}
      <div className="absolute top-2 right-2 z-10 bg-white bg-opacity-80 p-1 rounded-lg shadow-md flex space-x-1">
        <button
          onClick={() => setActiveLayer("standard")}
          className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
            activeLayer === "standard"
              ? "bg-slate-900 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Standard
        </button>
        <button
          onClick={() => setActiveLayer("satellite")}
          className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
            activeLayer === "satellite"
              ? "bg-slate-900 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Satellite
        </button>
      </div>

      <MapContainer
        center={initialPosition}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        {/* Standard Layer */}
        {activeLayer === "standard" && (
          <TileLayer
            url={tileLayers.standard.url}
            attribution={tileLayers.standard.attribution}
          />
        )}

        {/* Satellite Layer */}
        {activeLayer === "satellite" && (
          <>
            <TileLayer
              url={tileLayers.satellite.imagery.url}
              attribution={tileLayers.satellite.imagery.attribution}
            />
            <TileLayer
              url={tileLayers.satellite.labels.url}
              attribution={tileLayers.satellite.labels.attribution}
            />
          </>
        )}

        {/* Trigger API fetch on map move */}
        <FetchSightings setSightings={setSightings} />

        {/* Markers */}
        {sightings.map((sighting) => (
          <Marker
            key={sighting.sighting_id}
            position={[sighting.latitude, sighting.longitude]}
          >
            <Popup>
              <div className="font-sans w-48">
                <p className="text-sm text-gray-600 italic mb-2">
                  {sighting.species.scientific_name}
                </p>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>
                    <b>Temperature:</b> {sighting.sea_surface_temp_c}°C
                  </li>
                  <li>
                    <b>Salinity:</b> {sighting.salinity_psu} PSU
                  </li>
                  <li>
                    <b>Chlorophyll:</b> {sighting.chlorophyll_mg_m3} mg/m³
                  </li>
                </ul>
                <p className="text-xs text-gray-400 mt-3 border-t pt-1">
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
