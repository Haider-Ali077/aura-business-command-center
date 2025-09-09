import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useStableChatStore, Message } from "@/store/chatStore";

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

// Message interface imported from chatStore

export function FloatingChatbot() {
  const { session } = useAuthStore();
  const { addWidget } = useWidgetStore();
  const { getAccessibleModules } = useRoleStore();
  const isMobile = useIsMobile();
  
  // Use session-only chat store - NO localStorage persistence
  const chatStore = useStableChatStore(session?.user?.user_id?.toString() || null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<string>('');
  const [showDashboardSelect, setShowDashboardSelect] = useState(false);
  const [pendingChart, setPendingChart] = useState<ChartData | null>(null);
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [tableTitle, setTableTitle] = useState('');
  
  // Enhanced voice recognition states
  type VoiceState = 'idle' | 'listening' | 'processing' | 'completing';
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isBackgroundListening, setIsBackgroundListening] = useState(false);
  const [wakeWordRestartTrigger, setWakeWordRestartTrigger] = useState(0);
  const recognitionRef = useRef<any>(null);
  const wakeWordRecognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<any>(null);
  const autoSendTimeoutRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const finalTranscriptRef = useRef<string>('');
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Mobile-specific settings
  const voiceSettings = {
    silenceTimeout: isMobile ? 4000 : 2000, // Longer timeout for mobile
    continuous: true,
    interimResults: true,
    maxAlternatives: 1
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatStore.messages]);

  // Cleanup voice states when chat closes
  useEffect(() => {
    if (!isOpen) {
      setVoiceState('idle');
      setInputValue('');
      setInterimTranscript('');
      finalTranscriptRef.current = '';
      
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current);
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [isOpen]);

  // Mobile-optimized speech recognition initialization
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      // Main speech recognition for voice input
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = voiceSettings.continuous;
        recognitionRef.current.interimResults = voiceSettings.interimResults;
        recognitionRef.current.maxAlternatives = voiceSettings.maxAlternatives;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          if (isProcessingRef.current) return;
          
          let newFinalTranscript = '';
          let newInterimTranscript = '';
          
          // Process all results, starting from where we left off
          for (let i = finalTranscriptRef.current ? event.results.length - 1 : 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              newFinalTranscript += result[0].transcript;
            } else {
              newInterimTranscript += result[0].transcript;
            }
          }
          
          // Update final transcript accumulator
          if (newFinalTranscript) {
            finalTranscriptRef.current += newFinalTranscript;
          }
          
          // Combine accumulated final transcript with current interim
          const displayTranscript = (finalTranscriptRef.current + newInterimTranscript).trim();
          
          if (displayTranscript) {
            setInputValue(displayTranscript);
            setInterimTranscript(newInterimTranscript);
            
            // Reset silence timeout when we get speech
            if (silenceTimeoutRef.current) {
              clearTimeout(silenceTimeoutRef.current);
            }
            
            // Set new silence timeout
            silenceTimeoutRef.current = setTimeout(() => {
              if (finalTranscriptRef.current.trim() && voiceState === 'listening') {
                console.log('Voice input complete after silence:', finalTranscriptRef.current);
                completeVoiceInput();
              }
            }, voiceSettings.silenceTimeout);
            
            // If we have final results, prepare for completion
            if (newFinalTranscript.trim()) {
              console.log('Got final result:', newFinalTranscript);
              
              // On mobile, be more aggressive about completion
              if (isMobile) {
                setTimeout(() => {
                  if (finalTranscriptRef.current.trim() && voiceState === 'listening') {
                    completeVoiceInput();
                  }
                }, 1500);
              }
            }
          }
        };
        
        recognitionRef.current.onstart = () => {
          console.log('Voice input started');
          setVoiceState('listening');
          finalTranscriptRef.current = '';
          setInterimTranscript('');
          isProcessingRef.current = false;
        };
        
        recognitionRef.current.onend = () => {
          console.log('Voice input ended, state:', voiceState);
          
          // Only restart if we're still listening and have no final transcript
          if (voiceState === 'listening' && !finalTranscriptRef.current.trim()) {
            console.log('Restarting recognition - no speech detected');
            setTimeout(() => {
              if (voiceState === 'listening' && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (e) {
                  console.log('Could not restart recognition:', e);
                  setVoiceState('idle');
                }
              }
            }, 100);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Voice recognition error:', event.error);
          
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            const message = isMobile 
              ? 'Microphone permission denied. Please enable microphone access for voice input.'
              : 'Microphone access denied. Please allow microphone permissions and try again.';
            alert(message);
            setVoiceState('idle');
          } else if (event.error === 'network') {
            // Network errors - retry after delay
            setTimeout(() => {
              if (voiceState === 'listening') {
                console.log('Retrying after network error');
                startVoiceInput();
              }
            }, 2000);
          } else {
            // Other errors - reset state
            setVoiceState('idle');
          }
        };
      }

      // Background wake word recognition
      if (!wakeWordRecognitionRef.current) {
        wakeWordRecognitionRef.current = new SpeechRecognition();
        wakeWordRecognitionRef.current.continuous = true;
        wakeWordRecognitionRef.current.interimResults = false;
        wakeWordRecognitionRef.current.lang = 'en-US';
        
        wakeWordRecognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
          console.log('Wake word heard:', transcript);
          
          // More flexible wake word detection
          if (transcript.includes('hey agent') || transcript.includes('agent')) {
            console.log('🎯 Wake word "Hey Agent" detected! Opening chatbot...');
            
            if (!isOpen) {
              setIsOpen(true);
              setTimeout(() => {
                startVoiceInput();
              }, 500);
            } else {
              startVoiceInput();
            }
          }
        };
        
        wakeWordRecognitionRef.current.onend = () => {
          console.log('🔄 Wake word recognition session ended, restarting...');
          // Always restart for continuous listening like other voice assistants
          setTimeout(() => {
            if (isBackgroundListening && wakeWordRecognitionRef.current) {
              triggerWakeWordRestart();
            }
          }, 500);
        };
        
        wakeWordRecognitionRef.current.onerror = (event: any) => {
          console.log('⚠️ Wake word recognition error:', event.error);
          
          // Handle different error types appropriately
          if (event.error === 'no-speech') {
            // No speech is normal, just continue listening
            console.log('No speech detected, continuing to listen...');
          } else if (event.error === 'aborted') {
            // Aborted is usually manual stop, don't restart immediately
            console.log('Recognition aborted, will restart on next cycle');
          } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            // Permission issues
            console.error('Microphone permission denied for wake word');
            setIsBackgroundListening(false);
          } else {
            // Other errors, restart after delay
            console.log('Error occurred, will restart wake word detection');
            setTimeout(() => {
              if (isBackgroundListening && wakeWordRecognitionRef.current) {
                triggerWakeWordRestart();
              }
            }, 1000);
          }
        };
      }
    }

    return () => {
      // Cleanup timeouts
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current);
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, []); // Only run once on mount

  // Separate effect for managing wake word detection state
  useEffect(() => {
    if (isBackgroundListening && wakeWordRecognitionRef.current) {
      startWakeWordRecognition();
    } else if (!isBackgroundListening && wakeWordRecognitionRef.current) {
      stopWakeWordRecognition();
    }
  }, [isBackgroundListening]);

  // Start wake word detection on mount
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsBackgroundListening(true);
    }
  }, []);

  // Handle wake word restart trigger with better reliability
  useEffect(() => {
    if (wakeWordRestartTrigger > 0 && isBackgroundListening) {
      console.log('🔄 Wake word restart triggered, restarting detection...');
      
      // Ensure clean restart with proper timing
      const restartTimeout = setTimeout(() => {
        if (wakeWordRecognitionRef.current && isBackgroundListening) {
          startWakeWordRecognition();
        }
      }, 500); // Longer delay for more reliable restart
      
      return () => clearTimeout(restartTimeout);
    }
  }, [wakeWordRestartTrigger, isBackgroundListening]);

  const completeVoiceInput = () => {
    if (isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setVoiceState('processing');
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Recognition already stopped');
      }
    }
    
    const finalMessage = finalTranscriptRef.current.trim();
    
    if (finalMessage) {
      // Auto-send the message
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current);
      }
      autoSendTimeoutRef.current = setTimeout(() => {
        console.log('Auto-sending voice message:', finalMessage);
        handleSendMessage(true, finalMessage);
      }, 500);
    } else {
      // No speech detected, return to idle
      setVoiceState('idle');
      isProcessingRef.current = false;
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const message = isMobile 
        ? 'Voice input is not available on your device. Please type your message.'
        : 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.';
      alert(message);
      return;
    }
    
    if (voiceState !== 'idle') {
      stopVoiceInput();
      return;
    }
    
    // Stop wake word recognition while using main voice input
    if (wakeWordRecognitionRef.current) {
      stopWakeWordRecognition();
    }
    
    // Reset all voice states
    finalTranscriptRef.current = '';
    setInputValue('');
    setInterimTranscript('');
    isProcessingRef.current = false;
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    setVoiceState('listening');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        console.log('Starting main voice input');
      } catch (e) {
        console.error('Failed to start voice input:', e);
        const message = isMobile 
          ? 'Unable to start voice input. Please check your microphone permissions.'
          : 'Failed to start voice input. Please try again.';
        alert(message);
        setVoiceState('idle');
        
        // Restart wake word detection if main voice input failed
        if (isBackgroundListening) {
          triggerWakeWordRestart();
        }
      }
    }
  };

  const stopVoiceInput = () => {
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current);
    }
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Stopping main voice input');
      } catch (e) {
        console.error('Failed to stop voice input:', e);
      }
    }
    
    // If we have accumulated speech, try to send it
    if (finalTranscriptRef.current.trim()) {
      completeVoiceInput();
    } else {
      setVoiceState('idle');
      isProcessingRef.current = false;
      
      // Restart wake word detection after stopping main voice input
      if (isBackgroundListening) {
        console.log('Restarting wake word detection after stopping voice input');
        triggerWakeWordRestart();
      }
    }
  };
    if (!wakeWordRecognitionRef.current || !isBackgroundListening) {
      console.log('Wake word recognition not available or disabled');
      return;
    }
    
    try {
      // Stop any existing recognition first
      try {
        wakeWordRecognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
      
      // Start with proper delay to ensure clean state
      setTimeout(() => {
        if (wakeWordRecognitionRef.current && isBackgroundListening) {
          try {
            wakeWordRecognitionRef.current.start();
            console.log('🎤 Wake word detection started - listening for "Hey Agent"');
          } catch (startError: any) {
            // Handle "already started" error gracefully
            if (startError.name === 'InvalidStateError') {
              console.log('Wake word detection already running');
              return;
            }
            
            console.error('Failed to start wake word detection:', startError);
            
            // Retry after delay for network or temporary issues
            setTimeout(() => {
              if (wakeWordRecognitionRef.current && isBackgroundListening) {
                try {
                  wakeWordRecognitionRef.current.start();
                  console.log('🎤 Wake word detection started on retry');
                } catch (retryError) {
                  console.error('Wake word detection retry failed:', retryError);
                  // Try again after longer delay
                  setTimeout(() => triggerWakeWordRestart(), 3000);
                }
              }
            }, 1000);
          }
        }
      }, 200);
    } catch (e) {
      console.error('Wake word detection setup error:', e);
    }
  };

  const startWakeWordRecognition = () => {
    if (!wakeWordRecognitionRef.current || !isBackgroundListening) {
      console.log('Wake word recognition not available or disabled');
      return;
    }
    
    try {
      // Stop any existing recognition first
      try {
        wakeWordRecognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
      
      // Start with proper delay to ensure clean state
      setTimeout(() => {
        if (wakeWordRecognitionRef.current && isBackgroundListening) {
          try {
            wakeWordRecognitionRef.current.start();
            console.log('🎤 Wake word detection started - listening for "Hey Agent"');
          } catch (startError: any) {
            // Handle "already started" error gracefully
            if (startError.name === 'InvalidStateError') {
              console.log('Wake word detection already running');
              return;
            }
            
            console.error('Failed to start wake word detection:', startError);
            
            // Retry after delay for network or temporary issues
            setTimeout(() => {
              if (wakeWordRecognitionRef.current && isBackgroundListening) {
                try {
                  wakeWordRecognitionRef.current.start();
                  console.log('🎤 Wake word detection started on retry');
                } catch (retryError) {
                  console.error('Wake word detection retry failed:', retryError);
                  // Try again after longer delay
                  setTimeout(() => triggerWakeWordRestart(), 3000);
                }
              }
            }, 1000);
          }
        }
      }, 200);
    } catch (e) {
      console.error('Wake word detection setup error:', e);
    }
  };

  const stopWakeWordRecognition = () => {
    if (!wakeWordRecognitionRef.current) return;
    
    try {
      wakeWordRecognitionRef.current.stop();
      console.log('Wake word detection stopped');
    } catch (e) {
      console.log('Could not stop wake word detection:', e);
    }
  };

  const triggerWakeWordRestart = () => {
    if (isBackgroundListening) {
      console.log('Triggering wake word restart via state...');
      setWakeWordRestartTrigger(prev => prev + 1);
    }
  };

  const handleAddToDashboard = (chart: ChartData) => {
    // If it's a table, show title dialog first
    if (chart.chart_type === 'table') {
      setPendingChart(chart);
      setShowTitleDialog(true);
      return;
    }
    
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

  const handleTitleConfirm = () => {
    if (!tableTitle.trim() || !pendingChart) return;
    
    // Update the chart with the provided title
    const updatedChart = {
      ...pendingChart,
      title: tableTitle.trim()
    };
    
    setShowTitleDialog(false);
    setTableTitle('');
    
    const accessibleModules = getAccessibleModules();
    if (accessibleModules.length === 1) {
      // If user has access to only one dashboard, add directly
      confirmAddToDashboard(updatedChart, accessibleModules[0].id);
    } else {
      // Show dashboard selection with updated chart
      setPendingChart(updatedChart);
      setShowDashboardSelect(true);
    }
  };

  const handleTitleCancel = () => {
    setShowTitleDialog(false);
    setTableTitle('');
    setPendingChart(null);
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
          chart: undefined,
        };
        
        chatStore.addMessage(successMessage);
      
      // Reset state
      setShowDashboardSelect(false);
      setPendingChart(null);
      setSelectedDashboard('');
    } catch (error) {
      console.error('Error adding chart to dashboard:', error);
      
        const errorMessage: Message = {
          id: (Date.now() + 3).toString(),
          type: 'bot',
          content: '❌ Failed to add chart to dashboard. Please try again.',
          timestamp: new Date(),
          chart: undefined,
        };
        
        chatStore.addMessage(errorMessage);
    }
  };

  const clearChatHistory = () => {
    // Use chat store to clear - no localStorage
    chatStore.clearChat();
  };

  const handleSendMessage = async (isVoiceMessage = false, messageText?: string) => {
    if (isLoading || !session) return;
    
    const message = messageText || inputValue.trim();
    if (!message) {
      console.log('No message to send:', { messageText, inputValue });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
      chart: undefined,
    };

    // Use chat store instead of local state
    chatStore.addMessage(userMessage);
    setInputValue('');
    setIsLoading(true);
    
    // Handle voice completion - delay state change until after processing
    if (isVoiceMessage) {
      setVoiceState('completing');
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current);
      }
    }
    
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
        messageContent = 'Something went wrong. Please try again with another query, and if error presists please contact Admin.';
      }
      
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: messageContent,
        timestamp: new Date(),
        chart,
      };

      // Use chat store instead of local state
      chatStore.addMessage(botMessage);

      // Save conversation to database
      await saveConversation(userMessage.content, data.response);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
      
      // Complete voice state transition after message processing
      if (isVoiceMessage) {
        console.log('Voice message sent successfully');
        setVoiceState('idle');
        isProcessingRef.current = false;
        
        // Clear voice-related states
        finalTranscriptRef.current = '';
        setInterimTranscript('');
        
        // Immediately restart wake word detection after completing voice message
        if (isBackgroundListening) {
          console.log('Restarting wake word detection after voice message');
          triggerWakeWordRestart();
        }
      }
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
    <div className={`fixed bottom-6 z-50 ${isMobile ? 'right-4' : 'right-6'}`}>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:scale-105 transition-all"
        >
          <MessageSquare className="text-white" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        </Button>
      ) : (
        <Card className={`${isMobile ? 'w-full' : 'w-96'} shadow-xl flex flex-col transition-all duration-300 bg-card border-border ${isMinimized ? 'h-16' : isMobile ? 'h-[80vh] max-h-[600px]' : 'h-[600px]'}`}>
          {/* Fixed Header */}
          <div className="p-3 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between flex-shrink-0 relative z-10">
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
                  {chatStore.messages.map((message) => (
                     <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`${message.chart ? 'w-full' : 'max-w-[85%]'} ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                         {message.type === 'user' ? (
                           // User message bubble - SAP Joule style
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-md px-3 py-2 shadow-sm">
                              <p className="text-xs font-medium leading-relaxed">{message.content}</p>
                              <p className="text-xs text-blue-100 mt-1 opacity-80">{message.timestamp.toLocaleTimeString()}</p>
                            </div>
                         ) : (
            // Bot message - clean style without avatar
                             <div className="w-full">
                {message.content.trim() && (
                  <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl rounded-tl-md px-3 py-2 shadow-sm">
                    <p className="text-xs text-gray-800 dark:text-card-foreground leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    {!message.chart && (
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1 opacity-70">{message.timestamp.toLocaleTimeString()}</p>
                    )}
                  </div>
                )}
                               {message.chart && (
                                  <div className="mt-3 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl p-3 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-sm font-semibold text-gray-800 dark:text-card-foreground">{message.chart.title}</h4>
                                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                                    </div>
                                    <div className={`w-full h-56 bg-gray-50/50 dark:bg-background/30 rounded-lg p-2 ${message.chart.chart_type === 'table' ? 'overflow-auto' : 'overflow-hidden'}`}>
                                       <div className="w-full h-full">
                                         {renderChart(message.chart)}
                                       </div>
                                   </div>
                                   <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-border">
                                     <p className="text-xs text-gray-500 dark:text-muted-foreground opacity-70">{message.timestamp.toLocaleTimeString()}</p>
                                     <Button 
                                       size="sm" 
                                       onClick={() => handleAddToDashboard(message.chart!)}
                                       className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs px-3 py-1.5 shadow-sm rounded-full h-7"
                                     >
                                       <Plus className="h-3 w-3 mr-1" />
                                       Add to Dashboard
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
                {/* Voice input interim feedback */}
                {voiceState === 'listening' && interimTranscript && (
                  <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Listening...</span>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1 italic">
                      {interimTranscript}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && voiceState === 'idle' && handleSendMessage()}
                    placeholder={voiceState === 'listening' 
                      ? (isMobile ? "Speak now... Tap mic to stop" : "Listening... Speak now") 
                      : "Ask me anything about your business data..."
                    }
                    className={`flex-1 text-sm bg-white dark:bg-background border-gray-200 dark:border-border text-gray-900 dark:text-foreground ${
                      voiceState === 'listening' ? 'border-blue-400 dark:border-blue-600' : ''
                    }`}
                    disabled={isLoading || voiceState === 'processing'}
                  />
                   {/* Enhanced voice button with mobile optimization */}
                  {voiceState === 'idle' && !inputValue.trim() && !isLoading ? (
                    <Button 
                      variant="gradient"
                      onClick={startVoiceInput}
                      className="relative transition-all duration-200 hover:scale-105"
                      title={isMobile 
                        ? 'Tap for voice input or say "Hey Agent"'
                        : 'Start voice input or say "Hey Agent"'
                      }
                      size="sm"
                      disabled={isLoading}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  ) : voiceState === 'listening' ? (
                    <Button 
                      variant="gradient"
                      onClick={stopVoiceInput}
                      className={`relative animate-pulse bg-green-500 hover:bg-green-600 ${
                        isMobile ? 'scale-110 shadow-lg' : 'scale-110'
                      }`}
                      title={isMobile ? "Tap to stop and send" : "Listening... Click to stop"}
                      size="sm"
                    >
                      <Mic className="h-4 w-4 text-white" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    </Button>
                  ) : voiceState === 'processing' || voiceState === 'completing' ? (
                    <Button 
                      variant="gradient"
                      disabled
                      className="relative"
                      title="Processing voice..."
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    </Button>
                  ) : inputValue.trim() && voiceState === 'idle' && !isLoading ? (
                    <Button 
                      onClick={() => handleSendMessage(false)}
                      disabled={isLoading || !inputValue.trim()}
                      variant="gradient"
                      size="sm"
                      title="Send message"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  ) : null
                  }
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
                        variant="gradient"
                        size="sm" 
                        onClick={() => confirmAddToDashboard(pendingChart!, selectedDashboard)}
                        disabled={!selectedDashboard}
                        className="text-xs"
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
      
      {/* Table Title Dialog */}
      <Dialog open={showTitleDialog} onOpenChange={setShowTitleDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Table Title</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={tableTitle}
              onChange={(e) => setTableTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && tableTitle.trim() && handleTitleConfirm()}
              placeholder="Enter a title for your table..."
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleTitleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleTitleConfirm} 
              disabled={!tableTitle.trim()}
            >
              Add Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}