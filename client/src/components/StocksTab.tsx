import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, RefreshCw, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchFinancialData } from '@/lib/financeService';
import type { FinancialData, FinancialDataType, ChartData } from '@/types';

export function StocksTab() {
  const [stockData, setStockData] = useState<FinancialData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('1m');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  
  useEffect(() => {
    loadStockData();
  }, []);
  
  useEffect(() => {
    // Generate mock chart data based on period
    generateChartData();
  }, [chartPeriod, stockData]);
  
  const loadStockData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFinancialData(FinancialDataType.Stock);
      setStockData(data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshStockData = () => {
    loadStockData();
  };
  
  const generateChartData = () => {
    // This would ideally use real historical data
    // For now, we're generating sample data
    const sampleData: ChartData[] = [
      { name: 'Tech', value: 245 },
      { name: 'Finance', value: 190 },
      { name: 'Energy', value: 170 },
      { name: 'Health', value: 210 },
      { name: 'Consumer', value: 180 }
    ];
    
    setChartData(sampleData);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-md lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-lg font-medium">Market Trends</h2>
              </div>
              <Select value={chartPeriod} onValueChange={setChartPeriod}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1w">1 Week</SelectItem>
                  <SelectItem value="1m">1 Month</SelectItem>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {isLoading ? (
              <div className="h-64 mb-4 bg-muted/30 rounded-lg flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
                  <div className="w-4 h-4 rounded-full bg-primary animate-pulse delay-100"></div>
                  <div className="w-4 h-4 rounded-full bg-primary animate-pulse delay-200"></div>
                </div>
              </div>
            ) : (
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Tech Sector</p>
                <p className="text-lg font-medium text-green-500">+1.8%</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Finance</p>
                <p className="text-lg font-medium text-red-500">-0.6%</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Energy</p>
                <p className="text-lg font-medium text-green-500">+0.3%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <Wallet className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-lg font-medium">Investment Helper</h2>
            </div>
            
            <div className="flex flex-col space-y-2 mb-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">Short-term Focus</span>
                <div className="text-right">
                  <span className="text-sm font-medium">Technology</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">Long-term Focus</span>
                <div className="text-right">
                  <span className="text-sm font-medium">Energy</span>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-muted/30 rounded-lg mb-4">
              <h3 className="text-sm font-medium mb-2">AI Analysis</h3>
              <p className="text-xs text-muted-foreground">
                Based on current market conditions and historical trends, allocating 60% to established tech companies and 40% to renewable energy could provide balanced growth.
              </p>
            </div>
            
            <Button className="w-full">
              Generate Detailed Report
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-lg font-medium">Stock Market</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={refreshStockData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              <span>Refresh</span>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          ) : stockData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No stock data available at the moment.</p>
              <Button variant="outline" size="sm" onClick={refreshStockData} className="mt-2">
                Refresh
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="text-xs text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2 px-3 text-left">Symbol</th>
                    <th className="py-2 px-3 text-left">Name</th>
                    <th className="py-2 px-3 text-left">Price</th>
                    <th className="py-2 px-3 text-left">Change</th>
                    <th className="py-2 px-3 text-left">AI Analysis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stockData.map(stock => (
                    <tr key={stock.id}>
                      <td className="py-2 px-3 font-medium">{stock.symbol}</td>
                      <td className="py-2 px-3">{stock.name}</td>
                      <td className="py-2 px-3 font-mono">${stock.price}</td>
                      <td className={`py-2 px-3 font-medium ${parseFloat(stock.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.changePercent}
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">{stock.analysis || 'Analysis not available'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
