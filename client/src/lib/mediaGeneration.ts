/**
 * Media Generation Module
 * 
 * Provides high-performance, secure interfaces for generating images and videos
 * using various AI models. Implements strict content safety policies.
 */

// Safety protocols for content generation
const SAFETY_KEYWORDS = [
  'violent', 'violence', 'gore', 'blood', 'murder', 'kill',
  'pornographic', 'porn', 'nude', 'naked', 'sex', 'sexual',
  'child', 'kid', 'infant', 'baby', 'minor', 'underage',
  'weapon', 'gun', 'terrorist', 'bomb', 'explosive'
];

interface GenerationOptions {
  model?: string;
  safetyChecks?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: string;
  testMode?: boolean;
}

const DEFAULT_OPTIONS: GenerationOptions = {
  safetyChecks: true,
  size: 'medium',
  testMode: false
};

/**
 * Checks if a prompt contains prohibited content
 * @param prompt The user prompt to check
 * @returns True if the prompt contains prohibited content
 */
export function containsProhibitedContent(prompt: string): boolean {
  const lowercasePrompt = prompt.toLowerCase();
  return SAFETY_KEYWORDS.some(keyword => lowercasePrompt.includes(keyword));
}

/**
 * Generates an image from a text prompt
 * @param prompt The text prompt to generate an image from
 * @param options Generation options
 * @returns Promise that resolves to the image data (blob or URL)
 */
export async function generateImage(prompt: string, options: GenerationOptions = {}): Promise<string | HTMLImageElement> {
  // Merge with default options
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Safety check
  if (mergedOptions.safetyChecks && containsProhibitedContent(prompt)) {
    throw new Error("SECURITY VIOLATION: The prompt contains prohibited content. Image generation blocked.");
  }
  
  try {
    // Use Puter.js for image generation
    // Puter.js is loaded globally but types may not be complete
    if (typeof window !== 'undefined' && 'puter' in window) {
      // @ts-ignore - Puter.js txt2img API
      const image = await window.puter.ai.txt2img(prompt, mergedOptions.safetyChecks);
      return image;
    } else {
      throw new Error("Image generation service unavailable. Puter.js required.");
    }
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
}

/**
 * Generates a video from a text prompt
 * @param prompt The text prompt to generate a video from
 * @param options Generation options
 * @returns Promise that resolves to the video data
 */
export async function generateVideo(prompt: string, options: GenerationOptions = {}): Promise<string | HTMLVideoElement> {
  // Merge with default options
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Safety check
  if (mergedOptions.safetyChecks && containsProhibitedContent(prompt)) {
    throw new Error("SECURITY VIOLATION: The prompt contains prohibited content. Video generation blocked.");
  }
  
  try {
    // Use Puter.js for video generation with Gemini model
    if (typeof window !== 'undefined' && 'puter' in window) {
      const model = mergedOptions.model || 'google/gemini-video'; 
      // @ts-ignore - Puter.js txt2vid API
      const video = await window.puter.ai.txt2vid(prompt, { 
        model: model,
        testMode: mergedOptions.testMode 
      });
      return video;
    } else {
      throw new Error("Video generation service unavailable. Puter.js with Gemini integration required.");
    }
  } catch (error) {
    console.error('Video generation error:', error);
    throw error;
  }
}

/**
 * Checks if image generation is available
 * @returns True if image generation is available
 */
export function isImageGenerationAvailable(): boolean {
  if (typeof window !== 'undefined' && 'puter' in window) {
    // @ts-ignore - Puter.js txt2img API
    return typeof window.puter.ai?.txt2img === 'function';
  }
  return false;
}

/**
 * Checks if video generation is available
 * @returns True if video generation is available
 */
export function isVideoGenerationAvailable(): boolean {
  if (typeof window !== 'undefined' && 'puter' in window) {
    // @ts-ignore - Puter.js txt2vid API
    return typeof window.puter.ai?.txt2vid === 'function';
  }
  return false;
}

/**
 * Gets available models for image generation
 * @returns Array of available model names
 */
export function getAvailableImageModels(): string[] {
  return ['dall-e-3', 'stable-diffusion-xl'];
}

/**
 * Gets available models for video generation
 * @returns Array of available model names
 */
export function getAvailableVideoModels(): string[] {
  return ['google/gemini-video'];
}