"use client"

import { useState } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { WelcomeScreen } from "@/components/welcome-screen"

export default function Home() {
  const [hasStartedChat, setHasStartedChat] = useState(false)

  const handleGoHome = () => {
    setHasStartedChat(false)
  }

  return (
    <main className="min-h-screen bg-background">
      {!hasStartedChat ? (
        <WelcomeScreen onStartChat={() => setHasStartedChat(true)} />
      ) : (
        <ChatInterface onGoHome={handleGoHome} /> // Added onGoHome prop to enable home navigation
      )}
    </main>
  )
}
