import { apiRequest } from '@/lib/queryClient';
import { NewsItem } from '@/types';

// Function to fetch news from the server
export async function fetchNews(): Promise<NewsItem[]> {
  try {
    const response = await apiRequest('GET', '/api/news');
    return await response.json();
  } catch (error) {
    console.error("Error fetching news:", error);
    
    // If the API fails, simulate with sample data
    // In a production app, you should handle this more gracefully
    return simulateNewsData();
  }
}

// Function to fetch news from external sources
export async function fetchExternalNews(): Promise<NewsItem[]> {
  try {
    // In a real implementation, you would call an external news API
    // Since we're using puter.ai, we can generate news summaries
    const response = await puter.ai.chat(
      "Generate 5 recent news headlines about technology, finance, and global events. Format as JSON array with title, content, summary, source, and category fields.",
      { model: 'google/gemini-2.5-pro-exp-03-25:free' }
    );
    
    // Parse the JSON response
    const content = response.message.content;
    const jsonMatch = content.match(/```json\n([\s\S]*)\n```/) || 
                    content.match(/\[([\s\S]*)\]/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1].startsWith('[') ? jsonMatch[1] : `[${jsonMatch[1]}]`;
      const newsItems = JSON.parse(jsonStr);
      
      // Transform to our NewsItem format
      return newsItems.map((item: any, index: number) => ({
        id: index + 1,
        title: item.title,
        content: item.content,
        summary: item.summary,
        source: item.source,
        category: item.category,
        publishedAt: new Date(),
        saved: "false"
      }));
    }
    
    throw new Error("Could not parse news data from AI response");
  } catch (error) {
    console.error("Error fetching external news:", error);
    return simulateNewsData();
  }
}

// Function to save fetched news to the server
export async function saveNewsToServer(news: NewsItem[]): Promise<void> {
  try {
    for (const item of news) {
      await apiRequest('POST', '/api/news', {
        title: item.title,
        content: item.content,
        summary: item.summary || null,
        source: item.source || null,
        category: item.category || null,
        publishedAt: item.publishedAt,
        saved: item.saved || "false",
        impact: null,
        userInterest: null
      });
    }
  } catch (error) {
    console.error("Error saving news to server:", error);
    throw error;
  }
}

// Simulate news data for development and fallback
function simulateNewsData(): NewsItem[] {
  return [
    {
      id: 1,
      title: "AI Breakthrough Could Revolutionize Financial Analysis",
      content: "Researchers have developed a new AI model capable of predicting market trends with unprecedented accuracy. The model, which uses a novel approach to analyzing historical data, has shown a 35% improvement over existing systems in early tests.",
      summary: "New AI model shows 35% better accuracy in financial predictions.",
      source: "TechFinance Today",
      category: "TECHNOLOGY",
      publishedAt: new Date(Date.now() - 3600000), // 1 hour ago
      saved: "false"
    },
    {
      id: 2,
      title: "Global Markets React to Central Bank Announcements",
      content: "Stock markets worldwide showed mixed reactions today following announcements from major central banks. While European markets initially dropped, they recovered by mid-day trading. Asian markets closed higher, with Japan's Nikkei index up 1.2%.",
      summary: "Markets show mixed response to central bank policy updates.",
      source: "Global Economic Times",
      category: "FINANCE",
      publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
      saved: "false"
    },
    {
      id: 3,
      title: "New Regulations for Cryptocurrency Trading Coming Next Month",
      content: "Regulatory authorities have announced a new framework for cryptocurrency trading that will take effect next month. The regulations aim to increase transparency and reduce fraud while still allowing for innovation in the space.",
      summary: "New crypto regulations focus on transparency and fraud prevention.",
      source: "Crypto News Network",
      category: "CRYPTO",
      publishedAt: new Date(Date.now() - 86400000), // 1 day ago
      saved: "false"
    }
  ];
}
