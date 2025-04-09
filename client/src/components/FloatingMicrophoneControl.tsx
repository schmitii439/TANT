import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FloatingMicrophoneControlProps {
  listening: boolean;
  onToggle: () => void;
  transcript: string;
  expanded: boolean;
  onExpandToggle: () => void;
}

export function FloatingMicrophoneControl({
  listening,
  onToggle,
  transcript,
  expanded,
  onExpandToggle
}: FloatingMicrophoneControlProps) {
  return (
    <motion.div
      className={cn(
        "fixed bottom-24 right-4 z-50 flex flex-col items-end",
        "rounded-xl shadow-lg overflow-hidden"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
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