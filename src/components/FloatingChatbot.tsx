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
import {
  BarChart, Bar,
  LineChart, Line, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  chart_type: string;
  title: string;
  x: string[];
  y: number[];
  xLabel: string;
  yLabel: string;
  sqlQuery?: string;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  chart?: ChartData;
}

export function FloatingChatbot() {
  // Load initial state from localStorage if available
  const loadInitialMessages = () => {
    try {
      const saved = localStorage.getItem('intellyca-chat-messages');
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
      const saved = localStorage.getItem('intellyca-chat-open');
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

  const { addWidget } = useWidgetStore();
  const { session } = useAuthStore();
  const { getAccessibleModules } = useRoleStore();

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem('intellyca-chat-messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat messages:', error);
    }
  }, [messages]);

  // Save isOpen state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('intellyca-chat-open', JSON.stringify(isOpen));
    } catch (error) {
      console.error('Error saving chat open state:', error);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        const isFinal = event.results[last].isFinal;
        
        console.log('Speech recognition transcript:', transcript);
        console.log('isFinal:', isFinal);
        console.log('isOpen:', isOpen);
        
        // Only show transcription in input field when speech is final (not during speaking)
        if (isFinal) {
          setInputValue(transcript);
          
          // If not open, check for wake word to open chatbot
          if (!isOpen) {
            if (transcript.toLowerCase().includes('hey agent')) {
              console.log('Wake word detected! Opening chatbot');
              setIsOpen(true);
              setInputValue(''); // Clear the wake word from input
              return;
            }
          }
          
          // If chatbot is open and speech is final, just set the input (don't auto-send)
          if (isOpen && transcript.trim().length > 0) {
            // Don't show wake word in input
            const cleanTranscript = transcript.toLowerCase().trim();
            if (!cleanTranscript.includes('hey agent')) {
              console.log('Voice input complete - ready for manual send:', transcript);
              // Transcript is already set above
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

      // Add widget to selected dashboard
      const newWidget = {
        id: `chart-${Date.now()}`,
        title: chart.title,
        type: chart.chart_type,
        span: 1,
        position: { x: 0, y: 0 },
        size: { width: 300, height: 350 },
        sqlQuery: chart.sqlQuery || `SELECT '${chart.xLabel}' as name, ${chart.y[0]} as value`,
        config: {
          dataSource: 'chatbot',
          chartData: chart,
        }
      };
      
      await addWidget(newWidget, session.user.tenant_id, dashboardId);
      
      // Show success message
      const dashboardName = getAccessibleModules().find(m => m.id === dashboardId)?.name || dashboardId;
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: `✅ Chart "${chart.title}" has been added to your ${dashboardName} dashboard!`,
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
      localStorage.removeItem('intellyca-chat-messages');
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
      // const res = await fetch('http://localhost:8000/ask', {
      const res = await fetch('https://sql-database-agent.onrender.com/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMessage.content,
          user_id: session.user.user_id,
          tenant_name: session.user.tenant_id,
          role_name: session.user.role_name,
          token: session.token
        }),
      });

      const data = await res.json();
      console.log("Received response:", data);

      let chart: ChartData | undefined;
      if (data.response?.data && data.response?.x_axis && data.response?.y_axis) {
        chart = {
          chart_type: data.response.chart_type,
          title: `Chart: ${data.response.y_axis} by ${data.response.x_axis}`,
          x: data.response.data.map((row: any) => row[data.response.x_axis]),
          y: data.response.data.map((row: any) => row[data.response.y_axis]),
          xLabel: data.response.x_axis,
          yLabel: data.response.y_axis,
          sqlQuery: data.response.sql_query || data.sql_query || `SELECT ${data.response.x_axis} as name, ${data.response.y_axis} as value FROM your_table`
        };
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: typeof data.response === 'string' ? data.response : (data.sql_query ? `SQL Query: ${data.sql_query}` : ''),
        timestamp: new Date(),
        chart,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = (chart: ChartData) => {
    const chartData = chart.x.map((label, idx) => ({
      [chart.xLabel]: label,
      [chart.yLabel]: chart.y[idx],
    }));

    // SAP Joule AI inspired color palette
    const colors = [
      '#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', 
      '#EF4444', '#EC4899', '#84CC16', '#F97316', '#3B82F6'
    ];

    switch (chart.chart_type) {
      case 'bar':
        return (
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              <XAxis 
                dataKey={chart.xLabel} 
                tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} 
                angle={0}
                textAnchor="middle"
                height={20}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={25}
              />
              <Tooltip 
                contentStyle={{ 
                  fontSize: '9px', 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px hsl(var(--foreground) / 0.1)',
                  color: 'hsl(var(--popover-foreground))'
                }}
                cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
              />
              <Bar 
                dataKey={chart.yLabel} 
                fill="url(#barGradient)" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
        );
      case 'line':
        return (
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              <XAxis 
                dataKey={chart.xLabel} 
                tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} 
                angle={0}
                textAnchor="middle"
                height={20}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={25}
              />
              <Tooltip 
                contentStyle={{ 
                  fontSize: '9px', 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px hsl(var(--foreground) / 0.1)',
                  color: 'hsl(var(--popover-foreground))'
                }}
                cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--muted-foreground))' }}
              />
            <Area 
              type="monotone" 
              dataKey={chart.yLabel} 
              fill="url(#lineGradient)" 
              stroke="none"
            />
            <Line 
              type="monotone" 
              dataKey={chart.yLabel} 
              stroke="#10B981" 
              strokeWidth={3} 
              dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
            />
          </LineChart>
        );
      case 'pie':
        const pieData = chart.x.map((label, idx) => ({
          name: label,
          value: chart.y[idx],
          color: colors[idx % colors.length]
        }));
        return (
          <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              {pieData.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={0.9}/>
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.7}/>
                </linearGradient>
              ))}
            </defs>
            <Tooltip 
              contentStyle={{ 
                fontSize: '9px', 
                backgroundColor: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '4px',
                boxShadow: '0 2px 8px hsl(var(--foreground) / 0.1)',
                color: 'hsl(var(--popover-foreground))'
              }}
              formatter={(value, name) => [`${value}`, name]}
            />
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={60}
              innerRadius={20}
              paddingAngle={1}
              label={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#pieGradient-${index})`} />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return null;
    }
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
        <Card className={`w-80 shadow-xl flex flex-col transition-all duration-300 bg-card border-border ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
          {/* Fixed Header */}
          <div className="p-3 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between flex-shrink-0">
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
              <div className="flex-1 p-3 overflow-y-auto bg-gray-50/50 dark:bg-background/50">
                <div className="space-y-3">
                  {messages.map((message) => (
                     <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                         {message.type === 'user' ? (
                           // User message bubble - SAP Joule style
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-md px-3 py-2 shadow-sm">
                              <p className="text-xs font-medium leading-relaxed">{message.content}</p>
                              <p className="text-xs text-blue-100 mt-1 opacity-80">{message.timestamp.toLocaleTimeString()}</p>
                            </div>
                         ) : (
            // Bot message - clean style without avatar
                            <div className="w-full">
               <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl rounded-tl-md px-3 py-2 shadow-sm">
                                 <p className="text-xs text-gray-800 dark:text-card-foreground leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                 <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1 opacity-70">{message.timestamp.toLocaleTimeString()}</p>
                               </div>
                               {message.chart && (
                                 <div className="mt-2 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl p-2 shadow-sm">
                                   <div className="flex items-center justify-between mb-1">
                                     <h4 className="text-xs font-semibold text-gray-800 dark:text-card-foreground">{message.chart.title}</h4>
                                     <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                                   </div>
                                   <div className="w-full h-36 bg-gray-50/50 dark:bg-background/30 rounded-lg p-1">
                                     <ResponsiveContainer width="100%" height="100%">
                                       {renderChart(message.chart)}
                                     </ResponsiveContainer>
                                   </div>
                                   <div className="flex justify-end mt-1.5 pt-1.5 border-t border-gray-100 dark:border-border">
                                     <Button 
                                       size="sm" 
                                       onClick={() => handleAddToDashboard(message.chart!)}
                                       className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs px-2 py-1 shadow-sm rounded-full h-6"
                                     >
                                       <Plus className="h-2.5 w-2.5 mr-1" />
                                       Add
                                     </Button>
                                   </div>
                                 </div>
                               )}
                            </div>
                          )}
                        </div>
                      </div>
                   ))}
                   {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-100 dark:bg-muted border dark:border-border p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 dark:bg-primary/60 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 dark:bg-primary/60 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-blue-600 dark:bg-primary/60 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-gray-200 dark:border-border bg-white dark:bg-background flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything about your business data..."
                    className="flex-1 text-sm bg-white dark:bg-background border-gray-200 dark:border-border text-gray-900 dark:text-foreground"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/90 text-white dark:text-primary-foreground"
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {showDashboardSelect && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-lg">
                    <p className="text-sm font-medium mb-2 text-gray-900 dark:text-foreground">Select Dashboard:</p>
                    <div className="flex gap-2">
                      <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
                        <SelectTrigger className="flex-1 text-xs bg-white dark:bg-background border-gray-200 dark:border-border">
                          <SelectValue placeholder="Choose dashboard" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAccessibleModules().map((module) => (
                            <SelectItem key={module.id} value={module.id} className="text-xs">
                              {module.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        onClick={() => confirmAddToDashboard(pendingChart!, selectedDashboard)}
                        disabled={!selectedDashboard}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/90 text-white dark:text-primary-foreground text-xs"
                      >
                        Add
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setShowDashboardSelect(false);
                          setPendingChart(null);
                          setSelectedDashboard('');
                        }}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}