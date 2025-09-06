import React from 'react';
import FileUploader from '../features/dataUpload/FileUploader';

function DataUploadPage() {
  // This function will eventually send the uploaded file to the backend.
  // For now, it just logs the file to the console.
  const handleFileUpload = (file) => {
    console.log("File ready for upload:", file);
    // When the real API is ready, you'll create FormData and post it from here.
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Upload New Dataset</h1>
      <p className="mt-1 text-gray-600 mb-8">
        Upload your research data in CSV, JSON, or Excel format for analysis and visualization.
      </p>
      
      <div className="max-w-3xl">
        <FileUploader onFileUpload={handleFileUpload} />
      </div>
    </div>
  );
}

export default DataUploadPage;