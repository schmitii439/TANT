// Declaration file for Puter.js API
interface PuterAIChat {
  chat: (
    message: string | Array<{role: string; content: string}>,
    options?: {
      model?: string;
      stream?: boolean;
      temperature?: number;
      maxTokens?: number;
    }
  ) => Promise<any> | AsyncIterable<any>;
}

interface PuterAPI {
  ai: PuterAIChat;
  print: (message: string) => void;
}

declare global {
  interface Window {
    puter: PuterAPI;
  }
  
  const puter: PuterAPI;
}

export {};