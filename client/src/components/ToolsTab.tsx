import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, Mic, FileText, AlertCircle } from 'lucide-react';
import { processImageOcr } from '@/lib/ocrService';
import type { OcrData } from '@/types';

export function ToolsTab() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Reset previous results
    setOcrResult(null);
    setOcrError(null);
    
    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const processImage = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setOcrError("Please select an image first");
      return;
    }
    
    const file = fileInputRef.current.files[0];
    setIsProcessing(true);
    
    try {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      const result = await processImageOcr(dataUrl);
      setOcrResult(result);
    } catch (error) {
      console.error("OCR processing error:", error);
      setOcrError("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const resetOcr = () => {
    setOcrResult(null);
    setOcrError(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <Camera className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-medium">OCR Tool</h2>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Upload a photo of a document to convert it to text using optical character recognition.
          </p>
          
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-4">
            <input 
              type="file" 
              id="image-input" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden" 
            />
            <label htmlFor="image-input" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload an image</p>
                <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
              </div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-lg p-3 h-60 flex items-center justify-center">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Image preview will appear here</p>
                </div>
              )}
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3 h-60 overflow-y-auto">
              {isProcessing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-primary animate-bounce"></div>
                      <div className="w-3 h-3 rounded-full bg-primary animate-bounce delay-100"></div>
                      <div className="w-3 h-3 rounded-full bg-primary animate-bounce delay-200"></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Processing image...</p>
                  </div>
                </div>
              ) : ocrError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-red-500">{ocrError}</p>
                  </div>
                </div>
              ) : ocrResult ? (
                <pre className="text-sm whitespace-pre-wrap">{ocrResult}</pre>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Extracted text will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" onClick={resetOcr}>
              Reset
            </Button>
            <Button onClick={processImage} disabled={!imagePreview || isProcessing}>
              {isProcessing ? 'Processing...' : 'Extract Text'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <Mic className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-medium">Voice Command Guide</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-md font-medium mb-2">Assistant Commands</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>"Tell me about [topic]"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>"Analyze [stock/cryptocurrency]"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>"Compare [model1] and [model2] for [topic]"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>"Summarize today's financial news"</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Navigation & Actions</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>"Switch to [tab name] tab"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>"Read the latest news"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>"Show me [stock/crypto] prices"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>"Open the OCR tool"</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
