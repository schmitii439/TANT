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
  historicalData?: any;
  newsImpact?: any;
  technicalIndicators?: any;
  timestamp: Date;
}

export interface CryptoData {
  id: number;
  symbol: string;
  name: string;
  price: number;
  marketCap?: number;
  volume24h?: number;
  circulatingSupply?: number;
  change24h?: number;
  changePercent24h?: number;
  high24h?: number;
  low24h?: number;
  allTimeHigh?: number;
  allTimeHighDate?: Date;
  category?: string;
  analysis?: string;
  sentiment?: string;
  prediction?: any;
  timestamp: Date;
}

export interface TradingSimulation {
  id: number;
  symbol: string;
  assetType: string;
  strategy: string;
  entryPrice: number;
  entryDate: Date;
  exitPrice?: number;
  exitDate?: Date;
  initialInvestment: number;
  finalValue?: number;
  profitLoss?: number;
  profitLossPercent?: number;
  leverage?: number;
  status: 'active' | 'completed' | 'cancelled';
  rationale?: string;
  performanceAnalysis?: string;
  learningOutcomes?: any;
  userFeedback?: string;
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
