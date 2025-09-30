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
    <div className="space-y-8 p-4 lg:p-6">
      
      {/* Header Section - Styled for the dark theme */}
{/*       <div className="text-center space-y-2">
        <h1 className="text-4xl text-white font-extrabold">Data Upload Center</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Upload your marine data files for AI-powered analysis and insights
        </p>
      </div> */}
      
      {/* The main content wrapper now allows full width for the two-column FileUploader */}
      <div className="max-w-7xl mx-auto">
        <FileUploader onFileUpload={handleFileUpload} />
      </div>
    </div>
  );
}

export default DataUploadPage;