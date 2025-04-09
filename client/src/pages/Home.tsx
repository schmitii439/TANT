import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { TabNavigation } from "@/components/TabNavigation";
import { AssistantTab } from "@/components/AssistantTab";
import { EnhancedAssistantTab } from "@/components/EnhancedAssistantTab";
import { NewsTab } from "@/components/NewsTab";
import { StocksTab } from "@/components/StocksTab";
import { CryptoTab } from "@/components/CryptoTab";
import { HistoryTab } from "@/components/HistoryTab";
import { AnalysisTab } from "@/components/AnalysisTab";
import { ToolsTab } from "@/components/ToolsTab";
import { VoiceCommandButton } from "@/components/VoiceCommandButton";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { TabId } from "@/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("assistant");
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [useEnhancedAssistant, setUseEnhancedAssistant] = useState(true);

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
        {activeTab === "assistant" && (
          <>
            <div className="mb-4 flex justify-end">
              <RadioGroup
                defaultValue={useEnhancedAssistant ? "enhanced" : "basic"}
                className="flex space-x-4"
                onValueChange={(value) => setUseEnhancedAssistant(value === "enhanced")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="basic" id="basic-assistant" />
                  <Label htmlFor="basic-assistant" className="cursor-pointer">Basic Assistant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="enhanced" id="enhanced-assistant" />
                  <Label htmlFor="enhanced-assistant" className="cursor-pointer">Advanced Intelligence</Label>
                </div>
              </RadioGroup>
            </div>
            {useEnhancedAssistant ? <EnhancedAssistantTab /> : <AssistantTab />}
          </>
        )}
        {activeTab === "news" && <NewsTab />}
        {activeTab === "stocks" && <StocksTab />}
        {activeTab === "crypto" && <CryptoTab />}
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "analysis" && <AnalysisTab />}
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
