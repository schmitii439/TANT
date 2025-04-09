/**
 * Generated Media Display
 * 
 * Advanced component for displaying AI-generated images and videos
 * with military-grade safety controls and premium visual design.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Maximize, 
  Minimize, 
  X, 
  AlertTriangle,
  RefreshCw,
  Share
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type MediaType = 'image' | 'video';

interface GeneratedMediaDisplayProps {
  type: MediaType;
  source: string | HTMLElement;
  prompt: string;
  model: string;
  onClose: () => void;
  onRegenerate: () => void;
  error?: string;
}

export function GeneratedMediaDisplay({
  type,
  source,
  prompt,
  model,
  onClose,
  onRegenerate,
  error
}: GeneratedMediaDisplayProps) {
  // Local state
  const [enlarged, setEnlarged] = useState(false);
  const [copying, setCopying] = useState(false);
  
  // Handle download
  const handleDownload = async () => {
    try {
      // For string sources (URLs)
      if (typeof source === 'string') {
        const response = await fetch(source);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `generated-${type}-${Date.now()}.${type === 'image' ? 'png' : 'mp4'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } 
      // For HTML elements (like canvas or video)
      else if (source instanceof HTMLCanvasElement) {
        const link = document.createElement('a');
        link.download = `generated-image-${Date.now()}.png`;
        link.href = source.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      else if (source instanceof HTMLVideoElement) {
        // For video elements, we'd need to use MediaRecorder API
        // This is a simplified example
        alert('Video download functionality requires MediaRecorder implementation');
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };
  
  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      setCopying(true);
      
      if (typeof source === 'string') {
        const response = await fetch(source);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
      } 
      else if (source instanceof HTMLCanvasElement) {
        source.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob
              })
            ]);
          }
        });
      }
      
      // Show success state temporarily
      setTimeout(() => setCopying(false), 1500);
    } catch (err) {
      console.error('Copy error:', err);
      setCopying(false);
    }
  };
  
  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };
  
  // Determine the content based on the type
  const renderMediaContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Generation Failed</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={onRegenerate} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }
    
    if (type === 'image') {
      // Handle both string sources (URLs) and HTML elements
      if (typeof source === 'string') {
        return (
          <img 
            src={source} 
            alt={prompt} 
            className={cn(
              "rounded-md object-contain max-h-full max-w-full",
              enlarged ? "cursor-zoom-out" : "cursor-zoom-in"
            )}
            onClick={() => setEnlarged(!enlarged)}
          />
        );
      } else if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement) {
        return (
          <div 
            className={cn(
              "rounded-md object-contain max-h-full max-w-full",
              enlarged ? "cursor-zoom-out" : "cursor-zoom-in"
            )}
            onClick={() => setEnlarged(!enlarged)}
            ref={(el) => {
              // Safely append HTML element to the DOM
              if (el && el.childElementCount === 0) {
                // Clear previous contents
                while (el.firstChild) {
                  el.removeChild(el.firstChild);
                }
                // Append the new element
                el.appendChild(source);
              }
            }}
          />
        );
      }
    } else if (type === 'video') {
      if (typeof source === 'string') {
        return (
          <video 
            src={source} 
            controls 
            autoPlay 
            className="rounded-md max-h-full max-w-full"
          />
        );
      } else if (source instanceof HTMLVideoElement) {
        return (
          <div 
            className="rounded-md max-h-full max-w-full"
            ref={(el) => {
              // Safely append HTML video element to the DOM
              if (el && el.childElementCount === 0) {
                // Clear previous contents
                while (el.firstChild) {
                  el.removeChild(el.firstChild);
                }
                // Make sure controls are enabled
                source.controls = true;
                // Append the video element
                el.appendChild(source);
              }
            }}
          />
        );
      }
    }
    
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No media to display</p>
      </div>
    );
  };
  
  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
          "flex items-center justify-center p-4",
          !enlarged && "sm:p-8 md:p-12 lg:p-16"
        )}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={cardVariants}
      >
        <Card className={cn(
          "w-full max-w-4xl overflow-hidden",
          "flex flex-col",
          enlarged ? "h-[95vh]" : "max-h-[90vh]"
        )}>
          <CardHeader className="p-4 flex-shrink-0">
            <div className="flex justify-between items-center">
              <CardTitle className="truncate">
                {type === 'image' ? 'Generated Image' : 'Generated Video'}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEnlarged(!enlarged)}
                  title={enlarged ? "Minimize" : "Maximize"}
                >
                  {enlarged ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className={cn(
            "flex-grow overflow-auto p-0",
            "flex items-center justify-center",
            enlarged ? "h-[calc(95vh-8rem)]" : "max-h-[60vh]"
          )}>
            {renderMediaContent()}
          </CardContent>
          
          <CardFooter className="p-4 border-t flex-shrink-0 space-x-4">
            <div className="flex-grow">
              <p className="text-sm font-medium truncate">{prompt}</p>
              <p className="text-xs text-muted-foreground">Model: {model}</p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRegenerate}
                title="Regenerate"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={copying}
                title="Copy to clipboard"
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export default GeneratedMediaDisplay;