// src/features/conversation/chatService.js
import apiClient from "../../services/apiClient";

export const sendChatMessage = async (userInput, context = "") => {
  const delayPromise = new Promise((resolve) => setTimeout(resolve, 500)); // small UX delay

  try {
    const apiCallPromise = apiClient.post("/chat", {
      user_input: userInput,
      context,
    });

    const [response] = await Promise.all([apiCallPromise, delayPromise]);

    return (
      response.data.reply ||
      "Sorry, I couldn't generate a specific marine insight at this time."
    );
  } catch (error) {
    console.error("Error sending chat message:", error);
    return "Error: Could not connect to the Marine AI server. Please check the network or backend status.";
  }
};
