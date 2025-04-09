import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ChevronUp, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface FloatingMicrophoneControlProps {
  listening: boolean;
  onToggle: () => void;
  transcript: string;
  expanded: boolean;
  onExpandToggle: () => void;
  volumeLevel?: number;
  onVolumeChange?: (volume: number) => void;
  isVoiceEnabled?: boolean;
  onVoiceToggle?: () => void;
}

export function FloatingMicrophoneControl({
  listening,
  onToggle,
  transcript,
  expanded,
  onExpandToggle,
  volumeLevel = 70,
  onVolumeChange = () => {},
  isVoiceEnabled = true,
  onVoiceToggle = () => {}
}: FloatingMicrophoneControlProps) {
  return (
    <motion.div
      className={cn(
        "fixed bottom-24 right-4 z-50 flex flex-col items-end",
        "rounded-xl shadow-lg overflow-visible"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Vertical volume slider above the microphone */}
      <AnimatePresence>
        {isVoiceEnabled && (
          <motion.div 
            className="mb-3 bg-background/80 backdrop-blur-sm rounded-lg shadow-md p-2 flex flex-col items-center"
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: 20 }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 mb-2", 
                      "rounded-full",
                      isVoiceEnabled && "bg-white/90 shadow-sm"
                    )}
                    onClick={onVoiceToggle}
                  >
                    {isVoiceEnabled ? (
                      <Volume2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Sprachausgabe {isVoiceEnabled ? 'ein' : 'aus'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Slider
              orientation="vertical"
              value={[volumeLevel]}
              max={100}
              step={10}
              className="h-32"
              onValueChange={(values) => onVolumeChange(values[0])}
            />
            <span className="text-xs font-medium mt-1">{volumeLevel}%</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center">
        {expanded && (
          <motion.div
            className="bg-background border rounded-l-xl p-3 shadow-md"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
          >
            <div className="w-64 max-w-full">
              <p className="text-sm font-medium mb-1">Spracherkennung:</p>
              <div className="bg-muted/40 rounded-md p-2 text-sm min-h-[60px] max-h-[120px] overflow-y-auto">
                {transcript || (
                  <span className="text-muted-foreground italic">
                    {listening ? "Ich höre dir zu..." : "Starte die Spracherkennung..."}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggle}
                variant={listening ? "destructive" : "default"}
                size="icon"
                className={cn(
                  "h-12 w-12",
                  "rounded-full shadow-md",
                  listening && "mic-ripple glow-primary",
                  expanded ? "rounded-l-none" : "rounded-full"
                )}
              >
                {listening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{listening ? "Spracherkennung beenden" : "Spracherkennung starten"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="mt-1 h-6 w-6 rounded-full opacity-70 hover:opacity-100"
        onClick={onExpandToggle}
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronUp className="h-3 w-3" />
        )}
      </Button>
    </motion.div>
  );
}