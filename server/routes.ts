import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMessageSchema, 
  insertNewsSchema, 
  insertFinancialDataSchema, 
  insertCryptoDataSchema,
  insertTradingSimulationSchema,
  insertOcrDataSchema,
  insertSystemLearningSchema,
  insertSettingsSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // We're removing the WebSocket server for now as it's causing connection issues
  // We'll implement real-time updates using polling instead

  // Messages API endpoints
  app.get("/api/messages", async (_req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // News API endpoints
  app.get("/api/news", async (_req, res) => {
    try {
      const newsItems = await storage.getNewsItems();
      res.json(newsItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.post("/api/news", async (req, res) => {
    try {
      const validatedData = insertNewsSchema.parse(req.body);
      const newsItem = await storage.createNewsItem(validatedData);
      res.status(201).json(newsItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid news data" });
    }
  });

  // Financial data API endpoints
  app.get("/api/financial", async (req, res) => {
    try {
      const type = req.query.type as string;
      if (type === "stock" || type === "crypto") {
        const data = await storage.getFinancialDataByType(type);
        res.json(data);
      } else {
        const data = await storage.getAllFinancialData();
        res.json(data);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial data" });
    }
  });

  app.post("/api/financial", async (req, res) => {
    try {
      const validatedData = insertFinancialDataSchema.parse(req.body);
      const financialData = await storage.createFinancialData(validatedData);
      res.status(201).json(financialData);
    } catch (error) {
      res.status(400).json({ message: "Invalid financial data" });
    }
  });

  // Crypto data API endpoints
  app.get("/api/crypto", async (req, res) => {
    try {
      const category = req.query.category as string;
      if (category) {
        const data = await storage.getCryptoDataByCategory(category);
        res.json(data);
      } else {
        const data = await storage.getAllCryptoData();
        res.json(data);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch crypto data" });
    }
  });

  app.post("/api/crypto", async (req, res) => {
    try {
      const validatedData = insertCryptoDataSchema.parse(req.body);
      const cryptoData = await storage.createCryptoData(validatedData);
      res.status(201).json(cryptoData);
    } catch (error) {
      res.status(400).json({ message: "Invalid crypto data" });
    }
  });

  // Trading simulations API endpoints
  app.get("/api/trading-simulations", async (req, res) => {
    try {
      const assetType = req.query.assetType as string;
      const status = req.query.status as string;
      
      if (assetType) {
        const data = await storage.getTradingSimulationsByAssetType(assetType);
        res.json(data);
      } else if (status) {
        const data = await storage.getTradingSimulationsByStatus(status);
        res.json(data);
      } else {
        const data = await storage.getAllTradingSimulations();
        res.json(data);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trading simulations" });
    }
  });

  app.post("/api/trading-simulations", async (req, res) => {
    try {
      const validatedData = insertTradingSimulationSchema.parse(req.body);
      const simulation = await storage.createTradingSimulation(validatedData);
      res.status(201).json(simulation);
    } catch (error) {
      res.status(400).json({ message: "Invalid trading simulation data" });
    }
  });

  app.put("/api/trading-simulations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTradingSimulationSchema.partial().parse(req.body);
      const simulation = await storage.updateTradingSimulation(id, validatedData);
      res.json(simulation);
    } catch (error) {
      res.status(400).json({ message: "Failed to update trading simulation" });
    }
  });

  // System learning API endpoints
  app.get("/api/system-learning/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const data = await storage.getSystemLearningByCategory(category);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system learning data" });
    }
  });

  app.post("/api/system-learning", async (req, res) => {
    try {
      const validatedData = insertSystemLearningSchema.parse(req.body);
      const learning = await storage.createSystemLearning(validatedData);
      res.status(201).json(learning);
    } catch (error) {
      res.status(400).json({ message: "Invalid system learning data" });
    }
  });

  // OCR data API endpoints
  app.get("/api/ocr", async (_req, res) => {
    try {
      const ocrItems = await storage.getOcrData();
      res.json(ocrItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch OCR data" });
    }
  });

  app.post("/api/ocr", async (req, res) => {
    try {
      const validatedData = insertOcrDataSchema.parse(req.body);
      const ocrData = await storage.createOcrData(validatedData);
      res.status(201).json(ocrData);
    } catch (error) {
      res.status(400).json({ message: "Invalid OCR data" });
    }
  });

  // Settings API endpoints
  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(validatedData);
      res.status(201).json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data" });
    }
  });

  return httpServer;
}
