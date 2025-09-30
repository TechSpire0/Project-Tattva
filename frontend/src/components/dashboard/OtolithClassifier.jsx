// src/components/dashboard/OtolithClassifier.jsx

import React, { useState } from "react";
import apiClient from "../../services/apiClient";

// --- Icons (placeholders, replace with lucide-react if needed) ---
const Microscope = ({ className = "" }) => (
  <span className={className}>🔬</span>
);
const Dna = ({ className = "" }) => <span className={className}>🧬</span>;
const CheckCircle = ({ className = "" }) => (
  <span className={className}>✅</span>
);
const ImageIcon = ({ className = "" }) => <span className={className}>🖼️</span>;

// --- UI Helpers ---
const Card = ({ className = "", children }) => (
  <div className={`border rounded-xl shadow-lg h-full w-full ${className}`}>
    {children}
  </div>
);
const CardHeader = ({ children }) => <div className="p-6">{children}</div>;
const CardTitle = ({ className = "", children }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);
const CardContent = ({ className = "", children }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({ onClick, className = "", children, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

const Progress = ({
  value,
  className = "",
  indicatorClass = "bg-blue-500",
}) => (
  <div className={`w-full bg-gray-700 rounded-full h-2 ${className}`}>
    <div
      className={`h-2 rounded-full ${indicatorClass}`}
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

const Alert = ({ className = "", children }) => (
  <div className={`p-4 rounded-lg flex space-x-3 ${className}`}>{children}</div>
);
const AlertDescription = ({ children }) => (
  <div className="flex-1">{children}</div>
);

const Textarea = (props) => (
  <textarea
    {...props}
    className={`w-full p-2 border rounded-lg ${props.className || ""}`}
  />
);

// --- Main Component ---
function OtolithClassifier() {
  // --- Otolith states ---
  const [otolithImage, setOtolithImage] = useState(null);
  const [otolithResult, setOtolithResult] = useState(null);
  const [otolithLoading, setOtolithLoading] = useState(false);

  // --- eDNA states ---
  const [dnaSequence, setDnaSequence] = useState("");
  const [dnaResult, setDnaResult] = useState(null);
  const [dnaLoading, setDnaLoading] = useState(false);

  // --- Reset Handlers ---
  const resetOtolith = () => {
    setOtolithImage(null);
    setOtolithResult(null);
    setOtolithLoading(false);
  };

  const resetDNA = () => {
    setDnaSequence("");
    setDnaResult(null);
    setDnaLoading(false);
  };

  // --- Handlers ---
  const handleOtolithUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setOtolithImage(e.target.files[0]);
      setOtolithResult(null);
    }
  };

  const handleOtolithClassification = async () => {
    if (!otolithImage) return;

    setOtolithLoading(true);
    setOtolithResult(null);

    const formData = new FormData();
    formData.append("file", otolithImage);

    try {
      const apiCallPromise = apiClient.post("/classify_otolith", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 1500));
      const [response] = await Promise.all([apiCallPromise, delayPromise]);

      setOtolithResult(response.data);
    } catch (err) {
      console.error("Otolith classification error:", err);
      setOtolithResult({ error: "Failed to classify image" });
    } finally {
      setOtolithLoading(false);
    }
  };

  const handleDNAMatch = async () => {
    if (!dnaSequence.trim()) return;

    setDnaLoading(true);
    setDnaResult(null);

    try {
      const response = await apiClient.post("/edna/match", {
        sequence: dnaSequence,
      });
      setDnaResult(response.data);
    } catch (err) {
      console.error("DNA match error:", err);
      setDnaResult({ error: "Server error" });
    } finally {
      setDnaLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-8">
      {/* --- Otolith Classifier --- */}
      <Card className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-pink-500 rounded-lg flex items-center justify-center">
              <Microscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-white">Otolith Classifier</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {!otolithImage ? (
            <div className="border-2 border-dashed border-pink-300/50 rounded-xl p-6 text-center min-h-[250px] flex flex-col justify-center">
              <input
                type="file"
                id="otolith-upload"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleOtolithUpload}
              />
              <label
                htmlFor="otolith-upload"
                className="cursor-pointer space-y-4 block"
              >
                <div className="w-16 h-16 mx-auto bg-pink-300/20 rounded-full flex items-center justify-center border border-pink-300/50">
                  <ImageIcon className="h-8 w-8 text-pink-300" />
                </div>
                <p className="text-white">Click to upload otolith image</p>
                <p className="text-sm text-gray-300">PNG or JPG</p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {!otolithResult && !otolithLoading && (
                <Button
                  onClick={handleOtolithClassification}
                  className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white"
                >
                  Analyze Otolith
                </Button>
              )}

              {otolithLoading && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-400"></div>
                    <span className="text-pink-300">Processing image...</span>
                  </div>
                  <Progress value={60} indicatorClass="bg-pink-500" />
                </div>
              )}

              {otolithResult && (
                <div className="space-y-3">
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      {otolithResult.error ? (
                        <p className="text-red-500">{otolithResult.error}</p>
                      ) : (
                        <div>
                          <p className="font-semibold">Species Identified:</p>
                          <p className="italic">
                            {otolithResult.predicted_species}
                          </p>
                          <Progress
                            value={Math.round(otolithResult.confidence_score)}
                            indicatorClass="bg-green-500"
                          />
                          <p className="text-sm mt-1">
                            Confidence:{" "}
                            {Math.round(otolithResult.confidence_score)}%
                          </p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>

                  {/* Reset Button */}
                  <Button
                    onClick={resetOtolith}
                    className="w-full bg-gray-700 text-white hover:bg-gray-600"
                  >
                    Upload New Otolith
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- eDNA Matching --- */}
      <Card className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center">
              <Dna className="h-6 w-6 text-white" />
            </div>
            <span className="text-white">eDNA Sequence Matching</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Textarea
            placeholder={`Paste your DNA sequence here...\n>Sample_COI_sequence\nATGGCACAC...`}
            value={dnaSequence}
            onChange={(e) => setDnaSequence(e.target.value)}
            rows={6}
            className="font-mono text-sm bg-gray-900/50 border-gray-700 text-gray-200"
          />

          {!dnaResult && !dnaLoading && (
            <Button
              onClick={handleDNAMatch}
              disabled={!dnaSequence.trim()}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white"
            >
              Match DNA Sequence
            </Button>
          )}

          {dnaLoading && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400"></div>
                <span className="text-indigo-300">Searching database...</span>
              </div>
              <Progress value={80} indicatorClass="bg-indigo-500" />
            </div>
          )}

          {dnaResult && (
            <div className="mt-4 space-y-3">
              {dnaResult.success && dnaResult.matched && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    ✅ Match Found <br />
                    <span className="text-sm text-gray-500">
                      Header: {dnaResult.header}
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              {dnaResult.success && !dnaResult.matched && (
                <p className="text-red-400">❌ No match found</p>
              )}

              {dnaResult.error && (
                <p className="text-red-400">⚠ {dnaResult.error}</p>
              )}

              {/* Reset Button */}
              <Button
                onClick={resetDNA}
                className="w-full bg-gray-700 text-white hover:bg-gray-600"
              >
                Reset & Try Another Sequence
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default OtolithClassifier;
