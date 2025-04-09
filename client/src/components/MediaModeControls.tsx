import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Video, 
  Volume2, 
  VolumeX,
  Expand,
  Shrink,
  Shuffle,
  Brain
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type MediaMode = 'voice' | 'image' | 'video';
export type SystemMode = 'full-chat' | 'focused';

export interface MediaModeControlsProps {
  mediaMode: MediaMode;
  onMediaModeChange: (mode: MediaMode) => void;
  systemMode: SystemMode;
  onSystemModeChange: (mode: SystemMode) => void;
  volumeLevel: number;
  onVolumeChange: (value: number) => void;
  isVoiceEnabled: boolean;
  onVoiceToggle: () => void;
  useRandomModel?: boolean;
  onRandomModelToggle?: () => void;
}

export function MediaModeControls({
  mediaMode,
  onMediaModeChange,
  systemMode,
  onSystemModeChange,
  volumeLevel,
  onVolumeChange,
  isVoiceEnabled,
  onVoiceToggle,
  useRandomModel = false,
  onRandomModelToggle = () => {}
}: MediaModeControlsProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        {/* Media mode tabs at the top left */}
        <Tabs
          value={mediaMode}
          onValueChange={(value) => onMediaModeChange(value as MediaMode)}
        >
          <TabsList className="p-1 h-9">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="voice" 
                    className={cn(
                      "rounded-md px-3 h-7",
                      mediaMode === 'voice' && "bg-white/90 shadow-md"
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Sprache</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="image" 
                    className={cn(
                      "rounded-md px-3 h-7",
                      mediaMode === 'image' && "bg-white/90 shadow-md"
                    )}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Bild generieren</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="video" 
                    className={cn(
                      "rounded-md px-3 h-7",
                      mediaMode === 'video' && "bg-white/90 shadow-md"
                    )}
                  >
                    <Video className="h-4 w-4" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Video generieren</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TabsList>
        </Tabs>

        {/* Random model toggle next to the tabs */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-md", 
                  useRandomModel && "bg-white/90 shadow-md"
                )}
                onClick={onRandomModelToggle}
              >
                <Shuffle className={cn("h-4 w-4", useRandomModel ? "text-primary" : "text-muted-foreground")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Zufälliger Modellmodus</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
              >
                <Brain className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>PHÖNIX Modell</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Focus mode control in the middle */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 rounded-md",
                systemMode === 'focused' && "bg-white/90 shadow-md"
              )}
              onClick={() => 
                onSystemModeChange(systemMode === 'focused' ? 'full-chat' : 'focused')
              }
            >
              {systemMode === 'focused' ? (
                <Expand className="h-4 w-4" />
              ) : (
                <Shrink className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {systemMode === 'focused' 
                ? "Fokussiert auf die aktuelle Aufgabe" 
                : "Vollständiger Modus"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Volume slider - shown vertically in the FloatingMicrophoneControl */}
      <div className="hidden">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Slider 
                value={[volumeLevel]} 
                max={100} 
                step={10}
                disabled={!isVoiceEnabled}
                onValueChange={(values) => onVolumeChange(values[0])}
                className="w-24"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Lautstärke: {volumeLevel}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}