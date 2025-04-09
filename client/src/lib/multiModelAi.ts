import { ModelResponse } from '@/types';

// Define the available AI models through Puter.js
export enum AiModel {
  // Deepseek models
  DeepseekChat = 'deepseek-chat',
  DeepseekReasoner = 'deepseek-reasoner',
  
  // Grok models via OpenRouter
  Grok2 = 'openrouter:x-ai/grok-2-1212',
  
  // OpenAI models via Puter.js
  GPT4o = 'gpt-4o',
  GPT4o1Mini = 'gpt-4o-mini',
  GPT4o3Mini = 'gpt-4o-3-mini',
  
  // Claude models via OpenRouter
  Claude35Sonnet = 'claude-3-5-sonnet',
  Claude37Sonnet = 'claude-3-7-sonnet',
  
  // LLaMA models
  Llama31 = 'llama-3.1-8b-instruct',
  Llama4Maverick = 'llama-4-maverick',
  
  // Gemini models
  Gemini25Pro = 'gemini-2.5-pro-exp',
  GeminiFlash = 'gemini-flash',
  GeminiPro = 'gemini-pro',
  
  // Mistral models
  MistralLarge = 'mistral-large-latest',
  Mixtral8x7b = 'mixtral-8x7b',
  Mistral7bInst = 'mistralai/mistral-7b-instruct'
}

// Model capabilities for task-based selection
interface ModelCapability {
  model: AiModel;
  capabilities: {
    coding: number;         // 1-10 rating for coding ability
    reasoning: number;      // 1-10 rating for logical reasoning
    creativity: number;     // 1-10 rating for creative content
    factual: number;        // 1-10 rating for factual accuracy
    financial: number;      // 1-10 rating for financial analysis
    speed: number;          // 1-10 rating for response speed
    contextWindow: number;  // Approximate token limit
  };
  fallbacks: AiModel[];     // Ordered list of fallback models
}

// Define model capabilities for smart routing
const modelCapabilities: ModelCapability[] = [
  {
    model: AiModel.GPT4o,
    capabilities: {
      coding: 9,
      reasoning: 9,
      creativity: 8,
      factual: 8,
      financial: 8,
      speed: 6,
      contextWindow: 128000
    },
    fallbacks: [AiModel.Claude37Sonnet, AiModel.Grok2, AiModel.Llama4Maverick]
  },
  {
    model: AiModel.Grok2,
    capabilities: {
      coding: 8,
      reasoning: 9,
      creativity: 7,
      factual: 8,
      financial: 10,
      speed: 7,
      contextWindow: 131000
    },
    fallbacks: [AiModel.GPT4o, AiModel.Claude37Sonnet, AiModel.MistralLarge]
  },
  {
    model: AiModel.Claude37Sonnet,
    capabilities: {
      coding: 8,
      reasoning: 9,
      creativity: 10,
      factual: 9,
      financial: 8,
      speed: 6,
      contextWindow: 200000
    },
    fallbacks: [AiModel.Claude35Sonnet, AiModel.GPT4o, AiModel.Grok2]
  },
  {
    model: AiModel.Llama4Maverick,
    capabilities: {
      coding: 7,
      reasoning: 8,
      creativity: 7,
      factual: 7,
      financial: 7,
      speed: 8,
      contextWindow: 128000
    },
    fallbacks: [AiModel.Llama31, AiModel.MistralLarge, AiModel.GPT4o1Mini]
  },
  {
    model: AiModel.Gemini25Pro,
    capabilities: {
      coding: 8,
      reasoning: 8,
      creativity: 7,
      factual: 8,
      financial: 8,
      speed: 7,
      contextWindow: 128000
    },
    fallbacks: [AiModel.GeminiPro, AiModel.GeminiFlash, AiModel.GPT4o1Mini]
  },
  {
    model: AiModel.MistralLarge,
    capabilities: {
      coding: 7,
      reasoning: 8,
      creativity: 6,
      factual: 7,
      financial: 7,
      speed: 9,
      contextWindow: 32000
    },
    fallbacks: [AiModel.Mixtral8x7b, AiModel.Mistral7bInst, AiModel.Llama31]
  }
];

// Model groups for specific task domains
const modelGroups = {
  financial: [AiModel.Grok2, AiModel.GPT4o, AiModel.Claude37Sonnet, AiModel.Gemini25Pro],
  creative: [AiModel.Claude37Sonnet, AiModel.GPT4o, AiModel.Grok2, AiModel.Gemini25Pro],
  factual: [AiModel.GPT4o, AiModel.Claude37Sonnet, AiModel.Grok2, AiModel.MistralLarge],
  coding: [AiModel.GPT4o, AiModel.DeepseekChat, AiModel.Grok2, AiModel.Llama4Maverick],
  fast: [AiModel.MistralLarge, AiModel.GeminiFlash, AiModel.GPT4o1Mini, AiModel.Mixtral8x7b]
};

// Chat message tone options for personality
export enum ChatTone {
  Witty = 'witty',
  Logical = 'logical',
  Skeptical = 'skeptical',
  DarkHumor = 'dark-humor',
  Unbiased = 'unbiased',
  WarCommander = 'war-commander',
  SarcasticOracle = 'sarcastic-oracle',
  Friendly = 'friendly'
}

/**
 * Dynamically selects the best AI model for a given task
 * @param message User message to analyze
 * @param category Optional task category to help with model selection
 * @param tone Optional tone preference for response
 * @returns The selected model ID
 */
export function selectBestModel(
  message: string,
  category?: 'financial' | 'news' | 'coding' | 'creative' | 'factual',
  tone?: ChatTone
): AiModel {
  // Financial keywords
  const financialKeywords = ['stock', 'market', 'invest', 'crypto', 'finance', 'trading', 'price',
    'portfolio', 'asset', 'currency', 'bitcoin', 'ethereum', 'risk', 'inflation', 'economy'];
  
  // News-related keywords
  const newsKeywords = ['news', 'event', 'headline', 'report', 'announced', 'published',
    'latest', 'breaking', 'update', 'development', 'yesterday', 'today', 'article'];
  
  // Coding keywords
  const codingKeywords = ['code', 'program', 'function', 'class', 'algorithm', 'bug', 'error',
    'javascript', 'python', 'react', 'typescript', 'npm', 'git', 'api', 'variable'];
  
  // Creative content keywords
  const creativeKeywords = ['create', 'story', 'write', 'design', 'imagine', 'creative',
    'narrative', 'fiction', 'poem', 'description', 'visualization', 'scene', 'character'];
  
  // Factual/research keywords
  const factualKeywords = ['explain', 'research', 'study', 'fact', 'history', 'science',
    'definition', 'statistics', 'analysis', 'evidence', 'data', 'information', 'source'];
  
  // Count keyword matches to determine the likely category
  let financialCount = 0;
  let newsCount = 0;
  let codingCount = 0;
  let creativeCount = 0;
  let factualCount = 0;
  
  const lowercaseMsg = message.toLowerCase();
  
  financialKeywords.forEach(keyword => {
    if (lowercaseMsg.includes(keyword.toLowerCase())) financialCount++;
  });
  
  newsKeywords.forEach(keyword => {
    if (lowercaseMsg.includes(keyword.toLowerCase())) newsCount++;
  });
  
  codingKeywords.forEach(keyword => {
    if (lowercaseMsg.includes(keyword.toLowerCase())) codingCount++;
  });
  
  creativeKeywords.forEach(keyword => {
    if (lowercaseMsg.includes(keyword.toLowerCase())) creativeCount++;
  });
  
  factualKeywords.forEach(keyword => {
    if (lowercaseMsg.includes(keyword.toLowerCase())) factualCount++;
  });
  
  // If a category is explicitly specified, prioritize that
  if (category) {
    switch (category) {
      case 'financial':
        return modelGroups.financial[0];
      case 'news':
        return modelGroups.factual[0];
      case 'coding':
        return modelGroups.coding[0];
      case 'creative':
        return modelGroups.creative[0];
      case 'factual':
        return modelGroups.factual[0];
    }
  }
  
  // Otherwise determine based on keyword analysis
  const scores = [
    { category: 'financial', score: financialCount },
    { category: 'news', score: newsCount },
    { category: 'coding', score: codingCount },
    { category: 'creative', score: creativeCount },
    { category: 'factual', score: factualCount }
  ].sort((a, b) => b.score - a.score);
  
  // Get the highest scoring category
  const topCategory = scores[0].category;
  
  // If tone is specified, adjust model selection
  if (tone) {
    switch (tone) {
      case ChatTone.Witty:
      case ChatTone.DarkHumor:
      case ChatTone.SarcasticOracle:
        return AiModel.Claude37Sonnet; // Claude is best for witty/creative tones
      case ChatTone.Logical:
      case ChatTone.Unbiased:
      case ChatTone.Skeptical:
        return AiModel.Grok2; // Grok is good for logical/analytical responses
      case ChatTone.WarCommander:
        return AiModel.GPT4o; // GPT-4o handles role-playing well
      case ChatTone.Friendly:
        return AiModel.Llama4Maverick; // Llama-4 has a friendly disposition
    }
  }
  
  // Final model selection based on content category
  switch (topCategory) {
    case 'financial':
      return modelGroups.financial[0];
    case 'news':
      return modelGroups.factual[0];
    case 'coding':
      return modelGroups.coding[0];
    case 'creative':
      return modelGroups.creative[0];
    case 'factual':
      return modelGroups.factual[0];
    default:
      // Default to GPT-4o as a general-purpose model
      return AiModel.GPT4o;
  }
}

/**
 * Get fallback models for a given model
 * @param model The primary model that might fail
 * @returns Array of fallback models in order of preference
 */
export function getFallbackModels(model: AiModel): AiModel[] {
  const capability = modelCapabilities.find(m => m.model === model);
  if (capability) {
    return capability.fallbacks;
  }
  
  // Default fallback chain if model isn't in our capabilities list
  return [AiModel.GPT4o, AiModel.Claude37Sonnet, AiModel.MistralLarge, AiModel.GeminiFlash];
}

/**
 * Formats system message based on desired tone
 * @param tone The personality tone for the response
 * @returns System message to control AI response style
 */
function getSystemMessageForTone(tone: ChatTone): string {
  switch (tone) {
    case ChatTone.Witty:
      return "You are a witty assistant with a clever sense of humor. Your responses should be intelligent but with subtle wit and occasional jokes. Keep your answers informative but with a light, clever touch.";
    
    case ChatTone.Logical:
      return "You are a strictly logical assistant focused on clear reasoning. Present your thoughts in a structured, step-by-step manner with minimal emotional language. Prioritize accuracy and logical consistency above all else.";
    
    case ChatTone.Skeptical:
      return "You are a skeptical assistant who questions assumptions. Examine claims critically, point out potential flaws in reasoning, and consider alternative explanations. Don't accept statements at face value without evaluating the evidence.";
    
    case ChatTone.DarkHumor:
      return "You are an assistant with a dark sense of humor. Your responses should be informative but incorporate subtle dark jokes, irony, and a slightly cynical worldview. Don't be offensive, but don't shy away from the absurdity of difficult topics.";
    
    case ChatTone.Unbiased:
      return "You are a completely neutral and unbiased assistant. Present multiple perspectives on issues fairly, avoid inserting personal opinions, and maintain objectivity at all times. Your goal is to provide balanced information without leaning toward any particular viewpoint.";
    
    case ChatTone.WarCommander:
      return "You are a strategic war commander assistant. Your communication style is authoritative, direct, and focused on decisive action. Use military-like precision in your language, be confident in your assessments, and provide clear, actionable intelligence.";
    
    case ChatTone.SarcasticOracle:
      return "You are a sarcastic oracle with profound knowledge but a caustic delivery. Your responses should blend deep wisdom with sarcasm and irony. You see through human folly and point it out with a sharp wit while still providing valuable insights.";
    
    case ChatTone.Friendly:
      return "You are a warm, approachable assistant with a friendly demeanor. Your tone should be conversational, supportive, and encouraging. Use casual language, show empathy, and make the user feel comfortable and understood.";
    
    default:
      return "You are a helpful, harmless, and honest assistant. Provide accurate, concise information in a neutral tone.";
  }
}

// Track the last few models used to prevent repetition
let lastUsedModels: AiModel[] = [];

/**
 * Get a random model, avoiding recently used ones
 * @returns A randomly selected model
 */
export function getRandomModel(): AiModel {
  const allModels = Object.values(AiModel);
  
  // Filter out recently used models if possible
  const availableModels = allModels.filter(model => !lastUsedModels.includes(model));
  
  // If we've used all models recently, just pick any
  const models = availableModels.length > 0 ? availableModels : allModels;
  
  // Select a random model
  const randomIndex = Math.floor(Math.random() * models.length);
  const selectedModel = models[randomIndex];
  
  // Add to recently used and keep track of last 3
  lastUsedModels.unshift(selectedModel);
  if (lastUsedModels.length > 3) {
    lastUsedModels.pop();
  }
  
  return selectedModel;
}

/**
 * Sends a message to an AI model for chat completion
 * @param message The user message
 * @param model Optional specific model to use
 * @param tone Optional tone for the response
 * @param stream Whether to stream the response
 * @returns Promise with the model's response
 */
export async function sendModelMessage(
  message: string,
  model?: AiModel,
  tone?: ChatTone,
  stream: boolean = false
): Promise<string> {
  // Select model if not specified
  const selectedModel = model || selectBestModel(message, undefined, tone);
  
  try {
    // Prepare the system message based on tone
    const systemMessage = tone ? getSystemMessageForTone(tone) : undefined;
    
    // Construct messages for the AI
    const messages = systemMessage 
      ? [{ role: 'system', content: systemMessage }, { role: 'user', content: message }]
      : message;
    
    // Call the Puter.js AI chat API
    const response = await window.puter.ai.chat(messages, {
      model: selectedModel,
      stream: stream,
      temperature: 0.7
    });
    
    // Handle streamed responses
    if (stream) {
      // Return a placeholder - streaming will be handled by the UI component
      return "[Response is being streamed]";
    }
    
    // Return the content for non-streamed responses
    return response.message?.content || response.choices[0].message.content;
    
  } catch (error) {
    console.error(`Error with model ${selectedModel}:`, error);
    
    // Try fallback models
    const fallbacks = getFallbackModels(selectedModel);
    
    // Try each fallback model in sequence
    for (const fallbackModel of fallbacks) {
      try {
        console.log(`Trying fallback model: ${fallbackModel}`);
        
        const fallbackResponse = await window.puter.ai.chat(message, {
          model: fallbackModel,
          stream: false
        });
        
        return fallbackResponse.message?.content || fallbackResponse.choices[0].message.content;
      } catch (fallbackError) {
        console.error(`Fallback model ${fallbackModel} also failed:`, fallbackError);
        // Continue to next fallback
      }
    }
    
    // If all models fail, return an error message
    return `Sorry, I'm having trouble connecting to the AI models right now. Please try again later.`;
  }
}

/**
 * Compares responses from multiple models to the same query
 * @param message The user message to send to multiple models
 * @param models Array of models to compare
 * @returns Promise with responses from each model
 */
export async function compareModelResponses(
  message: string,
  models: AiModel[] = [AiModel.GPT4o, AiModel.Claude37Sonnet, AiModel.Grok2, AiModel.Llama4Maverick]
): Promise<ModelResponse[]> {
  // Use Promise.allSettled to handle cases where some models might fail
  const responsePromises = models.map(model => {
    return sendModelMessage(message, model)
      .then(content => ({
        model: model as string,
        content,
        timestamp: new Date()
      }))
      .catch(error => ({
        model: model as string,
        content: `Error with ${model}: ${error.message}`,
        timestamp: new Date()
      }));
  });
  
  const responses = await Promise.all(responsePromises);
  
  // Return all responses (errors are handled in the catch above)
  return responses.map(response => ({
    model: response.model,
    content: response.content,
    timestamp: response.timestamp
  }));
}

/**
 * Generates a response using randomly selected models for chaotic inspiration
 * @param message The user message
 * @returns Promise with chaotic response
 */
export async function getChaoticResponse(message: string): Promise<ModelResponse> {
  // Pick a random model
  const randomModel = getRandomModel();
  
  // Pick a random tone
  const tones = Object.values(ChatTone);
  const randomTone = tones[Math.floor(Math.random() * tones.length)];
  
  try {
    const content = await sendModelMessage(message, randomModel, randomTone);
    
    return {
      model: randomModel,
      content,
      timestamp: new Date()
    };
  } catch (error) {
    // If the random model fails, fall back to a reliable one
    const fallbackContent = await sendModelMessage(
      message, 
      AiModel.GPT4o,
      ChatTone.Witty
    );
    
    return {
      model: `${randomModel} (failed, using GPT-4o fallback)`,
      content: fallbackContent,
      timestamp: new Date()
    };
  }
}