import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, Send, Lightbulb, Calendar } from 'lucide-react';
import { AIModel, Message } from '@/types';
import { sendChatMessage, compareModels } from '@/lib/aiService';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { speak } from '@/lib/speechSynthesis';

export function AssistantTab() {
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('claude-3-7-sonnet');
  const [aiModels, setAIModels] = useState<AIModel[]>([
    { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic' },
    { id: 'google/gemini-2.5-pro-exp-03-25:free', name: 'Gemini 2.5 Pro', provider: 'Google' },
    { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek' },
    { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', provider: 'Meta' }
  ]);
  
  const conversationRef = useRef<HTMLDivElement>(null);
  const { transcript, listening, startListening, stopListening } = useSpeechRecognition();
  
  useEffect(() => {
    // Add welcome message when component mounts
    if (conversation.length === 0) {
      const welcomeMessage: Message = {
        id: 0,
        role: 'assistant',
        content: "Hello! I'm your AI assistant. I can provide information, answer questions, or help with various tasks. How can I assist you today?",
        timestamp: new Date()
      };
      setConversation([welcomeMessage]);
    }
  }, []);
  
  useEffect(() => {
    // Update input field with speech recognition results
    if (transcript) {
      setUserInput(transcript);
    }
  }, [transcript]);
  
  useEffect(() => {
    // Scroll to bottom of conversation when new messages are added
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);
  
  const sendMessage = async () => {
    if (!userInput.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    // Add user message to conversation
    const userMessage: Message = {
      id: conversation.length,
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setUserInput('');
    
    try {
      // Get response from selected AI model
      const response = await sendChatMessage(userInput, selectedModel);
      
      // Add AI response to conversation
      const aiMessage: Message = {
        id: conversation.length + 1,
        role: 'assistant',
        content: response.message.content,
        model: selectedModel,
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message to conversation
      const errorMessage: Message = {
        id: conversation.length + 1,
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const startVoiceInput = () => {
    startListening();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <Bot className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-medium">AI Assistant</h2>
          </div>
          
          <div 
            ref={conversationRef}
            className="mb-4 max-h-96 overflow-y-auto bg-muted/30 p-4 rounded-lg"
          >
            {conversation.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Your conversation with the AI assistant will appear here.
              </div>
            ) : (
              conversation.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : ''}`}
                >
                  <div 
                    className={`
                      max-w-[80%] rounded-lg p-3
                      ${message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'}
                    `}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.model && (
                      <div className="text-xs opacity-70 mt-1">
                        via {message.model}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isProcessing && (
              <div className="flex space-x-2 justify-start">
                <div className="bg-muted rounded-full h-2 w-2 animate-bounce"></div>
                <div className="bg-muted rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="bg-muted rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[180px] mr-2">
                <SelectValue placeholder="Select AI Model" />
              </SelectTrigger>
              <SelectContent>
                {aiModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative flex-1">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="pr-10"
                disabled={isProcessing}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary"
                onClick={sendMessage}
                disabled={!userInput.trim() || isProcessing}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="default"
              size="icon"
              className="ml-2 rounded-full"
              onClick={startVoiceInput}
              disabled={isProcessing || listening}
            >
              <Mic className={`h-4 w-4 ${listening ? 'animate-pulse' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
              <h2 className="text-lg font-medium">AI Recommendations</h2>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <h3 className="font-medium text-primary mb-2">Multi-Model Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Compare responses from different AI models to get a more comprehensive answer to complex questions.
                </p>
                <div className="flex justify-end mt-2">
                  <Button variant="link" size="sm" className="text-xs" onClick={() => {
                    setUserInput("Compare models: What are the implications of quantum computing for cybersecurity?");
                  }}>
                    Try It
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <h3 className="font-medium text-primary mb-2">Financial Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Ask about market trends, stock performance, or cryptocurrency analysis.
                </p>
                <div className="flex justify-end mt-2">
                  <Button variant="link" size="sm" className="text-xs" onClick={() => {
                    setUserInput("Analyze recent tech stock performance and give investment recommendations");
                  }}>
                    Try It
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-lg font-medium">Quick Actions</h2>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <h3 className="font-medium text-primary mb-2">Generate Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Create summarized reports from your financial data or news trends.
                </p>
                <div className="flex justify-end mt-2">
                  <Button variant="link" size="sm" className="text-xs" onClick={() => {
                    setUserInput("Generate a summary report of this week's major financial news");
                  }}>
                    Generate
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <h3 className="font-medium text-primary mb-2">Voice Commands</h3>
                <p className="text-sm text-muted-foreground">
                  Use voice commands to navigate through tabs or request information.
                </p>
                <div className="flex justify-end mt-2">
                  <Button variant="link" size="sm" className="text-xs" onClick={startVoiceInput}>
                    Start Voice
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Bot(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
