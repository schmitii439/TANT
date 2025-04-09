import { pgTable, text, serial, jsonb, timestamp, boolean, integer, decimal, index, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Conversation messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  model: text("model"),
  feedback: text("feedback"), // User feedback on response quality
  userInteractionData: jsonb("user_interaction_data"), // Stores additional data about user interaction
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  role: true,
  content: true,
  model: true,
  feedback: true,
  userInteractionData: true,
});

// News items table
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  source: text("source"),
  category: text("category"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  saved: text("saved").default("false"),
  impact: text("impact"), // Economic or market impact assessment
  userInterest: jsonb("user_interest"), // Tracks user interest in different news categories
});

export const insertNewsSchema = createInsertSchema(news).pick({
  title: true,
  content: true,
  summary: true,
  source: true,
  category: true,
  publishedAt: true,
  saved: true,
  impact: true,
  userInterest: true,
});

// Financial data table - enhanced for real-time data
export const financialData = pgTable("financial_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'stock' or 'crypto'
  price: text("price").notNull(),
  change: text("change").notNull(),
  changePercent: text("change_percent").notNull(),
  analysis: text("analysis"),
  historicalData: jsonb("historical_data"), // Stores historical price data
  newsImpact: jsonb("news_impact"), // Links to news that impacts this asset
  technicalIndicators: jsonb("technical_indicators"), // Technical analysis indicators
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => {
  return {
    symbolIdx: index("financial_data_symbol_idx").on(table.symbol),
    typeIdx: index("financial_data_type_idx").on(table.type),
    timestampIdx: index("financial_data_timestamp_idx").on(table.timestamp),
  }
});

export const insertFinancialDataSchema = createInsertSchema(financialData).pick({
  symbol: true,
  name: true,
  type: true,
  price: true,
  change: true,
  changePercent: true,
  analysis: true,
  historicalData: true,
  newsImpact: true,
  technicalIndicators: true,
});

// Cryptocurrency specific data table
export const cryptoData = pgTable("crypto_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  marketCap: doublePrecision("market_cap"),
  volume24h: doublePrecision("volume_24h"),
  circulatingSupply: doublePrecision("circulating_supply"),
  change24h: doublePrecision("change_24h"),
  changePercent24h: doublePrecision("change_percent_24h"),
  high24h: doublePrecision("high_24h"),
  low24h: doublePrecision("low_24h"),
  allTimeHigh: doublePrecision("all_time_high"),
  allTimeHighDate: timestamp("all_time_high_date"),
  category: text("category"), // e.g., "memecoin", "defi", "layer1"
  analysis: text("analysis"),
  sentiment: text("sentiment"), // Market sentiment assessment
  prediction: jsonb("prediction"), // Price prediction data
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => {
  return {
    symbolIdx: index("crypto_data_symbol_idx").on(table.symbol),
    categoryIdx: index("crypto_data_category_idx").on(table.category),
    timestampIdx: index("crypto_data_timestamp_idx").on(table.timestamp),
  }
});

export const insertCryptoDataSchema = createInsertSchema(cryptoData).pick({
  symbol: true,
  name: true,
  price: true,
  marketCap: true,
  volume24h: true,
  circulatingSupply: true,
  change24h: true,
  changePercent24h: true,
  high24h: true,
  low24h: true,
  allTimeHigh: true,
  allTimeHighDate: true,
  category: true,
  analysis: true,
  sentiment: true,
  prediction: true,
});

// Trading simulations table
export const tradingSimulations = pgTable("trading_simulations", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  assetType: text("asset_type").notNull(), // 'stock' or 'crypto'
  strategy: text("strategy").notNull(), // e.g., 'safe', 'high-risk', 'leveraged'
  entryPrice: doublePrecision("entry_price").notNull(),
  entryDate: timestamp("entry_date").defaultNow().notNull(),
  exitPrice: doublePrecision("exit_price"),
  exitDate: timestamp("exit_date"),
  initialInvestment: doublePrecision("initial_investment").notNull(),
  finalValue: doublePrecision("final_value"),
  profitLoss: doublePrecision("profit_loss"),
  profitLossPercent: doublePrecision("profit_loss_percent"),
  leverage: doublePrecision("leverage").default(1),
  status: text("status").notNull().default("active"), // 'active', 'completed', 'cancelled'
  rationale: text("rationale"), // Reason for entering the trade
  performanceAnalysis: text("performance_analysis"), // Analysis after trade completion
  learningOutcomes: jsonb("learning_outcomes"), // What the system learned from this trade
  userFeedback: text("user_feedback"), // User feedback on the trade
}, (table) => {
  return {
    symbolIdx: index("trading_simulations_symbol_idx").on(table.symbol),
    assetTypeIdx: index("trading_simulations_asset_type_idx").on(table.assetType),
    strategyIdx: index("trading_simulations_strategy_idx").on(table.strategy),
    statusIdx: index("trading_simulations_status_idx").on(table.status),
  }
});

export const insertTradingSimulationSchema = createInsertSchema(tradingSimulations).pick({
  symbol: true,
  assetType: true,
  strategy: true,
  entryPrice: true,
  entryDate: true,
  exitPrice: true,
  exitDate: true,
  initialInvestment: true,
  finalValue: true,
  profitLoss: true,
  profitLossPercent: true,
  leverage: true,
  status: true,
  rationale: true,
  performanceAnalysis: true,
  learningOutcomes: true,
  userFeedback: true,
});

// OCR data table
export const ocrData = pgTable("ocr_data", {
  id: serial("id").primaryKey(),
  fileName: text("file_name"),
  extractedText: text("extracted_text").notNull(),
  imageUrl: text("image_url"),
  processingMetadata: jsonb("processing_metadata"), // Metadata about the OCR process
  relevanceScore: integer("relevance_score"), // Relevance to user's interests
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertOcrDataSchema = createInsertSchema(ocrData).pick({
  fileName: true,
  extractedText: true,
  imageUrl: true,
  processingMetadata: true,
  relevanceScore: true,
});

// System learning data table
export const systemLearning = pgTable("system_learning", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // e.g., 'financial', 'conversation', 'news'
  learningContext: text("learning_context").notNull(), // What triggered this learning
  previousAssumption: jsonb("previous_assumption"), // System's prior understanding
  newUnderstanding: jsonb("new_understanding"), // Updated understanding
  confidenceLevel: doublePrecision("confidence_level"), // Confidence in the new understanding
  dataPoints: jsonb("data_points"), // Supporting evidence for learning
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertSystemLearningSchema = createInsertSchema(systemLearning).pick({
  category: true,
  learningContext: true,
  previousAssumption: true,
  newUnderstanding: true,
  confidenceLevel: true,
  dataPoints: true,
});

// Refresh history table to track all data refresh operations
export const refreshHistory = pgTable("refresh_history", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sources: jsonb("sources").notNull(), // JSON object with details about each data source
  status: text("status").notNull(), // 'success', 'partial', or 'failed'
  elapsedTime: integer("elapsed_time"), // Time taken in milliseconds
  userInitiated: boolean("user_initiated").default(true),
  triggeredBy: text("triggered_by"), // Component or function that initiated the refresh
  metadata: jsonb("metadata"), // Additional metadata about the refresh
}, (table) => {
  return {
    timestampIdx: index("refresh_history_timestamp_idx").on(table.timestamp),
    statusIdx: index("refresh_history_status_idx").on(table.status),
  }
});

export const insertRefreshHistorySchema = createInsertSchema(refreshHistory).pick({
  timestamp: true,
  sources: true,
  status: true,
  elapsedTime: true,
  userInitiated: true,
  triggeredBy: true,
  metadata: true,
});

// Model performance metrics table for the Meta-Model Brain
export const modelPerformance = pgTable("model_performance", {
  id: serial("id").primaryKey(),
  modelId: text("model_id").notNull(), // ID of the AI model
  taskType: text("task_type").notNull(), // Type of task (e.g., 'conversation', 'analysis', 'prediction')
  promptContext: text("prompt_context"), // Context of the prompt
  inputLength: integer("input_length"), // Length of the input in tokens/characters
  outputLength: integer("output_length"), // Length of the output in tokens/characters
  responseTime: integer("response_time"), // Time taken to generate response in ms
  accuracy: doublePrecision("accuracy"), // Assessed accuracy (0-1) if applicable
  relevance: doublePrecision("relevance"), // Assessed relevance (0-1)
  helpfulness: doublePrecision("helpfulness"), // Assessed helpfulness (0-1)
  creativity: doublePrecision("creativity"), // Assessed creativity (0-1)
  overallScore: doublePrecision("overall_score"), // Overall performance score (0-1)
  userFeedback: text("user_feedback"), // Optional user feedback
  metadata: jsonb("metadata"), // Additional metadata
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => {
  return {
    modelIdIdx: index("model_performance_model_id_idx").on(table.modelId),
    taskTypeIdx: index("model_performance_task_type_idx").on(table.taskType),
    timestampIdx: index("model_performance_timestamp_idx").on(table.timestamp),
  }
});

export const insertModelPerformanceSchema = createInsertSchema(modelPerformance).pick({
  modelId: true,
  taskType: true,
  promptContext: true,
  inputLength: true,
  outputLength: true,
  responseTime: true,
  accuracy: true,
  relevance: true,
  helpfulness: true,
  creativity: true,
  overallScore: true,
  userFeedback: true,
  metadata: true,
});

// User session history table
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  activeTabsLog: jsonb("active_tabs_log"), // Log of tabs used during session
  queriesLog: jsonb("queries_log"), // All queries made during session
  actionsLog: jsonb("actions_log"), // User actions (clicks, trades, etc.)
  refreshesLog: jsonb("refreshes_log"), // Data refreshes during session
  aiInteractionsLog: jsonb("ai_interactions_log"), // AI interactions during session
  sessionMetadata: jsonb("session_metadata"), // Additional metadata
}, (table) => {
  return {
    startTimeIdx: index("user_sessions_start_time_idx").on(table.startTime),
  }
});

export const insertUserSessionSchema = createInsertSchema(userSessions).pick({
  startTime: true,
  endTime: true,
  activeTabsLog: true,
  queriesLog: true,
  actionsLog: true,
  refreshesLog: true,
  aiInteractionsLog: true,
  sessionMetadata: true,
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  darkMode: text("dark_mode").default("true"),
  defaultAiModel: text("default_ai_model").default("claude-3-7-sonnet"),
  voiceEnabled: text("voice_enabled").default("true"),
  financialRiskTolerance: text("financial_risk_tolerance").default("moderate"),
  cryptoTradingEnabled: boolean("crypto_trading_enabled").default(true),
  stockTradingEnabled: boolean("stock_trading_enabled").default(true),
  defaultInvestmentAmount: doublePrecision("default_investment_amount").default(200),
  tradingPreferences: jsonb("trading_preferences"),
  newsPreferences: jsonb("news_preferences"),
  aiModelPreferences: jsonb("ai_model_preferences"),
  notificationSettings: jsonb("notification_settings"),
  preferences: jsonb("preferences"),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  darkMode: true,
  defaultAiModel: true,
  voiceEnabled: true,
  financialRiskTolerance: true,
  cryptoTradingEnabled: true,
  stockTradingEnabled: true,
  defaultInvestmentAmount: true,
  tradingPreferences: true,
  newsPreferences: true,
  aiModelPreferences: true,
  notificationSettings: true,
  preferences: true,
});

// Export types
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;

export type InsertFinancialData = z.infer<typeof insertFinancialDataSchema>;
export type FinancialData = typeof financialData.$inferSelect;

export type InsertCryptoData = z.infer<typeof insertCryptoDataSchema>;
export type CryptoData = typeof cryptoData.$inferSelect;

export type InsertTradingSimulation = z.infer<typeof insertTradingSimulationSchema>;
export type TradingSimulation = typeof tradingSimulations.$inferSelect;

export type InsertOcrData = z.infer<typeof insertOcrDataSchema>;
export type OcrData = typeof ocrData.$inferSelect;

export type InsertSystemLearning = z.infer<typeof insertSystemLearningSchema>;
export type SystemLearning = typeof systemLearning.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

export type InsertRefreshHistory = z.infer<typeof insertRefreshHistorySchema>;
export type RefreshHistory = typeof refreshHistory.$inferSelect;

export type InsertModelPerformance = z.infer<typeof insertModelPerformanceSchema>;
export type ModelPerformance = typeof modelPerformance.$inferSelect;

export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;
