import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  Image as ImageIcon, 
  Video, 
  Volume2, 
  VolumeX,
  Expand,
  Shrink
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
}

export function MediaModeControls({
  mediaMode,
  onMediaModeChange,
  systemMode,
  onSystemModeChange,
  volumeLevel,
  onVolumeChange,
  isVoiceEnabled,
  onVoiceToggle
}: MediaModeControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center space-x-4">
        <Tabs
          value={mediaMode}
          onValueChange={(value) => onMediaModeChange(value as MediaMode)}
          className="w-[400px]"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="voice" className="flex items-center">
              <Mic className="h-4 w-4 mr-2" />
              <span>Sprache</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              <span>Bild</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center">
              <Video className="h-4 w-4 mr-2" />
              <span>Video</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {mediaMode === 'voice' && (
          <>
            <div className="flex items-center space-x-3 min-w-[180px]">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={onVoiceToggle}
                title={isVoiceEnabled ? "Voice output on" : "Voice output off"}
              >
                {isVoiceEnabled ? (
                  <Volume2 className="h-4 w-4 text-green-500" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              
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
          </>
        )}
      </div>
      
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <Label 
                  htmlFor="system-mode" 
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  {systemMode === 'focused' ? "Fokussierter Modus" : "Vollständiger Modus"}
                </Label>
                <Switch 
                  id="system-mode" 
                  checked={systemMode === 'focused'} 
                  onCheckedChange={(checked) => 
                    onSystemModeChange(checked ? 'focused' : 'full-chat')
                  }
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => 
                    onSystemModeChange(systemMode === 'focused' ? 'full-chat' : 'focused')
                  }
                >
                  {systemMode === 'focused' ? (
                    <Expand className="h-3 w-3" />
                  ) : (
                    <Shrink className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {systemMode === 'focused' 
                  ? "Fokussiert auf die aktuelle Aufgabe" 
                  : "Zeigt alle Funktionen an"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}