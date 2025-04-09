import { eq, desc, asc } from 'drizzle-orm';
import { db } from './db';
import { 
  messages, InsertMessage, Message,
  news, InsertNews, News,
  financialData, InsertFinancialData, FinancialData,
  cryptoData, InsertCryptoData, CryptoData,
  tradingSimulations, InsertTradingSimulation, TradingSimulation,
  ocrData, InsertOcrData, OcrData,
  systemLearning, InsertSystemLearning, SystemLearning,
  settings, InsertSettings, Settings
} from '@shared/schema';

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
  
  // Crypto data
  getAllCryptoData(): Promise<CryptoData[]>;
  getCryptoDataByCategory(category: string): Promise<CryptoData[]>;
  createCryptoData(data: InsertCryptoData): Promise<CryptoData>;
  
  // Trading simulation data
  getAllTradingSimulations(): Promise<TradingSimulation[]>;
  getTradingSimulationsByAssetType(assetType: string): Promise<TradingSimulation[]>;
  getTradingSimulationsByStatus(status: string): Promise<TradingSimulation[]>;
  createTradingSimulation(data: InsertTradingSimulation): Promise<TradingSimulation>;
  updateTradingSimulation(id: number, data: Partial<InsertTradingSimulation>): Promise<TradingSimulation>;
  
  // OCR data
  getOcrData(): Promise<OcrData[]>;
  createOcrData(data: InsertOcrData): Promise<OcrData>;
  
  // System learning
  getSystemLearningByCategory(category: string): Promise<SystemLearning[]>;
  createSystemLearning(data: InsertSystemLearning): Promise<SystemLearning>;
  
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  
  // Message methods
  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.timestamp));
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
  
  // News methods
  async getNewsItems(): Promise<News[]> {
    return await db.select().from(news).orderBy(desc(news.publishedAt));
  }
  
  async createNewsItem(insertNews: InsertNews): Promise<News> {
    const [newsItem] = await db.insert(news).values(insertNews).returning();
    return newsItem;
  }
  
  // Financial data methods
  async getAllFinancialData(): Promise<FinancialData[]> {
    return await db.select().from(financialData).orderBy(desc(financialData.timestamp));
  }
  
  async getFinancialDataByType(type: string): Promise<FinancialData[]> {
    return await db.select().from(financialData)
      .where(eq(financialData.type, type))
      .orderBy(desc(financialData.timestamp));
  }
  
  async createFinancialData(insertData: InsertFinancialData): Promise<FinancialData> {
    const [data] = await db.insert(financialData).values(insertData).returning();
    return data;
  }
  
  // Crypto data methods
  async getAllCryptoData(): Promise<CryptoData[]> {
    return await db.select().from(cryptoData).orderBy(desc(cryptoData.timestamp));
  }
  
  async getCryptoDataByCategory(category: string): Promise<CryptoData[]> {
    return await db.select().from(cryptoData)
      .where(eq(cryptoData.category, category))
      .orderBy(desc(cryptoData.timestamp));
  }
  
  async createCryptoData(insertData: InsertCryptoData): Promise<CryptoData> {
    const [data] = await db.insert(cryptoData).values(insertData).returning();
    return data;
  }
  
  // Trading simulation methods
  async getAllTradingSimulations(): Promise<TradingSimulation[]> {
    return await db.select().from(tradingSimulations)
      .orderBy(desc(tradingSimulations.entryDate));
  }
  
  async getTradingSimulationsByAssetType(assetType: string): Promise<TradingSimulation[]> {
    return await db.select().from(tradingSimulations)
      .where(eq(tradingSimulations.assetType, assetType))
      .orderBy(desc(tradingSimulations.entryDate));
  }
  
  async getTradingSimulationsByStatus(status: string): Promise<TradingSimulation[]> {
    return await db.select().from(tradingSimulations)
      .where(eq(tradingSimulations.status, status))
      .orderBy(desc(tradingSimulations.entryDate));
  }
  
  async createTradingSimulation(insertData: InsertTradingSimulation): Promise<TradingSimulation> {
    const [simulation] = await db.insert(tradingSimulations).values(insertData).returning();
    return simulation;
  }
  
  async updateTradingSimulation(id: number, updateData: Partial<InsertTradingSimulation>): Promise<TradingSimulation> {
    const [updatedSimulation] = await db.update(tradingSimulations)
      .set(updateData)
      .where(eq(tradingSimulations.id, id))
      .returning();
    
    if (!updatedSimulation) {
      throw new Error(`Trading simulation with ID ${id} not found`);
    }
    
    return updatedSimulation;
  }
  
  // OCR data methods
  async getOcrData(): Promise<OcrData[]> {
    return await db.select().from(ocrData).orderBy(desc(ocrData.timestamp));
  }
  
  async createOcrData(insertData: InsertOcrData): Promise<OcrData> {
    const [data] = await db.insert(ocrData).values(insertData).returning();
    return data;
  }
  
  // System learning methods
  async getSystemLearningByCategory(category: string): Promise<SystemLearning[]> {
    return await db.select().from(systemLearning)
      .where(eq(systemLearning.category, category))
      .orderBy(desc(systemLearning.timestamp));
  }
  
  async createSystemLearning(insertData: InsertSystemLearning): Promise<SystemLearning> {
    const [learning] = await db.insert(systemLearning).values(insertData).returning();
    return learning;
  }
  
  // Settings methods
  async getSettings(): Promise<Settings> {
    const [existingSettings] = await db.select().from(settings).limit(1);
    
    if (existingSettings) {
      return existingSettings;
    } else {
      // Create default settings if none exist
      const defaultSettings: InsertSettings = {
        darkMode: "true",
        defaultAiModel: "claude-3-7-sonnet",
        voiceEnabled: "true",
        financialRiskTolerance: "moderate",
        defaultInvestmentAmount: 200
      };
      
      const [newSettings] = await db.insert(settings).values(defaultSettings).returning();
      return newSettings;
    }
  }
  
  async updateSettings(updateSettings: InsertSettings): Promise<Settings> {
    const [existingSettings] = await db.select().from(settings).limit(1);
    
    if (existingSettings) {
      // Update existing settings
      const [updatedSettings] = await db.update(settings)
        .set(updateSettings)
        .where(eq(settings.id, existingSettings.id))
        .returning();
      
      return updatedSettings;
    } else {
      // Create new settings if none exist
      const [newSettings] = await db.insert(settings).values(updateSettings).returning();
      return newSettings;
    }
  }
}

export const storage = new DatabaseStorage();
