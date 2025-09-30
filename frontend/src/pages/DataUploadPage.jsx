// src/pages/DataUploadPage.jsx
import React from "react";
import FileUploader from "../features/dataUpload/FileUploader";

export default function DataUploadPage() {
  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Header Section - Consistent with other pages */}
      <div className="relative overflow-hidden rounded-xl">
        {/* Gradient animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-xl"></div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-purple-300/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>

        {/* Title + subtitle */}
        <div className="relative p-6 text-center space-y-4">
          <h1 className="text-4xl pb-1 lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Data Upload Center
          </h1>
          <p className="mt-2 text-lg text-gray-300 max-w-3xl mx-auto">
            Upload your{" "}
            <span className="text-purple-300">CSV oceanographic data </span>
            and <span className="text-pink-300">FASTA eDNA sequences</span> for
            AI-powered ingestion and storage.
          </p>
        </div>
      </div>

      {/* Main FileUploader component */}
      <FileUploader />
    </div>
  );
}
