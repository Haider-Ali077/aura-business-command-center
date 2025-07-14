import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Bot, User, X, Minimize2, Maximize2, Plus } from "lucide-react";
import { useWidgetStore } from "@/store/widgetStore";
import { useAuthStore } from "@/store/authStore";
import { dataService } from "@/services/dataService";
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie,
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

  const { addWidget } = useWidgetStore();
  const { session } = useAuthStore();

  const handleAddToAnalytics = async (chart: ChartData) => {
    try {
      // Save chart data to backend
      await dataService.saveChartToAnalytics(chart);
      
      // Add widget to analytics dashboard with SQL query
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
      
      addWidget(newWidget, 1, 'main');
      
      // Show success message
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: `✅ Chart "${chart.title}" has been added to your Analytics dashboard with SQL query!`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      console.error('Error adding chart to analytics:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: '❌ Failed to add chart to Analytics dashboard. Please try again.',
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
      const res = await fetch('http://localhost:8000/ask', {
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

    switch (chart.chart_type) {
      case 'bar':
        return (
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={chart.xLabel} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: '12px' }} />
            <Bar dataKey={chart.yLabel} fill="#3b82f6" barSize={20} radius={[2, 2, 0, 0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={chart.xLabel} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey={chart.yLabel} stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        );
      case 'pie':
        const pieData = chart.x.map((label, idx) => ({
          name: label,
          value: chart.y[idx],
        }));
        return (
          <PieChart>
            <Tooltip contentStyle={{ fontSize: '12px' }} />
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={60}
              fill="#3b82f6"
              label={false}
            />
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
        <Card className={`w-80 shadow-xl flex flex-col transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Intellyca AI</h3>
                <p className="text-blue-100 text-xs">Business Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
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
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[85%] gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.type === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-slate-600 to-slate-700'}`}>
                        {msg.type === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                      </div>
                      <div className={`p-3 rounded-xl shadow-sm ${msg.type === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                        <p className="text-xs whitespace-pre-wrap">{msg.content}</p>
                        {msg.chart && (
                          <div className="mt-2">
                            <div className="w-full h-[180px] bg-slate-50 rounded-lg p-2 border">
                              <ResponsiveContainer width="100%" height="100%">
                                {renderChart(msg.chart)}
                              </ResponsiveContainer>
                            </div>
                            <div className="mt-2 flex justify-end">
                              <Button
                                size="sm"
                                onClick={() => handleAddToAnalytics(msg.chart!)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-6"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add to Analytics
                              </Button>
                            </div>
                          </div>
                        )}
                        <p className="text-xs mt-1 text-slate-500">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Box Fixed at Bottom */}
              <div className="p-3 border-t border-slate-200 bg-white">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask Intellyca about your business data..."
                    disabled={isLoading}
                    className="flex-1 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg text-sm"
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg px-4">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
