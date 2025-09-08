// frontend/src/features/conversation/chatInterface.jsx
import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "./chatService";

function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am the TATTVA Research Assistant. How can I help you analyze the marine data today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;

    const userMessage = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Optionally fetch dynamic context from database here
      const context = ""; // Placeholder for future dynamic context

      const aiResponseText = await sendChatMessage(inputValue, context);
      const aiMessage = { sender: "ai", text: aiResponseText };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const aiMessage = {
        sender: "ai",
        text: "Sorry, there was an error reaching the AI server.",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-[70vh] flex flex-col">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-lg ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-black p-3 rounded-lg max-w-lg animate-pulse">
                Typing...
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask anything about marine data..."
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || inputValue.trim() === ""}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
