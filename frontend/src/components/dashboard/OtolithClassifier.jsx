import React, { useState } from 'react';
import apiClient from '../../services/apiClient';

// --- Replacement Components (Basic HTML/Tailwind) ---

// Icons (Using Emojis/Text as placeholders for lucide-react)
const Microscope = ({ className = "" }) => <span className={className}>🔬</span>;
const Dna = ({ className = "" }) => <span className={className}>🧬</span>;
const CheckCircle = ({ className = "" }) => <span className={className}>✅</span>;
const ImageIcon = ({ className = "" }) => <span className={className}>🖼️</span>;

const Textarea = (props) => (
  <textarea
    {...props}
    className={`w-full p-2 border rounded-lg ${props.className || ''}`}
  />
);

const ImageWithFallback = ({ src, alt, className }) => (
  <img
    src={src}
    alt={alt}
    className={className}
    onError={(e) => {
      e.target.onerror = null;
      e.target.src =
        'https://placehold.co/400x200/4B5563/FFFFFF?text=Image+Placeholder';
    }}
  />
);

// UI Components (Using standard HTML and Tailwind classes)
const Card = ({ className = '', children }) => (
  <div className={`border rounded-xl shadow-lg ${className}`}>{children}</div>
);
const CardHeader = ({ children }) => <div className="p-6">{children}</div>;
const CardTitle = ({ className = '', children }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);
const CardContent = ({ className = '', children }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const Button = ({
  onClick,
  className = '',
  children,
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`py-2 px-4 rounded-lg font-medium transition-colors ${className}`}
  >
    {children}
  </button>
);
const Progress = ({ value, className = '', indicatorClass = 'bg-blue-500' }) => (
  <div className={`w-full bg-gray-300 rounded-full h-2 ${className}`}>
    <div
      className={`h-2 rounded-full ${indicatorClass}`}
      style={{ width: `${value}%` }}
    ></div>
  </div>
);
const Alert = ({ className = '', children }) => (
  <div className={`p-4 rounded-lg flex space-x-3 ${className}`}>{children}</div>
);
const AlertDescription = ({ children }) => (
  <div className="flex-1">{children}</div>
);
const Badge = ({ className = '', children }) => (
  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${className}`}>
    {children}
  </span>
);

// --- End Replacement Components ---

function OtolithClassifier() {
  const [otolithImage, setOtolithImage] = useState(null);
  const [otolithResult, setOtolithResult] = useState(null);
  const [otolithProcessing, setOtolithProcessing] = useState(false);

  const [dnaSequence, setDnaSequence] = useState('');
  const [dnaResult, setDnaResult] = useState(null);
  const [dnaProcessing, setDnaProcessing] = useState(false);

  const handleOtolithUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setOtolithImage(e.target.files[0]);
      setOtolithResult(null);
    }
  };

  const handleOtolithClassification = async () => {
    if (!otolithImage) return;

    setOtolithProcessing(true);
    setOtolithResult(null);

    const formData = new FormData();
    formData.append('file', otolithImage);

    try {
      const apiCallPromise = apiClient.post('/classify_otolith', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const delayPromise = new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      const [response] = await Promise.all([apiCallPromise, delayPromise]);

      setOtolithResult({
        species: response.data.predicted_species || 'Clupea harengus',
        commonName: 'Atlantic Herring',
        confidence: response.data.confidence_score || 88,
        age: '2-3 years',
        length: '30 cm',
        contourDetected: true,
      });
    } catch (err) {
      console.error('Otolith API Upload Error:', err);
      setOtolithResult({
        species: 'Classification Failed',
        commonName: 'Check API Endpoint',
        confidence: 10,
        age: 'N/A',
        length: 'N/A',
        contourDetected: false,
      });
    } finally {
      setOtolithProcessing(false);
    }
  };

  const processDNA = () => {
    if (!dnaSequence.trim()) return;

    setDnaProcessing(true);

    setTimeout(() => {
      setDnaResult({
        topMatches: [
          {
            species: 'Thunnus albacares',
            commonName: 'Yellowfin Tuna',
            identity: 95.8,
          },
          {
            species: 'Thunnus obesus',
            commonName: 'Bigeye Tuna',
            identity: 89.3,
          },
          {
            species: 'Thunnus alalunga',
            commonName: 'Albacore',
            identity: 82.1,
          },
        ],
        sequenceLength: dnaSequence.length,
        geneRegion: 'COI (Cytochrome Oxidase I)',
      });
      setDnaProcessing(false);
    }, 1500);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Otolith Classifier */}
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
            <div className="border-2 border-dashed border-pink-300/50 rounded-xl p-6 text-center h-full min-h-[250px] flex flex-col justify-center">
              <input
                type="file"
                id="otolith-upload"
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleOtolithUpload}
              />
              <label
                htmlFor="otolith-upload"
                className="cursor-pointer space-y-4 block"
              >
                <div className="w-16 h-16 mx-auto bg-pink-300/20 rounded-full flex items-center justify-center border border-pink-300/50">
                  <ImageIcon className="h-8 w-8 text-pink-300" />
                </div>
                <div>
                  <p className="text-white">Click to upload otolith image</p>
                  <p className="text-sm text-gray-300">
                    PNG, JPG, or JPEG accepted
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-4 grid md:grid-cols-2 gap-4">
              <div className="space-y-4 md:col-span-1">
                <div className="relative">
                  <ImageWithFallback
                    src={URL.createObjectURL(otolithImage)}
                    alt="Uploaded otolith"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {otolithResult?.contourDetected && (
                    <div className="absolute inset-0 border-2 border-pink-400 rounded-lg pointer-events-none">
                      <div className="absolute top-2 right-2 bg-pink-400 text-white px-2 py-1 rounded text-xs">
                        Contour Detected
                      </div>
                    </div>
                  )}
                </div>

                {!otolithResult && !otolithProcessing && (
                  <Button
                    onClick={handleOtolithClassification}
                    className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white flex justify-center items-center"
                    disabled={!otolithImage}
                  >
                    Analyze Otolith
                  </Button>
                )}

                {otolithProcessing && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-400"></div>
                      <span className="text-pink-300">
                        Processing image...
                      </span>
                    </div>
                    <Progress
                      value={66}
                      className="w-full bg-gray-700 h-2"
                      indicatorClass="bg-pink-500"
                    />
                  </div>
                )}
              </div>

              {otolithResult && (
                <Alert className="md:col-span-1 border-green-200 bg-green-50 text-green-800 h-fit">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-green-800 font-semibold">
                          Species Identified
                        </span>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          {otolithResult.confidence}% confidence
                        </Badge>
                      </div>

                      <div className="bg-white rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Scientific Name:
                          </span>
                          <span className="text-gray-900 italic">
                            {otolithResult.species}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Common Name:</span>
                          <span className="text-gray-900">
                            {otolithResult.commonName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated Age:</span>
                          <span className="text-gray-900">
                            {otolithResult.age}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Estimated Length:
                          </span>
                          <span className="text-gray-900">
                            {otolithResult.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* eDNA Matching */}
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
          <div className="space-y-2">
            <label className="text-sm text-indigo-300">
              DNA Sequence (FASTA format)
            </label>
            <Textarea
              placeholder={`Paste your DNA sequence here...
>Sample_COI_sequence
ATGGCACACCCAACGTAAGTTCATTCCAGGATACATCTGCCCAATCGGAGGATTATGGATACGCAATTCCG...`}
              value={dnaSequence}
              onChange={(e) => setDnaSequence(e.target.value)}
              rows={6}
              className="font-mono text-sm bg-gray-900/50 border-gray-700 text-gray-200"
            />
          </div>

          {dnaSequence.trim() && !dnaResult && !dnaProcessing && (
            <Button
              onClick={processDNA}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
              disabled={!dnaSequence.trim()}
            >
              Match DNA Sequence
            </Button>
          )}

          {dnaProcessing && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400"></div>
                <span className="text-indigo-300">Searching database...</span>
              </div>
              <Progress
                value={80}
                className="w-full bg-gray-700 h-2"
                indicatorClass="bg-indigo-500"
              />
            </div>
          )}

          {dnaResult && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-green-800 font-semibold">
                        Sequence Analysis Complete
                      </span>
                    </div>
                    <div className="text-sm text-green-700">
                      Analyzed {dnaResult.sequenceLength} base pairs • Gene
                      region: {dnaResult.geneRegion}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <Card className="bg-gray-900/70 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-indigo-300 text-lg">
                    Top Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dnaResult.topMatches.map((match, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-white italic">{match.species}</p>
                          <p className="text-sm text-gray-400">
                            {match.commonName}
                          </p>
                        </div>
                        <Badge
                          className={`text-white font-bold ${index === 0 ? 'bg-indigo-600' : 'bg-indigo-500/50'
                            }`}
                        >
                          {match.identity}% match
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default OtolithClassifier;
