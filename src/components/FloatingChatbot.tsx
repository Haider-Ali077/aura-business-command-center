import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Bot, User, X, Minimize2, Maximize2, Plus, Mic, MicOff, RefreshCw } from "lucide-react";
import { useWidgetStore } from "@/store/widgetStore";
import { useAuthStore } from "@/store/authStore";
import { useRoleStore } from "@/store/roleStore";
import { dataService } from "@/services/dataService";
import { ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '@/config/api';
import { UnifiedChartRenderer } from "./UnifiedChartRenderer";
import { ChartConfig, EnhancedChartData } from "@/types/chart";

interface ChartData {
  chart_type: string;
  title: string;
  x: string[];
  y: number[];
  xLabel: string;
  yLabel: string;
  sqlQuery?: string;
  rawData?: any[]; // Preserve original data for tables
  tableName?: string; // Table name for table charts
}

// Convert chatbot chart data to unified format
const convertChatbotChartData = (chart: ChartData): {
  data: EnhancedChartData[];
  config: ChartConfig;
} => {
  // For tables, use raw data if available to preserve all columns
  if (chart.chart_type === 'table' && chart.rawData) {
    const config: ChartConfig = {
      xLabel: chart.xLabel,
      yLabel: chart.yLabel,
      chartType: 'table',
      colors: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4'],
      showGrid: true,
    };
    return { data: chart.rawData, config };
  }
  
  // For charts, use the transformed data
  const data = chart.x.map((label, idx) => ({
    name: label,
    [chart.xLabel]: label,
    [chart.yLabel]: chart.y[idx],
  }));

  const config: ChartConfig = {
    xLabel: chart.xLabel,
    yLabel: chart.yLabel,
    chartType: chart.chart_type as 'line' | 'bar' | 'area' | 'pie' | 'table',
    colors: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4'],
    showGrid: true,
  };

  return { data, config };
};

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  chart?: ChartData;
}

export function FloatingChatbot() {
  const { session } = useAuthStore();
  const { addWidget } = useWidgetStore();
  const { getAccessibleModules } = useRoleStore();

  // Get user-specific localStorage keys
  const getUserStorageKey = (key: string) => {
    const userId = session?.user?.user_id || 'anonymous';
    return `intellyca-${userId}-${key}`;
  };

  // Load initial state from localStorage if available (user-specific)
  const loadInitialMessages = () => {
    try {
      const saved = localStorage.getItem(getUserStorageKey('chat-messages'));
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
    
    return [{
      id: '1',
      type: 'bot' as const,
      content: `Hello! I'm Intellyca, your AI-powered business intelligence assistant. What would you like to explore today?`,
      timestamp: new Date(),
    }];
  };

  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(getUserStorageKey('chat-open'));
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(loadInitialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<string>('');
  const [showDashboardSelect, setShowDashboardSelect] = useState(false);
  const [pendingChart, setPendingChart] = useState<ChartData | null>(null);
  
  // Voice recognition states
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isWaitingForWakeWord, setIsWaitingForWakeWord] = useState(false);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  // Save messages to localStorage whenever messages change (user-specific)
  useEffect(() => {
    try {
      localStorage.setItem(getUserStorageKey('chat-messages'), JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat messages:', error);
    }
  }, [messages, session?.user?.user_id]);

  // Save isOpen state to localStorage (user-specific)
  useEffect(() => {
    try {
      localStorage.setItem(getUserStorageKey('chat-open'), JSON.stringify(isOpen));
    } catch (error) {
      console.error('Error saving chat open state:', error);
    }
  }, [isOpen, session?.user?.user_id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-scroll to bottom when chat is reopened after minimizing
  useEffect(() => {
    if (!isMinimized && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isMinimized, isOpen]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        // Process all results
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Combine final and interim transcripts for display
        const fullTranscript = finalTranscript + interimTranscript;
        
        console.log('Speech recognition transcript:', fullTranscript);
        console.log('finalTranscript:', finalTranscript);
        console.log('interimTranscript:', interimTranscript);
        console.log('isOpen:', isOpen);
        
        // Always show transcription in input field (both interim and final)
        if (fullTranscript.trim()) {
          setInputValue(fullTranscript);
        }
        
        // Only process final transcripts for wake word detection and completion
        if (finalTranscript.trim()) {
          // If not open, check for wake word to open chatbot
          if (!isOpen) {
            if (finalTranscript.toLowerCase().includes('hey agent')) {
              console.log('Wake word detected! Opening chatbot');
              setIsOpen(true);
              setInputValue(''); // Clear the wake word from input
              return;
            }
          }
          
          // If chatbot is open and speech is final, process the input
          if (isOpen) {
            // Don't show wake word in input
            const cleanTranscript = finalTranscript.toLowerCase().trim();
            if (!cleanTranscript.includes('hey agent')) {
              console.log('Voice input complete - ready for manual send:', finalTranscript);
              setInputValue(finalTranscript); // Set only final transcript without interim
            } else {
              setInputValue(''); // Clear wake word
            }
          }
        }
      };
      
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started successfully');
        setIsRecognitionActive(true);
      };
      
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsRecognitionActive(false);
        
        // Clear any pending restart timeouts
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        
        // Always restart if voice is enabled (simplified logic)
        if (isVoiceEnabled) {
          restartTimeoutRef.current = setTimeout(() => {
            if (isVoiceEnabled && !isRecognitionActive && recognitionRef.current) {
              try {
                console.log('Restarting speech recognition...');
                recognitionRef.current.start();
              } catch (e) {
                console.error('Failed to restart recognition:', e);
              }
            }
          }, 500);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        console.log('Error details:', event);
        setIsRecognitionActive(false);
        
        // Don't restart on abort errors to prevent loops
        if (event.error === 'aborted') {
          console.log('Recognition aborted - not restarting to prevent loops');
          return;
        }
        
        if (isVoiceEnabled) {
          // Simplified: just restart if voice is still enabled
          // Clear any pending restarts
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
          }
          // Try to restart after a longer delay for errors
          restartTimeoutRef.current = setTimeout(() => {
            if (isVoiceEnabled && !isRecognitionActive && recognitionRef.current) {
              try {
                console.log('Restarting after error...');
                recognitionRef.current.start();
              } catch (e) {
                console.error('Failed to restart after error:', e);
              }
            }
          }, 1500);
        }
      };
    }
  }, [isVoiceEnabled, isWaitingForWakeWord, isListening]);

  const toggleVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    // Clear any pending timeouts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    if (isVoiceEnabled) {
      // Turn off voice recognition
      console.log('Turning OFF voice recognition');
      setIsVoiceEnabled(false);
      setIsRecognitionActive(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      // Turn on voice recognition
      console.log('Turning ON voice recognition');
      setIsVoiceEnabled(true);
      if (recognitionRef.current && !isRecognitionActive) {
        try {
          recognitionRef.current.start();
          console.log('Speech recognition started');
        } catch (e) {
          console.error('Failed to start speech recognition:', e);
        }
      }
    }
  };

  const handleAddToDashboard = (chart: ChartData) => {
    const accessibleModules = getAccessibleModules();
    if (accessibleModules.length === 1) {
      // If user has access to only one dashboard, add directly
      confirmAddToDashboard(chart, accessibleModules[0].id);
    } else {
      // Show dashboard selection
      setPendingChart(chart);
      setShowDashboardSelect(true);
    }
  };

  const confirmAddToDashboard = async (chart: ChartData, dashboardId: string) => {
    try {
      if (!session?.user.tenant_id) {
        console.error('No tenant session found');
        return;
      }

      const { data, config } = convertChatbotChartData(chart);

      // Add widget to selected dashboard with enhanced configuration
      const newWidget = {
        id: `chart-${Date.now()}`,
        title: chart.title,
        type: chart.chart_type,
        span: 1,
        position: { x: 0, y: 0 },
        size: { width: 300, height: 350 },
        sqlQuery: chart.sqlQuery || `SELECT '${chart.xLabel}' as name, ${chart.y[0]} as value`,
        tableName: chart.tableName, // Include table name for table widgets
        config: {
          dataSource: 'chatbot',
          chartData: data,
          chartConfig: config, // Enhanced configuration with labels
        }
      };
      
      await addWidget(newWidget, session.user.tenant_id, dashboardId);
      
      // Show success message
      const dashboardName = getAccessibleModules().find(m => m.id === dashboardId)?.name || dashboardId;
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: `Chart "${chart.title}" has been added to your ${dashboardName} dashboard with proper axis labels!`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, successMessage]);
      
      // Reset state
      setShowDashboardSelect(false);
      setPendingChart(null);
      setSelectedDashboard('');
    } catch (error) {
      console.error('Error adding chart to dashboard:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: '❌ Failed to add chart to dashboard. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const clearChatHistory = () => {
    const initialMessage = {
      id: '1',
      type: 'bot' as const,
      content: `Hello! I'm Intellyca, your AI-powered business intelligence assistant. What would you like to explore today?`,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
    try {
      localStorage.removeItem(getUserStorageKey('chat-messages'));
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !session) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    
    try {
      const res = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMessage.content,
          user_id: session.user.user_id,
          tenant_name: session.user.tenant_name,
          role_name: session.user.role_name,
          token: session.token
        }),
      });

      const data = await res.json();
      console.log("Received response:", data);

      let chart: ChartData | undefined;
      let messageContent = '';
      
      // Handle different response types
      if (data.response?.chart_type && data.response?.x_axis && data.response?.y_axis) {
        // Chart response
        chart = {
          chart_type: data.response.chart_type,
          title: data.response.chart_type === 'table' 
            ? "Data Table" 
            : `Chart: ${data.response.y_axis} by ${data.response.x_axis}`,
          x: data.response.data.map((row: any) => row[data.response.x_axis]),
          y: data.response.data.map((row: any) => row[data.response.y_axis]),
          xLabel: data.response.x_axis,
          yLabel: data.response.y_axis,
          sqlQuery: data.response.sql_query || `SELECT ${data.response.x_axis} as name, ${data.response.y_axis} as value FROM your_table`,
          rawData: data.response.chart_type === 'table' ? data.response.data : undefined, // Preserve raw data for tables
          tableName: data.response.table_name // Include table name for table charts
        };
        messageContent = data.response.chart_type === 'table' 
          ? `📋 Here's your data table`
          : `📊 Here's your chart showing ${data.response.y_axis} by ${data.response.x_axis}`;
      } else if (data.response?.text && data.response?.data) {
        // Text response with data
        messageContent = `${data.response.text}\n\n📋 Data Summary: ${data.response.summary || `Found ${data.response.data.length} rows`}`;
      } else if (data.response?.text) {
        // Text response without data (including single value responses)
        messageContent = data.response.text;
      } else if (data.response?.value) {
        // Single value response (legacy format)
        messageContent = `📊 Result: ${data.response.value}`;
      } else if (typeof data.response === 'string') {
        // Plain text response
        messageContent = data.response;
      } else {
        // Fallback
        messageContent = 'Received response from the system.';
      }
      
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: messageContent,
        timestamp: new Date(),
        chart,
      };

      setMessages(prev => [...prev, botMessage]);

      // Save conversation to database
      await saveConversation(userMessage.content, data.response);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversation = async (userPrompt: string, apiResponse: string) => {
    try {
      const authStore = useAuthStore.getState();
      const session = authStore.session;
      console.log("Session user_id: ",session.user.user_id)
      console.log("prompt: ",userPrompt)
      console.log("response: ",apiResponse)
      
      if (!session) return;

      await fetch(`${API_BASE_URL}/save-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: session.user.user_id,
          prompt: userPrompt,
          // response: apiResponse.toString()
          response: typeof apiResponse === 'object' ? JSON.stringify(apiResponse) : apiResponse
        }),
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };


  const renderChart = (chart: ChartData) => {
    const { data, config } = convertChatbotChartData(chart);
    
    return (
      <UnifiedChartRenderer
        type={chart.chart_type as 'line' | 'bar' | 'area' | 'pie' | 'table'}
        data={data}
        config={config}
        isLoading={false}
        isMaximized={false}
        context="chatbot"
        tableName={chart.tableName}
      />
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:scale-105 transition-all"
        >
          <MessageSquare className="text-white" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        </Button>
      ) : (
        <Card className={`w-96 shadow-xl flex flex-col transition-all duration-500 ease-in-out bg-card border-border origin-top ${isMinimized ? 'h-16' : 'h-[600px]'}`}>
          {/* Fixed Header */}
          <div className="p-3 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between flex-shrink-0 relative z-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Intellyca AI</h3>
                <p className="text-blue-100 text-xs">Business Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleVoiceRecognition}
                className={`text-white p-1 relative ${isVoiceEnabled ? 'bg-white/20' : ''}`}
                title={isVoiceEnabled ? 'Voice commands ON - Say "Hey Agent"' : 'Enable voice commands'}
              >
                {isVoiceEnabled ? (
                  <Mic className={`h-3 w-3 ${isRecognitionActive ? 'text-green-300 animate-pulse' : ''}`} />
                ) : (
                  <MicOff className="h-3 w-3" />
                )}
                {isVoiceEnabled && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearChatHistory}
                className="text-white p-1"
                title="Clear chat history"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} className="text-white p-0">
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area - SAP Joule AI Style */}
              <div className="flex-1 p-3 overflow-y-auto bg-gray-50/50 dark:bg-background/50 relative z-40">
                <div className="space-y-3 animate-fade-in transition-opacity duration-300 delay-75">
                  {messages.map((message) => (
                     <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[80%] rounded-lg p-3 ${
                         message.type === 'user' 
                           ? 'bg-blue-600 text-white' 
                           : 'bg-white dark:bg-muted border shadow-sm'
                       }`}>
                         {message.type === 'bot' && message.chart ? (
                           <div className="space-y-3">
                             <p className="text-sm text-muted-foreground mb-2">{message.content}</p>
                             {renderChart(message.chart)}
                             <Button
                               onClick={() => handleAddToDashboard(message.chart)}
                               className="w-full text-xs"
                               variant="outline"
                               size="sm"
                             >
                               Add to Dashboard
                             </Button>
                           </div>
                         ) : (
                           <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                         )}
                       </div>
                     </div>
                   ))}
                   
                   {isLoading && (
                     <div className="flex justify-start">
                       <div className="bg-white dark:bg-muted border shadow-sm rounded-lg p-3 max-w-[80%]">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                           <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                           <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                           <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
                         </div>
                       </div>
                     </div>
                   )}
                   <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-3 border-t bg-white dark:bg-background">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Ask about your data..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Dashboard Selection Modal */}
              {showDashboardSelect && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white dark:bg-card rounded-lg p-4 w-full max-w-sm">
                    <h3 className="font-semibold mb-3">Add to Dashboard</h3>
                    <div className="space-y-2 mb-4">
                      {getAccessibleModules().map((dashboard) => (
                        <Button
                          key={dashboard.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            if (pendingChart) {
                              confirmAddToDashboard(pendingChart, dashboard.id);
                            }
                          }}
                        >
                          {dashboard.name}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDashboardSelect(false);
                          setPendingChart(null);
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
                 )}
            </>
          )}
        </Card>
      )}
    </div>
  );
}