import {
  type Message,
  type InsertMessage,
  type News,
  type InsertNews,
  type FinancialData,
  type InsertFinancialData,
  type OcrData,
  type InsertOcrData,
  type Settings,
  type InsertSettings,
} from "@shared/schema";

export interface IStorage {
  // Messages
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // News
  getNewsItems(): Promise<News[]>;
  createNewsItem(news: InsertNews): Promise<News>;
  
  // Financial data
  getAllFinancialData(): Promise<FinancialData[]>;
  getFinancialDataByType(type: string): Promise<FinancialData[]>;
  createFinancialData(data: InsertFinancialData): Promise<FinancialData>;
  
  // OCR data
  getOcrData(): Promise<OcrData[]>;
  createOcrData(data: InsertOcrData): Promise<OcrData>;
  
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private messages: Map<number, Message>;
  private news: Map<number, News>;
  private financialData: Map<number, FinancialData>;
  private ocrData: Map<number, OcrData>;
  private settings: Settings;
  
  private messageId: number;
  private newsId: number;
  private financialDataId: number;
  private ocrDataId: number;

  constructor() {
    this.messages = new Map();
    this.news = new Map();
    this.financialData = new Map();
    this.ocrData = new Map();
    
    this.messageId = 1;
    this.newsId = 1;
    this.financialDataId = 1;
    this.ocrDataId = 1;
    
    // Initialize with default settings
    this.settings = {
      id: 1,
      darkMode: "true",
      defaultAiModel: "claude-3-7-sonnet",
      voiceEnabled: "true",
      preferences: {}
    };
  }

  // Messages methods
  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const timestamp = new Date();
    const message: Message = { ...insertMessage, id, timestamp };
    this.messages.set(id, message);
    return message;
  }
  
  // News methods
  async getNewsItems(): Promise<News[]> {
    return Array.from(this.news.values());
  }

  async createNewsItem(insertNews: InsertNews): Promise<News> {
    const id = this.newsId++;
    const publishedAt = insertNews.publishedAt || new Date();
    const news: News = { ...insertNews, id, publishedAt };
    this.news.set(id, news);
    return news;
  }
  
  // Financial data methods
  async getAllFinancialData(): Promise<FinancialData[]> {
    return Array.from(this.financialData.values());
  }
  
  async getFinancialDataByType(type: string): Promise<FinancialData[]> {
    return Array.from(this.financialData.values()).filter(
      (data) => data.type === type,
    );
  }

  async createFinancialData(insertData: InsertFinancialData): Promise<FinancialData> {
    const id = this.financialDataId++;
    const timestamp = new Date();
    const financialData: FinancialData = { ...insertData, id, timestamp };
    this.financialData.set(id, financialData);
    return financialData;
  }
  
  // OCR data methods
  async getOcrData(): Promise<OcrData[]> {
    return Array.from(this.ocrData.values());
  }

  async createOcrData(insertData: InsertOcrData): Promise<OcrData> {
    const id = this.ocrDataId++;
    const timestamp = new Date();
    const ocrData: OcrData = { ...insertData, id, timestamp };
    this.ocrData.set(id, ocrData);
    return ocrData;
  }
  
  // Settings methods
  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(updateSettings: InsertSettings): Promise<Settings> {
    this.settings = { ...this.settings, ...updateSettings };
    return this.settings;
  }
}

export const storage = new MemStorage();
