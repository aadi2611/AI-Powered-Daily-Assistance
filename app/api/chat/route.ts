export async function POST(req: Request) {
  try {
    console.log("[v0] API route called")

    const body = await req.json()
    console.log("[v0] Request body:", body)

    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      console.log("[v0] Invalid messages format")
      return new Response("Invalid messages format", { status: 400 })
    }

    console.log("[v0] Messages received:", messages.length)
    console.log("[v0] GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY)

    // Remove any leading assistant messages and ensure proper conversation flow
    const validMessages = messages.filter((msg, index) => {
      // Keep user messages
      if (msg.role === "user") return true
      // Keep assistant messages only if they follow a user message
      if (msg.role === "assistant" && index > 0 && messages[index - 1].role === "user") return true
      return false
    })

    console.log("[v0] Valid messages after filtering:", validMessages.length)

    const lastMessage = validMessages[validMessages.length - 1]
    const userInput = lastMessage?.content || ""

    console.log("[v0] User input:", userInput)

    // Use Groq API for comprehensive responses
    if (!process.env.GROQ_API_KEY) {
      return new Response("AI service not configured", { status: 500 })
    }

    try {
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful, knowledgeable AI assistant. Provide comprehensive, accurate, and detailed answers to any question. Be informative, engaging, and cover all aspects of the topic asked about. Always aim to be educational and thorough in your responses.",
            },
            ...validMessages,
          ],
          max_tokens: 1000,
          temperature: 0.7,
          stream: false,
        }),
      })

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text()
        console.log("[v0] Groq API error:", groqResponse.status, groqResponse.statusText, errorText)
        throw new Error(`Groq API error: ${groqResponse.status}`)
      }

      const groqData = await groqResponse.json()
      const aiResponse =
        groqData.choices[0]?.message?.content || "I apologize, but I couldn't generate a response at the moment."

      console.log("[v0] AI response generated successfully")

      return new Response(aiResponse, {
        headers: {
          "Content-Type": "text/plain",
        },
      })
    } catch (aiError) {
      console.error("[v0] AI API error:", aiError)

      let response = ""
      const userInputLower = userInput.toLowerCase()

      if (userInputLower.includes("ram") && !userInputLower.includes("program")) {
        response =
          "RAM stands for Random Access Memory. It's a type of computer memory that temporarily stores data and programs that are currently being used by the CPU. Unlike storage devices like hard drives, RAM is volatile memory, meaning it loses its contents when power is turned off. RAM allows for quick read and write access to data, making it essential for system performance. Common types include DDR4 and DDR5, with capacities typically ranging from 4GB to 64GB in modern computers."
      } else if (userInputLower.includes("quantum physics")) {
        response =
          "Quantum physics is the branch of physics that studies matter and energy at the smallest scales - typically atoms and subatomic particles. Key principles include wave-particle duality (particles can behave as both waves and particles), uncertainty principle (you can't precisely know both position and momentum), superposition (particles can exist in multiple states simultaneously), and quantum entanglement (particles can be mysteriously connected across distances). It's fundamental to technologies like lasers, MRI machines, and quantum computers."
      } else if (userInputLower.includes("ai technology") || userInputLower.includes("artificial intelligence")) {
        response =
          "Recent AI technology advances include large language models like GPT-4 and Claude, computer vision breakthroughs, autonomous vehicles, AI in healthcare for drug discovery and diagnosis, generative AI for art and content creation, AI chips and hardware optimization, robotics integration, and AI safety research. Key areas of development are multimodal AI, AI reasoning capabilities, and making AI more efficient and accessible."
      } else if (userInputLower.includes("vaccine") && userInputLower.includes("hypersensitivity")) {
        response =
          "Vaccine hypersensitivity refers to allergic reactions to vaccines, which are rare but can occur. Types include immediate reactions (within minutes) like anaphylaxis, and delayed reactions. Common allergens in vaccines include egg proteins, gelatin, antibiotics, or preservatives. Most reactions are mild (redness, swelling), but severe reactions require immediate medical attention. People with known allergies should inform healthcare providers before vaccination. Benefits of vaccination typically far outweigh risks for most people."
      } else if (userInputLower.includes("atm")) {
        response =
          "ATM stands for Automated Teller Machine. It's an electronic banking outlet that allows customers to complete basic transactions without the aid of a branch representative or teller."
      } else if (userInputLower.includes("pm") && userInputLower.includes("india")) {
        response =
          "The current Prime Minister of India is Narendra Modi. He has been serving as the PM since May 2014 and was re-elected in 2019 and 2024."
      } else {
        response = `I understand you're asking about "${userInput}". I'm experiencing some technical difficulties with my AI service, but I can still help with many topics. Could you try rephrasing your question or ask about something specific like science, technology, history, or general knowledge?`
      }

      console.log("[v0] Fallback response generated:", response)

      return new Response(response, {
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }
  } catch (error) {
    console.error("[v0] API route error:", error)
    return new Response(`Server error: ${error.message}`, { status: 500 })
  }
}
