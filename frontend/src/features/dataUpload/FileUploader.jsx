// src/features/dataUpload/FileUploader.jsx
import React, { useState, useCallback } from "react";
import apiClient from "../../services/apiClient";

const ACCEPTED_EXTENSIONS = ["csv", "fasta", "fa"];
const ACCEPTED_FORMATS = ".csv,.fasta,.fa";

export default function FileUploader() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle | uploading | success | error
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isFileValid = (file) => {
    if (!file) return false;
    const extension = file.name.split(".").pop().toLowerCase();
    return ACCEPTED_EXTENSIONS.includes(extension);
  };

  const processFile = (selectedFile) => {
    if (isFileValid(selectedFile)) {
      setUploadedFile(selectedFile);
      setError(null);
      setUploadStatus("idle");
      setUploadProgress(0);
    } else {
      setError("Invalid file type. Please upload a CSV or FASTA file.");
      setUploadedFile(null);
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files?.[0];
    processFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    processFile(droppedFile);
  }, []);

  const handleUploadClick = async () => {
    if (!uploadedFile) return;

    setUploadStatus("uploading");
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", uploadedFile);

    const ext = uploadedFile.name.split(".").pop().toLowerCase();
    let endpoint = null;
    if (ext === "csv") endpoint = "/upload/csv";
    if (ext === "fasta" || ext === "fa") endpoint = "/upload/edna";

    if (!endpoint) {
      setError("Unsupported file type.");
      setUploadStatus("error");
      return;
    }

    try {
      const response = await apiClient.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        },
      });

      // ✅ Now we only mark success when server finishes processing
      setUploadStatus("success");
      console.log("Upload response:", response.data);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file. Please try again.");
      setUploadStatus("error");
    }
  };

  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Upload UI */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Drag & Drop Zone */}
        <div className="lg:col-span-1">
          <div className="border-2 border-dashed border-purple-500/50 rounded-xl p-6 bg-gray-800/70 backdrop-blur-sm shadow-2xl h-full">
            <div
              className={`relative transition-all duration-300 h-full flex flex-col justify-center items-center rounded-lg 
              ${
                dragActive
                  ? "bg-purple-800/60 border-purple-500"
                  : "bg-gradient-to-br from-purple-900/40 to-pink-900/30"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileInputChange}
                accept={ACCEPTED_FORMATS}
              />

              <div className="text-center space-y-4 p-8">
                <div
                  className={`w-16 h-16 mx-auto flex items-center justify-center rounded-full ${
                    dragActive ? "bg-purple-300/30" : "bg-purple-500/20"
                  }`}
                >
                  <svg
                    className="h-8 w-8 text-purple-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>

                <h3 className="text-2xl text-white font-semibold">
                  Drag & drop your file
                </h3>

                <label htmlFor="file-upload" className="cursor-pointer">
                  <p className="text-gray-300">
                    or{" "}
                    <span className="text-purple-300 underline font-semibold">
                      browse to upload
                    </span>
                  </p>
                </label>

                <div className="text-sm text-gray-400 mt-2">
                  Supported: CSV, FASTA (.fasta / .fa)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: File Details / Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700/50 space-y-4 h-full flex flex-col justify-center">
            <h4 className="text-white font-semibold">File Details</h4>

            {!uploadedFile ? (
              // Placeholder before upload
              <p className="text-sm text-gray-400 italic">
                No file selected yet. Choose a file to see details here.
              </p>
            ) : (
              <>
                <p className="text-sm text-white truncate">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-300">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>

                {uploadStatus === "uploading" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-300">
                        {uploadProgress < 100
                          ? "Uploading..."
                          : "Processing on server..."}
                      </span>
                      <span className="text-gray-300">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {uploadStatus !== "success" && (
                  <button
                    onClick={handleUploadClick}
                    disabled={uploadStatus === "uploading"}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 disabled:cursor-not-allowed transition-all"
                  >
                    {uploadStatus === "uploading"
                      ? "Uploading..."
                      : "Ingest Data"}
                  </button>
                )}
              </>
            )}
          </div>

          {uploadStatus === "success" && (
            <div className="bg-green-900/50 text-green-300 p-4 rounded-xl border border-green-500/50 shadow-lg">
              ✅ Data ingested successfully! Ready for analysis.
            </div>
          )}

          {error && (
            <p className="text-red-300 text-sm p-4 bg-red-900/50 rounded-lg text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
