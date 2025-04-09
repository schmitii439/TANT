import { apiRequest } from '@/lib/queryClient';
import { FinancialData, FinancialDataType } from '@/types';

// Function to fetch financial data from the server
export async function fetchFinancialData(type: FinancialDataType): Promise<FinancialData[]> {
  try {
    const response = await apiRequest('GET', `/api/financial?type=${type}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${type} data:`, error);
    
    // If the API fails, simulate with sample data
    // In a production app, you should handle this more gracefully
    return type === FinancialDataType.Stock 
      ? simulateStockData() 
      : simulateCryptoData();
  }
}

// Function to fetch financial data from external sources
export async function fetchExternalFinancialData(type: FinancialDataType): Promise<FinancialData[]> {
  try {
    // In a real implementation, you would call an external financial API
    // Since we're using puter.ai, we can generate simulated data
    const prompt = type === FinancialDataType.Stock
      ? "Generate 5 stock symbols with current price, change percentage, and brief analysis. Format as JSON array with symbol, name, price, change, changePercent, and analysis fields."
      : "Generate 5 cryptocurrency symbols with current price, change percentage, and brief analysis. Format as JSON array with symbol, name, price, change, changePercent, and analysis fields.";
    
    const response = await puter.ai.chat(prompt, {
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
  } catch (error) {
    console.error(`Error fetching external ${type} data:`, error);
    return type === FinancialDataType.Stock 
      ? simulateStockData() 
      : simulateCryptoData();
  }
}

// Function to save fetched financial data to the server
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
        analysis: item.analysis
      });
    }
  } catch (error) {
    console.error("Error saving financial data to server:", error);
    throw error;
  }
}

// Function to analyze financial data using AI
export async function analyzeFinancialData(
  data: FinancialData[], 
  timeframe: string = 'short'
): Promise<string> {
  try {
    const dataDescription = data.map(item => 
      `${item.symbol}: ${item.price}, ${item.changePercent}`
    ).join('; ');
    
    const prompt = `Analyze these ${data[0].type} investments for a ${timeframe}-term strategy: ${dataDescription}. 
                    Provide a brief recommendation on which would be best to invest in.`;
    
    const response = await puter.ai.chat(prompt, {
      model: 'claude-3-7-sonnet'
    });
    
    return response.message.content;
  } catch (error) {
    console.error("Error analyzing financial data:", error);
    return "Unable to analyze data at this time. Please try again later.";
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
