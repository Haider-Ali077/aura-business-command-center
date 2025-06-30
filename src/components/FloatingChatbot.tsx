
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Bot, User, X, Minimize2, Maximize2, BarChart3 } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m Intellyca, your AI-powered business intelligence assistant. I can help you analyze data, generate reports, create visualizations, and provide strategic insights. What would you like to explore today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Here you would integrate with your OpenAI API and MSSQL database
      // For now, we'll simulate a response
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `I'm analyzing "${userMessage.content}" with our business intelligence system. I can help you with: 📊 Sales analytics, 📈 Performance metrics, 📋 Custom reports, 🎯 Predictive insights, and 💡 Strategic recommendations. What specific data would you like me to examine?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 group"
        >
          <div className="relative">
            <MessageSquare className="h-6 w-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`${isMinimized ? 'h-16' : 'h-[500px]'} w-80 shadow-xl transition-all duration-300 border-0 overflow-hidden`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-7 w-7 p-0 text-white hover:bg-white/20 rounded-full"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 p-0 text-white hover:bg-white/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-50 to-white h-[380px]">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                        : 'bg-gradient-to-r from-slate-600 to-slate-700'
                    }`}>
                      {message.type === 'user' ? 
                        <User className="h-4 w-4 text-white" /> : 
                        <BarChart3 className="h-4 w-4 text-white" />
                      }
                    </div>
                    <div className={`p-3 rounded-xl shadow-sm ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                        : 'bg-white border border-slate-200 text-slate-800'
                    }`}>
                      <p className="text-xs leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-slate-600 to-slate-700">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 bg-white">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Intellyca about your business data..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                  className="flex-1 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg text-sm"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
