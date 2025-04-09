import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Conversation messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  model: text("model"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  role: true,
  content: true,
  model: true,
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
});

export const insertNewsSchema = createInsertSchema(news).pick({
  title: true,
  content: true,
  summary: true,
  source: true,
  category: true,
  publishedAt: true,
  saved: true,
});

// Financial data table
export const financialData = pgTable("financial_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'stock' or 'crypto'
  price: text("price").notNull(),
  change: text("change").notNull(),
  changePercent: text("change_percent").notNull(),
  analysis: text("analysis"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertFinancialDataSchema = createInsertSchema(financialData).pick({
  symbol: true,
  name: true,
  type: true,
  price: true,
  change: true,
  changePercent: true,
  analysis: true,
});

// OCR data table
export const ocrData = pgTable("ocr_data", {
  id: serial("id").primaryKey(),
  fileName: text("file_name"),
  extractedText: text("extracted_text").notNull(),
  imageUrl: text("image_url"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertOcrDataSchema = createInsertSchema(ocrData).pick({
  fileName: true,
  extractedText: true,
  imageUrl: true,
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  darkMode: text("dark_mode").default("true"),
  defaultAiModel: text("default_ai_model").default("claude-3-7-sonnet"),
  voiceEnabled: text("voice_enabled").default("true"),
  preferences: jsonb("preferences"),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  darkMode: true,
  defaultAiModel: true,
  voiceEnabled: true,
  preferences: true,
});

// Export types
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;

export type InsertFinancialData = z.infer<typeof insertFinancialDataSchema>;
export type FinancialData = typeof financialData.$inferSelect;

export type InsertOcrData = z.infer<typeof insertOcrDataSchema>;
export type OcrData = typeof ocrData.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
