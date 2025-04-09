/**
 * Autonomous Data Collection Module
 * 
 * Continuously collects and stores relevant data from various sources
 * Creates structured local files for each data type by date
 */

import { NewsItem, FinancialData, FinancialDataType } from '@/types';
import { apiRequest } from './queryClient';
import { fetchExternalNews } from './newsService';
import { fetchExternalFinancialData } from './financeService';

// Define storage prefixes and formats
const STORAGE_PREFIX = 'data-collection-';
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { 
  year: 'numeric', 
  month: '2-digit', 
  day: '2-digit' 
};

// Define topic categories for data collection
export interface DataSource {
  id: string;
  name: string;
  category: 'news' | 'financial' | 'custom';
  enabled: boolean;
  keywords?: string[];
  queryParams?: Record<string, any>;
  customFetchFn?: () => Promise<any>;
  lastFetched?: Date;
}

// Default data sources list
const DEFAULT_DATA_SOURCES: DataSource[] = [
  {
    id: 'news-politics',
    name: 'Political News',
    category: 'news',
    enabled: true,
    keywords: ['politics', 'government', 'election', 'policy', 'democracy', 'parliament']
  },
  {
    id: 'news-financial',
    name: 'Financial News',
    category: 'news',
    enabled: true,
    keywords: ['finance', 'market', 'economy', 'stock', 'investment', 'banking']
  },
  {
    id: 'news-tech',
    name: 'Technology News',
    category: 'news',
    enabled: true,
    keywords: ['technology', 'AI', 'internet', 'digital', 'software', 'hardware', 'startup']
  },
  {
    id: 'news-science',
    name: 'Science News',
    category: 'news',
    enabled: true,
    keywords: ['science', 'research', 'discovery', 'study', 'innovation', 'breakthrough']
  },
  {
    id: 'news-geopolitics',
    name: 'Geopolitics',
    category: 'news',
    enabled: true,
    keywords: ['geopolitics', 'international', 'diplomacy', 'conflict', 'treaty', 'global']
  },
  {
    id: 'news-ufo',
    name: 'UFO & Unexplained',
    category: 'news',
    enabled: true,
    keywords: ['UFO', 'UAP', 'alien', 'unexplained', 'paranormal', 'conspiracy']
  },
  {
    id: 'financial-stocks',
    name: 'Stock Market',
    category: 'financial',
    enabled: true,
    queryParams: { type: FinancialDataType.Stock }
  },
  {
    id: 'financial-crypto',
    name: 'Cryptocurrency',
    category: 'financial',
    enabled: true,
    queryParams: { type: FinancialDataType.Crypto }
  }
];

// Track data collection state and sources
let dataSources: DataSource[] = [...DEFAULT_DATA_SOURCES];
let isCollectionActive = false;
let collectionInterval: NodeJS.Timeout | null = null;
const DEFAULT_COLLECTION_INTERVAL = 3600000; // 1 hour in milliseconds

/**
 * Initialize the data collection module
 */
export function initDataCollection(): void {
  loadDataSources();
  loadCollectedData();
}

/**
 * Start automatic data collection with specified interval
 * @param intervalMs Collection interval in milliseconds (default: 1 hour)
 */
export function startAutomaticCollection(intervalMs = DEFAULT_COLLECTION_INTERVAL): void {
  // Stop any existing collection interval
  if (collectionInterval) {
    clearInterval(collectionInterval);
  }
  
  // Set collection as active
  isCollectionActive = true;
  
  // Run an initial collection
  runFullCollectionCycle();
  
  // Setup interval for regular collection
  collectionInterval = setInterval(runFullCollectionCycle, intervalMs);
  
  // Save module state
  saveModuleState();
  
  console.log(`Automatic data collection started with interval: ${intervalMs}ms`);
}

/**
 * Stop automatic data collection
 */
export function stopAutomaticCollection(): void {
  if (collectionInterval) {
    clearInterval(collectionInterval);
    collectionInterval = null;
  }
  
  isCollectionActive = false;
  saveModuleState();
  
  console.log('Automatic data collection stopped');
}

/**
 * Toggle a data source's enabled state
 * @param sourceId ID of the source to toggle
 * @returns Updated data source or undefined if not found
 */
export function toggleDataSource(sourceId: string): DataSource | undefined {
  const sourceIndex = dataSources.findIndex(source => source.id === sourceId);
  
  if (sourceIndex >= 0) {
    dataSources[sourceIndex] = {
      ...dataSources[sourceIndex],
      enabled: !dataSources[sourceIndex].enabled
    };
    
    saveDataSources();
    return dataSources[sourceIndex];
  }
  
  return undefined;
}

/**
 * Add a new custom data source
 * @param source New data source to add
 * @returns The added data source
 */
export function addDataSource(source: Omit<DataSource, 'id'>): DataSource {
  // Generate ID based on name
  const id = `custom-${source.name.toLowerCase().replace(/\s+/g, '-')}`;
  
  const newSource: DataSource = {
    ...source,
    id,
    lastFetched: new Date()
  };
  
  dataSources.push(newSource);
  saveDataSources();
  
  return newSource;
}

/**
 * Remove a data source
 * @param sourceId ID of the source to remove
 * @returns True if source was found and removed
 */
export function removeDataSource(sourceId: string): boolean {
  const initialLength = dataSources.length;
  dataSources = dataSources.filter(source => source.id !== sourceId);
  
  if (dataSources.length !== initialLength) {
    saveDataSources();
    return true;
  }
  
  return false;
}

/**
 * Get all configured data sources
 * @returns Array of data sources
 */
export function getDataSources(): DataSource[] {
  return [...dataSources];
}

/**
 * Get collected data for a specific date and category
 * @param date Target date
 * @param category Data category
 * @returns Collected data or null if not found
 */
export function getCollectedData(
  date: Date = new Date(),
  category?: 'news' | 'financial' | string
): any {
  // If no category is specified, get all data
  if (!category) {
    return getAllCollectedData();
  }
  
  const dateStr = formatDateForStorage(date);
  const storageKey = `${STORAGE_PREFIX}${category}-${dateStr}`;
  
  try {
    const storedData = localStorage.getItem(storageKey);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error(`Error retrieving collected data for ${category} on ${dateStr}:`, error);
    return null;
  }
}

/**
 * Get all collected data from all sources and categories
 * @returns Combined object with all collected data
 */
export function getAllCollectedData(): Record<string, any> {
  const allData: Record<string, any> = {};
  
  try {
    // Get all keys that match our data prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const storedData = localStorage.getItem(key);
        if (storedData) {
          try {
            // Extract category and date from the key
            const keyParts = key.replace(STORAGE_PREFIX, '').split('-');
            const category = keyParts[0];
            const dateStr = keyParts.slice(1).join('-');
            
            // Create category in allData if it doesn't exist
            if (!allData[category]) {
              allData[category] = {};
            }
            
            // Add data under category and date
            allData[category][dateStr] = JSON.parse(storedData);
          } catch (parseError) {
            console.error(`Error parsing data for key ${key}:`, parseError);
          }
        }
      }
    }
    
    return allData;
  } catch (error) {
    console.error('Error retrieving all collected data:', error);
    return {};
  }
}

/**
 * Run a full data collection cycle for all enabled sources
 */
export async function runFullCollectionCycle(): Promise<void> {
  console.log('Starting full data collection cycle');
  
  try {
    // Get today's date
    const today = new Date();
    const dateStr = formatDateForStorage(today);
    
    // Collect data for each enabled source
    for (const source of dataSources) {
      if (!source.enabled) continue;
      
      try {
        console.log(`Collecting data for source: ${source.name}`);
        
        let collectedData: any = null;
        
        // Fetch data based on source category
        if (source.category === 'news') {
          collectedData = await collectNewsData(source);
        } else if (source.category === 'financial') {
          collectedData = await collectFinancialData(source);
        } else if (source.customFetchFn) {
          // Handle custom data source with its own fetch function
          collectedData = await source.customFetchFn();
        }
        
        // Save the collected data
        if (collectedData) {
          const storageKey = `${STORAGE_PREFIX}${source.id}-${dateStr}`;
          saveToLocalStorage(storageKey, collectedData);
          
          // Update last fetched timestamp
          source.lastFetched = new Date();
        }
      } catch (sourceError) {
        console.error(`Error collecting data for source ${source.name}:`, sourceError);
        // Continue with other sources even if one fails
      }
    }
    
    // Save updated source metadata
    saveDataSources();
    console.log('Data collection cycle completed');
    
  } catch (error) {
    console.error('Error running data collection cycle:', error);
  }
}

/**
 * Collect news data for a specific source
 * @param source The news data source configuration
 * @returns Collected news data
 */
async function collectNewsData(source: DataSource): Promise<NewsItem[]> {
  try {
    // Fetch external news
    const allNews = await fetchExternalNews();
    
    // Filter news by keywords if defined
    if (source.keywords && source.keywords.length > 0) {
      return allNews.filter(newsItem => {
        const content = (newsItem.title + ' ' + newsItem.content).toLowerCase();
        // Check if any keyword matches the content
        return source.keywords!.some(keyword => 
          content.includes(keyword.toLowerCase())
        );
      });
    }
    
    return allNews;
  } catch (error) {
    console.error(`Error collecting news data for ${source.name}:`, error);
    throw error;
  }
}

/**
 * Collect financial data for a specific source
 * @param source The financial data source configuration
 * @returns Collected financial data
 */
async function collectFinancialData(source: DataSource): Promise<FinancialData[]> {
  try {
    // Extract type from query parameters
    const type = source.queryParams?.type || FinancialDataType.Stock;
    
    // Fetch financial data from external source
    return await fetchExternalFinancialData(type);
  } catch (error) {
    console.error(`Error collecting financial data for ${source.name}:`, error);
    throw error;
  }
}

/**
 * Save collected data to local storage
 * @param key Storage key
 * @param data Data to save
 */
function saveToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Data saved to local storage: ${key}`);
  } catch (error) {
    console.error(`Error saving data to local storage for key ${key}:`, error);
    
    // Handle potential quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Clear old data to make space
      clearOldCollectedData();
      
      // Try saving again
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (retryError) {
        console.error('Failed to save data even after clearing old data:', retryError);
      }
    }
  }
}

/**
 * Load data sources from local storage or use defaults
 */
function loadDataSources(): void {
  try {
    const savedSources = localStorage.getItem('data-collection-sources');
    if (savedSources) {
      dataSources = JSON.parse(savedSources);
    }
  } catch (error) {
    console.error('Error loading data sources:', error);
    // Fall back to default sources
    dataSources = [...DEFAULT_DATA_SOURCES];
  }
}

/**
 * Save data sources to local storage
 */
function saveDataSources(): void {
  try {
    localStorage.setItem('data-collection-sources', JSON.stringify(dataSources));
  } catch (error) {
    console.error('Error saving data sources:', error);
  }
}

/**
 * Save module state to local storage
 */
function saveModuleState(): void {
  try {
    localStorage.setItem('data-collection-state', JSON.stringify({
      isActive: isCollectionActive,
      lastRun: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error saving module state:', error);
  }
}

/**
 * Load collected data from local storage
 */
function loadCollectedData(): void {
  try {
    // Load module state
    const stateStr = localStorage.getItem('data-collection-state');
    if (stateStr) {
      const state = JSON.parse(stateStr);
      isCollectionActive = state.isActive;
      
      // Restart collection if it was active
      if (isCollectionActive) {
        startAutomaticCollection();
      }
    }
  } catch (error) {
    console.error('Error loading collected data:', error);
  }
}

/**
 * Clear old collected data to free up storage space
 * Keeps the most recent 7 days of data
 */
function clearOldCollectedData(): void {
  try {
    // Get all keys matching our prefix
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keys.push(key);
      }
    }
    
    // Sort keys by date (oldest first)
    keys.sort();
    
    // Keep only the last 7 days worth of data (approximate)
    const keysToRemove = keys.slice(0, Math.max(0, keys.length - 7 * dataSources.length));
    
    // Remove old data
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed old data: ${key}`);
    });
  } catch (error) {
    console.error('Error clearing old collected data:', error);
  }
}

/**
 * Format a date for storage key
 * @param date Date to format
 * @returns Formatted date string (e.g., "2025-04-09")
 */
function formatDateForStorage(date: Date): string {
  return date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
}

/**
 * Check if data for a specific date and category exists
 * @param date Target date
 * @param category Data category
 * @returns True if data exists
 */
export function hasDataForDate(date: Date, category: string): boolean {
  const dateStr = formatDateForStorage(date);
  
  // Check if any source in this category has data for this date
  for (const source of dataSources) {
    if (source.category === category || source.id === category) {
      const key = `${STORAGE_PREFIX}${source.id}-${dateStr}`;
      if (localStorage.getItem(key)) {
        return true;
      }
    }
  }
  
  return false;
}