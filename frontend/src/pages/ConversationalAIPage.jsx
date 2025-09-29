// frontend/src/pages/ConversationalAIpage.jsx
import React from "react";
import ChatInterface from "../features/conversation/ChatInterface";
function ConversationalAIPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Conversational AI for TATTVA
        </h1>
        <p className="mt-1 text-gray-600">
          Ask any question related to the marine dataset, and I will provide
          insights based on the available information.
        </p>
      </div>

      {/* The main chat feature is encapsulated in its own component. */}
      <ChatInterface />
    </div>
  );
}

export default ConversationalAIPage;
