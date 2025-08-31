"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Clock, Zap, HardHat, ArrowRight, Star } from "lucide-react"
import { useState, useEffect } from "react"

interface WelcomeScreenProps {
  onStartChat: () => void
}

export function WelcomeScreen({ onStartChat }: WelcomeScreenProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleSuggestionClick = (suggestion: string) => {
    onStartChat()
    // Store the suggestion for the chat interface to use
    localStorage.setItem("initialMessage", suggestion)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-500/20 rounded-full animate-pulse"
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
        className="fixed w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div
          className={`max-w-4xl w-full space-y-12 text-center transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-orange-500/10 rounded-full animate-pulse group-hover:bg-orange-500/20 transition-colors duration-500" />
                <div className="absolute w-24 h-24 bg-orange-500/5 rounded-full animate-ping" />
              </div>
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-110 group-hover:rotate-12">
                  <HardHat className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl font-black text-white text-balance tracking-tight">
                MADE FOR
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  REAL WORK
                </span>
              </h1>
              <p className="text-xl text-slate-300 text-pretty max-w-2xl mx-auto leading-relaxed">
                Your industrial-strength AI assistant built for professionals who demand reliable, comprehensive answers
                to any challenge.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              {
                icon: Sparkles,
                title: "Smart Intelligence",
                desc: "Advanced AI that understands context and provides detailed, accurate responses",
                color: "orange",
              },
              {
                icon: Clock,
                title: "Always Ready",
                desc: "24/7 availability with instant responses when you need them most",
                color: "blue",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Optimized for speed without compromising on quality or depth",
                color: "green",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`p-8 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-500 cursor-pointer group ${hoveredCard === index ? "scale-105 shadow-2xl shadow-orange-500/10" : "hover:scale-102"}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                      feature.color === "orange"
                        ? "bg-orange-500/10 group-hover:bg-orange-500/20"
                        : feature.color === "blue"
                          ? "bg-blue-500/10 group-hover:bg-blue-500/20"
                          : "bg-green-500/10 group-hover:bg-green-500/20"
                    }`}
                  >
                    <feature.icon
                      className={`w-8 h-8 transition-all duration-300 ${
                        feature.color === "orange"
                          ? "text-orange-400 group-hover:text-orange-300"
                          : feature.color === "blue"
                            ? "text-blue-400 group-hover:text-blue-300"
                            : "text-green-400 group-hover:text-green-300"
                      } ${hoveredCard === index ? "scale-110" : ""}`}
                    />
                  </div>
                  <h3 className="font-bold text-xl text-white group-hover:text-orange-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-center leading-relaxed group-hover:text-slate-300 transition-colors">
                    {feature.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <div className="pt-12 space-y-8">
            <Button
              onClick={onStartChat}
              size="lg"
              className="px-12 py-8 text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 group relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative flex items-center gap-3">
                Start Working
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>

            <div className="space-y-4">
              <p className="text-slate-400 font-medium">Quick Start - Try asking about:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "Latest technology trends",
                  "Project management tips",
                  "Industry best practices",
                  "Technical documentation",
                  "Problem solving strategies",
                  "Market analysis",
                ].map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 text-slate-300 rounded-full text-sm hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-300 transition-all duration-300 hover:scale-105 group backdrop-blur-sm"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="flex items-center gap-2">
                      <Star className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-700/30">
            <div className="flex justify-center items-center gap-8 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>AI Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span>Always Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
