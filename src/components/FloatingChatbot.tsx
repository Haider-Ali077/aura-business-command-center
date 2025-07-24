import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Bot, User, X, Minimize2, Maximize2, Plus, Mic, MicOff } from "lucide-react";
import { useWidgetStore } from "@/store/widgetStore";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
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
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: `Hello! I'm Intellyca, your AI-powered business intelligence assistant. What would you like to explore today?`,
      timestamp: new Date(),
    },
  ]);
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
  const { currentSession } = useTenantStore();
  const { getAccessibleModules } = useRoleStore();

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
      if (!currentSession?.tenantId) throw new Error('No tenant session');

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
      
      await addWidget(newWidget, currentSession.tenantId, dashboardId);
      
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

    // Professional color palette
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];

    switch (chart.chart_type) {
      case 'bar':
        return (
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.7}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
            <XAxis 
              dataKey={chart.xLabel} 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
              angle={-45}
              textAnchor="end"
              height={60}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip 
              contentStyle={{ 
                fontSize: '12px', 
                backgroundColor: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 10px 30px -10px hsl(var(--foreground) / 0.1)',
                color: 'hsl(var(--popover-foreground))'
              }}
              cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
            />
            <Bar 
              dataKey={chart.yLabel} 
              fill="url(#barGradient)" 
              barSize={30} 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
            <XAxis 
              dataKey={chart.xLabel} 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
              angle={-45}
              textAnchor="end"
              height={60}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip 
              contentStyle={{ 
                fontSize: '12px', 
                backgroundColor: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 10px 30px -10px hsl(var(--foreground) / 0.1)',
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
          <PieChart>
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
                fontSize: '12px', 
                backgroundColor: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 10px 30px -10px hsl(var(--foreground) / 0.1)',
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
              outerRadius={85}
              innerRadius={25}
              paddingAngle={2}
              label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(1)}%`}
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
              {/* Scrollable Messages Area with proper horizontal scrolling */}
              <div className="flex-1 p-4 overflow-x-auto overflow-y-auto bg-background max-h-96">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                      <div className={`max-w-[80%] p-3 rounded-lg overflow-x-auto ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}>
                        <div className="flex items-start gap-2 mb-2">
                          {message.type === 'bot' && (
                            <Bot className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">{message.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                        {message.chart && (
                          <div className="mt-4 bg-card border border-border rounded-lg p-4 overflow-x-auto shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-card-foreground">{message.chart.title}</h4>
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            </div>
                            <div className="w-full h-52 min-w-[360px] bg-background/50 rounded-lg p-2">
                              <ResponsiveContainer width="100%" height="100%">
                                {renderChart(message.chart)}
                              </ResponsiveContainer>
                            </div>
                            <div className="flex justify-end mt-3 pt-3 border-t border-border">
                              <Button 
                                size="sm" 
                                onClick={() => handleAddToDashboard(message.chart!)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 py-1.5 shadow-sm"
                              >
                                <Plus className="h-3 w-3 mr-1.5" />
                                Add to Dashboard
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-muted border border-border p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-border bg-background flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything about your business data..."
                    className="flex-1 text-sm bg-background border-border text-foreground"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {showDashboardSelect && (
                  <div className="mt-2 p-3 bg-muted border border-border rounded-lg">
                    <p className="text-sm font-medium mb-2 text-foreground">Select Dashboard:</p>
                    <div className="flex gap-2">
                      <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
                        <SelectTrigger className="flex-1 text-xs bg-background border-border">
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
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
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