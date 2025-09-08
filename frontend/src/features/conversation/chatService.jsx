// src/features/conversation/chatService.js
import apiClient from "../../services/apiClient";

export const sendChatMessage = async (userInput, context = "") => {
  try {
    const response = await apiClient.post("/chat", {
      user_input: userInput,
      context,
    });
    return (
      response.data.reply ||
      "Sorry, I couldn't generate a response at this time."
    );
  } catch (error) {
    console.error("Error sending chat message:", error);
    return "Sorry, there was an error reaching the AI server.";
  }
};
