import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bitcoin, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchFinancialData } from '@/lib/financeService';
import type { FinancialData, FinancialDataType } from '@/types';

export function CryptoTab() {
  const [cryptoData, setCryptoData] = useState<FinancialData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [strategy, setStrategy] = useState<'safe' | 'risky'>('safe');
  
  useEffect(() => {
    loadCryptoData();
  }, []);
  
  const loadCryptoData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFinancialData(FinancialDataType.Crypto);
      setCryptoData(data);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshCryptoData = () => {
    loadCryptoData();
  };
  
  const getCryptoStatusBadge = (change: string) => {
    const changeValue = parseFloat(change);
    
    if (changeValue > 5) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <TrendingUp className="h-3 w-3 mr-1" />
          RISING
        </Badge>
      );
    } else if (changeValue < -5) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <TrendingDown className="h-3 w-3 mr-1" />
          FALLING
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          STABLE
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bitcoin className="h-5 w-5 text-warning mr-2" />
              <h2 className="text-lg font-medium">Cryptocurrency Tracker</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={refreshCryptoData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              <span>Refresh</span>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg animate-pulse">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-muted mr-2"></div>
                      <div className="h-4 w-20 bg-muted rounded"></div>
                    </div>
                    <div className="h-4 w-16 bg-muted rounded"></div>
                  </div>
                  <div className="flex justify-between mb-1">
                    <div className="h-3 w-10 bg-muted rounded"></div>
                    <div className="h-3 w-16 bg-muted rounded"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-muted rounded"></div>
                    <div className="h-3 w-10 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : cryptoData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No cryptocurrency data available at the moment.</p>
              <Button variant="outline" size="sm" onClick={refreshCryptoData} className="mt-2">
                Refresh
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {cryptoData.map(crypto => (
                <div key={crypto.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                        <span className="text-primary font-medium">{crypto.symbol.substring(0, 2)}</span>
                      </div>
                      <span className="font-medium">{crypto.name}</span>
                    </div>
                    {getCryptoStatusBadge(crypto.changePercent)}
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Price</span>
                    <span className="text-sm font-mono font-medium">${crypto.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">24h Change</span>
                    <span className={`text-sm font-medium ${parseFloat(crypto.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {crypto.changePercent}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="text-md font-medium mb-3">AI Trading Analysis</h3>
            
            <Tabs defaultValue="safe" className="mb-4">
              <TabsList>
                <TabsTrigger 
                  value="safe" 
                  onClick={() => setStrategy('safe')}
                >
                  Low Risk Strategy
                </TabsTrigger>
                <TabsTrigger 
                  value="risky" 
                  onClick={() => setStrategy('risky')}
                >
                  High Risk Strategy
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="safe" className="pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-medium mb-2">Safe Strategy</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      This conservative strategy aims for steady growth with minimized risk.
                    </p>
                    <div className="flex justify-between text-xs">
                      <span>Suggested Investment:</span>
                      <span className="font-medium">Bitcoin (BTC), Ethereum (ETH)</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>Expected Monthly Return:</span>
                      <span className="font-medium text-green-500">+3-5%</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">Analysis:</p>
                      <p className="text-xs text-muted-foreground">Established cryptocurrencies with strong market cap and history offer more predictable movements. Allocate 70% to BTC, 30% to ETH for a balanced approach.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="risky" className="pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-medium mb-2">High Risk Strategy</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      For those seeking higher returns with increased volatility risk.
                    </p>
                    <div className="flex justify-between text-xs">
                      <span>Suggested Investment:</span>
                      <span className="font-medium">Emerging Altcoins</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>Expected Monthly Return:</span>
                      <span className="font-medium text-yellow-500">+15-30%</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">Analysis:</p>
                      <p className="text-xs text-muted-foreground">New projects with strong technological innovations present greater growth potential but also higher risk. Consider using leverage cautiously with strict stop-loss orders to protect capital.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="text-center mt-4">
              <Button>
                Generate Detailed Trading Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
