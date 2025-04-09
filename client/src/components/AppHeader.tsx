import { Button } from "@/components/ui/button";
import { Sun, Moon, Mic, MicOff } from "lucide-react";
import { MasterRefreshButton, RefreshData } from "./MasterRefreshButton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface AppHeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  microphoneActive: boolean;
  toggleMicrophone: () => void;
}

export function AppHeader({ 
  darkMode, 
  toggleDarkMode, 
  microphoneActive, 
  toggleMicrophone 
}: AppHeaderProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefreshStart = () => {
    setIsRefreshing(true);
    toast({
      title: "Refreshing all data",
      description: "Fetching the latest information from all sources...",
      duration: 2000,
    });
  };
  
  const handleRefreshComplete = (refreshData: RefreshData) => {
    setIsRefreshing(false);
    
    // Count successful and failed sources
    const financial = refreshData.sources.financial;
    const totalSources = 3; // stocks, crypto, news
    const successCount = [
      financial.stocks.success, 
      financial.crypto.success, 
      refreshData.sources.news.success
    ].filter(Boolean).length;
    
    if (successCount === totalSources) {
      toast({
        title: "Data refresh complete",
        description: `Successfully updated ${successCount} data sources in ${refreshData.elapsedTime / 1000}s`,
      });
    } else if (successCount === 0) {
      toast({
        title: "Data refresh failed",
        description: "Unable to update any data sources. Check your connection.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Partial data refresh",
        description: `Updated ${successCount}/${totalSources} data sources. Some updates failed.`,
      });
    }
  };
  
  return (
    <header className="bg-card text-card-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-semibold">AI Assistant</span>
        </div>
        <div className="flex items-center space-x-4">
          <MasterRefreshButton 
            onRefreshStart={handleRefreshStart}
            onRefreshComplete={handleRefreshComplete}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode} 
            className="rounded-full"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMicrophone} 
            className="rounded-full"
          >
            {microphoneActive ? (
              <Mic className="h-5 w-5 text-primary animate-pulse" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
