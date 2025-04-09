import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { fetchExternalFinancialData, fetchRealTimeStockData, fetchRealTimeCryptoData, saveFinancialDataToServer } from '@/lib/financeService';
import { fetchExternalNews, saveNewsToServer } from '@/lib/newsService';
import { FinancialDataType } from '@/types';
import { apiRequest } from '@/lib/queryClient';

interface MasterRefreshButtonProps {
  onRefreshStart?: () => void;
  onRefreshComplete?: (refreshData: RefreshData) => void;
}

export interface RefreshData {
  timestamp: Date;
  sources: {
    financial: {
      stocks: {
        success: boolean;
        count: number;
        error?: string;
      };
      crypto: {
        success: boolean;
        count: number;
        error?: string;
      };
    };
    news: {
      success: boolean;
      count: number;
      error?: string;
    };
    custom?: {
      name: string;
      success: boolean;
      count: number;
      error?: string;
    }[];
  };
  elapsedTime: number;
}

export function MasterRefreshButton({ onRefreshStart, onRefreshComplete }: MasterRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTimestamp, setLastRefreshTimestamp] = useState<Date | null>(null);
  const [lastRefreshStatus, setLastRefreshStatus] = useState<'idle' | 'success' | 'partial' | 'failed'>('idle');
  const { toast } = useToast();

  const handleGlobalRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    onRefreshStart?.();
    const startTime = Date.now();
    
    const refreshData: RefreshData = {
      timestamp: new Date(),
      sources: {
        financial: {
          stocks: { success: false, count: 0 },
          crypto: { success: false, count: 0 }
        },
        news: { success: false, count: 0 },
        custom: []
      },
      elapsedTime: 0
    };
    
    try {
      // Fetch stock data
      try {
        const stockData = await fetchRealTimeStockData();
        if (stockData && stockData.length > 0) {
          await saveFinancialDataToServer(stockData);
          refreshData.sources.financial.stocks = {
            success: true,
            count: stockData.length
          };
        }
      } catch (error) {
        console.error('Error refreshing stock data:', error);
        refreshData.sources.financial.stocks.error = error.message;
      }
      
      // Fetch crypto data
      try {
        const cryptoData = await fetchRealTimeCryptoData();
        if (cryptoData && cryptoData.length > 0) {
          await saveFinancialDataToServer(cryptoData);
          refreshData.sources.financial.crypto = {
            success: true,
            count: cryptoData.length
          };
        }
      } catch (error) {
        console.error('Error refreshing crypto data:', error);
        refreshData.sources.financial.crypto.error = error.message;
      }
      
      // Fetch news
      try {
        const newsData = await fetchExternalNews();
        if (newsData && newsData.length > 0) {
          await saveNewsToServer(newsData);
          refreshData.sources.news = {
            success: true,
            count: newsData.length
          };
        }
      } catch (error) {
        console.error('Error refreshing news data:', error);
        refreshData.sources.news.error = error.message;
      }
      
      // Save refresh details to database
      try {
        await saveRefreshHistory(refreshData);
      } catch (error) {
        console.error('Error saving refresh history:', error);
      }
      
      // Calculate final status
      const allSuccess = refreshData.sources.financial.stocks.success && 
                         refreshData.sources.financial.crypto.success && 
                         refreshData.sources.news.success;
                         
      const allFailed = !refreshData.sources.financial.stocks.success && 
                       !refreshData.sources.financial.crypto.success && 
                       !refreshData.sources.news.success;
                        
      if (allSuccess) {
        setLastRefreshStatus('success');
        toast({
          title: "Data refresh complete",
          description: `Successfully updated stocks, crypto, and news data.`,
        });
      } else if (allFailed) {
        setLastRefreshStatus('failed');
        toast({
          title: "Data refresh failed",
          description: "Unable to update data from any sources. Check your connection.",
          variant: "destructive"
        });
      } else {
        setLastRefreshStatus('partial');
        toast({
          title: "Partial data refresh",
          description: "Some data sources were updated successfully, but others failed.",
          variant: "warning"
        });
      }
      
      refreshData.elapsedTime = Date.now() - startTime;
      setLastRefreshTimestamp(refreshData.timestamp);
      onRefreshComplete?.(refreshData);
      
    } catch (error) {
      console.error('Global refresh error:', error);
      setLastRefreshStatus('failed');
      toast({
        title: "Data refresh failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Save refresh history to database for historical tracking
  async function saveRefreshHistory(refreshData: RefreshData) {
    try {
      await apiRequest('POST', '/api/refresh-history', {
        timestamp: refreshData.timestamp,
        sources: refreshData.sources,
        elapsedTime: refreshData.elapsedTime,
        status: getStatusFromRefreshData(refreshData)
      });
    } catch (error) {
      console.error('Error saving refresh history:', error);
      throw error;
    }
  }
  
  function getStatusFromRefreshData(refreshData: RefreshData): string {
    const { stocks, crypto } = refreshData.sources.financial;
    const { news } = refreshData.sources;
    
    if (stocks.success && crypto.success && news.success) {
      return 'success';
    } else if (!stocks.success && !crypto.success && !news.success) {
      return 'failed';
    } else {
      return 'partial';
    }
  }
  
  function getStatusIcon() {
    switch(lastRefreshStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  }
  
  function formatTimestamp(timestamp: Date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return timestamp.toLocaleTimeString();
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={handleGlobalRefresh}
              disabled={isRefreshing}
              className="relative"
            >
              {isRefreshing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}
            </Button>
            {lastRefreshStatus !== 'idle' && !isRefreshing && (
              <div className="absolute -top-1 -right-1">
                {getStatusIcon()}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-semibold">Refresh all data sources</p>
            {lastRefreshTimestamp && (
              <div className="text-xs text-muted-foreground">
                Last refreshed: {formatTimestamp(lastRefreshTimestamp)}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}