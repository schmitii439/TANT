import { ModelResponse } from '@/types';

// Function to send a chat message to a specific AI model
export async function sendChatMessage(message: string, model: string): Promise<any> {
  try {
    // Use Puter.js to call the selected AI model
    return await puter.ai.chat(message, { model });
  } catch (error) {
    console.error(`Error with ${model}:`, error);
    throw error;
  }
}

// Function to compare responses from multiple models
export async function compareModels(
  message: string, 
  models: string[] = [
    'claude-3-7-sonnet', 
    'google/gemini-2.5-pro-exp-03-25:free',
    'openrouter:x-ai/grok-2-1212',
    'deepseek-chat', 
    'meta-llama/llama-4-maverick'
  ]
): Promise<ModelResponse[]> {
  const responses: ModelResponse[] = [];
  
  // First get responses from all models in parallel
  const responsePromises = models.map(model => {
    return sendChatMessage(message, model)
      .then(response => ({
        model,
        content: response.message.content,
        timestamp: new Date()
      }))
      .catch(error => ({
        model,
        content: `Error: ${error.message}`,
        timestamp: new Date()
      }));
  });
  
  try {
    const results = await Promise.all(responsePromises);
    return results;
  } catch (error) {
    console.error("Error comparing models:", error);
    throw error;
  }
}

// Function to analyze and select the best response
export async function getBestResponse(message: string): Promise<ModelResponse> {
  try {
    const responses = await compareModels(message);
    
    // Return the most detailed response
    // (In a real scenario, you'd have more sophisticated logic here)
    const sortedResponses = [...responses].sort(
      (a, b) => b.content.length - a.content.length
    );
    
    return sortedResponses[0];
  } catch (error) {
    console.error("Error getting best response:", error);
    throw error;
  }
}
