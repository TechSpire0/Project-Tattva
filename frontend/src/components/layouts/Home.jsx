import React from 'react';
import { Link } from 'react-router-dom';

// --- Icon Replacements (Standard SVGs, simplified) ---
const ArrowRight = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
const Upload = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const BarChart3 = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>;
const Brain = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 0 0-3-3 3 3 0 0 0-3 3v14a3 3 0 0 0 3 3 3 3 0 0 0 3-3V5Z" /><path d="M15 7a3 3 0 0 1 3-3 3 3 0 0 1 3 3v14a3 3 0 0 1-3 3 3 3 0 0 1-3-3V7Z" /><path d="M12 5h3" /><path d="M12 19h3" /><path d="M12 12h3" /></svg>;
const Sparkles = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.91 7.21l1.58 3.19a.25.25 0 0 0 .22.12h3.46a.25.25 0 0 1 .19.41l-2.8 2.74a.25.25 0 0 0-.07.27l.67 3.86a.25.25 0 0 1-.36.27l-3.21-1.7a.25.25 0 0 0-.25 0l-3.21 1.7a.25.25 0 0 1-.36-.27l.67-3.86a.25.25 0 0 0-.07-.27l-2.8-2.74a.25.25 0 0 1 .19-.41h3.46a.25.25 0 0 0 .22-.12l1.58-3.19a.25.25 0 0 1 .44 0Z" /></svg>;
// --- End Icon Replacements ---

// --- Component Replacements (Styled HTML elements) ---
const Card = ({ className = "", children }) => <div className={`border rounded-xl ${className}`}>{children}</div>;
const CardHeader = ({ className = "", children }) => <div className={`p-6 ${className}`}>{children}</div>;
const CardTitle = ({ className = "", children }) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
const CardContent = ({ className = "", children }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
// We assume 'variant' is no longer used for the custom gradient buttons
const Button = ({ onClick, className = "", children, variant = null }) => <button onClick={onClick} className={`font-medium transition-all duration-300 ${className}`}>{children}</button>;
// --- End Component Replacements ---

export function Homepage() {
    const features = [
        {
            title: 'Data Upload',
            description: 'Upload CSV, images, and FASTA files seamlessly',
            icon: Upload,
            color: 'from-purple-400 to-purple-500',
            path: '/data-upload' // Aligned with project routes
        },
        {
            title: 'Ocean Insights',
            description: 'Visualize marine data with interactive dashboards',
            icon: BarChart3,
            color: 'from-purple-400 to-pink-500',
            // MODIFICATION HERE: Use the dashboard route with the specific chart hash
            path: '/dashboard#avg-temp-trend'
        },
        {
            title: 'AI Classifier',
            description: 'Advanced otolith and eDNA species identification',
            icon: Brain,
            color: 'from-purple-500 to-pink-500',
            path: '/otolith-classifier' // Aligned with project routes
        }
    ];

    return (
        <div className="space-y-12 p-4 lg:p-6">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Animated Background and Floating Elements (UNCHANGED) */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-3xl"></div>
                <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-purple-400/30 to-purple-300/30 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-purple-400/25 to-pink-400/25 rounded-full blur-lg animate-pulse delay-500"></div>

                <div className="relative grid lg:grid-cols-2 gap-12 items-center p-8 lg:p-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-300/10 to-pink-300/10 text-purple-300 px-4 py-2 rounded-full text-sm border border-purple-300/30 shadow-lg backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 animate-pulse" />
                            <span>Next-Generation Marine Analytics</span>
                        </div>

                        <h1 className="text-4xl lg:text-6xl text-white leading-tight">
                            Unifying Ocean Data with
                            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent animate-pulse"> AI</span>
                        </h1>

                        <p className="text-lg text-gray-300 leading-relaxed">
                            Project TATTVA revolutionizes marine research by combining advanced AI algorithms
                            with comprehensive ocean data analysis. Discover patterns, identify species, and
                            unlock insights from the world's oceans.
                        </p>

                        <div className="flex space-x-4">
                            <Link to="/dashboard">
                                {/* Primary Button */}
                                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                    Explore Dashboard
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                            <Link to="/data-upload">
                                {/* Secondary Button */}
                                <Button className="border-purple-300/50 text-purple-300 hover:bg-purple-300/10 px-6 py-3 rounded-xl border">
                                    Upload Data
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-2xl blur-3xl animate-pulse"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-300/10 to-pink-300/10 rounded-2xl blur-2xl animate-pulse delay-700"></div>
                        {/* ImageWithFallback replaced with standard img tag */}
                        <img
                            src="https://images.unsplash.com/photo-1608721190006-dcad8a3670b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHdhdmVzJTIwYmx1ZSUyMG1hcmluZXxlbnwxfHx8fDE3NTg3NzQ5MDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                            alt="Ocean waves with blue marine theme"
                            className="relative rounded-2xl shadow-2xl w-full h-80 object-cover border-2 border-purple-400/30"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="space-y-8">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl text-white">Powerful Features</h2>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Comprehensive tools for marine data analysis and species identification
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <Link key={index} to={feature.path}>
                                <Card className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 group hover:border-gray-600/70 transition-all duration-300 hover:scale-105">
                                    <CardHeader className="text-center space-y-4">
                                        <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="h-8 w-8 text-white" />
                                        </div>
                                        <CardTitle className="text-white">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-300 text-center text-sm leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
