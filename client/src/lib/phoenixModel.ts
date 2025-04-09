/**
 * PHÖNIX Model - Multi-model synthesis engine
 * Combines outputs from multiple AI models to create enhanced, refined responses
 */

import { ModelResponse } from '@/types';
import { AiModel, selectBestModel, compareModelResponses, sendModelMessage } from './multiModelAi';
import { isConspiracyModeActive, transformPromptForConspiracyMode } from './conspiracyMode';
import { shouldRespondInGerman, transformPromptForLanguage } from './languageController';

// Default model selector for PHÖNIX synthesizer
const PHOENIX_SYNTHESIZER_MODEL = AiModel.GPT4o;

// Default models to include in the synthesis process
const DEFAULT_SYNTHESIS_MODELS = [
  AiModel.GPT4o,
  AiModel.Claude37Sonnet,
  AiModel.Grok2,
  AiModel.Llama4Maverick,
  AiModel.MistralLarge
];

// Configurable number of models to use in synthesis
const DEFAULT_MODEL_COUNT = 3;

/**
 * Interface for PHÖNIX response options
 */
export interface PhoenixOptions {
  modelsToUse?: AiModel[];
  modelCount?: number;
  includeRawResponses?: boolean;
  synthesizer?: AiModel;
  temperature?: number;
}

/**
 * Interface for PHÖNIX response object
 */
export interface PhoenixResponse {
  synthesizedResponse: string;
  rawResponses?: ModelResponse[];
  elapsedTime: number;
  modelsUsed: string[];
}

/**
 * Phoenix model - The multi-model synthesis engine
 * @param prompt User input to process
 * @param options Configuration options for the synthesis
 * @returns Promise with synthesized response
 */
export async function phoenixModel(
  prompt: string,
  options: PhoenixOptions = {}
): Promise<PhoenixResponse> {
  const startTime = Date.now();
  
  // Apply language and conspiracy mode transformations
  let transformedPrompt = prompt;
  
  // Apply conspiracy mode transformation if active
  if (isConspiracyModeActive()) {
    transformedPrompt = transformPromptForConspiracyMode(transformedPrompt);
  }
  
  // Apply language transformation
  transformedPrompt = transformPromptForLanguage(transformedPrompt);
  
  // Set default options
  const {
    modelsToUse = DEFAULT_SYNTHESIS_MODELS,
    modelCount = DEFAULT_MODEL_COUNT,
    includeRawResponses = false,
    synthesizer = PHOENIX_SYNTHESIZER_MODEL,
    temperature = 0.7
  } = options;
  
  // Ensure modelCount doesn't exceed available models
  const effectiveModelCount = Math.min(modelCount, modelsToUse.length);
  
  // Select models to use (either take all or select a subset)
  let selectedModels: AiModel[];
  
  if (effectiveModelCount >= modelsToUse.length) {
    // Use all specified models
    selectedModels = [...modelsToUse];
  } else {
    // Select a subset of models based on task suitability
    const taskModel = selectBestModel(prompt);
    
    // Always include the task-specific model
    selectedModels = [taskModel];
    
    // Add other models avoiding duplicates
    const remainingModels = modelsToUse.filter(model => model !== taskModel);
    
    // Shuffle and select remaining models
    const shuffled = remainingModels.sort(() => 0.5 - Math.random());
    
    // Fill up to the desired count
    while (selectedModels.length < effectiveModelCount && shuffled.length > 0) {
      selectedModels.push(shuffled.pop()!);
    }
  }
  
  // Get responses from all selected models
  console.log(`PHÖNIX querying ${selectedModels.length} models: ${selectedModels.join(', ')}`);
  const modelResponses = await compareModelResponses(transformedPrompt, selectedModels);
  
  // If we only have one response, return it directly
  if (modelResponses.length === 1) {
    const elapsedTime = Date.now() - startTime;
    return {
      synthesizedResponse: modelResponses[0].content,
      rawResponses: includeRawResponses ? modelResponses : undefined,
      elapsedTime,
      modelsUsed: [modelResponses[0].model]
    };
  }
  
  // Filter out error responses
  const validResponses = modelResponses.filter(resp => 
    !resp.content.includes("Error with") && 
    !resp.content.includes("Sorry, I'm having trouble")
  );
  
  // If no valid responses, return an error
  if (validResponses.length === 0) {
    const elapsedTime = Date.now() - startTime;
    return {
      synthesizedResponse: "Alle Modelle konnten keine Antwort generieren. Bitte versuchen Sie es später erneut.",
      rawResponses: includeRawResponses ? modelResponses : undefined,
      elapsedTime,
      modelsUsed: selectedModels.map(m => m.toString())
    };
  }
  
  // If we still have only one valid response, return it directly
  if (validResponses.length === 1) {
    const elapsedTime = Date.now() - startTime;
    return {
      synthesizedResponse: validResponses[0].content,
      rawResponses: includeRawResponses ? modelResponses : undefined,
      elapsedTime,
      modelsUsed: [validResponses[0].model]
    };
  }
  
  // Prepare synthesis prompt with all model responses
  const rawResponsesText = validResponses
    .map(response => `${response.model}:\n${response.content}\n---`)
    .join('\n\n');
  
  // Language-aware synthesis instruction
  const synthesisInstructionPrefix = shouldRespondInGerman(prompt)
    ? "Du bist PHÖNIX, die Synthese-Engine für multiple KI-Modelle. Deine Aufgabe ist es, die besten Elemente aus allen folgenden Modellantworten zu kombinieren und zu verfeinern."
    : "You are PHÖNIX, the multi-model synthesis engine. Your task is to combine and refine the best elements from all of the following model responses.";
  
  const synthesisPrompt = `${synthesisInstructionPrefix}

User Query: "${prompt}"

Model Responses:
${rawResponsesText}

Instructions for Synthesis:
1. Combine the most accurate, helpful, and insightful elements from each response.
2. Resolve any contradictions with the most credible information.
3. Maintain a coherent tone and logical flow in your synthesized response.
4. Be comprehensive but concise - focus on quality information over length.
5. Do not mention that you are combining responses or reference the individual models.
6. Create a response that appears as if it came from a single, highly capable assistant.
7. Preserve critical nuance and insights from specialized models.
8. If appropriate, include creative elements from more innovative responses.

Your synthesized response:`;

  // Get synthesized response from the synthesizer model
  let synthesizedContent;
  try {
    synthesizedContent = await sendModelMessage(
      synthesisPrompt,
      synthesizer,
      undefined,
      false
    );
  } catch (error) {
    console.error("Error during PHÖNIX synthesis:", error);
    
    // If synthesis fails, return the best individual response
    const bestResponse = validResponses[0];
    const elapsedTime = Date.now() - startTime;
    
    return {
      synthesizedResponse: bestResponse.content,
      rawResponses: includeRawResponses ? modelResponses : undefined,
      elapsedTime,
      modelsUsed: [bestResponse.model, "Synthesis failed - using best model"]
    };
  }
  
  const elapsedTime = Date.now() - startTime;
  
  // Return the complete PHÖNIX response
  return {
    synthesizedResponse: synthesizedContent,
    rawResponses: includeRawResponses ? modelResponses : undefined,
    elapsedTime,
    modelsUsed: selectedModels.map(m => m.toString()).concat([synthesizer])
  };
}

/**
 * Simple version of PHÖNIX that only uses specific models
 * @param prompt User input to process
 * @param models Specific models to use
 * @returns Promise with synthesized response
 */
export async function phoenixSpecificModels(
  prompt: string,
  models: AiModel[] = [AiModel.Claude37Sonnet, AiModel.Grok2]
): Promise<string> {
  const response = await phoenixModel(prompt, {
    modelsToUse: models,
    modelCount: models.length,
    includeRawResponses: false
  });
  
  return response.synthesizedResponse;
}

/**
 * Fast version of PHÖNIX that uses fewer models for quicker responses
 * @param prompt User input to process
 * @returns Promise with synthesized response
 */
export async function phoenixFast(prompt: string): Promise<string> {
  const fastModels = [
    AiModel.MistralLarge,
    AiModel.Llama31,
    AiModel.GeminiFlash
  ];
  
  const response = await phoenixModel(prompt, {
    modelsToUse: fastModels,
    modelCount: 2,
    synthesizer: AiModel.MistralLarge,
    includeRawResponses: false
  });
  
  return response.synthesizedResponse;
}

/**
 * Deep analysis version of PHÖNIX using the most capable models
 * @param prompt User input to process
 * @param useConspiracyMode Whether to use conspiracy mode for deeper analysis
 * @param collectedData Optional data to incorporate in analysis
 * @returns Promise with synthesized response
 */
export async function phoenixDeep(
  prompt: string, 
  useConspiracyMode: boolean = false,
  collectedData?: any
): Promise<PhoenixResponse> {
  const deepModels = [
    AiModel.GPT4o,
    AiModel.Claude37Sonnet,
    AiModel.Grok2,
    AiModel.DeepseekReasoner
  ];
  
  // If we have collected data, append it to the prompt for context
  let enhancedPrompt = prompt;
  
  if (collectedData) {
    // Format data for analysis
    const dataContext = typeof collectedData === 'string' 
      ? collectedData 
      : JSON.stringify(collectedData, null, 2);
    
    enhancedPrompt = `${prompt}\n\nRelevante Hintergrund-Daten für die Analyse:\n${dataContext}`;
  }
  
  // Apply conspiracy mode transformation if specified
  if (useConspiracyMode) {
    enhancedPrompt = transformPromptForConspiracyMode(enhancedPrompt);
  }
  
  return phoenixModel(enhancedPrompt, {
    modelsToUse: deepModels,
    modelCount: deepModels.length,
    includeRawResponses: true
  });
}