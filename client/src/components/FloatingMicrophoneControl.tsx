import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ChevronUp, ChevronDown, Volume2, VolumeX, ChevronRight, ChevronLeft } from 'lucide-react';
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
  const [volumeExpanded, setVolumeExpanded] = useState(false);

  return (
    <motion.div
      className={cn(
        "fixed bottom-4 left-4 z-50 flex flex-col items-start",
        "rounded-xl shadow-lg overflow-visible"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Horizontal volume control next to the microphone */}
      <div className="flex items-center mb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10", 
                  "rounded-full hover:scale-105 transition-transform",
                  isVoiceEnabled && "bg-white/90 shadow-sm",
                  volumeExpanded && "selected-item-glow"
                )}
                onClick={() => {
                  onVoiceToggle();
                  setVolumeExpanded(prev => !prev);
                }}
              >
                {isVoiceEnabled ? (
                  <Volume2 className="h-5 w-5 text-green-500" />
                ) : (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Sprachausgabe {isVoiceEnabled ? 'ein' : 'aus'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <AnimatePresence>
          {volumeExpanded && isVoiceEnabled && (
            <motion.div 
              className="ml-2 bg-background/80 backdrop-blur-sm rounded-lg shadow-md p-2 flex items-center"
              initial={{ opacity: 0, width: 0, x: -20 }}
              animate={{ opacity: 1, width: 'auto', x: 0 }}
              exit={{ opacity: 0, width: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Slider
                value={[volumeLevel]}
                max={100}
                step={10}
                className="w-32"
                onValueChange={(values) => onVolumeChange(values[0])}
              />
              <span className="text-xs font-medium ml-2 min-w-[32px]">{volumeLevel}%</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center">
        {expanded && (
          <motion.div
            className="bg-background border rounded-xl p-3 shadow-md"
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
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="mt-1 h-6 w-6 rounded-full opacity-70 hover:opacity-100 hover:scale-110 transition-transform ml-3"
        onClick={onExpandToggle}
      >
        {expanded ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </Button>
    </motion.div>
  );
}