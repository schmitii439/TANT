export type TabId = 'assistant' | 'news' | 'stocks' | 'crypto' | 'tools';

export interface Tab {
  id: TabId;
  name: string;
  icon: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
}

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: Date;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  summary?: string;
  source?: string;
  category?: string;
  publishedAt: Date;
  saved?: string;
}

export enum FinancialDataType {
  Stock = 'stock',
  Crypto = 'crypto',
}

export interface FinancialData {
  id: number;
  symbol: string;
  name: string;
  type: FinancialDataType;
  price: string;
  change: string;
  changePercent: string;
  analysis?: string;
  timestamp: Date;
}

export interface OcrData {
  id: number;
  fileName?: string;
  extractedText: string;
  imageUrl?: string;
  timestamp: Date;
}

export interface Settings {
  id: number;
  darkMode: string;
  defaultAiModel: string;
  voiceEnabled: string;
  preferences?: Record<string, any>;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface ModelResponse {
  model: string;
  content: string;
  timestamp: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
