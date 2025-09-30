import React, { useState, useCallback } from 'react';
// ICON IMPORTS REMOVED

// NOTE: These constants were defined in your first component block and are used here.
const ACCEPTED_EXTENSIONS = ['csv', 'fasta', 'fa'];
const ACCEPTED_FORMATS = '.csv,.fasta,.fa';

// --- Helper Functions (SIMPLIFIED - no longer return Lucide icons) ---
const getFileIcon = (fileType, fileName) => {
  // This function can no longer return JSX (like <Image />), 
  // but its presence is safe for the logic flow.
  return 'File';
};

const getFileTypeDescription = (file) => {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) return 'Oceanographic Data';
  if (name.endsWith('.fasta') || name.endsWith('.fa')) return 'eDNA Sequence';
  
  return 'Data File';
};

// --- Supported Formats (Simplified: icon property removed) ---
const supportedFormats = [
  { extension: 'CSV', description: 'Oceanographic measurements', color: 'text-purple-400' },
  // { extension: 'JPG/PNG', description: 'Otolith images', color: 'text-pink-400' },
  { extension: 'FASTA', description: 'eDNA sequences', color: 'text-yellow-400' },
];
// --------------------------------------------------------------------------

export default function FileUploader({ onFileUpload }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // --- Component Logic (UNCHANGED) ---
  const isFileValid = (file) => {
    if (!file) return false;
    const extension = file.name.split('.').pop().toLowerCase();
    return ACCEPTED_EXTENSIONS.includes(extension);
  };

  const processFile = (selectedFile) => {
    if (isFileValid(selectedFile)) {
      setUploadedFile(selectedFile);
      setError(null);
      setUploadStatus('idle');
      setUploadProgress(0);
    } else {
      setError('Invalid file type. Please upload a CSV, Image (JPG/PNG), or FASTA file.');
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
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    processFile(droppedFile);
  }, []);

  const handleUploadClick = () => {
    if (!uploadedFile) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          setTimeout(() => onFileUpload(uploadedFile), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const isUploading = uploadStatus === 'uploading';
  // --- END Component Logic ---

  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl text-white">Data Upload Center</h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Upload your marine data files for AI-powered analysis and insights
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column: Upload Zone (NEW DESIGN) */}
        <div className="lg:col-span-1">
          <div className="border-2 border-dashed border-purple-500/50 rounded-xl p-6 bg-gray-800/70 backdrop-blur-sm shadow-2xl h-full">
            <div
              className={`relative transition-all duration-300 h-full flex flex-col justify-center items-center rounded-lg 
                ${dragActive ? 'bg-purple-800/60 border-purple-500' : 'bg-gradient-to-br from-purple-900/40 to-pink-900/30'}`}
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
                {/* Upload Icon Placeholder (REMOVED LUCIDE ICON) */}
                <div className={`w-16 h-16 mx-auto flex items-center justify-center rounded-full ${dragActive ? 'bg-purple-300/30' : 'bg-purple-500/20'
                  }`}>
                  <svg className="h-8 w-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>

                <h3 className="text-2xl text-white font-semibold">
                  Drag & drop your file
                </h3>

                <label htmlFor="file-upload" className="cursor-pointer">
                  <p className="text-gray-300">
                    or <span className="text-purple-300 underline font-semibold">browse to upload</span>
                  </p>
                </label>

                <div className="text-sm text-gray-400 mt-2">
                  Supported: CSV, Images (JPG/PNG), FASTA
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Supported Formats (NEW DESIGN) */}
        <div className="lg:col-span-1 space-y-6">

          {/* File Preview / Status */}
          {uploadedFile && uploadStatus !== 'success' && (
            <div className="bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700/50 space-y-4">
              <h4 className="text-white font-semibold">File Details</h4>
              <div className="flex items-center space-x-3 p-3 bg-purple-300/10 rounded-lg border border-purple-300/30">
                <div className="text-purple-300">
                  {/* Placeholder for file icon (REMOVED LUCIDE ICON) */}
                  <div className="h-6 w-6"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-300">
                    {getFileTypeDescription(uploadedFile)} • {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-300">Uploading...</span>
                    <span className="text-gray-300">{uploadProgress}%</span>
                  </div>
                  {/* Simple progress bar implementation */}
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                onClick={handleUploadClick}
                disabled={!uploadedFile || isUploading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all"
              >
                {isUploading ? 'Uploading...' : 'Ingest Data'}
              </button>
            </div>
          )}

          {/* Success Message */}
          {uploadStatus === 'success' && (
            <div className="bg-green-900/50 text-green-300 p-4 rounded-xl border border-green-500/50 shadow-lg">
              <div className='flex items-center space-x-2'>
                {/* Placeholder for CheckCircle icon */}
                <div className="h-4 w-4 text-green-400"></div>
                <span className="text-green-300 text-sm font-medium">
                  Data ingested successfully! Ready for analysis.
                </span>
              </div>
            </div>
          )}

          {error && <p className="text-red-300 text-sm p-4 bg-red-900/50 rounded-lg text-center">{error}</p>}


          {/* Supported Formats (NEW DESIGN) */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Supported Formats</h4>
            <div className="grid gap-3">
              {supportedFormats.map((format, index) => {
                return (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-gray-800 rounded-xl border border-purple-500/30 shadow-lg">
                    {/* Placeholder for data icon */}
                    <div className={`h-5 w-5 ${format.color}`}></div>
                    <div>
                      <p className="text-sm text-white font-medium">{format.extension}</p>
                      <p className="text-xs text-gray-400">{format.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}