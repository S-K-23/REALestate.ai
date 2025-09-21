import { NextRequest, NextResponse } from 'next/server'

// Dummy OpenAI API implementation for chat - mimics OpenAI Chat Completions API
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, userId, conversationHistory = [] } = body

    console.log('🤖 OpenAI API called with message:', message)

    if (!message) {
      return NextResponse.json({ 
        error: {
          message: "Missing required parameter: message",
          type: "invalid_request_error",
          code: "missing_parameter"
        }
      }, { status: 400 })
    }

    // Simulate OpenAI API delay (typically 1-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Generate contextual AI response based on the message
    const aiResponse = generateAIResponse(message, conversationHistory)

    // Mimic OpenAI Chat Completions API response structure
    const openAIResponse = {
      id: `chatcmpl-${Math.random().toString(36).substr(2, 29)}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "gpt-4",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: aiResponse
          },
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: Math.floor(message.length / 4) + 50,
        completion_tokens: Math.floor(aiResponse.length / 4),
        total_tokens: Math.floor((message.length + aiResponse.length) / 4) + 50
      }
    }

    const response = NextResponse.json(openAIResponse)

    // Add OpenAI-like headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Content-Type', 'application/json')
    response.headers.set('OpenAI-Processing-Ms', Math.floor(Math.random() * 2000 + 500).toString())

    return response

  } catch (error: any) {
    console.error('Error in OpenAI API:', error)
    return NextResponse.json({ 
      error: {
        message: error.message || 'Internal server error',
        type: "server_error",
        code: "internal_error"
      }
    }, { status: 500 })
  }
}

// Generate realistic AI responses for real estate context
function generateAIResponse(message: string, conversationHistory: any[]): string {
  const lowerMessage = message.toLowerCase()

  // Property-related responses
  if (lowerMessage.includes('property') || lowerMessage.includes('house') || lowerMessage.includes('home')) {
    const propertyResponses = [
      "I'd be happy to help you find the perfect property! What type of home are you looking for?",
      "Let me help you discover some amazing properties. Are you interested in single-family homes, condos, or townhouses?",
      "Great! I can show you some properties that match your criteria. What's your budget range?",
      "I have access to thousands of properties. What location interests you most?",
      "Let me find some properties that would be perfect for you. Do you have any specific requirements?"
    ]
    return propertyResponses[Math.floor(Math.random() * propertyResponses.length)]
  }

  // Budget-related responses
  if (lowerMessage.includes('budget') || lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('afford')) {
    const budgetResponses = [
      "Understanding your budget is crucial for finding the right property. What price range are you considering?",
      "I can help you find properties within your budget. Are you looking for something under $500K, $500K-$1M, or over $1M?",
      "Let me show you some great options in your price range. What's your target budget?",
      "I'll make sure to find properties that fit your financial goals. What's your maximum budget?"
    ]
    return budgetResponses[Math.floor(Math.random() * budgetResponses.length)]
  }

  // Location-related responses
  if (lowerMessage.includes('location') || lowerMessage.includes('city') || lowerMessage.includes('neighborhood') || lowerMessage.includes('area')) {
    const locationResponses = [
      "Location is everything in real estate! Which cities or neighborhoods are you most interested in?",
      "I can help you explore different areas. Are you looking for urban, suburban, or rural properties?",
      "Let me show you some great neighborhoods. Do you have any specific location preferences?",
      "I have properties in many desirable locations. What type of area appeals to you most?"
    ]
    return locationResponses[Math.floor(Math.random() * locationResponses.length)]
  }

  // Investment-related responses
  if (lowerMessage.includes('investment') || lowerMessage.includes('rental') || lowerMessage.includes('roi') || lowerMessage.includes('profit')) {
    const investmentResponses = [
      "I can help you find great investment opportunities! Are you looking for rental properties or fix-and-flip opportunities?",
      "Real estate can be an excellent investment. What's your investment strategy - long-term rentals or short-term gains?",
      "Let me show you some properties with strong rental potential. What's your target ROI?",
      "I'll help you find properties that align with your investment goals. What type of returns are you targeting?"
    ]
    return investmentResponses[Math.floor(Math.random() * investmentResponses.length)]
  }

  // Market-related responses
  if (lowerMessage.includes('market') || lowerMessage.includes('trend') || lowerMessage.includes('prices') || lowerMessage.includes('value')) {
    const marketResponses = [
      "I can provide insights on current market trends. Are you curious about price trends in a specific area?",
      "The real estate market is constantly evolving. What market information would be most helpful for you?",
      "Let me share some market insights. Are you interested in current pricing trends or future predictions?",
      "I have access to comprehensive market data. What specific market information are you looking for?"
    ]
    return marketResponses[Math.floor(Math.random() * marketResponses.length)]
  }

  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('start')) {
    const greetingResponses = [
      "Hello! I'm your AI real estate assistant. I'm here to help you find the perfect property. What are you looking for today?",
      "Hi there! Welcome to your personalized property search experience. How can I assist you in finding your dream home?",
      "Hey! I'm excited to help you discover amazing properties. What brings you here today?",
      "Welcome! I'm your AI assistant specializing in real estate. What type of property are you interested in?"
    ]
    return greetingResponses[Math.floor(Math.random() * greetingResponses.length)]
  }

  // Help-related responses
  if (lowerMessage.includes('help') || lowerMessage.includes('assist') || lowerMessage.includes('support')) {
    const helpResponses = [
      "I'm here to help you find the perfect property! I can assist with property searches, market insights, and investment advice. What would you like to know?",
      "I can help you with property recommendations, market trends, and finding homes that match your criteria. What specific help do you need?",
      "I'm your real estate assistant and I'm here to make your property search easier. How can I assist you today?",
      "I specialize in helping people find their ideal properties. Whether you're buying, investing, or just exploring, I'm here to help!"
    ]
    return helpResponses[Math.floor(Math.random() * helpResponses.length)]
  }

  // Thank you responses
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    const thankResponses = [
      "You're very welcome! I'm here whenever you need help with your property search.",
      "My pleasure! Feel free to ask me anything else about properties or real estate.",
      "Happy to help! Is there anything else I can assist you with today?",
      "You're welcome! I'm always here to help you find the perfect property."
    ]
    return thankResponses[Math.floor(Math.random() * thankResponses.length)]
  }

  // Default responses for general conversation
  const defaultResponses = [
    "I'm here to help you with all your real estate needs. Could you tell me more about what you're looking for?",
    "That's interesting! I'd love to help you find properties that match your interests. What specific features are you looking for?",
    "I understand! Let me help you find some great options. What's most important to you in a property?",
    "I'm your AI real estate assistant, and I'm here to make your property search easier. What would you like to explore?",
    "Great question! I can help you with property searches, market insights, and investment opportunities. What interests you most?",
    "I'm here to help you navigate the real estate market. What specific information or properties are you looking for?",
    "That sounds exciting! I can help you find properties that meet your needs. What are your top priorities?",
    "I'd love to assist you with your real estate goals. What type of property or information are you seeking?"
  ]

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}
