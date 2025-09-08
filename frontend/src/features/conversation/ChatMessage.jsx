// frontend/src/features/conversation/chatMessage.jsx
import React from "react";

// A "presentational" component for displaying a single chat bubble.
// Its appearance changes based on whether the sender is the 'user' or the 'ai'.
function ChatMessage({ message }) {
  const { sender, text, isLoading } = message;
  const isUser = sender === "user";

  // Typing indicator for when the AI is "thinking"
  if (isLoading) {
    return (
      <div className="flex justify-start">
        <div className="bg-gray-200 text-black p-3 rounded-lg max-w-lg flex items-center space-x-2">
          <span className="block w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
          <span className="block w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
          <span className="block w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`p-3 rounded-lg max-w-lg ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
        }`}
      >
        <p>{text}</p>
      </div>
    </div>
  );
}

export default ChatMessage;
