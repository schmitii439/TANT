import { useState, useEffect, useCallback } from 'react';
import { getSpeechRecognition } from '@/lib/speechRecognition';

interface SpeechRecognitionHook {
  transcript: string;
  listening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  browserSupportsSpeechRecognition: boolean;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [browserSupport, setBrowserSupport] = useState(true);
  
  // Initialize recognition once
  useEffect(() => {
    const recognitionInstance = getSpeechRecognition();
    
    if (!recognitionInstance) {
      setBrowserSupport(false);
      return;
    }
    
    setRecognition(recognitionInstance);
    
    // Set up recognition event handlers
    recognitionInstance.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      setTranscript(finalTranscript || interimTranscript);
    };
    
    recognitionInstance.onend = () => {
      setListening(false);
    };
    
    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
    };
    
    return () => {
      // Clean up
      if (recognitionInstance) {
        recognitionInstance.onresult = null;
        recognitionInstance.onend = null;
        recognitionInstance.onerror = null;
        
        if (listening) {
          try {
            recognitionInstance.stop();
          } catch (e) {
            // Ignore errors when stopping
          }
        }
      }
    };
  }, []);
  
  const startListening = useCallback(() => {
    if (!recognition) return;
    
    setTranscript('');
    
    try {
      recognition.start();
      setListening(true);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  }, [recognition]);
  
  const stopListening = useCallback(() => {
    if (!recognition) return;
    
    try {
      recognition.stop();
      setListening(false);
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }, [recognition]);
  
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);
  
  return {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition: browserSupport
  };
}
