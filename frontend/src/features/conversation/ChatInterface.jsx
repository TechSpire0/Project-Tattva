import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

// --- Static AI Brain (Dummy API) ---
// We'll use this object to simulate AI responses based on keywords.
const staticResponses = {
  "default": "I'm sorry, I can only answer questions about 'salinity', 'temperature', and 'mackerel'. Please try one of those topics.",
  "salinity": "Salinity in the Arabian Sea typically ranges from 35 to 37 PSU. Our data indicates a strong negative correlation between high salinity and chlorophyll concentration.",
  "temperature": "The average sea surface temperature in the dataset is 28.5°C. Temperature is a key factor in the distribution of Indian Oil Sardine.",
  "mackerel": "Indian Mackerel (Rastrelliger kanagurta) is one of the most common species in the dataset, with over 40 sightings recorded in the last year.",
};

// A simple function to simulate the AI finding a response.
const getDummyAIResponse = (prompt) => {
  const lowerCasePrompt = prompt.toLowerCase();
  if (lowerCasePrompt.includes('salinity')) return staticResponses.salinity;
  if (lowerCasePrompt.includes('temperature')) return staticResponses.temperature;
  if (lowerCasePrompt.includes('mackerel')) return staticResponses.mackerel;
  return staticResponses.default;
};
// --- End of Static AI Brain ---

function ChatInterface() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am the TATTVA Research Assistant. How can I help you analyze the marine data today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // This effect automatically scrolls to the bottom whenever a new message is added.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '' || isLoading) return;

    // 1. Add the user's message to the chat
    const userMessage = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 2. Simulate the AI "thinking" and responding
    setTimeout(() => {
      const aiResponseText = getDummyAIResponse(inputValue);
      const aiMessage = { sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500); // Simulate a 1.5-second delay
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-[70vh] flex flex-col">
      {/* Message Display Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoading && <ChatMessage message={{ sender: 'ai', isLoading: true }} />}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about salinity, temperature, or mackerel..."
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || inputValue.trim() === ''}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md
                       hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;