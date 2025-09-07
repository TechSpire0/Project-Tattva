// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
// 1. Import BrowserRouter from react-router-dom
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import "leaflet/dist/leaflet.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 2. Wrap the entire App component with BrowserRouter */}
    {/* This is the crucial fix. By wrapping <App /> here, we ensure that */}
    {/* every component inside App, including Sidebar and its NavLinks, */}
    {/* has access to the routing context, which resolves the error. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
