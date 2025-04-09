import React, { useState, useEffect } from 'react';
import { Pause, Play, Square, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { speak, stop, pause, resume, isSpeaking, isPauseActive, setSpeechRate, getVoiceConfig } from '@/lib/voiceOutput';

interface VoicePlaybackControlsProps {
  text: string;
  messageId: number;
}

export function VoicePlaybackControls({ text, messageId }: VoicePlaybackControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRateState] = useState(getVoiceConfig().rate);
  
  // Handle speech status updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Check if this message is currently being spoken
      setIsPlaying(isSpeaking());
      setIsPaused(isPauseActive());
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  // Event handlers
  const handlePlay = () => {
    if (isPaused) {
      resume();
    } else {
      speak(text, { rate: speechRate }, {
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onPause: () => setIsPaused(true),
        onResume: () => setIsPaused(false),
        onError: () => {
          setIsPlaying(false);
          setIsPaused(false);
        }
      });
    }
  };
  
  const handlePause = () => {
    pause();
    setIsPaused(true);
  };
  
  const handleStop = () => {
    stop();
    setIsPlaying(false);
    setIsPaused(false);
  };
  
  const handleRateChange = (value: number[]) => {
    const newRate = value[0];
    setSpeechRateState(newRate);
    setSpeechRate(newRate);
  };
  
  return (
    <div className="flex items-center space-x-1 mt-1">
      {/* Play/Pause button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={isPlaying && !isPaused ? handlePause : handlePlay}
        title={isPlaying && !isPaused ? "Pause" : "Play"}
      >
        {isPlaying && !isPaused ? (
          <Pause className="h-3 w-3" />
        ) : (
          <Play className="h-3 w-3" />
        )}
      </Button>
      
      {/* Stop button (only visible during playback) */}
      {(isPlaying || isPaused) && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleStop}
          title="Stop"
        >
          <Square className="h-3 w-3" />
        </Button>
      )}
      
      {/* Speed settings (only shown when not at max rate) */}
      {speechRate < 2.0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="Speed Settings"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Speech Rate</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs">0.5×</span>
                <Slider
                  defaultValue={[speechRate]}
                  max={2.0}
                  min={0.5}
                  step={0.1}
                  onValueChange={handleRateChange}
                  className="flex-1"
                />
                <span className="text-xs">2.0×</span>
              </div>
              <div className="text-center text-sm">
                Current: {speechRate.toFixed(1)}×
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}