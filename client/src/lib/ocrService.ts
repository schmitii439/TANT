import { apiRequest } from '@/lib/queryClient';
import { OcrData } from '@/types';

// Function to process an image with OCR
export async function processImageOcr(imageDataUrl: string): Promise<string> {
  try {
    // Use Puter.js OCR capabilities
    const text = await puter.ai.img2txt(imageDataUrl);
    
    // Save the OCR result to the server
    await saveOcrResult({
      fileName: "uploaded_image.jpg", // Placeholder filename
      extractedText: text,
      imageUrl: imageDataUrl
    });
    
    return text;
  } catch (error) {
    console.error("OCR processing error:", error);
    throw error;
  }
}

// Function to save OCR result to the server
async function saveOcrResult(data: {
  fileName?: string;
  extractedText: string;
  imageUrl?: string;
}): Promise<OcrData> {
  try {
    const response = await apiRequest('POST', '/api/ocr', data);
    return await response.json();
  } catch (error) {
    console.error("Error saving OCR result:", error);
    throw error;
  }
}

// Function to fetch saved OCR results
export async function fetchOcrResults(): Promise<OcrData[]> {
  try {
    const response = await apiRequest('GET', '/api/ocr');
    return await response.json();
  } catch (error) {
    console.error("Error fetching OCR results:", error);
    throw error;
  }
}
