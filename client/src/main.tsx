import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import { preloadVoiceAPIs } from "./lib/voiceServiceWorker";
import { initVoiceSystem } from "./lib/voiceOutput";
import "./index.css";

// Initialize voice systems and APIs
preloadVoiceAPIs();
initVoiceSystem();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
