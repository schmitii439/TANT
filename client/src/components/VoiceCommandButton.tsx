import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { speak } from '@/lib/speechSynthesis';
import type { TabId } from '@/types';

interface VoiceCommandButtonProps {
  setActiveTab: (tab: TabId) => void;
  microphoneActive: boolean;
  toggleMicrophone: () => void;
}

export function VoiceCommandButton({ 
  setActiveTab, 
  microphoneActive,
  toggleMicrophone
}: VoiceCommandButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const { transcript, listening, startListening, stopListening } = useSpeechRecognition();
  
  useEffect(() => {
    if (!listening && isListening) {
      setIsListening(false);
    }
    
    if (transcript) {
      processCommand(transcript);
    }
  }, [transcript, listening]);
  
  const toggleVoiceCommands = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
      
      // Auto-stop after 5 seconds if no speech detected
      setTimeout(() => {
        if (isListening) {
          stopListening();
          setIsListening(false);
        }
      }, 5000);
    }
  };
  
  const processCommand = (command: string) => {
    // Convert to lowercase for easier matching
    const cmd = command.toLowerCase();
    
    // Tab navigation commands
    if (cmd.includes('switch to') || cmd.includes('go to')) {
      if (cmd.includes('assistant')) {
        setActiveTab('assistant');
        speak('Switching to assistant tab');
      } else if (cmd.includes('news')) {
        setActiveTab('news');
        speak('Switching to news tab');
      } else if (cmd.includes('stocks') || cmd.includes('stock')) {
        setActiveTab('stocks');
        speak('Switching to stocks tab');
      } else if (cmd.includes('crypto') || cmd.includes('cryptocurrency')) {
        setActiveTab('crypto');
        speak('Switching to crypto tab');
      } else if (cmd.includes('tools') || cmd.includes('tool')) {
        setActiveTab('tools');
        speak('Switching to tools tab');
      }
    }
    
    // Feature toggle commands
    else if (cmd.includes('enable microphone') || cmd.includes('turn on microphone')) {
      if (!microphoneActive) {
        toggleMicrophone();
        speak('Microphone enabled');
      }
    } else if (cmd.includes('disable microphone') || cmd.includes('turn off microphone')) {
      if (microphoneActive) {
        toggleMicrophone();
        speak('Microphone disabled');
      }
    }
    
    // If no command matched
    else {
      setActiveTab('assistant');
      // The actual query will be handled by the assistant tab
    }
  };

  return (
    <Button 
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
      variant="default"
      onClick={toggleVoiceCommands}
    >
      <Mic className={`h-6 w-6 ${isListening ? 'animate-pulse' : ''}`} />
    </Button>
  );
}
