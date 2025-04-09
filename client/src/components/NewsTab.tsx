import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, MoveUp, Volume2, RefreshCw } from 'lucide-react';
import { fetchNews } from '@/lib/newsService';
import { speak, stopSpeaking } from '@/lib/speechSynthesis';
import type { NewsItem } from '@/types';

export function NewsTab() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReading, setIsReading] = useState(false);
  const [newsView, setNewsView] = useState<'detailed' | 'summary'>('detailed');
  
  useEffect(() => {
    loadNews();
  }, []);
  
  const loadNews = async () => {
    setIsLoading(true);
    try {
      const news = await fetchNews();
      setNewsItems(news);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshNews = () => {
    loadNews();
  };
  
  const readNewsAloud = () => {
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
      return;
    }
    
    setIsReading(true);
    
    // Prepare news content for speech synthesis
    const newsToRead = newsItems.slice(0, 3).map(news => {
      return newsView === 'detailed' 
        ? `${news.title}. ${news.content}` 
        : `${news.title}. ${news.summary || ''}`;
    }).join('. Next article. ');
    
    speak(newsToRead, () => {
      setIsReading(false);
    });
  };
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Newspaper className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-medium">News & Updates</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={refreshNews}>
              <RefreshCw className="h-4 w-4 mr-1" />
              <span>Refresh</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={readNewsAloud}>
              {isReading ? (
                <>
                  <Volume2 className="h-4 w-4 mr-1 animate-pulse" />
                  <span>Stop Reading</span>
                </>
              ) : (
                <>
                  <MoveUp className="h-4 w-4 mr-1" />
                  <span>Read Aloud</span>
                </>
              )}
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="detailed" className="mb-4">
          <TabsList>
            <TabsTrigger 
              value="detailed" 
              onClick={() => setNewsView('detailed')}
            >
              Detailed
            </TabsTrigger>
            <TabsTrigger 
              value="summary" 
              onClick={() => setNewsView('summary')}
            >
              Summary
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded mb-2 w-1/4"></div>
                <div className="h-6 bg-muted rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-muted rounded mb-2 w-full"></div>
                <div className="h-4 bg-muted rounded mb-2 w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : newsItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No news available at the moment.</p>
            <Button variant="outline" size="sm" onClick={refreshNews} className="mt-2">
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {newsView === 'detailed' ? (
              newsItems.map(item => (
                <div key={item.id} className="p-4 bg-muted/30 rounded-lg">
                  <span className="text-xs text-primary font-medium uppercase">
                    {item.category || 'General'}
                  </span>
                  <h3 className="text-lg font-medium mt-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{item.content}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.publishedAt)}
                    </span>
                    <Button variant="link" size="sm" className="text-xs">
                      Read Full Article
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              newsItems.map(item => (
                <div key={item.id} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-xs text-primary font-medium uppercase">
                      {item.category || 'General'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.publishedAt)}
                    </span>
                  </div>
                  <h3 className="text-md font-medium mt-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.summary || item.content.substring(0, 100) + '...'}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
