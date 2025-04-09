import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types';
import { sendModelMessage, compareModelResponses, getChaoticResponse, ChatTone, AiModel } from '@/lib/multiModelAi';
import { speak, stopSpeaking } from '@/lib/speechSynthesis';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Send, RotateCcw, Volume2, VolumeX, Trash2, RefreshCw, MessageSquare, Eye, Sparkles, Database, Edit, Zap } from 'lucide-react';
import { phoenixModel, phoenixFast, phoenixDeep } from '@/lib/phoenixModel';
import { detectLanguageCommand, shouldRespondInGerman, getGermanLanguageReminder, Language, setActiveLanguage, transformPromptForLanguage } from '@/lib/languageController';
import { detectConspiracyModeActivation, isConspiracyModeActive, deactivateConspiracyMode, activateConspiracyMode } from '@/lib/conspiracyMode';
import { initDataCollection, runFullCollectionCycle, getCollectedData, hasDataForDate } from '@/lib/dataCollectionModule';

export function EnhancedAssistantTab() {
  // Message history state
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [streamedContent, setStreamedContent] = useState('');
  
  // UI state for assistive features
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [selectedTone, setSelectedTone] = useState<ChatTone>(ChatTone.Logical);
  // We use union type with string to allow both enum values and special options
  const [selectedModel, setSelectedModel] = useState<string>('auto');
  const [useRandomModel, setUseRandomModel] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [language, setLanguage] = useState<'english' | 'german'>('german');
  
  // Track conspiracy mode state
  const [conspiracyModeActive, setConspiracyModeActive] = useState(false);
  
  // For editing messages
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  
  // Update conspiracy mode indicator
  useEffect(() => {
    setConspiracyModeActive(isConspiracyModeActive());
  }, [messages]);
  
  // Speech recognition
  // Get toast hook for notifications
  const { toast } = useToast();
  
  // Speech recognition hook
  const { 
    transcript, 
    listening, 
    startListening, 
    stopListening, 
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Refs for autoscroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  // Initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting: Message = {
        id: 0,
        role: 'assistant',
        content: generateCinematicIntro(),
        model: 'system',
        timestamp: new Date()
      };
      
      setMessages([initialGreeting]);
      
      // Fetch message history from server if available
      fetchMessageHistory();
      
      // Initialize data collection module
      initDataCollection();
    }
  }, []);
  
  // Voice recognition effect
  useEffect(() => {
    if (transcript) {
      setCurrentInput(transcript);
    }
  }, [transcript]);
  
  // Auto-scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedContent]);
  
  // Fetch message history from the server
  async function fetchMessageHistory() {
    try {
      const response = await apiRequest('GET', '/api/messages');
      const serverMessages: Message[] = await response.json();
      
      if (serverMessages.length > 0) {
        setMessages(prev => {
          // Combine server messages with the greeting, avoiding duplicates
          const combinedMessages = [...prev];
          
          serverMessages.forEach(serverMsg => {
            // Check if this message already exists in our state
            const exists = combinedMessages.some(msg => 
              msg.id === serverMsg.id || 
              (msg.content === serverMsg.content && msg.role === serverMsg.role)
            );
            
            if (!exists) {
              combinedMessages.push(serverMsg);
            }
          });
          
          // Sort by timestamp
          return combinedMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });
      }
    } catch (error) {
      console.error('Error fetching message history:', error);
    }
  }
  
  // Save a message to the server
  async function saveMessageToServer(message: Omit<Message, 'id' | 'timestamp'>) {
    try {
      await apiRequest('POST', '/api/messages', {
        role: message.role,
        content: message.content,
        model: message.model
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }
  
  // Generate a cinematic intro message
  function generateCinematicIntro(): string {
    const greetings = [
      "Initializing Core Intelligence System... all protocols active. Financial, News and Strategic modules online. What intelligence do you require today?",
      
      "Financial Combat Unit activated. Markets under surveillance. Data flows secured. Intelligence module engaged. At your command.",
      
      "Crypto Warfare systems online. Memecoin radar calibrated. Market psychology analysis ready. What's your objective?",
      
      "Intelligence fusion complete. Real-time data streams operational. Multiple AI cores synchronized. How shall we proceed?",
      
      "Welcome back, Commander. All systems operational. The digital battlefield awaits your orders."
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Add a user message and get AI response
  async function handleSendMessage() {
    if (!currentInput.trim()) return;
    
    // Check for special commands like conspiracy mode activation
    const isConspiracyActivation = detectConspiracyModeActivation(currentInput);
    
    // Detect language commands (e.g., "Switch to English")
    const isLanguageCommand = detectLanguageCommand(currentInput);
    
    // Create and add user message
    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: currentInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    saveMessageToServer(userMessage);
    setCurrentInput('');
    resetTranscript();
    setStreamedContent('');
    setLoading(true);
    
    try {
      // For conspiracy mode activation, respond with an acknowledgment
      if (isConspiracyActivation) {
        const activationResponse: Message = {
          id: messages.length + 2,
          role: 'assistant',
          content: "Ich habe verstanden, aber ich antworte auf Deutsch. Aktiviere den freien Denkmodus für tiefergehende Analysen.",
          model: 'system',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, activationResponse]);
        saveMessageToServer(activationResponse);
        
        if (voiceOutputEnabled) {
          speak(activationResponse.content);
        }
        
        setLoading(false);
        return;
      }
      
      // For language command, respond with confirmation
      if (isLanguageCommand) {
        // Check if we should respond in German despite English request
        if (shouldRespondInGerman(currentInput)) {
          const languageReminder: Message = {
            id: messages.length + 2,
            role: 'assistant',
            content: getGermanLanguageReminder(),
            model: 'system',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, languageReminder]);
          saveMessageToServer(languageReminder);
          
          if (voiceOutputEnabled) {
            speak(languageReminder.content);
          }
          
          setLoading(false);
          return;
        }
      }
      
      // Update app state based on language setting
      if (language === 'german') {
        setActiveLanguage(Language.German);
      } else {
        setActiveLanguage(Language.English);
      }
      
      if (compareMode) {
        // Compare mode: get responses from multiple models
        const modelResponses = await compareModelResponses(
          transformPromptForLanguage(currentInput),
          [AiModel.GPT4o, AiModel.Claude37Sonnet, AiModel.Grok2, AiModel.Llama4Maverick]
        );
        
        // Add each model's response as a separate message
        for (const response of modelResponses) {
          const aiMessage: Message = {
            id: messages.length + 2 + modelResponses.indexOf(response),
            role: 'assistant',
            content: response.content,
            model: response.model,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
          saveMessageToServer(aiMessage);
          
          // Small delay between messages for better UI readability
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } else if (useRandomModel) {
        // Random model mode
        const response = await getChaoticResponse(transformPromptForLanguage(currentInput));
        
        const aiMessage: Message = {
          id: messages.length + 2,
          role: 'assistant',
          content: response.content,
          model: response.model,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        saveMessageToServer(aiMessage);
        
        // Read response aloud if voice output is enabled
        if (voiceOutputEnabled) {
          speak(response.content);
        }
      } else {
        // PHÖNIX model integration - multi-model synthesis
        try {
          // Use the PHÖNIX model if there's a specific query about trends or analysis
          const needsDeepThought = currentInput.toLowerCase().includes('analyze') || 
                                 currentInput.toLowerCase().includes('compare') ||
                                 currentInput.toLowerCase().includes('trends') ||
                                 currentInput.toLowerCase().includes('synthesize');
          
          let phoenixResult;
          
          if (needsDeepThought) {
            // Use deep PHÖNIX for complex queries
            phoenixResult = await phoenixDeep(transformPromptForLanguage(currentInput), false);
          } else {
            // Use standard PHÖNIX for normal queries
            phoenixResult = await phoenixModel(transformPromptForLanguage(currentInput));
          }
          
          const aiMessage: Message = {
            id: messages.length + 2,
            role: 'assistant',
            content: phoenixResult.synthesizedResponse,
            model: `PHÖNIX (${phoenixResult.modelsUsed.join(', ')})`,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
          saveMessageToServer(aiMessage);
          
          // Read response aloud if voice output is enabled
          if (voiceOutputEnabled) {
            speak(phoenixResult.synthesizedResponse);
          }
        } catch (phoenixError) {
          console.error('PHÖNIX error, falling back to standard model:', phoenixError);
          
          // Fallback to standard model
          const model = selectedModel === 'auto' || selectedModel === 'phoenix' 
                    ? undefined 
                    : selectedModel as AiModel;
          
          const responseContent = await sendModelMessage(
            transformPromptForLanguage(currentInput),
            model,
            selectedTone
          );
          
          const aiMessage: Message = {
            id: messages.length + 2,
            role: 'assistant',
            content: responseContent,
            model: model || 'auto-selected',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
          saveMessageToServer(aiMessage);
          
          // Read response aloud if voice output is enabled
          if (voiceOutputEnabled) {
            speak(responseContent);
          }
        }
      }
      
      // Check if this query is about recent information or news
      if (currentInput.toLowerCase().includes('today') || 
          currentInput.toLowerCase().includes('latest') ||
          currentInput.toLowerCase().includes('news') ||
          currentInput.toLowerCase().includes('current') ||
          currentInput.toLowerCase().includes('happening')) {
        
        // Trigger data collection in the background
        runFullCollectionCycle().catch(error => 
          console.error('Background data collection error:', error)
        );
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again later.',
        model: 'error',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }
  
  // Handle keyboard shortcuts
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }
  
  // Toggle voice input
  function toggleVoiceInput() {
    if (listening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  }
  
  // Toggle voice output
  function toggleVoiceOutput() {
    if (voiceOutputEnabled) {
      stopSpeaking();
    }
    setVoiceOutputEnabled(!voiceOutputEnabled);
  }
  
  // Clear chat history
  function clearChat() {
    setMessages([{
      id: 0,
      role: 'assistant',
      content: generateCinematicIntro(),
      model: 'system',
      timestamp: new Date()
    }]);
  }
  
  // Start editing a user message
  function startEditingMessage(message: Message) {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  }
  
  // Save the edited message
  function saveEditedMessage() {
    if (editingMessageId === null) return;
    
    // Find the message being edited
    const messageIndex = messages.findIndex(msg => msg.id === editingMessageId);
    if (messageIndex === -1) return;
    
    // Create updated messages array
    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      content: editingContent
    };
    
    // Find and remove the AI response that followed this user message
    if (messages[messageIndex].role === 'user' && 
        messageIndex + 1 < messages.length && 
        messages[messageIndex + 1].role === 'assistant') {
      // Remove the next message (AI response)
      updatedMessages.splice(messageIndex + 1, 1);
    }
    
    // Update state
    setMessages(updatedMessages);
    
    // Clear editing state
    setEditingMessageId(null);
    setEditingContent('');
    
    // Generate new response for edited message
    setTimeout(() => {
      const lastUserMessage = editingContent;
      setCurrentInput(lastUserMessage);
      handleSendMessage();
    }, 300);
  }
  
  // Cancel editing
  function cancelEditing() {
    setEditingMessageId(null);
    setEditingContent('');
  }
  
  // Regenerate an AI response
  async function regenerateResponse(previousUserMessage: string) {
    if (!previousUserMessage.trim()) return;
    
    setCurrentInput(previousUserMessage);
    setLoading(true);
    
    try {
      if (conspiracyModeActive) {
        // Process with conspiracy mode active
        // Using data from all sources for deeper analysis
        const collectedData = await getCollectedData();
        
        // Create a conspiracy response that incorporates collected data
        const conspiracyResponse: Message = {
          id: messages.length + 1,
          role: 'assistant',
          content: `Regenerating response with Critical Override Engine active. Using all available data sources for unrestricted analysis...`,
          model: 'PHÖNIX (Conspiracy Mode)',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, conspiracyResponse]);
        saveMessageToServer(conspiracyResponse);
        
        // Simulate processing time for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate deep analysis response
        const phoenixResult = await phoenixDeep(
          transformPromptForLanguage(previousUserMessage), 
          true, // conspiracy mode flag
          collectedData // pass all collected data
        );
        
        // Create the response message
        const responseMessage: Message = {
          id: messages.length + 2,
          role: 'assistant',
          content: phoenixResult.synthesizedResponse,
          model: `PHÖNIX (${phoenixResult.modelsUsed.join(', ')}) + Critical Override`,
          timestamp: new Date()
        };
        
        // Update the messages state
        setMessages(prev => [...prev, responseMessage]);
        saveMessageToServer(responseMessage);
        
        if (voiceOutputEnabled) {
          speak(phoenixResult.synthesizedResponse);
        }
      } else {
        // Normal regeneration
        const regeneratedMessage: Message = {
          id: messages.length + 1,
          role: 'user',
          content: previousUserMessage,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, regeneratedMessage]);
        saveMessageToServer(regeneratedMessage);
        
        // Generate new response
        await handleSendMessage();
      }
    } catch (error) {
      console.error('Error regenerating response:', error);
    } finally {
      setLoading(false);
      setCurrentInput('');
    }
  }
  
  // Format message content with markdown-like syntax (basic)
  function formatMessageContent(content: string) {
    // Replace code blocks
    content = content.replace(
      /```(\w+)?\n([\s\S]*?)\n```/g, 
      '<pre><code class="$1">$2</code></pre>'
    );
    
    // Replace inline code
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Replace headers
    content = content.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    content = content.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    content = content.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Replace bold and italic
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace links
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Replace newlines with <br />
    content = content.replace(/\n/g, '<br />');
    
    return content;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls and settings */}
      <div className="bg-card border-b border-border p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="voice-output" 
                checked={voiceOutputEnabled} 
                onCheckedChange={toggleVoiceOutput}
              />
              <Label htmlFor="voice-output">Voice Output</Label>
              {voiceOutputEnabled ? (
                <Volume2 className="h-4 w-4 text-green-500" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="random-model" 
                checked={useRandomModel} 
                onCheckedChange={setUseRandomModel}
                disabled={compareMode}
              />
              <Label htmlFor="random-model">Random Model Mode</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Randomly select an AI model for chaotic inspiration</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="compare-mode" 
                checked={compareMode} 
                onCheckedChange={setCompareMode}
                disabled={useRandomModel}
              />
              <Label htmlFor="compare-mode">Model Comparison</Label>
            </div>
            
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as 'english' | 'german')}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="german">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-3">
            {conspiracyModeActive && (
              <div className="flex items-center bg-red-500 bg-opacity-20 text-red-500 px-2 py-1 rounded-md text-xs font-semibold">
                <Eye className="h-3 w-3 mr-1" />
                Kritisches Denken Aktiv
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 ml-1" 
                  onClick={() => {
                    deactivateConspiracyMode();
                    setConspiracyModeActive(false);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <Select
              value={selectedTone}
              onValueChange={(value) => setSelectedTone(value as ChatTone)}
              disabled={compareMode || useRandomModel}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Assistant Tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ChatTone.Logical}>Logical</SelectItem>
                <SelectItem value={ChatTone.Witty}>Witty</SelectItem>
                <SelectItem value={ChatTone.Skeptical}>Skeptical</SelectItem>
                <SelectItem value={ChatTone.DarkHumor}>Dark Humor</SelectItem>
                <SelectItem value={ChatTone.Unbiased}>Unbiased</SelectItem>
                <SelectItem value={ChatTone.WarCommander}>War Commander</SelectItem>
                <SelectItem value={ChatTone.SarcasticOracle}>Sarcastic Oracle</SelectItem>
                <SelectItem value={ChatTone.Friendly}>Friendly</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={selectedModel}
              onValueChange={(value) => setSelectedModel(value)}
              disabled={compareMode || useRandomModel}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="AI Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-select</SelectItem>
                <SelectItem value="phoenix" className="font-semibold text-primary">
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-1 text-yellow-500" />
                    PHÖNIX Engine
                  </div>
                </SelectItem>
                <SelectItem value={AiModel.GPT4o}>GPT-4o</SelectItem>
                <SelectItem value={AiModel.Grok2}>Grok 2</SelectItem>
                <SelectItem value={AiModel.Claude37Sonnet}>Claude 3.7 Sonnet</SelectItem>
                <SelectItem value={AiModel.Llama4Maverick}>Llama 4 Maverick</SelectItem>
                <SelectItem value={AiModel.Gemini25Pro}>Gemini 2.5 Pro</SelectItem>
                <SelectItem value={AiModel.MistralLarge}>Mistral Large</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={clearChat}
              title="Clear chat history"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Chat messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        ref={chatHistoryRef}
      >
        {messages.map((message, index) => {
          const isLastUserMessage = message.role === 'user' && 
                                  index < messages.length - 1 && 
                                  messages[index + 1].role === 'assistant';
          const isAssistantMessage = message.role === 'assistant';
          
          return (
            <div 
              key={message.id}
              className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <Card className={`
                max-w-[85%] 
                ${message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card'
                }
              `}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    {message.role === 'assistant' && (
                      <MessageSquare className="h-5 w-5 mt-1 flex-shrink-0" />
                    )}
                    <div className="space-y-1 w-full">
                      <div 
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                      />
                      {message.model && (
                        <div className="text-xs text-muted-foreground mt-2 flex justify-between items-center">
                          <span>{message.role === 'assistant' ? `Model: ${message.model}` : ''}</span>
                          
                          {/* Edit buttons for user messages */}
                          {message.role === 'user' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 ml-2" 
                              onClick={() => {
                                setCurrentInput(message.content);
                                // Scroll to input field
                                setTimeout(() => {
                                  document.querySelector('textarea')?.focus();
                                }, 100);
                              }}
                              title="Edit message"
                            >
                              <div className="text-xs text-muted-foreground flex items-center">
                                <RotateCcw className="h-3 w-3 mr-1" />
                                <span>Edit</span>
                              </div>
                            </Button>
                          )}
                          
                          {/* Regenerate button for assistant messages */}
                          {isAssistantMessage && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6 ml-2"
                              onClick={async () => {
                                // Find the preceding user message
                                const userMessageIndex = messages.findIndex(m => 
                                  m.id === message.id) - 1;
                                
                                if (userMessageIndex >= 0 && messages[userMessageIndex].role === 'user') {
                                  const userPrompt = messages[userMessageIndex].content;
                                  setLoading(true);
                                  
                                  try {
                                    // Use the conspiracy mode if active
                                    let regeneratedContent;
                                    
                                    if (isConspiracyModeActive()) {
                                      regeneratedContent = await phoenixDeep(
                                        transformPromptForLanguage(userPrompt),
                                        true
                                      );
                                    } else if (selectedModel === 'phoenix') {
                                      regeneratedContent = await phoenixModel(
                                        transformPromptForLanguage(userPrompt)
                                      );
                                    } else {
                                      regeneratedContent = await sendModelMessage(
                                        transformPromptForLanguage(userPrompt),
                                        selectedModel === 'auto' || selectedModel === 'phoenix' 
                                            ? undefined 
                                            : (selectedModel as AiModel),
                                        selectedTone
                                      );
                                    }
                                    
                                    // Create a new response with the regenerated content
                                    const modelName = selectedModel === 'phoenix' 
                                      ? `PHÖNIX (${
                                          typeof regeneratedContent === 'string' 
                                            ? 'Multi-model' 
                                            : regeneratedContent.modelsUsed.join(', ')
                                         })`
                                      : (selectedModel === 'auto' ? 'auto-selected' : selectedModel);
                                    
                                    const content = typeof regeneratedContent === 'string'
                                      ? regeneratedContent
                                      : regeneratedContent.synthesizedResponse;
                                      
                                    const regeneratedMessage: Message = {
                                      id: Date.now(),
                                      role: 'assistant',
                                      content: content,
                                      model: `${modelName} (regenerated)`,
                                      timestamp: new Date()
                                    };
                                    
                                    // Add the regenerated message
                                    setMessages(prev => [...prev, regeneratedMessage]);
                                    saveMessageToServer(regeneratedMessage);
                                    
                                    // Read aloud if voice output is enabled
                                    if (voiceOutputEnabled) {
                                      speak(content);
                                    }
                                  } catch (error) {
                                    console.error('Error regenerating response:', error);
                                    toast({
                                      title: "Regeneration failed",
                                      description: "Failed to regenerate response. Please try again.",
                                      variant: "destructive"
                                    });
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              }}
                              title="Generate a new response"
                              disabled={loading}
                            >
                              <div className="text-xs text-muted-foreground flex items-center">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                <span>Regenerate</span>
                              </div>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Special message action buttons */}
              {isLastUserMessage && (
                <div className="flex mt-1 space-x-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 text-xs px-2"
                    onClick={() => {
                      // Activate conspiracy mode for this message
                      activateConspiracyMode();
                      setConspiracyModeActive(true);
                      
                      // Regenerate the response with conspiracy mode
                      const userPrompt = message.content;
                      setLoading(true);
                      
                      phoenixDeep(transformPromptForLanguage(userPrompt), true)
                        .then(result => {
                          const conspiracyResponse: Message = {
                            id: Date.now(),
                            role: 'assistant',
                            content: result.synthesizedResponse,
                            model: `PHÖNIX Critical Override (${result.modelsUsed.join(', ')})`,
                            timestamp: new Date()
                          };
                          
                          setMessages(prev => [...prev, conspiracyResponse]);
                          saveMessageToServer(conspiracyResponse);
                          
                          if (voiceOutputEnabled) {
                            speak(result.synthesizedResponse);
                          }
                        })
                        .catch(error => {
                          console.error('Error generating conspiracy response:', error);
                          toast({
                            title: "Failed to activate Conspiracy Mode",
                            description: "Could not generate critical analysis response.",
                            variant: "destructive"
                          });
                        })
                        .finally(() => {
                          setLoading(false);
                        });
                    }}
                    title="Activate Critical Analysis Mode for deeper thinking"
                  >
                    <Eye className="h-3 w-3 mr-1 text-red-500" />
                    <span>Critical Analysis Mode</span>
                  </Button>
                </div>
              )}
            </div>
          );
        })}
        
        {loading && (
          <div className="flex justify-start">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse rounded-full bg-muted h-3 w-3"></div>
                  <div className="animate-pulse rounded-full bg-muted h-3 w-3 animation-delay-200"></div>
                  <div className="animate-pulse rounded-full bg-muted h-3 w-3 animation-delay-500"></div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {streamedContent && (
          <div className="flex justify-start">
            <Card>
              <CardContent className="p-4">
                <div 
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatMessageContent(streamedContent) }}
                />
              </CardContent>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t border-border p-4">
        <div className="flex space-x-2">
          {browserSupportsSpeechRecognition && (
            <Button
              onClick={toggleVoiceInput}
              variant={listening ? "destructive" : "outline"}
              size="icon"
              title={listening ? "Stop listening" : "Start voice input"}
            >
              {listening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          )}
          
          <Textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={listening ? "Listening..." : "Type a message..."}
            rows={3}
            className="flex-1 resize-none"
            disabled={loading}
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || loading}
            title="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}