// Function to convert text to speech
export function speak(text: string, onEnd?: () => void): void {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis is not supported in this browser.');
    return;
  }
  
  // Stop any current speech
  stopSpeaking();
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Configure the utterance
  utterance.lang = 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  // Set voice (use a system voice if available)
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    // Try to find a good English voice
    const englishVoice = voices.find(voice => 
      voice.lang.includes('en-') && voice.name.includes('Google') || 
      voice.name.includes('Microsoft')
    );
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
  }
  
  // Handle events
  if (onEnd) {
    utterance.onend = onEnd;
  }
  
  window.speechSynthesis.speak(utterance);
}

// Function to stop any ongoing speech
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
