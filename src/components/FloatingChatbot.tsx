"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { MessageSquare, Send, Bot, X, Minimize2, Maximize2, Plus, Mic, RefreshCw, Volume2, VolumeX, Edit3 } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useRoleStore } from "@/store/roleStore"
import { API_BASE_URL } from "@/config/api"
import { UnifiedChartRenderer } from "./UnifiedChartRenderer"
import type { ChartConfig, EnhancedChartData } from "@/types/chart"
import { useIsMobile } from "@/hooks/use-mobile"
import { useUserChatStore, type Message } from "@/store/chatStore"

interface ChartData {
  chart_type: string
  title: string
  x: string[]
  y?: number[]
  xLabel?: string
  yLabel?: string
  y_axes?: string[] // Array of Y-axis column names (for multi-series charts)
  sqlQuery?: string
  rawData?: any[] // Preserve original data for tables
  tableName?: string // Table name for table charts
}

// Convert chatbot chart data to unified format
const convertChatbotChartData = (
  chart: ChartData,
): {
  data: EnhancedChartData[]
  config: ChartConfig
} => {
  // For tables, use raw data if available to preserve all columns
  if (chart.chart_type === "table" && chart.rawData) {
    const config: ChartConfig = {
      xLabel: chart.xLabel,
      yLabel: chart.yLabel,
      chartType: "table",
      colors: ["#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6", "#06B6D4"],
      showGrid: true,
    }
    return { data: chart.rawData, config }
  }
  // If rawData is present for a chart (common when multiple y-series are returned),
  // transform rawData rows into EnhancedChartData preserving all numeric series keys.
  if (chart.rawData && chart.chart_type !== "table") {
    // rawData is expected as array of objects: [{ x: 'Jan', sales: 100, purchase: 120 }, ...]
    // If y_axes is provided, only include those columns (plus X-axis) to avoid showing unwanted columns
    const allowedKeys = chart.y_axes && chart.y_axes.length > 0
      ? [chart.xLabel, ...chart.y_axes].filter(Boolean) // Include X-axis + Y-axes
      : null; // If no y_axes specified, include all keys (backward compatibility)
    
    const data = chart.rawData.map((row: any) => {
      const entry: any = { name: row[chart.xLabel] ?? row.name ?? '' };
      Object.keys(row).forEach((k) => {
        if (k === chart.xLabel) return; // Skip X-axis (already in 'name')
        // If y_axes is specified, only include those columns
        if (allowedKeys && !allowedKeys.includes(k)) return;
        entry[k] = row[k];
      });
      return entry;
    });

    // Use y_axes if provided, otherwise extract from data (backward compatibility)
    const seriesKeys = chart.y_axes && chart.y_axes.length > 0
      ? chart.y_axes
      : (data.length ? Object.keys(data[0]).filter((k) => k !== 'name') : []);

    const config: ChartConfig = {
      xLabel: chart.xLabel,
      yLabel: chart.yLabel,
      chartType: chart.chart_type as "line" | "bar" | "area" | "doughnut" | "table",
      colors: ["#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6", "#06B6D4"],
      dataKeys: seriesKeys,
      showGrid: true,
      showLegend: true,
    };

    return { data, config };
  }

  // Fallback: single-series charts (legacy behavior)
  const data = chart.x.map((label, idx) => ({
    name: label,
    [chart.xLabel]: label,
    [chart.yLabel]: chart.y[idx],
  }));

  const config: ChartConfig = {
    xLabel: chart.xLabel,
    yLabel: chart.yLabel,
    chartType: chart.chart_type as "line" | "bar" | "area" | "doughnut"| "table",
    colors: ["#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6", "#06B6D4"],
    showGrid: true,
  };

  return { data, config };
}

// Message interface imported from chatStore

export function FloatingChatbot() {
  const { session } = useAuthStore()
  const { getAccessibleModules } = useRoleStore()
  const isMobile = useIsMobile()
  const chatStore = useUserChatStore(session?.user?.user_id?.toString() || null)

  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDashboardSelect, setShowDashboardSelect] = useState(false)
  const [pendingChart, setPendingChart] = useState<ChartData | null>(null)
  const [titleDraft, setTitleDraft] = useState<string>('')
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false)
  const [isEditingTableTitle, setIsEditingTableTitle] = useState<boolean>(false)
  const [showTitleDialog, setShowTitleDialog] = useState(false)
  const [tableTitle, setTableTitle] = useState("")
  const [modalDashboard, setModalDashboard] = useState<string>("")
  const [maxChart, setMaxChart] = useState<ChartData | null>(null)
  const [showMaxDialog, setShowMaxDialog] = useState(false)

  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Enhanced voice recognition states
  type VoiceState = "idle" | "listening" | "processing" | "completing"
  const [voiceState, setVoiceState] = useState<VoiceState>("idle")
  const [isBackgroundListening, setIsBackgroundListening] = useState(false)
  const [isListeningForAddToDashboard, setIsListeningForAddToDashboard] = useState(false) // ✅ NEW
  const [wakeWordRestartTrigger, setWakeWordRestartTrigger] = useState(0)
  const recognitionRef = useRef<any>(null)
  const wakeWordRecognitionRef = useRef<any>(null)
  const addToDashboardRecognitionRef = useRef<any>(null) // ✅ NEW: Dedicated listener for "add to dashboard"
  // Running state refs to avoid race conditions when starting/stopping recognizers
  const mainRunningRef = useRef(false)
  const wakeRunningRef = useRef(false)
  const addToRunningRef = useRef(false)
  const restartTimeoutRef = useRef<any>(null)
  const autoSendTimeoutRef = useRef<any>(null)
  // Keep the most recent chart produced in-memory to avoid timing races between
  // voice detection and chatStore updates.
  const lastChartRef = useRef<ChartData | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive or chat opens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatStore.messages])

  // Scroll to bottom when chat window opens
  useEffect(() => {
    if (isOpen && !isMinimized && chatStore.messages.length > 0) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [isOpen, isMinimized])

  // Cleanup voice states when chat closes
  useEffect(() => {
    if (!isOpen) {
      setVoiceState("idle")
      setInputValue("")
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current)
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (speakingMessageId) {
        window.speechSynthesis.cancel()
        setSpeakingMessageId(null)
      }
    }
  }, [isOpen])

  // Initialize speech recognition - only once on mount
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      // Main speech recognition for voice input
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          // Show interim separately (typing effect)
          if (interimTranscript) {
            setInputValue(interimTranscript.trim())
          }

          // Only commit when final is ready (fixes mobile duplication)
          if (finalTranscript.trim()) {
            console.log("Voice input complete:", finalTranscript)
            setInputValue(finalTranscript.trim())
            setVoiceState("processing")

            // Stop recognition immediately after final transcript
            try {
              recognitionRef.current?.stop()
            } catch {
              console.log("Recognition already stopped")
            }

            // Auto-send after short delay
            if (autoSendTimeoutRef.current) {
              clearTimeout(autoSendTimeoutRef.current)
            }
            autoSendTimeoutRef.current = setTimeout(() => {
              console.log("Auto-sending voice message:", finalTranscript)
              
              // ✅ FIXED: Set voice to idle BEFORE sending message so mic becomes clickable immediately
              setVoiceState("idle")
              
              // Send the message
              handleSendMessage(true, finalTranscript.trim())
              
              // ✅ FIXED: Restart wake word listener with shorter delay
              setTimeout(() => {
                if (isBackgroundListening) {
                  console.log("🔄 Restarting wake word after sending message")
                  triggerWakeWordRestart()
                }
              }, 500)
            }, 800)
          }
        }

        recognitionRef.current.onstart = () => {
          console.log("Main voice input started")
          mainRunningRef.current = true
          setVoiceState("listening")
        }

        recognitionRef.current.onend = () => {
          console.log("Main voice input ended")
          mainRunningRef.current = false
          // Ensure state is idle unless we transitioned to completing elsewhere
          setVoiceState((s) => (s === 'completing' ? 'completing' : 'idle'))
          // Restart wake word detection after main input ends
          if (isBackgroundListening) {
            console.log("Restarting wake word after main input")
            triggerWakeWordRestart()
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Voice recognition error:", event.error)
          mainRunningRef.current = false
          setVoiceState("idle")

          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            const message = isMobile
              ? "Microphone permission denied. Please enable microphone access for voice input."
              : "Microphone access denied. Please allow microphone permissions and try again."
            alert(message)
          }

          // Restart wake word even if error happens
          if (isBackgroundListening) {
            triggerWakeWordRestart()
          }
        }
      }

      // Background wake word recognition
      if (!wakeWordRecognitionRef.current) {
        wakeWordRecognitionRef.current = new SpeechRecognition()
        wakeWordRecognitionRef.current.continuous = true
        wakeWordRecognitionRef.current.interimResults = true
        wakeWordRecognitionRef.current.lang = "en-US"

  wakeWordRecognitionRef.current.onresult = (event: any) => {
          // Build a transcript from interim+final results so we can detect wake words early
          let transcriptAll = ""
          for (let i = 0; i < event.results.length; i++) {
            const t = event.results[i][0].transcript || ""
            transcriptAll += t + " "
          }

          const transcript = transcriptAll.toLowerCase().trim()
          if (!transcript) return
          console.log("Wake word heard (interim+final):", transcript)

          // Detect variations for AI Agent wake word
          if (transcript.includes("ai agent") || transcript.includes("hey ai agent") || transcript.includes("hey agent") || transcript.includes("ok ai")) {
            console.log('🎯 Wake word "AI Agent" detected! Opening chatbot...')

            // Prevent wake word from retriggering while we handle main input
            try {
              stopWakeWordRecognition()
            } catch {}

            // Start main voice input in a controlled way
            if (!isOpen) {
              setIsOpen(true)
              setTimeout(() => {
                startVoiceInput()
              }, 400)
            } else {
              setTimeout(() => startVoiceInput(), 100)
            }
          }
        }
        wakeWordRecognitionRef.current.onend = () => {
          console.log("🔄 Wake word recognition session ended")
          wakeRunningRef.current = false
          // Restart unless background listening disabled or add-to-dashboard is running
          setTimeout(() => {
            if (isBackgroundListening && !addToRunningRef.current) {
              triggerWakeWordRestart()
            }
          }, 500)
        }

        wakeWordRecognitionRef.current.onerror = (event: any) => {
          console.log("⚠️ Wake word recognition error:", event.error)

          wakeRunningRef.current = false
          if (event.error === "no-speech") {
            console.log("No speech detected, continuing...")
          } else if (event.error === "aborted") {
            console.log("Recognition aborted, will restart later")
          } else if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            console.error("Microphone permission denied for wake word")
            setIsBackgroundListening(false)
          } else {
            console.log("Error occurred, restarting wake word detection")
            setTimeout(() => {
              if (isBackgroundListening && wakeWordRecognitionRef.current) {
                triggerWakeWordRestart()
              }
            }, 1000)
          }
        }
      }

      // ✅ NEW: Dedicated "add to dashboard" recognition
      if (!addToDashboardRecognitionRef.current) {
        addToDashboardRecognitionRef.current = new SpeechRecognition()
        addToDashboardRecognitionRef.current.continuous = true
        addToDashboardRecognitionRef.current.interimResults = true
        addToDashboardRecognitionRef.current.lang = "en-US"

  addToDashboardRecognitionRef.current.onresult = (event: any) => {
          // Check interim + final transcripts to catch command early
          let transcriptAll = ""
          for (let i = 0; i < event.results.length; i++) {
            const t = event.results[i][0].transcript || ""
            transcriptAll += t + " "
          }
          const transcript = transcriptAll.toLowerCase().trim()
          if (!transcript) return
          console.log("🎧 Listening for 'add to dashboard' (interim+final):", transcript)

          // Check for "add to dashboard" variations
          const addCommands = [
            'add to dashboard', 'add to dash board', 'add dashboard',
            'add it to dashboard', 'add this to dashboard', 'save to dashboard',
            'add chart to dashboard', 'add table to dashboard',
            'save chart', 'save table', 'add it', 'save it'
          ]

          const isAddCommand = addCommands.some(cmd => transcript.includes(cmd))

          if (isAddCommand) {
            console.log('✅ "Add to dashboard" command detected!')

            // Ensure we only handle this once
            setIsListeningForAddToDashboard(false)
            try {
              addToDashboardRecognitionRef.current?.stop()
            } catch (e) {
              console.log('Already stopped')
            }

            addToRunningRef.current = false

            // Stop wake word as well to avoid conflicts, it will be restarted later
            try {
              stopWakeWordRecognition()
            } catch {}
            // Try to find the most recent bot message with a chart/table.
            // Sometimes recognition fires slightly before the UI/store update completes, so retry a few times.
            (async () => {
              // Prefer the in-memory lastChartRef when available to avoid timing races
              if (lastChartRef.current) {
                console.log('📌 Using lastChartRef for add-to-dashboard (fast path)')
                handleAddToDashboard(lastChartRef.current)
                return
              }

              const attempts = 4
              let found: any = null
              for (let i = 0; i < attempts; i++) {
                // always inspect current messages snapshot
                const msg = [...chatStore.messages].reverse().find((m) => m.type === 'bot' && m.chart)
                if (msg) {
                  found = msg
                  break
                }
                // small delay before retrying
                await new Promise((r) => setTimeout(r, 150))
              }

              if (found?.chart) {
                console.log('📊 Triggering add to dashboard for chart/table (after retry):', found.chart)
                handleAddToDashboard(found.chart)
                return
              }

              // Fallback: if no message with chart was found, try the last bot message and prompt the user
              const lastBot = [...chatStore.messages].reverse().find((m) => m.type === 'bot')
              if (lastBot) {
                console.log('⚠️ No chart/table found attached to last bot message, prompting user')
                const infoMsg: Message = {
                  id: (Date.now() + 5).toString(),
                  type: 'bot',
                  content: "I heard 'add to dashboard' but couldn't find the chart or table. Please click 'Add to Dashboard' on the chart you want to save, or say 'add to dashboard' again.",
                  timestamp: new Date(),
                  chart: undefined,
                }
                chatStore.addMessage(infoMsg)
              } else {
                console.log('❌ No bot messages at all to attach')
              }
            })()
          }
        }

        addToDashboardRecognitionRef.current.onend = () => {
          console.log("🎧 'Add to dashboard' listener ended")
          addToRunningRef.current = false
          // If still supposed to be listening, restart to be resilient
          if (isListeningForAddToDashboard && addToDashboardRecognitionRef.current) {
            setTimeout(() => {
              try {
                addToDashboardRecognitionRef.current?.start()
                addToRunningRef.current = true
                console.log("🎧 'Add to dashboard' listener restarted")
              } catch (e) {
                console.log("Failed to restart 'add to dashboard' listener:", e)
              }
            }, 500)
          }
        }

        addToDashboardRecognitionRef.current.onerror = (event: any) => {
          console.log("⚠️ 'Add to dashboard' listener error:", event.error)
          addToRunningRef.current = false
          // Try to restart on recoverable errors
          if (isListeningForAddToDashboard) {
            setTimeout(() => {
              try {
                addToDashboardRecognitionRef.current?.start()
                addToRunningRef.current = true
              } catch (e) {
                console.log("Could not restart addToDashboard listener after error", e)
              }
            }, 800)
          }
        }
      }
    }

    return () => {
      // Cleanup timeouts
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current)
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
    }
  }, [])

  // Separate effect for managing wake word detection state
  useEffect(() => {
    if (isBackgroundListening && wakeWordRecognitionRef.current) {
      startWakeWordRecognition()
    } else if (!isBackgroundListening && wakeWordRecognitionRef.current) {
      stopWakeWordRecognition()
    }
  }, [isBackgroundListening])

  // Start wake word detection on mount
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setIsBackgroundListening(true)
    }
  }, [])

  // Handle wake word restart trigger with better reliability
  useEffect(() => {
    if (wakeWordRestartTrigger > 0 && isBackgroundListening) {
      console.log("🔄 Wake word restart triggered, restarting detection...")

      // Ensure clean restart with proper timing
      const restartTimeout = setTimeout(() => {
        if (wakeWordRecognitionRef.current && isBackgroundListening) {
          startWakeWordRecognition()
        }
      }, 500) // Longer delay for more reliable restart

      return () => clearTimeout(restartTimeout)
    }
  }, [wakeWordRestartTrigger, isBackgroundListening])

  const startWakeWordRecognition = () => {
    if (!wakeWordRecognitionRef.current || !isBackgroundListening) {
      console.log("Wake word recognition not available or disabled")
      return
    }

    if (wakeRunningRef.current) {
      console.log('Wake word recognition already running, skipping start')
      return
    }

    try {
      // Stop any existing recognition first
      try {
        wakeWordRecognitionRef.current.stop()
      } catch (e) {
        // Ignore stop errors
      }

      // Start with proper delay to ensure clean state
      setTimeout(() => {
        if (wakeWordRecognitionRef.current && isBackgroundListening) {
          try {
            wakeWordRecognitionRef.current.start()
            wakeRunningRef.current = true
            console.log('🎤 Wake word detection started - listening for "AI Agent"')
          } catch (startError: any) {
            // Handle "already started" error gracefully
            if (startError.name === "InvalidStateError") {
              console.log("Wake word detection already running")
              return
            }

            console.error("Failed to start wake word detection:", startError)

            // Retry after delay for network or temporary issues
            setTimeout(() => {
              if (wakeWordRecognitionRef.current && isBackgroundListening) {
                try {
                  wakeWordRecognitionRef.current.start()
                  wakeRunningRef.current = true
                  console.log("🎤 Wake word detection started on retry")
                } catch (retryError) {
                  console.error("Wake word detection retry failed:", retryError)
                  // Try again after longer delay
                  setTimeout(() => triggerWakeWordRestart(), 3000)
                }
              }
            }, 1000)
          }
        }
      }, 200)
    } catch (e) {
      console.error("Wake word detection setup error:", e)
    }
  }

  const stopWakeWordRecognition = () => {
    if (!wakeWordRecognitionRef.current) return

    try {
      wakeWordRecognitionRef.current.stop()
      wakeRunningRef.current = false
      console.log("Wake word detection stopped")
    } catch (e) {
      console.log("Could not stop wake word detection:", e)
    }
  }

  const triggerWakeWordRestart = () => {
    if (isBackgroundListening) {
      console.log("Triggering wake word restart via state...")
      setWakeWordRestartTrigger((prev) => prev + 1)
    }
  }

  // ✅ NEW: Functions to control "add to dashboard" listener
  const startAddToDashboardListener = () => {
    if (!addToDashboardRecognitionRef.current) {
      console.log('❌ Add to dashboard listener not initialized')
      return
    }

    try {
      // Stop wake word recognition to avoid conflicts
      try {
        stopWakeWordRecognition()
      } catch {}

      // Stop any existing recognition first
      try {
        addToDashboardRecognitionRef.current.stop()
      } catch (e) {
        // Ignore
      }

      // Start listening after a short delay
      setTimeout(() => {
        if (addToDashboardRecognitionRef.current) {
          try {
            addToDashboardRecognitionRef.current.start()
            addToRunningRef.current = true
            setIsListeningForAddToDashboard(true) // ✅ Set state
            console.log('🎧 Started listening for "add to dashboard" command...')
          } catch (startError: any) {
            if (startError.name === "InvalidStateError") {
              console.log('"Add to dashboard" listener already running')
              setIsListeningForAddToDashboard(true)
            } else {
              console.error('Failed to start "add to dashboard" listener:', startError)
            }
          }
        }
      }, 200)
    } catch (e) {
      console.error('"Add to dashboard" listener error:', e)
    }
  }

  const stopAddToDashboardListener = () => {
    if (!addToDashboardRecognitionRef.current) return

    try {
      addToDashboardRecognitionRef.current.stop()
      addToRunningRef.current = false
      setIsListeningForAddToDashboard(false) // ✅ Clear state
      console.log('🎧 Stopped "add to dashboard" listener')
    } catch (e) {
      console.log('Could not stop "add to dashboard" listener:', e)
    }
  }
  
  // Ensure wake-word restarts when add-to-dashboard listener stops
  useEffect(() => {
    if (!isListeningForAddToDashboard && isBackgroundListening) {
      // Give a small delay to let resources settle
      setTimeout(() => startWakeWordRecognition(), 300)
    }
  }, [isListeningForAddToDashboard, isBackgroundListening])

  // Derived flag to decide if the send button should be shown
  const sendAllowed = !!(inputValue.trim() && !isLoading && !(['listening', 'processing'] as string[]).includes(voiceState as string))

  const startVoiceInput = () => {
    console.log('🎤 startVoiceInput called, current state:', {
      voiceState,
      isBackgroundListening,
      hasRecognition: !!recognitionRef.current,
      hasWakeWord: !!wakeWordRecognitionRef.current
    })

    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const message = isMobile
        ? "Voice input is not available on your device. Please type your message."
        : "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari."
      alert(message)
      return
    }

    if (voiceState !== "idle") {
      console.log('🛑 Voice not idle, stopping current input')
      stopVoiceInput()
      return
    }

    // Stop wake word recognition while using main voice input
    if (wakeWordRecognitionRef.current) {
      console.log('⏸️ Stopping wake word detection for main voice input')
      stopWakeWordRecognition()
    }

    // ✅ Also stop "add to dashboard" listener when starting new voice input
    stopAddToDashboardListener()

    // Clear input and start listening
    setInputValue("")
    setVoiceState("listening")

    if (recognitionRef.current) {
      try {
        // Check microphone permission via Permissions API when available
        try {
          if ((navigator as any).permissions && (navigator as any).permissions.query) {
            ;(navigator as any).permissions.query({ name: 'microphone' }).then((perm: any) => {
              if (perm.state === 'denied') {
                alert('Microphone access denied. Please enable microphone permissions for this site.')
                setVoiceState('idle')
                // disable background listeners to avoid repeated prompts
                setIsBackgroundListening(false)
              }
            }).catch(() => {
              // ignore permission query errors
            })
          }
        } catch (permErr) {
          // ignore
        }
        // Try to ensure recognizer is not already running
        try {
          if (mainRunningRef.current) {
            console.log('Main recognizer already running, skipping start')
            return
          }
          // sometimes recognition can be left in a bad state; try to stop first
          try {
            recognitionRef.current.stop()
          } catch (stopErr) {
            // ignore
          }

          recognitionRef.current.start()
          console.log("✅ Main voice input started successfully")
        } catch (startErr: any) {
          console.error('Start failed, attempting recovery:', startErr)
          // If we get InvalidStateError, try a short-stop-start recovery
          if (startErr && (startErr.name === 'InvalidStateError' || startErr.name === 'NotAllowedError' || startErr.message?.includes('Failed to execute'))) {
            try {
              recognitionRef.current.stop()
            } catch (e) {
              // ignore
            }
            setTimeout(() => {
              try {
                recognitionRef.current.start()
                console.log('✅ Main voice input started on retry')
              } catch (retryErr) {
                console.error('Retry start failed:', retryErr)
                const message = isMobile
                  ? "Unable to start voice input. Please check your microphone permissions."
                  : "Failed to start voice input. Please try again."
                alert(message)
                setVoiceState('idle')
                if (isBackgroundListening) triggerWakeWordRestart()
              }
            }, 300)
          } else {
            const message = isMobile
              ? "Unable to start voice input. Please check your microphone permissions."
              : "Failed to start voice input. Please try again."
            alert(message)
            setVoiceState('idle')
            if (isBackgroundListening) triggerWakeWordRestart()
          }
        }
      } catch (e) {
        console.error("❌ Failed to start voice input:", e)
        const message = isMobile
          ? "Unable to start voice input. Please check your microphone permissions."
          : "Failed to start voice input. Please try again."
        alert(message)
        setVoiceState("idle")
        // Restart wake word detection if main voice input failed
        if (isBackgroundListening) {
          console.log('🔄 Restarting wake word after voice input failure')
          triggerWakeWordRestart()
        }
      }
    } else {
      console.error('❌ recognitionRef.current is null!')
      setVoiceState("idle")
    }
  }

  const stopVoiceInput = () => {
    console.log('🛑 stopVoiceInput called')
    
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current)
      console.log('⏱️ Cleared auto-send timeout')
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        console.log("✅ Stopped main voice input")
      } catch (e) {
        console.error("❌ Failed to stop voice input:", e)
      }
    }

    setVoiceState("idle")

    // Restart wake word detection after stopping main voice input
    if (isBackgroundListening) {
      console.log("🔄 Restarting wake word detection after stopping voice input")
      setTimeout(() => {
        triggerWakeWordRestart()
      }, 500)
    }
  }

  const handleTextToSpeech = (messageId: string, text: string) => {
    // If already speaking this message, stop it
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel()
      setSpeakingMessageId(null)
      return
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel()

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onend = () => {
      setSpeakingMessageId(null)
    }

    utterance.onerror = () => {
      setSpeakingMessageId(null)
    }

    speechSynthesisRef.current = utterance
    setSpeakingMessageId(messageId)
    window.speechSynthesis.speak(utterance)
  }

  const handleAddToDashboard = (chart: ChartData) => {
    console.log('📊 handleAddToDashboard called with chart:', chart)
    
    // ✅ Stop the listener since we're now adding to dashboard
    stopAddToDashboardListener()
    
    const accessibleModules = getAccessibleModules()
    console.log('✅ Accessible modules:', accessibleModules)
    
    // Set pending chart for modal and prefill editable titles
    setPendingChart(chart)
    setTitleDraft(chart.title || '')
    if (chart.chart_type === 'table') {
      // Prefill table title from API-provided title so user can edit it instead of asking
      setTableTitle(chart.title || '')
    }
    
    // Pre-select dashboard if only one available
    if (accessibleModules.length === 1) {
      setModalDashboard(accessibleModules[0].id)
    }
    
    // ✅ FIXED: Always show modal - different for table vs chart
    if (chart.chart_type === "table") {
      console.log('📋 Chart is a table, showing title + dashboard dialog')
      setShowTitleDialog(true)
    } else {
      console.log('� Chart detected, showing dashboard selection modal')
      setShowDashboardSelect(true)
    }
  }

  const handleTitleConfirm = () => {
    if (!tableTitle.trim() || !pendingChart || !modalDashboard) return

    // ✅ Stop listener when confirming
    stopAddToDashboardListener()

    // Update the chart with the provided title
    const updatedChart = {
      ...pendingChart,
      title: tableTitle.trim(),
    }

    // Reset modal states
    setShowTitleDialog(false)
    setTableTitle("")
    
    // Directly add to the selected dashboard
    confirmAddToDashboard(updatedChart, modalDashboard)
    setModalDashboard("")
  }

  const handleTitleCancel = () => {
    setShowTitleDialog(false)
    setTableTitle("")
    setPendingChart(null)
    setModalDashboard("")
    
    // ✅ Restart listener if user cancels
  const lastBotMessage = [...chatStore.messages].reverse().find((m) => m.type === 'bot' && m.chart)
  // If chat store doesn't yet contain the latest chart (race), fall back to in-memory lastChartRef
  const effectiveLast = lastBotMessage?.chart ? lastBotMessage : (lastChartRef.current ? { type: 'bot', chart: lastChartRef.current } as any : null)
    if (effectiveLast?.chart) {
        setTimeout(() => startAddToDashboardListener(), 500)
      }
  }

  const confirmAddToDashboard = async (chart: ChartData, dashboardId: string) => {
    console.log('🚀 Starting confirmAddToDashboard:', { chart, dashboardId })
    
    try {
      if (!session?.user.tenant_id) {
        console.error("❌ No tenant session found")
        throw new Error("No tenant session found")
      }

      const { data, config } = convertChatbotChartData(chart)
      console.log('✅ Chart data converted:', { data, config })

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
          dataSource: "chatbot",
          chartData: data,
          chartConfig: config, // Enhanced configuration with labels
        },
      }

      console.log('📦 Widget payload:', {
        tenant_id: session.user.tenant_id,
        dashboard: dashboardId,
        title: newWidget.title,
        type: newWidget.type,
        user_id: session.user.user_id,
      })

      // Add widget to dashboard using direct API call
      const response = await fetch(`${API_BASE_URL}/widgets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenant_id: session.user.tenant_id,
          dashboard: dashboardId,
          title: newWidget.title,
          type: newWidget.type,
          span: newWidget.span,
          position_x: newWidget.position.x,
          position_y: newWidget.position.y,
          size_width: newWidget.size.width,
          size_height: newWidget.size.height,
          sql_query: newWidget.sqlQuery || "",
          user_id: session.user.user_id,
        }),
      })

      console.log('📡 API Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error response:', errorText)
        throw new Error(`Failed to create widget: ${response.status} ${errorText}`)
      }

      const responseData = await response.json()
      console.log('✅ Widget created successfully:', responseData)

      // Show success message
      const dashboardName = getAccessibleModules().find((m) => m.id === dashboardId)?.name || dashboardId
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "bot",
        content: `✅ Chart "${chart.title}" has been added to your ${dashboardName} dashboard with proper axis labels!`,
        timestamp: new Date(),
        chart: undefined,
      }

      chatStore.addMessage(successMessage)
      console.log('✅ Success message added to chat')

      // Trigger dashboard refresh via custom event
      window.dispatchEvent(
        new CustomEvent("widgetAdded", {
          detail: { dashboardId, tenantId: session.user.tenant_id },
        }),
      )
      console.log('✅ Dashboard refresh event dispatched')

      // ✅ FIXED: Reset state properly (removed setSelectedDashboard which doesn't exist)
      setShowDashboardSelect(false)
      setPendingChart(null)
      setModalDashboard("") // Reset the modal dashboard selection
      console.log('✅ Modal states reset successfully')
    } catch (error) {
      console.error("Error adding chart to dashboard:", error)

      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        type: "bot",
        content: "❌ Failed to add chart to dashboard. Please try again.",
        timestamp: new Date(),
        chart: undefined,
      }

      chatStore.addMessage(errorMessage)
    }
  }

  const clearChatHistory = async () => {
    // Clear frontend UI
    chatStore.clearChat()

    // Reset backend session for this user
    if (session?.user?.user_id) {
      try {
        await fetch(`${API_BASE_URL}/session/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: session.user.user_id,
            tenant_name: session.user.tenant_name,
          }),
        })
        console.log(`🔄 Backend session reset for user ${session.user.user_id}`)
      } catch (error) {
        console.error("Failed to reset backend session:", error)
      }
    }
  }

  const handleSendMessage = async (isVoiceMessage = false, messageText?: string) => {
    if (isLoading || !session) return

    const message = messageText || inputValue.trim()
    if (!message) {
      console.log("No message to send:", { messageText, inputValue })
      return
    }

    // ✅ Stop "add to dashboard" listener when sending new message
    stopAddToDashboardListener()

    // ✅ FIXED: Check for "add to dashboard" command BEFORE sending to avoid timing issues
    const lastBotMessage = [...chatStore.messages].reverse().find((m) => m.type === 'bot' && m.chart)
    // If chat store doesn't yet contain the latest chart (race), fall back to in-memory lastChartRef
    const effectiveLast = lastBotMessage?.chart ? lastBotMessage : (lastChartRef.current ? { type: 'bot', chart: lastChartRef.current } as any : null)
    const normalizedMessage = message.toLowerCase().replace(/[^\w\s]/g, '').trim()
    
    // Check for various "add to dashboard" command variations
    const addToDashboardCommands = [
      'add to dashboard',
      'add to dash board', 
      'add dashboard',
      'add it to dashboard',
      'add this to dashboard',
      'save to dashboard',
      'add chart to dashboard',
      'add table to dashboard',
      'save chart',
      'save table'
    ]
    
    const isAddToDashboardCommand = addToDashboardCommands.some(cmd => 
      normalizedMessage.includes(cmd.replace(/\s+/g, ' '))
    )
    
    console.log('🎯 Voice command check:', {
      message,
      normalizedMessage,
      isAddToDashboardCommand,
      hasChart: !!effectiveLast?.chart,
      lastBotMessage,
      lastChartRef: !!lastChartRef.current,
    })
    
    // ✅ FIXED: Handle "add to dashboard" for the LAST chart/table shown
    if (isAddToDashboardCommand && effectiveLast?.chart) {
      console.log('✅ Add to dashboard command detected! Triggering action (effectiveLast)!')
      handleAddToDashboard(effectiveLast.chart)
      setInputValue("")
      
      // Provide voice feedback
      if (isVoiceMessage) {
        const feedbackMessage: Message = {
          id: Date.now().toString(),
          type: "bot",
          content: "🎯 Got it! Opening the dashboard selection for you.",
          timestamp: new Date(),
          chart: undefined,
        }
        chatStore.addMessage(feedbackMessage)
        
        // ✅ FIXED: Reset voice state and restart wake word detection
        setTimeout(() => {
          setVoiceState("idle")
          if (isBackgroundListening) {
            console.log("Restarting wake word after dashboard command")
            triggerWakeWordRestart()
          }
        }, 500)
      }
      return // Don't send this as a regular message
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
      chart: undefined,
    }

    // Use chat store instead of local state
    chatStore.addMessage(userMessage)
    setInputValue("")
    setIsLoading(true)

    // Handle voice completion - delay state change until after processing
    if (isVoiceMessage) {
      setVoiceState("completing")
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current)
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage.content,
          user_id: session.user.user_id,
          tenant_name: session.user.tenant_name,
          tenant_id: session.user.tenant_id,
          role_name: session.user.role_name,
          token: session.token,
        }),
      })

      const data = await res.json()
      console.log("Received response:", data)

      let chart: ChartData | undefined
      let messageContent = ""

      // Handle different response types
      if (data.response?.chart_type && Array.isArray(data.response?.data)) {
        // Chart response - support multi-series when data is array of objects
        const rows = data.response.data

        // If rows are objects (keyed by column names), treat as rawData and allow multi-series
          if (rows.length > 0 && typeof rows[0] === 'object' && !Array.isArray(rows[0])) {
          const inferredX = data.response.x_axis || Object.keys(rows[0])[0]
          chart = {
            chart_type: data.response.chart_type,
            // Prefer API-provided title when available, otherwise keep legacy generated title
            title: data.response.title || (data.response.chart_type === 'table' ? 'Data Table' : `Chart: ${data.response.y_axis ?? ''} by ${inferredX}`),
            x: rows.map((row: any) => row[inferredX]),
            xLabel: inferredX,
            // y and yLabel left undefined for multi-series; converter uses rawData
            y_axes: data.response.y_axes, // Include y_axes array if provided (for filtering columns)
            rawData: rows,
            tableName: data.response.table_name,
            sqlQuery: data.response.sql_query,
          }

          if (data.response.text) {
            messageContent = data.response.text
          } else {
            messageContent = data.response.chart_type === 'table' ? `📋 Here's your data table` : `📊 Here's your chart`;
          }
        } else if (data.response?.x_axis && data.response?.y_axis) {
          // Legacy single-series chart format where data is array of rows but y_axis is a single key
          chart = {
            chart_type: data.response.chart_type,
            // Prefer API-provided title if present
            title: data.response.title || (data.response.chart_type === 'table' ? 'Data Table' : `Chart: ${data.response.y_axis} by ${data.response.x_axis}`),
            x: data.response.data.map((row: any) => row[data.response.x_axis]),
            y: data.response.data.map((row: any) => row[data.response.y_axis]),
            xLabel: data.response.x_axis,
            yLabel: data.response.y_axis,
            sqlQuery: data.response.sql_query || `SELECT ${data.response.x_axis} as name, ${data.response.y_axis} as value FROM your_table`,
            rawData: data.response.chart_type === 'table' ? data.response.data : undefined,
            tableName: data.response.table_name,
          }

          if (data.response.text) {
            messageContent = data.response.text
          } else {
            messageContent = data.response.chart_type === 'table' ? `📋 Here's your data table` : `📊 Here's your chart showing ${data.response.y_axis} by ${data.response.x_axis}`
          }
        } else {
          // fallback when data array is present but structure is unexpected
          messageContent = data.response.text || `📊 Here's your chart data`;
        }
      } else if (data.response?.text && data.response?.data) {
        // Text response with data
        messageContent = `${data.response.text}\n\n📋 Data Summary: ${
          data.response.summary || `Found ${data.response.data.length} rows`
        }`
      } else if (data.response?.text) {
        // Text response without data (including single value responses)
        messageContent = data.response.text
      } else if (data.response?.value) {
        // Single value response (legacy format)
        messageContent = `📊 Result: ${data.response.value}`
      } else if (typeof data.response === "string") {
        // Plain text response
        messageContent = data.response
      } else {
        // Fallback
        messageContent =
          "Something went wrong. Please try again with another query, and if error presists please contact Admin."
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: messageContent,
        timestamp: new Date(),
        chart,
      }

      // Use chat store instead of local state
      chatStore.addMessage(botMessage)

      // Store the most recent chart in-memory to avoid timing races where
      // the voice 'add to dashboard' listener fires before chatStore updates.
      if (chart) {
        lastChartRef.current = chart
        console.log('🗂️ lastChartRef updated with latest chart')
      }

      // ✅ NEW: Auto-start "add to dashboard" listener after chart/table is generated
      if (chart) {
        console.log('📊 Chart/table generated! Auto-starting "add to dashboard" listener...')
        setTimeout(() => {
          startAddToDashboardListener()
        }, 1500) // Wait 1.5 seconds after chart appears, then start listening
      }

      // Save conversation to database
      await saveConversation(userMessage.content, data.response)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
      // ✅ REMOVED: Voice state is now set to idle BEFORE sending message (in onresult handler)
      // This allows the mic button to be clickable immediately after speaking
    }
  }

  const saveConversation = async (userPrompt: string, apiResponse: string) => {
    try {
      const authStore = useAuthStore.getState()
      const session = authStore.session
      console.log("Session user_id: ", session.user.user_id)
      console.log("prompt: ", userPrompt)
      console.log("response: ", apiResponse)

      if (!session) return

      await fetch(`${API_BASE_URL}/save-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: session.user.user_id,
          prompt: userPrompt,
          // response: apiResponse.toString()
          response: typeof apiResponse === "object" ? JSON.stringify(apiResponse) : apiResponse,
        }),
      })
    } catch (error) {
      console.error("Error saving conversation:", error)
    }
  }

  const renderChart = (chart: ChartData) => {
    const { data, config } = convertChatbotChartData(chart)

    return (
      <UnifiedChartRenderer
        type={chart.chart_type as "line" | "bar" | "area" | "doughnut" | "table"}
        data={data}
        config={config}
        isLoading={false}
        isMaximized={false}
        context="chatbot"
        tableName={chart.tableName}
      />
    )
  }

  return (
    <div className={`fixed z-50 ${isMobile && isOpen ? "inset-4 top-4" : "bottom-6 right-6 top-auto"} max-h-[calc(100vh-2rem)]`}>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="ml-auto h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:scale-105 transition-all"
        >
          <MessageSquare className="text-white" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        </Button>
      ) : (
        <Card
          className={`${
            isMobile ? "w-full" : "w-96"
          } shadow-xl flex flex-col transition-all duration-300 bg-card border-border max-h-[calc(100vh-2rem)] ${
            isMinimized ? "h-16" : isMobile ? "h-[calc(100vh-2rem)]" : "h-[600px] max-h-[calc(100vh-2rem)]"
          }`}
        >
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
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`${
                          message.chart ? "w-full" : "max-w-[85%]"
                        } ${message.type === "user" ? "order-2" : "order-1"}`}
                      >
                        {message.type === "user" ? (
                          // User message bubble - SAP Joule style
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-md px-3 py-2 shadow-sm">
                            <p className="text-xs font-medium leading-relaxed">{message.content}</p>
                            <p className="text-xs text-blue-100 mt-1 opacity-80">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        ) : (
                          // Bot message - clean style without avatar
                          <div className="w-full">
                            {message.content.trim() && (
                              <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl rounded-tl-md px-3 py-2 shadow-sm">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs text-gray-800 dark:text-card-foreground leading-relaxed whitespace-pre-wrap flex-1">
                                    {message.content}
                                  </p>
                                  <button
                                    onClick={() => handleTextToSpeech(message.id, message.content)}
                                    className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-muted rounded transition-colors"
                                    title={speakingMessageId === message.id ? "Stop reading" : "Read aloud"}
                                  >
                                    {speakingMessageId === message.id ? (
                                      <VolumeX className="h-3.5 w-3.5 text-blue-600" />
                                    ) : (
                                      <Volume2 className="h-3.5 w-3.5 text-gray-500 dark:text-muted-foreground" />
                                    )}
                                  </button>
                                </div>
                                {!message.chart && (
                                  <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1 opacity-70">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                  </p>
                                )}
                              </div>
                            )}
                            {message.chart && (
                              <div className="mt-3 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl p-3 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-sm font-semibold text-gray-800 dark:text-card-foreground">
                                    {message.chart.title}
                                  </h4>
                                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                                </div>
                                <div
                                  className={`relative w-full bg-gray-50/50 dark:bg-background/30 rounded-lg p-2 ${
                                    message.chart.chart_type === "table"
                                      ? "h-48 md:h-56"
                                      : "h-56"
                                  }`}
                                >
                                  {/* Maximize button placed top-right inside chart area */}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setMaxChart(message.chart!); setShowMaxDialog(true); }}
                                    title="Maximize chart"
                                    className="absolute top-2 right-2 z-20 bg-white/0 hover:bg-white/5 rounded p-1"
                                  >
                                    <Maximize2 className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                                  </button>
                                  <div className="w-full h-full">{renderChart(message.chart)}</div>
                                </div>
                                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-border">
                                  <p className="text-xs text-gray-500 dark:text-muted-foreground opacity-70">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                  </p>
                                    <div className="flex items-center gap-2">
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
                    onKeyPress={(e) => e.key === "Enter" && voiceState === "idle" && handleSendMessage()}
                    placeholder="Ask me anything about your business data..."
                    className="flex-1 text-sm bg-white dark:bg-background border-gray-200 dark:border-border text-gray-900 dark:text-foreground"
                    disabled={isLoading || voiceState === "processing"}
                  />
                  {/* Google Assistant-like button behavior */}
                  {/* ✅ FIXED: Allow mic even during isLoading so user can say "add to dashboard" while waiting */}
                  {voiceState === "idle" && !inputValue.trim() ? (
                    <Button
                      onClick={startVoiceInput}
                      className="relative transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      title="Start voice input or say 'AI Agent'"
                      size="sm"
                      disabled={false}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  ) : voiceState === "listening" ? (
                    <Button
                      onClick={stopVoiceInput}
                      className="relative scale-110 animate-pulse bg-green-500 hover:bg-green-600 text-white"
                      title="Listening... Click to stop"
                      size="sm"
                    >
                      <Mic className="h-4 w-4 text-white" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    </Button>
                  ) : voiceState === "processing" ? (
                    <Button disabled className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white" title="Processing voice..." size="sm">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    </Button>
                  ) : (
                    // Allow sending while responses arrive; only block during active listening/processing
                    sendAllowed && (
                      <Button
                        onClick={() => handleSendMessage(false)}
                        disabled={isLoading || !inputValue.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        size="sm"
                        title="Send message"
                      >
                        {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      {/* ✅ NEW: Chart Dashboard Selection Modal (for non-table charts) */}
      <Dialog open={showDashboardSelect} onOpenChange={setShowDashboardSelect}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[425px] mx-4 p-4 sm:p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="truncate">Add Chart to Dashboard</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Chart title (from API) with inline edit support */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chart Title</label>
              {!isEditingTitle ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-sm text-foreground truncate min-w-0 flex-1">{titleDraft || pendingChart?.title || 'Untitled Chart'}</div>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingTitle(true)} className="flex-shrink-0">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} className="flex-1 min-w-0" />
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" onClick={() => { if (pendingChart) { setPendingChart({...pendingChart, title: titleDraft}); } setIsEditingTitle(false); }}>
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setTitleDraft(pendingChart?.title || ''); setIsEditingTitle(false); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <label className="text-sm font-medium">Select Dashboard</label>
              <Select value={modalDashboard} onValueChange={setModalDashboard}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose dashboard" />
                </SelectTrigger>
                <SelectContent>
                  {getAccessibleModules().map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      <span className="truncate block">{module.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDashboardSelect(false)
                setPendingChart(null)
                setModalDashboard("")
                // ✅ Restart listener if user cancels - prefer in-memory lastChartRef as fallback
                const lastBotMessage = [...chatStore.messages].reverse().find((m) => m.type === 'bot' && m.chart)
                const effectiveLast = lastBotMessage?.chart ? lastBotMessage : (lastChartRef.current ? { type: 'bot', chart: lastChartRef.current } as any : null)
                if (effectiveLast?.chart) {
                  setTimeout(() => startAddToDashboardListener(), 500)
                }
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (pendingChart && modalDashboard) {
                  confirmAddToDashboard(pendingChart, modalDashboard)
                  setShowDashboardSelect(false)
                  setModalDashboard("")
                }
              }}
              disabled={!modalDashboard}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Add to Dashboard</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table Title + Dashboard Selection Dialog */}
      <Dialog open={showTitleDialog} onOpenChange={setShowTitleDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[425px] mx-4 p-4 sm:p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="truncate">Add Table to Dashboard</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Table Title</label>
              {!isEditingTableTitle ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-sm text-foreground truncate min-w-0 flex-1">{tableTitle || pendingChart?.title || 'Untitled Table'}</div>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingTableTitle(true)} className="flex-shrink-0">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input
                    value={tableTitle}
                    onChange={(e) => setTableTitle(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && tableTitle.trim() && modalDashboard && handleTitleConfirm()}
                    placeholder="Enter a title for your table..."
                    className="flex-1 min-w-0"
                    autoFocus
                  />
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" onClick={() => setIsEditingTableTitle(false)}>
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setTableTitle(pendingChart?.title || ''); setIsEditingTableTitle(false); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Dashboard</label>
              <Select value={modalDashboard} onValueChange={setModalDashboard}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose dashboard" />
                </SelectTrigger>
                <SelectContent>
                  {getAccessibleModules().map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      <span className="truncate block">{module.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleTitleCancel} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleTitleConfirm} disabled={!tableTitle.trim() || !modalDashboard} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Add to Dashboard</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maximize chart dialog */}
      <Dialog open={showMaxDialog} onOpenChange={(open) => { setShowMaxDialog(open); if (!open) setMaxChart(null); }}>
        {/* Allow taller dialog and constrain to viewport so maximized charts aren't cut off */}
        <DialogContent className="sm:max-w-[800px] w-full max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{maxChart?.title ?? 'Chart'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {maxChart && (
              <UnifiedChartRenderer
                type={maxChart.chart_type as any}
                data={convertChatbotChartData(maxChart).data}
                config={convertChatbotChartData(maxChart).config}
                isLoading={false}
                isMaximized={true}
                // When maximized, treat context as dashboard-like so margins and
                // legends behave appropriately and avoid extra top offset.
                context="dashboard"
                tableName={maxChart.tableName}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
