import React from 'react';
import ChatInterface from '../features/conversation/ChatInterface';
// Removed: import ConversationalAI from '../components/ConversationalAI'; // Assuming ChatInterface handles the logic now

function ConversationalAIPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Colorful Header - Matching the new design aesthetic */}
      <div className="relative overflow-hidden rounded-xl">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-xl"></div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-purple-300/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative p-6">
          <div className="space-y-2">
            <h1 className="text-3xl text-white">
              <span>Conversational AI</span>
            </h1>
            <p className="text-lg bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              Intelligent marine data analysis and insights
            </p>
          </div>
        </div>
      </div>

      {/* The main chat feature */}
      <ChatInterface />
    </div>
  );
}

export default ConversationalAIPage;