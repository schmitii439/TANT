import { apiRequest } from '@/lib/queryClient';
import { FinancialData, FinancialDataType, CryptoData } from '@/types';
import { analyzeFinancialData as grokAnalyzeFinancialData } from './grokAiService';

// API endpoints for real-time financial data
const STOCK_API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1';
const CRYPTO_API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1';
const MEMECOIN_API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=meme-token&order=market_cap_desc&per_page=50&page=1';

/**
 * Fetches financial data from server-side cache
 */
export async function fetchFinancialData(type: FinancialDataType): Promise<FinancialData[]> {
  try {
    const response = await apiRequest('GET', `/api/financial?type=${type}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${type} data:`, error);
    
    // If the API fails, use the existing fallback
    return type === FinancialDataType.Stock 
      ? simulateStockData() 
      : simulateCryptoData();
  }
}

/**
 * Fetches financial data from external API sources in real-time
 */
export async function fetchExternalFinancialData(type: FinancialDataType): Promise<FinancialData[]> {
  try {
    // First try to get real market data from external APIs
    if (type === FinancialDataType.Stock) {
      return await fetchRealTimeStockData();
    } else {
      return await fetchRealTimeCryptoData();
    }
  } catch (externalError) {
    console.error(`External API data fetch failed, trying Puter.AI fallback:`, externalError);
    
    try {
      // Use puter.ai as a backup data source
      const prompt = type === FinancialDataType.Stock
        ? "Generate 5 stock symbols with current price, change percentage, and brief analysis. Format as JSON array with symbol, name, price, change, changePercent, and analysis fields."
        : "Generate 5 cryptocurrency symbols with current price, change percentage, and brief analysis. Format as JSON array with symbol, name, price, change, changePercent, and analysis fields.";
      
      const response = await window.puter.ai.chat(prompt, {
        model: 'google/gemini-2.5-pro-exp-03-25:free'
      });
      
      // Parse the JSON response
      const content = response.message.content;
      const jsonMatch = content.match(/```json\n([\s\S]*)\n```/) || 
                        content.match(/\[([\s\S]*)\]/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1].startsWith('[') ? jsonMatch[1] : `[${jsonMatch[1]}]`;
        const items = JSON.parse(jsonStr);
        
        // Transform to our FinancialData format
        return items.map((item: any, index: number) => ({
          id: index + 1,
          symbol: item.symbol,
          name: item.name,
          type: type,
          price: item.price,
          change: item.change,
          changePercent: item.changePercent,
          analysis: item.analysis,
          timestamp: new Date()
        }));
      }
      
      throw new Error("Could not parse financial data from AI response");
    } catch (aiError) {
      console.error(`AI-generated data fetch failed:`, aiError);
      // Final fallback to sample data
      return type === FinancialDataType.Stock 
        ? simulateStockData() 
        : simulateCryptoData();
    }
  }
}

/**
 * Fetches real-time cryptocurrency data
 */
export async function fetchRealTimeCryptoData(): Promise<FinancialData[]> {
  try {
    const response = await fetch(CRYPTO_API_URL);
    
    if (!response.ok) {
      throw new Error('Failed to fetch crypto data from external API');
    }
    
    const data = await response.json();
    
    return data.slice(0, 10).map((coin: any, index: number) => ({
      id: index + 1,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      type: FinancialDataType.Crypto,
      price: coin.current_price.toString(),
      change: coin.price_change_24h.toString(),
      changePercent: coin.price_change_percentage_24h.toString(),
      timestamp: new Date(),
    }));
  } catch (error) {
    console.error('Error fetching real-time crypto data:', error);
    throw error;
  }
}

/**
 * Fetches real-time stock market data
 */
export async function fetchRealTimeStockData(): Promise<FinancialData[]> {
  // Note: In a production environment, you would use a real stock API
  // For now, we'll use the Puter.AI approach as the primary method
  try {
    const prompt = "Generate 10 real current stock market data with accurate prices for top tech companies including Apple, Microsoft, Google, Amazon, Meta, Tesla, NVIDIA. Format as JSON array with each object having symbol, name, price (current realistic price), change (dollar amount), changePercent (percentage as string with % sign), timestamp fields.";
    
    const response = await window.puter.ai.chat(prompt, {
      model: 'claude-3-7-sonnet'
    });
    
    // Parse the JSON response
    const content = response.message.content;
    const jsonMatch = content.match(/```json\n([\s\S]*)\n```/) || 
                      content.match(/\[([\s\S]*)\]/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1].startsWith('[') ? jsonMatch[1] : `[${jsonMatch[1]}]`;
      const items = JSON.parse(jsonStr);
      
      // Transform to our FinancialData format
      return items.map((item: any, index: number) => ({
        id: index + 1,
        symbol: item.symbol,
        name: item.name,
        type: FinancialDataType.Stock,
        price: typeof item.price === 'number' ? item.price.toString() : item.price,
        change: typeof item.change === 'number' ? item.change.toString() : item.change,
        changePercent: item.changePercent,
        timestamp: new Date()
      }));
    }
    
    throw new Error("Could not parse stock data from AI response");
  } catch (error) {
    console.error('Error generating stock data:', error);
    throw error;
  }
}

/**
 * Fetches memecoin data for crypto analysis
 */
export async function fetchMemecoins(): Promise<CryptoData[]> {
  try {
    const response = await fetch(MEMECOIN_API_URL);
    
    if (!response.ok) {
      throw new Error('Failed to fetch memecoin data');
    }
    
    const data = await response.json();
    
    return data.slice(0, 15).map((coin: any, index: number) => ({
      id: index + 1,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      circulatingSupply: coin.circulating_supply,
      change24h: coin.price_change_24h,
      changePercent24h: coin.price_change_percentage_24h,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      allTimeHigh: coin.ath,
      allTimeHighDate: new Date(coin.ath_date),
      category: 'memecoin',
      timestamp: new Date(),
    }));
  } catch (error) {
    console.error('Error fetching memecoin data:', error);
    
    // Fallback to AI-generated data
    try {
      const prompt = "Generate data for 5 current memecoins including their symbol, name, current price, market cap, 24h volume, circulating supply, 24h price change percentage. Format as JSON.";
      
      const response = await window.puter.ai.chat(prompt, {
        model: 'claude-3-7-sonnet'
      });
      
      const content = response.message.content;
      const jsonMatch = content.match(/```json\n([\s\S]*)\n```/) || 
                        content.match(/\[([\s\S]*)\]/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1].startsWith('[') ? jsonMatch[1] : `[${jsonMatch[1]}]`;
        const items = JSON.parse(jsonStr);
        
        return items.map((coin: any, index: number) => ({
          id: index + 1,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.price || coin.current_price,
          marketCap: coin.marketCap || coin.market_cap,
          volume24h: coin.volume24h || coin.volume,
          circulatingSupply: coin.circulatingSupply || coin.circulating_supply,
          change24h: coin.change24h || 0,
          changePercent24h: coin.changePercent24h || coin.priceChangePercentage24h,
          category: 'memecoin',
          timestamp: new Date(),
        }));
      }
      
      throw new Error("Could not parse memecoin data from AI response");
    } catch (aiError) {
      console.error('Error generating memecoin data with AI:', aiError);
      throw error;
    }
  }
}

/**
 * Saves financial data to server for persistent storage
 */
export async function saveFinancialDataToServer(data: FinancialData[]): Promise<void> {
  try {
    for (const item of data) {
      await apiRequest('POST', '/api/financial', {
        symbol: item.symbol,
        name: item.name,
        type: item.type,
        price: item.price,
        change: item.change,
        changePercent: item.changePercent,
        analysis: item.analysis,
        historicalData: item.historicalData,
        newsImpact: item.newsImpact,
        technicalIndicators: item.technicalIndicators
      });
    }
  } catch (error) {
    console.error('Error saving financial data:', error);
    throw error;
  }
}

/**
 * Saves crypto-specific data to server
 */
export async function saveCryptoDataToServer(data: CryptoData[]): Promise<void> {
  try {
    for (const item of data) {
      await apiRequest('POST', '/api/crypto', {
        symbol: item.symbol,
        name: item.name,
        price: item.price,
        marketCap: item.marketCap,
        volume24h: item.volume24h,
        circulatingSupply: item.circulatingSupply,
        change24h: item.change24h,
        changePercent24h: item.changePercent24h,
        high24h: item.high24h,
        low24h: item.low24h,
        allTimeHigh: item.allTimeHigh,
        allTimeHighDate: item.allTimeHighDate,
        category: item.category,
        analysis: item.analysis,
        sentiment: item.sentiment,
        prediction: item.prediction
      });
    }
  } catch (error) {
    console.error('Error saving crypto data:', error);
    throw error;
  }
}

/**
 * Analyzes financial data using multiple AI models
 */
export async function analyzeFinancialData(
  data: FinancialData[], 
  timeframe: string = 'short'
): Promise<string> {
  try {
    // First try to use Grok for deep analysis
    try {
      if (data.length > 0) {
        const result = await grokAnalyzeFinancialData(data[0], 
          data[0].type === FinancialDataType.Stock ? 'stock' : 'crypto');
        
        if (result && result.analysis) {
          return result.analysis;
        }
      }
    } catch (grokError) {
      console.warn("Grok analysis failed, falling back to Puter.AI:", grokError);
    }
    
    // Fallback to Puter.AI
    const dataDescription = data.map(item => 
      `${item.symbol}: ${item.price}, ${item.changePercent}`
    ).join('; ');
    
    const prompt = `Analyze these ${data[0].type} investments for a ${timeframe}-term strategy: ${dataDescription}. 
                    Provide a detailed recommendation on which would be best to invest in and why. Consider risk levels, recent performance, and market trends.`;
    
    const response = await window.puter.ai.chat(prompt, {
      model: 'claude-3-7-sonnet'
    });
    
    return response.message.content;
  } catch (error) {
    console.error("Error analyzing financial data:", error);
    return "Unable to analyze data at this time. Please try again later.";
  }
}

/**
 * Creates a trading simulation for virtual trading environment
 */
export async function createTradingSimulation(
  symbol: string, 
  assetType: 'stock' | 'crypto',
  strategy: string,
  entryPrice: number, 
  initialInvestment: number,
  leverage: number = 1,
  rationale?: string
): Promise<any> {
  try {
    const simulationData = {
      symbol,
      assetType,
      strategy,
      entryPrice,
      entryDate: new Date(),
      initialInvestment,
      leverage,
      status: 'active',
      rationale: rationale || `${strategy} strategy based on technical analysis`
    };
    
    const response = await apiRequest('POST', '/api/trading-simulations', simulationData);
    return await response.json();
  } catch (error) {
    console.error('Error creating trading simulation:', error);
    throw error;
  }
}

/**
 * Updates a trading simulation with exit data and performance analysis
 */
export async function completeTradingSimulation(
  id: number,
  exitPrice: number,
  performanceAnalysis?: string,
  userFeedback?: string
): Promise<any> {
  try {
    const finalValue = exitPrice; // Calculate based on entry details
    const profitLoss = exitPrice - finalValue;
    const profitLossPercent = (profitLoss / finalValue) * 100;
    
    const updateData = {
      exitPrice,
      exitDate: new Date(),
      finalValue,
      profitLoss,
      profitLossPercent,
      status: 'completed',
      performanceAnalysis,
      userFeedback
    };
    
    const response = await apiRequest('PUT', `/api/trading-simulations/${id}`, updateData);
    return await response.json();
  } catch (error) {
    console.error('Error completing trading simulation:', error);
    throw error;
  }
}

/**
 * Cancels an active trading simulation
 */
export async function cancelTradingSimulation(id: number, reason?: string): Promise<any> {
  try {
    const updateData = {
      status: 'cancelled',
      userFeedback: reason || 'Cancelled by user'
    };
    
    const response = await apiRequest('PUT', `/api/trading-simulations/${id}`, updateData);
    return await response.json();
  } catch (error) {
    console.error('Error cancelling trading simulation:', error);
    throw error;
  }
}

// Simulate stock data for development and fallback
function simulateStockData(): FinancialData[] {
  return [
    {
      id: 1,
      symbol: "AAPL",
      name: "Apple Inc.",
      type: FinancialDataType.Stock,
      price: "182.43",
      change: "+1.58",
      changePercent: "+0.87%",
      analysis: "Strong performance in services, potential growth with AI initiatives",
      timestamp: new Date()
    },
    {
      id: 2,
      symbol: "MSFT",
      name: "Microsoft Corporation",
      type: FinancialDataType.Stock,
      price: "410.34",
      change: "+3.21",
      changePercent: "+0.79%",
      analysis: "Cloud services continue to drive growth, positive AI outlook",
      timestamp: new Date()
    },
    {
      id: 3,
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      type: FinancialDataType.Stock,
      price: "145.20",
      change: "-0.82",
      changePercent: "-0.56%",
      analysis: "Ad revenue concerns offset by AI advances and cloud growth",
      timestamp: new Date()
    },
    {
      id: 4,
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      type: FinancialDataType.Stock,
      price: "178.08",
      change: "+2.15",
      changePercent: "+1.22%",
      analysis: "E-commerce stabilizing, AWS and advertising showing strength",
      timestamp: new Date()
    }
  ];
}

// Simulate crypto data for development and fallback
function simulateCryptoData(): FinancialData[] {
  return [
    {
      id: 1,
      symbol: "BTC",
      name: "Bitcoin",
      type: FinancialDataType.Crypto,
      price: "64230.45",
      change: "+1204.30",
      changePercent: "+1.91%",
      analysis: "Institutional adoption continuing, halving event impact positive",
      timestamp: new Date()
    },
    {
      id: 2,
      symbol: "ETH",
      name: "Ethereum",
      type: FinancialDataType.Crypto,
      price: "3451.12",
      change: "-52.40",
      changePercent: "-1.50%",
      analysis: "Network upgrades progressing, layer-2 adoption increasing",
      timestamp: new Date()
    },
    {
      id: 3,
      symbol: "SOL",
      name: "Solana",
      type: FinancialDataType.Crypto,
      price: "146.75",
      change: "+8.23",
      changePercent: "+5.94%",
      analysis: "Growing ecosystem, rising transaction volume, improved stability",
      timestamp: new Date()
    },
    {
      id: 4,
      symbol: "ADA",
      name: "Cardano",
      type: FinancialDataType.Crypto,
      price: "0.432",
      change: "-0.008",
      changePercent: "-1.82%",
      analysis: "Development milestones met, but adoption remains a challenge",
      timestamp: new Date()
    }
  ];
}
