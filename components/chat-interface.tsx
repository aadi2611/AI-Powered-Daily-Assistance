"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, Sparkles, Mic, Copy, ThumbsUp, ThumbsDown, Zap, Volume2, Pause, Home, User } from "lucide-react" // Replaced Settings with Home icon
import { ThemeToggle } from "./theme-toggle"
import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt?: number
  liked?: boolean
  disliked?: boolean
  isPlaying?: boolean
}

interface ChatInterfaceProps {
  onGoHome?: () => void // Added prop for home navigation
}

export function ChatInterface({ onGoHome }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const initialMessage = typeof window !== "undefined" ? localStorage.getItem("initialMessage") : null
    const baseMessages = [
      {
        id: "1",
        role: "assistant" as const,
        content:
          "Hello! I'm your industrial-strength AI assistant built for professionals. I can help you with any questions, provide comprehensive information on virtually any topic, and assist with complex problem-solving. What challenge can I help you tackle today?",
        createdAt: Date.now(),
      },
    ]

    if (initialMessage) {
      localStorage.removeItem("initialMessage")
      return [
        ...baseMessages,
        {
          id: "2",
          role: "user" as const,
          content: initialMessage,
          createdAt: Date.now() + 1,
        },
      ]
    }

    return baseMessages
  })

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const initialMessage = messages.find((m) => m.role === "user")
    if (initialMessage && messages.length === 2 && !isLoading) {
      handleSubmitMessage(initialMessage.content)
    }
  }, [])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (input.length > 0) {
      setIsTyping(true)
      setShowSuggestions(false)
      const timer = setTimeout(() => setIsTyping(false), 1000)
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
      setShowSuggestions(true)
    }
  }, [input])

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error("Failed to copy message:", err)
    }
  }

  const reactToMessage = (messageId: string, reaction: "like" | "dislike") => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            liked: reaction === "like" ? !msg.liked : false,
            disliked: reaction === "dislike" ? !msg.disliked : false,
          }
        }
        return msg
      }),
    )
  }

  const speakMessage = (content: string, messageId: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(content)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onstart = () => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, isPlaying: true } : { ...msg, isPlaying: false })),
        )
      }

      utterance.onend = () => {
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isPlaying: false } : msg)))
      }

      speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = (messageId: string) => {
    speechSynthesis.cancel()
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isPlaying: false } : msg)))
  }

  const handleSubmitMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent.trim(),
      createdAt: Date.now(),
    }

    // Only add user message if it's not already in the messages array
    const messageExists = messages.some((m) => m.content === messageContent.trim() && m.role === "user")
    if (!messageExists) {
      setMessages((prev) => [...prev, userMessage])
    }

    setInput("")
    setIsLoading(true)
    setShowSuggestions(false)

    try {
      console.log("[v0] Starting chat request")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone

        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line)
                if (data.type === "text-delta" && data.textDelta) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id ? { ...msg, content: msg.content + data.textDelta } : msg,
                    ),
                  )
                } else if (typeof data === "string") {
                  setMessages((prev) =>
                    prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: msg.content + data } : msg)),
                  )
                } else if (data.content) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id ? { ...msg, content: msg.content + data.content } : msg,
                    ),
                  )
                }
              } catch (e) {
                if (line.trim()) {
                  setMessages((prev) =>
                    prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: msg.content + line } : msg)),
                  )
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("[v0] Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          createdAt: Date.now(),
        },
      ])
    } finally {
      setIsLoading(false)
      setShowSuggestions(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmitMessage(input)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    inputRef.current?.focus()
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false)
        setInput("Voice message recorded...")
      }, 2000)
    }
  }

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-500/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div
        className="fixed w-64 h-64 bg-orange-500/3 rounded-full blur-3xl pointer-events-none transition-all duration-700 ease-out z-0"
        style={{
          left: mousePosition.x - 128,
          top: mousePosition.y - 128,
        }}
      />

      <div className="relative z-10 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <Avatar className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-orange-500/25">
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <Bot className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping opacity-75 group-hover:opacity-100" />
            </div>
            <div>
              <h2 className="font-black text-xl text-white tracking-tight">A.I. powered Daily Assistance</h2>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-slate-400 font-medium">Built for Real Work</p>
                <Zap className="w-3 h-3 text-orange-400 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoHome} // Changed from settings toggle to home navigation
              className="hover:bg-orange-500/10 text-slate-400 hover:text-orange-400 transition-all duration-200 hover:scale-105"
            >
              <Home className="w-4 h-4" /> {/* Changed from Settings to Home icon */}
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full p-4">
          <div className="max-w-4xl mx-auto space-y-6 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-4 group ${
                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
                onMouseEnter={() => setHoveredMessageId(message.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <Avatar
                  className={`w-10 h-10 transition-all duration-300 group-hover:scale-110 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-slate-600 to-slate-700 shadow-slate-500/25"
                      : "bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/25"
                  } ${hoveredMessageId === message.id ? "shadow-lg" : ""}`}
                >
                  <AvatarFallback
                    className={`${
                      message.role === "user"
                        ? "bg-gradient-to-br from-slate-600 to-slate-700 text-white"
                        : "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                    }`}
                  >
                    {message.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col space-y-3 max-w-xs md:max-w-md lg:max-w-2xl">
                  <Card
                    className={`p-6 transition-all duration-300 ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white ml-auto shadow-orange-500/25"
                        : "bg-slate-800/70 text-slate-100 border-slate-700/50 backdrop-blur-sm"
                    } animate-in slide-in-from-bottom-3 duration-500 hover:shadow-xl ${
                      hoveredMessageId === message.id ? "scale-[1.02] shadow-2xl" : ""
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-invert">
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-2xl font-black mb-4 text-white font-sans tracking-tight leading-tight">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-xl font-bold mb-3 text-orange-300 font-sans tracking-tight">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-lg font-semibold mb-2 text-orange-400 font-sans">{children}</h3>
                            ),
                            p: ({ children }) => (
                              <p className="mb-4 text-sm leading-relaxed text-slate-200 font-sans">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-4 space-y-2 pl-3">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-4 space-y-2 pl-3">{children}</ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-sm text-slate-200 font-sans leading-relaxed">{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold text-orange-300 font-sans">{children}</strong>
                            ),
                            code: ({ children }) => (
                              <code className="bg-slate-700 px-2 py-1 rounded text-xs font-mono text-orange-300 border border-slate-600">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-slate-900 p-4 rounded-lg text-sm overflow-x-auto mb-4 border border-slate-700 font-mono">
                                {children}
                              </pre>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
                    )}
                    <p
                      className={`text-xs mt-4 font-medium ${
                        message.role === "user" ? "text-white/70" : "text-slate-400"
                      }`}
                    >
                      {new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </Card>

                  {message.role === "assistant" && (
                    <div
                      className={`flex items-center space-x-2 ml-3 transition-all duration-300 ${
                        hoveredMessageId === message.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                      }`}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyMessage(message.content, message.id)}
                        className="h-8 px-3 hover:bg-orange-500/10 text-slate-400 hover:text-orange-400 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedMessageId === message.id && (
                          <span className="ml-2 text-xs text-orange-400 animate-in fade-in duration-200">Copied!</span>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          message.isPlaying ? stopSpeaking(message.id) : speakMessage(message.content, message.id)
                        }
                        className="h-8 px-3 hover:bg-orange-500/10 text-slate-400 hover:text-orange-400 transition-all duration-200 hover:scale-105"
                      >
                        {message.isPlaying ? <Pause className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reactToMessage(message.id, "like")}
                        className={`h-8 px-3 transition-all duration-200 hover:scale-105 ${
                          message.liked
                            ? "text-orange-400 bg-orange-500/20"
                            : "text-slate-400 hover:bg-orange-500/10 hover:text-orange-400"
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reactToMessage(message.id, "dislike")}
                        className={`h-8 px-3 transition-all duration-200 hover:scale-105 ${
                          message.disliked
                            ? "text-red-400 bg-red-500/20"
                            : "text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-4 animate-in slide-in-from-bottom-3 duration-500">
                <Avatar className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 animate-pulse shadow-orange-500/25">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-slate-800/70 text-slate-100 border-slate-700/50 backdrop-blur-sm p-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <Sparkles className="w-5 h-5 text-orange-400 animate-spin" />
                    <span className="text-sm font-bold text-slate-300 animate-pulse">Processing your request...</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="relative z-10 border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your work..."
                className={`pr-24 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 rounded-xl font-medium text-sm backdrop-blur-sm transition-all duration-200 ${
                  isTyping ? "ring-2 ring-orange-500/50 shadow-lg shadow-orange-500/10" : ""
                }`}
                disabled={isLoading}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {isTyping && <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />}
                <Sparkles
                  className={`w-4 h-4 transition-all duration-200 ${
                    isTyping ? "text-orange-400 animate-spin" : "text-slate-500"
                  }`}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRecording}
              className={`hover:bg-orange-500/10 text-slate-400 hover:text-orange-400 transition-all duration-200 hover:scale-105 ${
                isRecording ? "bg-red-500/20 text-red-400 animate-pulse" : ""
              }`}
              disabled={isLoading}
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl px-6 py-2 transition-all duration-200 hover:scale-105 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25"
            >
              <Send className={`w-4 h-4 transition-all duration-200 ${isLoading ? "animate-pulse" : ""}`} />
            </Button>
          </form>

          {showSuggestions && (
            <div className="flex flex-wrap gap-3 mt-4 animate-in slide-in-from-bottom-2 duration-500">
              {[
                "What's the full form of ATM?",
                "Who is the PM of India?",
                "Explain quantum physics simply",
                "Help me plan my workday",
                "Latest AI technology trends",
                "Industrial safety best practices",
              ].map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-orange-500/10 text-slate-400 hover:text-orange-400 border border-slate-600/50 hover:border-orange-500/30 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm backdrop-blur-sm animate-in slide-in-from-bottom-3 duration-300"
                  style={{ animationDelay: `${index * 75}ms` }}
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
