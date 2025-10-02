import React, { useState } from "react";
import Image from "../../assets/img.jpg";
// All imports from './ui/...' and 'lucide-react' have been REMOVED.
// We will use inline components and SVGs as replacements.

// --- Icon Replacements (Replicating functionality with SVG or simple tags) ---
const Users = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 5.74" />
  </svg>
);
const Target = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const Award = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M15.47 16.27a4 4 0 0 0-6.94 0" />
    <line x1="21" y1="12" x2="16.5" y2="12" />
    <line x1="2.5" y1="12" x2="7" y2="12" />
    <line x1="12" y1="2" x2="12" y2="6" />
  </svg>
);
const Mail = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const ExternalLink = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3h6v6" />
    <path d="M10 14L21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);
const Copy = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const CheckCircle = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
// --- End Icon Replacements ---

// --- Component Replacements (Styled HTML elements) ---
const Card = ({ className = "", children }) => (
  <div className={`p-0 rounded-xl ${className}`}>{children}</div>
);
const CardHeader = ({ className = "", children }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);
const CardTitle = ({ className = "", children }) => (
  <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>
);
const CardContent = ({ className = "", children }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const Button = ({ onClick, disabled = false, className = "", children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${className}`}
  >
    {children}
  </button>
);
const Dialog = ({ open, onOpenChange, children }) =>
  open ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
      {children}
    </div>
  ) : null;
const DialogContent = ({ className, children }) => (
  <div className={`relative ${className}`}>{children}</div>
);
const DialogHeader = ({ children }) => (
  <div className="space-y-2">{children}</div>
);
const DialogTitle = ({ className, children }) => (
  <h4 className={`text-xl font-bold ${className}`}>{children}</h4>
);
const DialogDescription = ({ className, children }) => (
  <p className={`text-sm ${className}`}>{children}</p>
);
const DialogTrigger = ({ children }) => children;
// --- End Component Replacements ---

// REMOVED: import { ImageWithFallback } from './figma/ImageWithFallback';
import tattvaLogo from "../../assets/Tattva.png";

export const About = React.memo(function About() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = React.useCallback(() => {
    navigator.clipboard.writeText("techspire000@gmail.com");
    setEmailCopied(true);
    const timeoutId = setTimeout(() => setEmailCopied(false), 2000);
    return () => clearTimeout(timeoutId);
  }, []);
  // --- Data (UNCHANGED) ---
  const teamMembers = [
    {
      name: "Vishal",
      role: "Backend Developer",
      expertise: "Server Architecture, Database Systems",
    },
    {
      name: "Jayanth",
      role: "Frontend Developer",
      expertise: "React, UI/UX Development",
    },
    {
      name: "Priyanka",
      role: "Data Researcher",
      expertise: "Marine Data Analysis, Research",
    },
    {
      name: "Sai Kiran",
      role: "Research Team",
      expertise: "Marine Biology, Data Analysis",
    },
    {
      name: "Pranathi",
      role: "Research Team",
      expertise: "Marine Biology, Data Analysis",
    },
    { name: "Satvika", role: "Research Team", expertise: "Marine Research" },
  ];

  const objectives = [
    {
      icon: Target,
      title: "Unified Data Platform",
      description:
        "Integrate diverse marine datasets into a single, accessible platform for researchers worldwide.",
    },
    {
      icon: Award,
      title: "AI-Powered Insights",
      description:
        "Leverage cutting-edge machine learning to accelerate species identification and ecological analysis.",
    },
    {
      icon: Users,
      title: "Collaborative Research",
      description:
        "Foster collaboration between marine scientists, data scientists, and conservation organizations.",
    },
  ];
  // --- End Data ---

  return (
    <div className="space-y-12 p-4 lg:p-6">
            {/* Hero Section */}     {" "}
      <section className="text-center space-y-6">
               {" "}
        <div className="flex justify-center">
                   {" "}
          <div className="relative">
                       {" "}
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 border border-purple-300/30 p-2 backdrop-blur-sm">
                           {" "}
              <img
                src={tattvaLogo}
                alt="TATTVA Logo"
                className="h-full w-full rounded-full object-cover"
              />
                         {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </div>
               {" "}
        <div className="relative overflow-hidden rounded-xl">
          {/* Gradient animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-xl"></div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-purple-300/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>

          {/* Content */}
          <div className="relative p-6 text-center space-y-4">
            <h1 className="text-4xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              About TATTVA
            </h1>
            <p className="text-lg lg:text-xl text-purple-300 max-w-3xl mx-auto">
              Transformative AI for Taxonomic, Temporal & Visual Analytics
            </p>
          </div>
        </div>
             {" "}
      </section>
            {/* Mission Statement */}     {" "}
      <section className="bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-3xl p-8 lg:p-12 border border-purple-300/20">
               {" "}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
                   {" "}
          <div className="space-y-6">
                        <h2 className="text-3xl text-white">Our Mission</h2>   
                   {" "}
            <p className="text-lg text-gray-300 leading-relaxed">
                            Project TATTVA addresses the critical challenge of
              fragmented marine data by creating an integrated platform that
              combines traditional oceanographic measurements with modern AI
              techniques for species identification and ecosystem analysis.    
                     {" "}
            </p>
                       {" "}
            <p className="text-purple-300">
                            Through advanced machine learning algorithms and
              comprehensive data integration, we aim to accelerate marine
              research, support conservation efforts, and unlock new insights
              about our oceans.            {" "}
            </p>
                     {" "}
          </div>
                   {" "}
          <div className="relative">
                       {" "}
            <img // Changed from ImageWithFallback to img
              src={Image}
              alt="Marine biodiversity"
              className="rounded-2xl shadow-xl w-full h-80 object-cover border border-purple-300/30"
            />
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </section>
            {/* Project Objectives */}     {" "}
      <section className="space-y-8">
               {" "}
        <div className="text-center">
                    <h2 className="text-3xl text-white">Project Objectives</h2> 
                 {" "}
          <p className="text-lg text-purple-300 mt-4">
                        Building the future of marine data science          {" "}
          </p>
                 {" "}
        </div>
                       {" "}
        <div className="grid md:grid-cols-3 gap-6">
                   {" "}
          {objectives.map((objective, index) => {
            const Icon = objective.icon;
            const colors = ["purple", "pink", "green"];
            const color = colors[index % colors.length];
            return (
              <Card
                key={index}
                className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                               {" "}
                <CardHeader className="text-center">
                                   {" "}
                  <div
                    className={`w-16 h-16 mx-auto bg-gradient-to-r from-${color}-400/20 to-${color}-300/20 border border-${color}-300/30 rounded-2xl flex items-center justify-center mb-4`}
                  >
                                       {" "}
                    <Icon className={`h-8 w-8 text-${color}-300`} />           
                         {" "}
                  </div>
                                   {" "}
                  <CardTitle className="text-white">
                    {objective.title}
                  </CardTitle>
                                 {" "}
                </CardHeader>
                               {" "}
                <CardContent>
                                   {" "}
                  <p className="text-gray-300 text-center leading-relaxed">
                    {objective.description}
                  </p>
                                 {" "}
                </CardContent>
                             {" "}
              </Card>
            );
          })}
                 {" "}
        </div>
             {" "}
      </section>
            {/* Team Section */}
      <section className="space-y-10">
        <h2 className="text-3xl font-bold text-white text-center">Our Team</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => {
            // Use fixed Tailwind color classes instead of dynamic strings
            const colorClasses = [
              "from-purple-400/20 to-purple-300/20 border-purple-300/30 text-purple-300",
              "from-pink-400/20 to-pink-300/20 border-pink-300/30 text-pink-300",
              "from-green-400/20 to-green-300/20 border-green-300/30 text-green-300",
              "from-yellow-400/20 to-yellow-300/20 border-yellow-300/30 text-yellow-300",
              "from-blue-400/20 to-blue-300/20 border-blue-300/30 text-blue-300",
              "from-cyan-400/20 to-cyan-300/20 border-cyan-300/30 text-cyan-300",
            ];
            const color = colorClasses[index % colorClasses.length];

            return (
              <Card
                key={index}
                className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center"
              >
                <CardContent className="p-6 text-center space-y-4 flex flex-col items-center">
                  {/* Avatar Circle */}
                  <div
                    className={`w-20 h-20 flex items-center justify-center mx-auto rounded-full border ${color} bg-gradient-to-r`}
                  >
                    <span
                      className={`text-xl font-semibold ${color
                        .split(" ")
                        .pop()}`}
                    >
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>

                  {/* Member Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-purple-300 mb-2">
                      {member.role}
                    </p>
                    <p className="text-xs text-gray-400">{member.expertise}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
});
