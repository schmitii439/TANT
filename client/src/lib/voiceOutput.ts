// Voice Output Module
// Provides natural German voice synthesis and playback controls

type VoiceConfig = {
  language: string;
  rate: number;
  pitch: number;
  volume: number;
};

// Default voice settings - German female voice, 1.25x speed
const defaultVoiceConfig: VoiceConfig = {
  language: 'de-DE',
  rate: 1.25,
  pitch: 1.0,
  volume: 1.0,
};

// Current voice config
let currentVoiceConfig = { ...defaultVoiceConfig };

// Active utterance
let currentUtterance: SpeechSynthesisUtterance | null = null;

// Playback status
let isPlaying = false;
let isPaused = false;

// Audio context for signal tone
let audioContext: AudioContext | null = null;

// Available voices cache
let availableVoices: SpeechSynthesisVoice[] = [];

// Callbacks for speech events
type SpeechEventCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (error: any) => void;
};

let eventCallbacks: SpeechEventCallbacks = {};

/**
 * Initialize the voice system
 */
export function initVoiceSystem(): Promise<boolean> {
  return new Promise((resolve) => {
    // Get available voices
    if (window.speechSynthesis) {
      // Check if voices are already loaded
      availableVoices = window.speechSynthesis.getVoices();
      
      if (availableVoices.length > 0) {
        console.log(`Loaded ${availableVoices.length} voices`);
        resolve(true);
      } else {
        // Wait for voices to load
        window.speechSynthesis.onvoiceschanged = () => {
          availableVoices = window.speechSynthesis.getVoices();
          console.log(`Loaded ${availableVoices.length} voices`);
          resolve(true);
        };
      }
    } else {
      console.error('Speech synthesis not supported');
      resolve(false);
    }
  });
}

/**
 * Get the best German female voice
 */
export function getBestGermanVoice(): SpeechSynthesisVoice | undefined {
  // Filter for German voices only
  const germanVoices = availableVoices.filter(voice => 
    voice.lang === 'de-DE' || voice.lang.startsWith('de')
  );
  
  if (germanVoices.length === 0) {
    console.warn('No German voices found, using default voice');
    return undefined;
  }
  
  // Prioritize female voices (usually contain 'female', 'frau', or other female terms)
  const femaleVoiceTerms = ['female', 'frau', 'weiblich', 'f'];
  const femalePriority = germanVoices
    .map(voice => ({
      voice,
      score: femaleVoiceTerms.reduce(
        (score, term) => score + (voice.name.toLowerCase().includes(term) ? 1 : 0), 
        0
      )
    }))
    .sort((a, b) => b.score - a.score);
  
  return femalePriority[0]?.voice || germanVoices[0];
}

/**
 * Speaks the provided text with the configured voice
 */
export function speak(
  text: string, 
  config: Partial<VoiceConfig> = {}, 
  callbacks: SpeechEventCallbacks = {}
): void {
  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported');
    if (callbacks.onError) callbacks.onError('Speech synthesis not supported');
    return;
  }
  
  // Stop any current speech
  stop();
  
  // Apply config overrides
  const mergedConfig = { ...currentVoiceConfig, ...config };
  
  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = mergedConfig.language;
  utterance.rate = mergedConfig.rate;
  utterance.pitch = mergedConfig.pitch;
  utterance.volume = mergedConfig.volume;

  // Set the best German female voice
  const bestVoice = getBestGermanVoice();
  if (bestVoice) {
    utterance.voice = bestVoice;
  }
  
  // Set up event handlers
  eventCallbacks = callbacks;
  
  utterance.onstart = () => {
    isPlaying = true;
    isPaused = false;
    if (eventCallbacks.onStart) eventCallbacks.onStart();
  };
  
  utterance.onend = () => {
    isPlaying = false;
    isPaused = false;
    currentUtterance = null;
    if (eventCallbacks.onEnd) eventCallbacks.onEnd();
    playSignalTone();
  };
  
  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
    isPlaying = false;
    isPaused = false;
    if (eventCallbacks.onError) eventCallbacks.onError(event);
  };
  
  // Store the current utterance
  currentUtterance = utterance;
  
  // Start speaking
  window.speechSynthesis.speak(utterance);
}

/**
 * Pauses the current speech
 */
export function pause(): void {
  if (window.speechSynthesis && isPlaying && !isPaused) {
    window.speechSynthesis.pause();
    isPaused = true;
    if (eventCallbacks.onPause) eventCallbacks.onPause();
  }
}

/**
 * Resumes the current speech
 */
export function resume(): void {
  if (window.speechSynthesis && isPlaying && isPaused) {
    window.speechSynthesis.resume();
    isPaused = false;
    if (eventCallbacks.onResume) eventCallbacks.onResume();
  }
}

/**
 * Stops the current speech
 */
export function stop(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    isPlaying = false;
    isPaused = false;
    currentUtterance = null;
  }
}

/**
 * Checks if speech is currently playing
 */
export function isSpeaking(): boolean {
  return isPlaying;
}

/**
 * Checks if speech is currently paused
 */
export function isPauseActive(): boolean {
  return isPaused;
}

/**
 * Gets the current voice configuration
 */
export function getVoiceConfig(): VoiceConfig {
  return { ...currentVoiceConfig };
}

/**
 * Updates the voice configuration
 */
export function updateVoiceConfig(config: Partial<VoiceConfig>): void {
  currentVoiceConfig = { ...currentVoiceConfig, ...config };
}

/**
 * Sets the speech rate
 */
export function setSpeechRate(rate: number): void {
  // Clamp rate between 0.5 and 2
  const clampedRate = Math.min(2.0, Math.max(0.5, rate));
  currentVoiceConfig.rate = clampedRate;
}

/**
 * Gets all available voices for a language
 */
export function getAvailableVoices(langCode?: string): SpeechSynthesisVoice[] {
  if (langCode) {
    return availableVoices.filter(voice => voice.lang.startsWith(langCode));
  }
  return availableVoices;
}

/**
 * Play a soft signal tone to indicate the AI has finished speaking
 */
function playSignalTone(): void {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 880; // A5
    gainNode.gain.value = 0.1; // Very quiet
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Short duration gentle tone
    oscillator.start();
    
    // Fade out
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
    
    // Stop after fade out
    setTimeout(() => {
      oscillator.stop();
    }, 500);
  } catch (error) {
    console.error('Error playing signal tone:', error);
  }
}

// Initialize the voice system when the module is imported
initVoiceSystem().catch(err => console.error('Failed to initialize voice system:', err));