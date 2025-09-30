import React from 'react';
// Import the component that now contains both modules
import OtolithClassifier from '../components/dashboard/OtolithClassifier';

// This component represents the page for the Otolith Classifier tool.
export default function OtolithClassifierPage() {
    return (
        <div className="space-y-8 p-4 lg:p-6">
            {/* Page Header - Using the full title for the dual module */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                    AI Classification Modules
                </h1>
                <p className="mt-2 text-lg text-gray-300 max-w-3xl mx-auto">
                    Advanced machine learning tools for automated otolith morphology analysis and eDNA species identification, accelerating marine biodiversity research.
                </p>
            </div>
            
            {/* Render the core component which contains the two-column grid */}
            <OtolithClassifier />
        </div>
    );
}
