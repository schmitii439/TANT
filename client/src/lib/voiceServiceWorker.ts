// Voice Service Worker
// Ensure voice synthesis and recognition services are preloaded

export function preloadVoiceAPIs() {
  // Preload speech synthesis voices
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    
    // In some browsers, voices are loaded asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };

    console.log("Speech synthesis API preloaded");
  } else {
    console.warn("Speech synthesis not supported in this browser");
  }
  
  // Check for speech recognition availability 
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    console.log("Speech recognition API available");
  } else {
    console.warn("Speech recognition not supported in this browser");
  }
}

// Handle voice permissions
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Stop the stream immediately, we just needed permission
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    console.error('Microphone permission denied or error occurred:', error);
    return false;
  }
}