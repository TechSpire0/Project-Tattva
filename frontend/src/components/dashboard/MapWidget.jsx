import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import apiClient from "../../services/apiClient";
import useApi from "../../hooks/useApi";

// Icon path correction
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

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
      attribution: "Tiles &copy; Esri",
    },
    labels: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      attribution: "Labels &copy; Esri",
    },
  },
  // dark: {
  //   url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  //   attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  // }
};

const getSightingsData = () => apiClient.get("/sightings_sample?limit=50");

function MapWidget() {
  const { data: sightings, loading, error } = useApi(getSightingsData);
  const [activeLayer, setActiveLayer] = useState("standard");
  const initialPosition = [20.5937, 78.9629];

  if (loading) {
    return (
      <div className="h-full min-h-[500px] flex justify-center items-center bg-gray-100 rounded-lg shadow-md">
        <p>Loading Map Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full min-h-[500px] flex justify-center items-center bg-red-50 text-red-700 rounded-lg shadow-md">
        <p>Error: Could not load map data.</p>
      </div>
    );
  }

  const validSightings = Array.isArray(sightings) ? sightings : [];

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
        {/* Standard / Dark */}
        {activeLayer === "standard" && (
          <TileLayer
            url={tileLayers.standard.url}
            attribution={tileLayers.standard.attribution}
          />
        )}
        {/* {activeLayer === 'dark' && (
          <TileLayer url={tileLayers.dark.url} attribution={tileLayers.dark.attribution} />
        )} */}

        {/* Satellite with labels */}
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

        {/* Markers */}
        {validSightings.map((sighting) => (
          <Marker
            key={sighting.sighting_id}
            position={[sighting.latitude, sighting.longitude]}
          >
            <Popup>
              <div className="font-sans w-48">
                <h4 className="font-bold text-base mb-1 text-gray-800">
                  {sighting.species.common_name}
                </h4>
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
