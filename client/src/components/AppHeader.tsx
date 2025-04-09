import { Button } from "@/components/ui/button";
import { Sun, Moon, Mic, MicOff } from "lucide-react";

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
  return (
    <header className="bg-card text-card-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-semibold">AI Assistant</span>
        </div>
        <div className="flex items-center space-x-4">
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
