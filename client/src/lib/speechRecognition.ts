// Speech recognition functionality
export function initializeSpeechRecognition(): SpeechRecognition | null {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error('Speech recognition is not supported in this browser.');
    return null;
  }
  
  // Use the appropriate constructor based on browser support
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || 
                              (window as any).webkitSpeechRecognition;
  
  const recognition = new SpeechRecognitionAPI();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  
  return recognition;
}

// Global recognition instance to be reused
let recognitionInstance: SpeechRecognition | null = null;

export function getSpeechRecognition(): SpeechRecognition | null {
  if (!recognitionInstance) {
    recognitionInstance = initializeSpeechRecognition();
  }
  return recognitionInstance;
}
