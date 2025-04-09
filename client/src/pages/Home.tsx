import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { TabNavigation } from "@/components/TabNavigation";
import { AssistantTab } from "@/components/AssistantTab";
import { NewsTab } from "@/components/NewsTab";
import { StocksTab } from "@/components/StocksTab";
import { CryptoTab } from "@/components/CryptoTab";
import { ToolsTab } from "@/components/ToolsTab";
import { VoiceCommandButton } from "@/components/VoiceCommandButton";
import { useDarkMode } from "@/hooks/useDarkMode";
import type { TabId } from "@/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("assistant");
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [microphoneActive, setMicrophoneActive] = useState(false);

  const toggleMicrophone = () => {
    setMicrophoneActive(!microphoneActive);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <AppHeader 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        microphoneActive={microphoneActive} 
        toggleMicrophone={toggleMicrophone} 
      />
      
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="container mx-auto px-4 py-6">
        {activeTab === "assistant" && <AssistantTab />}
        {activeTab === "news" && <NewsTab />}
        {activeTab === "stocks" && <StocksTab />}
        {activeTab === "crypto" && <CryptoTab />}
        {activeTab === "tools" && <ToolsTab />}
      </main>
      
      <VoiceCommandButton 
        setActiveTab={setActiveTab} 
        microphoneActive={microphoneActive}
        toggleMicrophone={toggleMicrophone}
      />
    </div>
  );
}
