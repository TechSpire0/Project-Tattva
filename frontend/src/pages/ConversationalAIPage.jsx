// src/pages/ConversationalAIPage.jsx
import React from "react";
import ChatInterface from "../features/conversation/ChatInterface";

export default function ConversationalAIPage() {
  return (
    // Full-screen flex column layout
    <div className="flex flex-col h-screen bg-transparent">
      {/* Header Section */}
      <div className="shrink-0 p-4 lg:p-6">
        <div className="relative overflow-hidden rounded-xl">
          {/* Gradient animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-xl"></div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-purple-300/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>

          {/* Title + subtitle */}
          <div className="relative p-6 text-center space-y-2">
            <h1 className="text-4xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Conversational AI
            </h1>
            <p className="text-lg bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              Intelligent marine data analysis and insights
            </p>
          </div>
        </div>
      </div>

      {/* Chat area (fills remaining space, scrollable) */}
      <div className="flex-1 min-h-0 px-4 lg:px-6 pb-6">
        <ChatInterface />
      </div>
    </div>
  );
}
