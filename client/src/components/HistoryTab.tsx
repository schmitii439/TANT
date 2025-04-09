import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ChevronLeft, ChevronRight, RotateCw, FileText, Users, Fingerprint } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, subDays, isAfter, isBefore, isEqual } from 'date-fns';
import { RefreshHistory, UserSession } from '@shared/schema';
import { RefreshData } from './MasterRefreshButton';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function HistoryTab() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [historyTab, setHistoryTab] = useState<'refreshes' | 'sessions' | 'models'>('refreshes');
  
  const { data: refreshHistory, isLoading: refreshHistoryLoading } = useQuery<RefreshHistory[]>({
    queryKey: ['/api/refresh-history'],
    staleTime: 60000 // 1 minute
  });
  
  const { data: sessions, isLoading: sessionsLoading } = useQuery<UserSession[]>({
    queryKey: ['/api/sessions'],
    staleTime: 60000 // 1 minute
  });
  
  // Filter history by selected date
  const filteredRefreshHistory = refreshHistory?.filter(item => {
    const itemDate = new Date(item.timestamp);
    return itemDate.toDateString() === selectedDate.toDateString();
  });
  
  const filteredSessions = sessions?.filter(session => {
    const sessionDate = new Date(session.startTime);
    return sessionDate.toDateString() === selectedDate.toDateString();
  });
  
  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedDate(prev => subDays(prev, 1));
    } else {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(selectedDate.getDate() + 1);
      
      // Don't allow navigating to future dates
      if (isBefore(nextDay, new Date()) || isEqual(nextDay, new Date())) {
        setSelectedDate(nextDay);
      }
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">History</h1>
        <div className="flex space-x-4 items-center">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[180px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => isAfter(date, new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigateDate('next')}
              disabled={selectedDate.toDateString() === new Date().toDateString()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="refreshes" onValueChange={(value) => setHistoryTab(value as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="refreshes" className="flex items-center">
            <RotateCw className="mr-2 h-4 w-4" />
            Refreshes
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center">
            <Fingerprint className="mr-2 h-4 w-4" />
            AI Models
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="refreshes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Refresh History</CardTitle>
              <CardDescription>
                Records of all data refresh operations and their outcomes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {refreshHistoryLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ))}
                  </div>
                ) : filteredRefreshHistory?.length ? (
                  <div className="space-y-4">
                    {filteredRefreshHistory.map((item) => (
                      <RefreshHistoryItem key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/60" />
                    <h3 className="mt-4 text-lg font-semibold">No refresh history</h3>
                    <p className="text-muted-foreground mt-2">
                      There are no data refreshes recorded for this date.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Sessions</CardTitle>
              <CardDescription>
                Past user interaction sessions with the assistant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {sessionsLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-5 w-60" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    ))}
                  </div>
                ) : filteredSessions?.length ? (
                  <div className="space-y-4">
                    {filteredSessions.map((session) => (
                      <SessionHistoryItem key={session.id} session={session} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground/60" />
                    <h3 className="mt-4 text-lg font-semibold">No sessions found</h3>
                    <p className="text-muted-foreground mt-2">
                      There are no user sessions recorded for this date.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="models" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Model Performance</CardTitle>
              <CardDescription>
                Performance metrics for different AI models over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Fingerprint className="mx-auto h-12 w-12 text-muted-foreground/60" />
                <h3 className="mt-4 text-lg font-semibold">Model metrics coming soon</h3>
                <p className="text-muted-foreground mt-2">
                  AI model performance tracking will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface RefreshHistoryItemProps {
  item: RefreshHistory;
}

function RefreshHistoryItem({ item }: RefreshHistoryItemProps) {
  const sourcesData = item.sources as RefreshData['sources'];
  const timestamp = new Date(item.timestamp);
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500">Partial</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-muted-foreground">
              {format(timestamp, 'h:mm a')}
            </div>
            <CardTitle className="text-base mt-1 flex items-center gap-2">
              Data Refresh {getStatusBadge(item.status)}
            </CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            {item.elapsedTime ? `${(item.elapsedTime / 1000).toFixed(1)}s` : ''}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="text-sm space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <div className="font-medium">Stocks</div>
              <div className="flex items-center">
                {sourcesData.financial.stocks.success ? (
                  <Badge className="bg-green-500 text-xs">Success</Badge>
                ) : (
                  <Badge className="bg-red-500 text-xs">Failed</Badge>
                )}
                {sourcesData.financial.stocks.count > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {sourcesData.financial.stocks.count} items
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Crypto</div>
              <div className="flex items-center">
                {sourcesData.financial.crypto.success ? (
                  <Badge className="bg-green-500 text-xs">Success</Badge>
                ) : (
                  <Badge className="bg-red-500 text-xs">Failed</Badge>
                )}
                {sourcesData.financial.crypto.count > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {sourcesData.financial.crypto.count} items
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">News</div>
              <div className="flex items-center">
                {sourcesData.news.success ? (
                  <Badge className="bg-green-500 text-xs">Success</Badge>
                ) : (
                  <Badge className="bg-red-500 text-xs">Failed</Badge>
                )}
                {sourcesData.news.count > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {sourcesData.news.count} items
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SessionHistoryItemProps {
  session: UserSession;
}

function SessionHistoryItem({ session }: SessionHistoryItemProps) {
  const startTime = new Date(session.startTime);
  const endTime = session.endTime ? new Date(session.endTime) : null;
  
  const duration = endTime 
    ? Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60) 
    : null;
  
  // Extract some metrics from the session logs
  const tabsLog = session.activeTabsLog || {};
  const queriesLog = session.queriesLog || {};
  const aiInteractionsLog = session.aiInteractionsLog || {};
  
  // Convert unknown types to known types safely
  const tabsLogKeys = typeof tabsLog === 'object' && tabsLog ? Object.keys(tabsLog) : [];
  const queriesLogKeys = typeof queriesLog === 'object' && queriesLog ? Object.keys(queriesLog) : [];
  const aiInteractionsLogKeys = typeof aiInteractionsLog === 'object' && aiInteractionsLog ? Object.keys(aiInteractionsLog) : [];
  
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-muted-foreground">
              {format(startTime, 'h:mm a')} 
              {endTime ? ` - ${format(endTime, 'h:mm a')}` : ' (Active)'}
            </div>
            <CardTitle className="text-base mt-1">
              User Session 
              {!endTime && <Badge className="ml-2 bg-blue-500">Active</Badge>}
            </CardTitle>
          </div>
          {duration !== null && (
            <Badge variant="outline" className="text-xs font-normal">
              {duration} min
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="text-sm">
          {!tabsLogKeys.length && 
           !queriesLogKeys.length && 
           !aiInteractionsLogKeys.length ? (
            <div className="text-muted-foreground italic">
              No detailed activity recorded for this session
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-normal">
                  {aiInteractionsLogKeys.length} AI interactions
                </Badge>
                <Badge variant="outline" className="text-xs font-normal">
                  {queriesLogKeys.length} queries
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Session ID: {session.id}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}