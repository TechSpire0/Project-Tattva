import React, { useState, useCallback } from 'react';

// An array of accepted file extensions for validation.
const ACCEPTED_EXTENSIONS = ['csv', 'json', 'xls', 'xlsx'];
// The string for the file input's 'accept' attribute.
const ACCEPTED_FORMATS = '.csv,.json,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';


function FileUploader({ onFileUpload }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  // --- THE FIX IS HERE: Add state for the success message ---
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Helper function to validate the file extension.
  const isFileValid = (file) => {
    if (!file) return false;
    const extension = file.name.split('.').pop().toLowerCase();
    return ACCEPTED_EXTENSIONS.includes(extension);
  };

  const processFile = (selectedFile) => {
    if (isFileValid(selectedFile)) {
      setFile(selectedFile);
      setError(null);
      setUploadSuccess(false); // Clear previous success message
    } else {
      setError('Invalid file type. Please upload a CSV, JSON, or Excel file.');
      setFile(null);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    processFile(selectedFile);
  };

  // Memoize drag-and-drop handlers for performance.
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    processFile(droppedFile);
  }, []);
  
  const handleUploadClick = () => {
    if (file) {
      setIsUploading(true);
      setError(null);
      setUploadSuccess(false);
      // Simulate an API call delay.
      setTimeout(() => {
        onFileUpload(file);
        setIsUploading(false);
        setFile(null); // Clear the file after "upload".
        
        // --- THE FIX IS HERE: Show the success message ---
        setUploadSuccess(true);
        // Automatically hide the message after 5 seconds for a clean UI
        setTimeout(() => setUploadSuccess(false), 5000);

      }, 1500);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div 
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors
                    ${isDragOver ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 bg-gray-50'}`}
      >
        <input 
          type="file"
          id="file-upload"
          className="hidden"
          accept={ACCEPTED_FORMATS}
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <p className="text-gray-500">
            <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop.
          </p>
          <p className="text-xs text-gray-400 mt-1">CSV, JSON, XLS, or XLSX files only.</p>
        </label>
      </div>

      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

      {file && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm">
          <p>Selected file: <span className="font-semibold">{file.name}</span></p>
        </div>
      )}

      {/* --- THE FIX IS HERE: Render the success message when upload is complete --- */}
      {uploadSuccess && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 border border-green-200 rounded-md text-sm animate-fade-in">
          <p><strong>Success!</strong> Your file has been uploaded and is being processed.</p>
        </div>
      )}

      <button
        onClick={handleUploadClick}
        disabled={!file || isUploading}
        className="mt-4 w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md
                   hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isUploading ? 'Uploading...' : 'Upload File'}
      </button>
    </div>
  );
}

export default FileUploader;
