import { useState, useEffect } from 'react';
import { Tab, TabId } from '@/types';
import { Bot, Newspaper, TrendingUp, Bitcoin, Wrench, History, BarChart2 } from 'lucide-react';

interface TabNavigationProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'assistant', name: 'Assistant', icon: 'bot' },
    { id: 'news', name: 'News', icon: 'newspaper' },
    { id: 'stocks', name: 'Stocks', icon: 'trending-up' },
    { id: 'crypto', name: 'Crypto', icon: 'bitcoin' },
    { id: 'history', name: 'History', icon: 'history' },
    { id: 'analysis', name: 'Analysis', icon: 'bar-chart' },
    { id: 'tools', name: 'Tools', icon: 'wrench' }
  ]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'bot':
        return <Bot className="h-5 w-5" />;
      case 'newspaper':
        return <Newspaper className="h-5 w-5" />;
      case 'trending-up':
        return <TrendingUp className="h-5 w-5" />;
      case 'bitcoin':
        return <Bitcoin className="h-5 w-5" />;
      case 'history':
        return <History className="h-5 w-5" />;
      case 'bar-chart':
        return <BarChart2 className="h-5 w-5" />;
      case 'wrench':
        return <Wrench className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <nav className="bg-card text-card-foreground border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap 
                hover:text-primary transition-colors duration-200 flex items-center
                ${activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent'}
              `}
            >
              <span className="mr-2">{getIcon(tab.icon)}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
