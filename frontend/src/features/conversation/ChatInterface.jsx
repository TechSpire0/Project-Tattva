// src/features/conversation/ChatInterface.jsx
import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import { sendChatMessage } from "./chatService"; // same folder
import ReactMarkdown from "react-markdown";

// Small icon components (as in your new design)
const Send = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m22 2-7 20-4-9-9-4 20-7z" />
  </svg>
);
const Bot = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3 3 3 0 0 0 3-3V5a3 3 0 0 0-3-3z" />
    <path d="M16 11h-8" />
    <path d="M16 15h-8" />
    <path d="M16 7h-8" />
  </svg>
);
const Zap = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m13 2-7 10h4l-3 10 7-10h-4l3-10z" />
  </svg>
);
const FileText = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </svg>
);
const Image = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.08-3.08a2 2 0 0 0-2.83 0L6 21" />
  </svg>
);

// Simple local components
const Card = ({ className = "", children }) => (
  <div className={`border rounded-xl ${className}`}>{children}</div>
);
const CardHeader = ({ className = "", children }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
const CardTitle = ({ className = "", children }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);
const Input = (props) => <input {...props} />;
const ButtonRaw = ({ onClick, className = "", children, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`py-2 px-4 rounded-lg font-medium transition-colors ${className}`}
  >
    {children}
  </button>
);

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am the **TATTVA Research Assistant**. How can I help you analyze the marine data today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    {
      text: "Species distribution",
      icon: FileText,
      category: "Analysis",
      color: "from-purple-400 to-purple-500",
      bgColor: "from-purple-300/10 to-purple-400/20",
    },
    {
      text: "Otolith classification",
      icon: Zap,
      category: "AI",
      color: "from-purple-400 to-pink-500",
      bgColor: "from-purple-300/10 to-pink-300/20",
    },
    {
      text: "eDNA analysis",
      icon: FileText,
      category: "Genomics",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-300/10 to-pink-300/20",
    },
    {
      text: "Temperature trends",
      icon: Zap,
      category: "Climate",
      color: "from-purple-400 to-purple-500",
      bgColor: "from-purple-300/10 to-purple-400/20",
    },
    {
      text: "Species identification",
      icon: Image,
      category: "Vision",
      color: "from-purple-400 to-pink-500",
      bgColor: "from-purple-300/10 to-pink-300/20",
    },
    {
      text: "Migration patterns",
      icon: Zap,
      category: "Prediction",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-300/10 to-pink-300/20",
    },
    {
      text: "Biodiversity metrics",
      icon: FileText,
      category: "Metrics",
      color: "from-purple-400 to-purple-500",
      bgColor: "from-purple-300/10 to-purple-400/20",
    },
    {
      text: "Ocean chemistry",
      icon: Zap,
      category: "Chemical",
      color: "from-purple-400 to-pink-500",
      bgColor: "from-purple-300/10 to-pink-300/20",
    },
  ];

  useEffect(() => {
    // scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;

    const userMessage = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const aiResponseText = await sendChatMessage(inputValue);
      const aiMessage = { sender: "ai", text: aiResponseText };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Error: Could not connect to the Marine AI server.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => setInputValue(prompt);

  return (
    // Root uses full height from parent. DON'T set a fixed viewport height here.
    <div className="grid lg:grid-cols-3 gap-6 h-full min-h-0">
      {/* Chat column - left (spans 2) */}
      <div className="lg:col-span-2 flex flex-col h-full min-h-0">
        <Card className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 flex flex-col h-full min-h-0">
          <CardHeader className="border-b border-gray-700/50 shrink-0">
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="text-white">Marine AI Assistant</span>
              <div className="ml-auto flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-purple-300">Online</span>
              </div>
            </CardTitle>
          </CardHeader>

          {/* MESSAGES: this is the only scrollable area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className="prose prose-invert max-w-none">
                <ChatMessage message={msg} />
              </div>
            ))}

            {isLoading && (
              <ChatMessage message={{ sender: "ai", isLoading: true }} />
            )}

            {/* sentinel for scrolling */}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer / input: shrink-0 so it never gets scrolled out */}
          <div className="shrink-0 border-t border-gray-700/50 p-4 bg-gray-800/80">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about marine data, species identification, or ocean insights..."
                className="flex-1 p-3 border border-gray-600/50 bg-gray-900/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400 transition-all"
                disabled={isLoading}
              />
              <ButtonRaw
                onClick={handleSendMessage}
                disabled={isLoading || inputValue.trim() === ""}
                className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
              >
                <Send className="h-4 w-4" />
              </ButtonRaw>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick prompts sidebar - right */}
      <div className="lg:col-span-1 space-y-6 h-full min-h-0">
        <Card className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 h-full min-h-0">
          <CardHeader className="border-b border-gray-700/50 shrink-0">
            <CardTitle className="text-white">Quick Prompts</CardTitle>
          </CardHeader>

          <div className="p-4 overflow-y-auto">
            {" "}
            {/* allow sidebar internal scroll if many prompts */}
            <div className="grid grid-cols-2 gap-3">
              {quickPrompts.map((prompt, index) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="group relative h-auto p-3 justify-start text-left transition-all duration-300 overflow-hidden text-gray-200 hover:text-white border border-gray-700/50 hover:border-purple-500/50 rounded-lg"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${prompt.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg`}
                    ></div>
                    <div className="relative flex flex-col items-center text-center space-y-2 w-full">
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${prompt.color} bg-opacity-20 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}
                      >
                        <Icon className="h-3.5 w-3.5 text-white/80 group-hover:text-white" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium leading-tight">
                          {prompt.text}
                        </div>
                        <div className="text-[10px] text-gray-400 group-hover:text-gray-300 transition-colors">
                          {prompt.category}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* <div className="mt-4 pt-3 border-t border-gray-700/50">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                <Zap className="h-3 w-3 text-purple-400" />
                <span>Click any prompt to instantly draft a query</span>
              </div>
            </div> */}
          </div>
        </Card>
      </div>
    </div>
  );
}
