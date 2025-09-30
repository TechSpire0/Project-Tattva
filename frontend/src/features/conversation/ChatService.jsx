import apiClient from "../../services/apiClient";

/**
 * Sends the user's message to the backend chat API endpoint.
 * @param {string} userInput - The message entered by the user.
 * @param {string} context - Optional context/session ID for the chat.
 * @returns {Promise<string>} The AI-generated response text.
 */
export const sendChatMessage = async (userInput, context = "") => {
  // Simulate network latency and processing time for better UX, even if the API call is fast.
  const delayPromise = new Promise(resolve => setTimeout(resolve, 500)); 

  try {
    const apiCallPromise = apiClient.post("/chat", {
      user_input: userInput,
      context,
    });

    // Wait for both the API response and the minimum delay
    const [response] = await Promise.all([apiCallPromise, delayPromise]);

    return (
      response.data.reply ||
      "Sorry, I couldn't generate a specific marine insight at this time."
    );
  } catch (error) {
    console.error("Error sending chat message:", error);
    // Provide a helpful, themed error message
    return "Error: Could not connect to the Marine AI server. Please check the network or backend status.";
  }
};
