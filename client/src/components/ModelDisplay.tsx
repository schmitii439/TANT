import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Cpu, 
  Bot, 
  Shuffle, 
  Sparkles, 
  RotateCcw 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type AiModelType = 
  | 'auto' 
  | 'gpt-4o' 
  | 'claude-3-7-sonnet' 
  | 'grok-2'
  | 'llama-4-maverick'
  | 'phoenix'; 

export interface ModelDisplayProps {
  modelName: string;
  onModelChange: (model: string) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

export function ModelDisplay({
  modelName,
  onModelChange,
  onRegenerate,
  isRegenerating = false
}: ModelDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Handle model icons based on model name
  const getModelIcon = () => {
    if (modelName.toLowerCase().includes('phoenix') || modelName.toLowerCase().includes('phönix')) {
      return <Brain className="h-4 w-4 mr-1.5 text-purple-500" />;
    } else if (modelName.toLowerCase().includes('gpt') || modelName.toLowerCase().includes('openai')) {
      return <Sparkles className="h-4 w-4 mr-1.5 text-green-500" />;
    } else if (modelName.toLowerCase().includes('claude')) {
      return <Bot className="h-4 w-4 mr-1.5 text-amber-500" />;
    } else if (modelName.toLowerCase().includes('grok')) {
      return <Cpu className="h-4 w-4 mr-1.5 text-red-500" />;
    } else if (modelName.toLowerCase().includes('llama')) {
      return <Bot className="h-4 w-4 mr-1.5 text-blue-500" />;
    } else if (modelName.toLowerCase().includes('random') || modelName.toLowerCase().includes('chaotic')) {
      return <Shuffle className="h-4 w-4 mr-1.5 text-indigo-500" />;
    }
    
    return <Bot className="h-4 w-4 mr-1.5 text-primary" />;
  };
  
  // Format the model name for display
  const getFormattedModelName = () => {
    if (modelName.includes('(') && modelName.includes(')')) {
      // If it's a multi-model response (e.g., "PHÖNIX (gpt-4o, claude-3-7-sonnet)")
      const baseName = modelName.split('(')[0].trim();
      const modelsList = modelName.split('(')[1].split(')')[0];
      return (
        <>
          <span className="font-semibold">{baseName}</span>
          <span className="text-xs opacity-70"> ({modelsList})</span>
        </>
      );
    }
    
    return modelName;
  };
  
  return (
    <div className="inline-flex items-center">
      {isEditing ? (
        // Model selection when editing
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-2 items-center"
        >
          <Select
            defaultValue={modelName}
            onValueChange={(value) => {
              onModelChange(value);
              setIsEditing(false);
            }}
          >
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Modell wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (System wählt)</SelectItem>
              <SelectItem value="gpt-4o">OpenAI GPT-4o</SelectItem>
              <SelectItem value="claude-3-7-sonnet">Claude 3.7 Sonnet</SelectItem>
              <SelectItem value="grok-2">Grok 2</SelectItem>
              <SelectItem value="llama-4-maverick">Llama 4 Maverick</SelectItem>
              <SelectItem value="phoenix">PHÖNIX (Multi-Modell)</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsEditing(false)}
          >
            <span className="sr-only">Cancel</span>
            &times;
          </Button>
        </motion.div>
      ) : (
        // Model display when not editing
        <Badge 
          variant="outline" 
          className={cn(
            "flex items-center hover:bg-secondary/50 cursor-pointer transition-colors px-3 h-6 gap-0.5",
            "bg-background text-foreground"
          )}
          onClick={() => setIsEditing(true)}
        >
          {getModelIcon()}
          <span className="text-xs whitespace-nowrap">
            {getFormattedModelName()}
          </span>
        </Badge>
      )}
      
      {/* Regenerate button */}
      {!isEditing && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-6 w-6"
                onClick={onRegenerate}
                disabled={isRegenerating}
              >
                <RotateCcw className={cn(
                  "h-3 w-3",
                  isRegenerating && "animate-spin"
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mit neuem Modell antworten</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}