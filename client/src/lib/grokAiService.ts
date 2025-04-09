import { ModelResponse } from '../types';

interface GrokCompletionOptions {
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

interface GrokImageResponse {
  analysis: string;
  objects: string[];
  sentiment: string;
  technicalAnalysis?: {
    patterns?: string[];
    indicators?: Record<string, number>;
    recommendation?: string;
  };
}

/**
 * Sends a message to Grok AI for text-only completion
 * @param message The user message text
 * @param options Optional configuration parameters
 * @returns The model's response
 */
export async function getGrokCompletion(
  message: string, 
  options: GrokCompletionOptions = {}
): Promise<string> {
  try {
    // Check if we have the XAI_API_KEY
    if (!import.meta.env.VITE_XAI_API_KEY) {
      return "API key for xAI (Grok) is missing. Please configure it in your environment.";
    }

    // First try to use the Puter.js integration if available
    if (window.puter && window.puter.ai) {
      try {
        const response = await window.puter.ai.chat(message, {
          model: "grok-2-1212",
          ...options
        });
        return response.choices[0].message.content;
      } catch (puterError) {
        console.warn("Puter.js integration failed, falling back to direct API call:", puterError);
      }
    }
    
    // Fallback to direct API call
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "grok-2-1212",
        messages: [{ role: "user", content: message }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error("Error calling Grok API:", error);
    throw new Error(`Failed to get completion from Grok: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Analyzes financial data using Grok to provide insights and predictions
 * @param assetData Financial data about the asset
 * @param assetType Type of asset (stock, crypto)
 * @returns Analysis and prediction data
 */
export async function analyzeFinancialData(
  assetData: any,
  assetType: 'stock' | 'crypto'
): Promise<{analysis: string, prediction: any}> {
  const prompt = `
    You are a financial expert analyzing ${assetType} data. 
    Please provide a detailed analysis and future prediction for the following ${assetType}:
    
    ${JSON.stringify(assetData, null, 2)}
    
    Include in your analysis:
    1. Key patterns and trends
    2. Technical analysis insights
    3. Risk assessment
    4. Short-term prediction (24-48 hours)
    5. Medium-term outlook (1-2 weeks)
    
    Format your response as a JSON object with the following fields:
    {
      "analysis": "Detailed analysis text here...",
      "prediction": {
        "shortTerm": {
          "direction": "up/down/sideways",
          "confidence": 0-1 value,
          "rationale": "Brief explanation"
        },
        "mediumTerm": {
          "direction": "up/down/sideways",
          "confidence": 0-1 value,
          "rationale": "Brief explanation"
        }
      }
    }
  `;

  try {
    const responseText = await getGrokCompletion(prompt, { temperature: 0.3 });
    // Extract the JSON portion from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsedResponse = JSON.parse(jsonMatch[0]);
      return parsedResponse;
    } else {
      throw new Error("Could not parse JSON from Grok response");
    }
  } catch (error) {
    console.error("Error analyzing financial data with Grok:", error);
    return {
      analysis: "Error analyzing financial data. Please try again later.",
      prediction: {
        shortTerm: { direction: "unknown", confidence: 0, rationale: "Analysis error" },
        mediumTerm: { direction: "unknown", confidence: 0, rationale: "Analysis error" }
      }
    };
  }
}

/**
 * Analyzes news content using Grok to provide relevance to financial markets
 * @param newsContent The news article or content
 * @param assetSymbols Optional array of asset symbols to check for impact
 * @returns Analysis of news impact on markets/assets
 */
export async function analyzeNewsImpact(
  newsContent: string,
  assetSymbols?: string[]
): Promise<{
  impact: string;
  affectedAssets: Array<{symbol: string, impact: 'positive' | 'negative' | 'neutral', magnitude: number}>;
  summary: string;
}> {
  const symbolsContext = assetSymbols?.length 
    ? `Specifically analyze the impact on these assets: ${assetSymbols.join(', ')}.` 
    : 'Analyze impact on general market conditions and major assets.';
  
  const prompt = `
    As a financial news analyst, analyze the following news content and determine its impact on financial markets.
    ${symbolsContext}
    
    News Content:
    "${newsContent}"
    
    Provide your response as a JSON object with the following structure:
    {
      "impact": "Overall market impact assessment",
      "affectedAssets": [
        {
          "symbol": "Asset symbol",
          "impact": "positive/negative/neutral",
          "magnitude": number from 0-10,
          "reason": "Brief explanation of why"
        }
      ],
      "summary": "Brief summary of the news and its financial relevance"
    }
  `;

  try {
    const responseText = await getGrokCompletion(prompt, { temperature: 0.3 });
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Could not parse JSON from Grok response");
    }
  } catch (error) {
    console.error("Error analyzing news impact with Grok:", error);
    return {
      impact: "Unable to determine impact at this time",
      affectedAssets: [],
      summary: "Error analyzing news content. Please try again later."
    };
  }
}

/**
 * Formats the response from all AI models and selects the best one
 * @param responses The responses from different AI models
 * @returns The best response with model attribution
 */
export function getBestAIResponse(responses: ModelResponse[]): ModelResponse {
  // If Grok is available, prioritize it for financial analysis
  const grokResponse = responses.find(r => r.model.toLowerCase().includes('grok'));
  if (grokResponse) {
    return grokResponse;
  }
  
  // Otherwise, select best response based on content length and quality heuristics
  return responses.reduce((best, current) => {
    // Simple heuristic: longer responses often have more detail
    // This could be improved with more sophisticated quality metrics
    if (current.content.length > best.content.length * 1.2) {
      return current;
    }
    return best;
  }, responses[0]);
}

/**
 * Analyzes a chart image using Grok vision capabilities
 * @param imageBase64 The base64-encoded image
 * @returns Analysis of the chart including patterns and insights
 */
export async function analyzeChartImage(imageBase64: string): Promise<GrokImageResponse> {
  try {
    // First check if we can use Puter.js
    if (window.puter && window.puter.ai) {
      try {
        const prompt = `Analyze this financial chart image (base64: ${imageBase64.slice(0, 20)}...). Identify patterns, trends, and provide technical analysis. Format your response as a JSON object with keys: analysis (string), objects (array of strings), sentiment (string), and technicalAnalysis (object with patterns, indicators, and recommendation).`;
        
        const response = await window.puter.ai.chat(prompt, {
          model: "grok-2-vision-1212"
        });
        
        const content = response.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (puterError) {
        console.warn("Puter.js vision analysis failed, falling back to direct API call:", puterError);
      }
    }
    
    // Fallback to direct API call
    if (!import.meta.env.VITE_XAI_API_KEY) {
      return {
        analysis: "API key for xAI (Grok) is missing. Please configure it in your environment.",
        objects: [],
        sentiment: "unknown"
      };
    }
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "grok-2-vision-1212",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this financial chart image. Identify patterns, trends, and provide technical analysis. Format your response as a JSON object with keys: analysis (string), objects (array of strings), sentiment (string), and technicalAnalysis (object with patterns, indicators, and recommendation)."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1024
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Could not parse JSON from Grok vision response");
    }
  } catch (error) {
    console.error("Error analyzing chart image with Grok:", error);
    return {
      analysis: "Error analyzing chart image. Please try again later.",
      objects: [],
      sentiment: "unknown"
    };
  }
}