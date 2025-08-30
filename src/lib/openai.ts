// Placeholder for OpenAI chatbot service
// Replace with your actual implementation

export const chatbotService = {
  async sendMessage(message: string) {
    // This is a mock response. Replace with actual OpenAI API call.
    return {
      id: Date.now(),
      text: `Echo: ${message}`,
      createdAt: new Date().toISOString(),
      sender: 'bot',
    };
  },
};
