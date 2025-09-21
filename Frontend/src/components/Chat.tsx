'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Home } from 'lucide-react'
import { PropertyCardChat } from './PropertyCardChat'
import { getPropertyById } from '@/lib/api-adapter'
import { Property } from './PropertyCard'
import { openai } from '@/lib/openai-client' // Uncomment to use OpenAI API


interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  property?: Property
  type?: 'text' | 'property'
}


const PROPERTY_ID = [
    '0b40c6aa-527d-4ce7-904a-d9b0ee7e7a86'
]

const HARDCODED_RESPONSES = [
  "Hello, I'm your AI real estate assistant. What are you looking for?",
  "Certainly! Let me take a look.",
  "I'd be happy to help you find the perfect property!",
  "That sounds interesting! Let me show you some options.",
  "Great choice! I can help you explore that area.",
  "I understand your needs. Let me find some matches for you."
]

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI real estate assistant. How can I help you find your perfect property today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(async () => {
      let botMessage: Message
      
      setCount(prev => prev + 1)
      
      if(inputText.toLowerCase().includes("show me a property")) {
        const propertyId = PROPERTY_ID[Math.floor(Math.random() * PROPERTY_ID.length)]
        const property = await getPropertyById(propertyId)
        if(property) {
          botMessage = {
            id: (Date.now() + 1).toString(),
            text: "Here's a property that meets that criteria",
            sender: 'bot',
            timestamp: new Date(),
            property: property,
            type: 'property'
          }
        } else {
          botMessage = {
            id: (Date.now() + 1).toString(),
            text: "I couldn't find a property that meets that criteria",
            sender: 'bot',
            timestamp: new Date(),
            type: 'text'
          }
        }
      } else {
        
        // const openaiResponse = await openai.chat([
        //  { role: 'system', content: 'You are a helpful real estate assistant.' },
        //  { role: 'user', content: inputText }
        //])
        // Extract the AI's message from the response
        // const aiMessage = openaiResponse.choices[0].message.content
        
        const randomResponse = HARDCODED_RESPONSES[count % HARDCODED_RESPONSES.length]
        botMessage = {
          id: (Date.now() + 1).toString(),
          text: randomResponse,
          sender: 'bot',
          timestamp: new Date()
        }
      }
      
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 2000 + Math.random() * 3000) 
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handlePropertySelect = (property: Property) => {
    console.log('Property selected:', property)
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 group"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
        
        {/* Notification badge */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            1
          </div>
        )}
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-end p-4 sm:items-center sm:justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat Container */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md h-96 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">REALagent AI</h3>
                  <p className="text-xs text-blue-100">Online now</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'property' && message.property ? (
                    <div className="max-w-xs">
                      <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg mb-2">
                        <div className="flex items-start space-x-2">
                          <Bot className="w-4 h-4 mt-0.5 text-blue-600" />
                          <div>
                            <p className="text-sm">{message.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <PropertyCardChat 
                        property={message.property} 
                        onSelect={handlePropertySelect}
                      />
                    </div>
                  ) : (
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender === 'bot' && (
                          <Bot className="w-4 h-4 mt-0.5 text-blue-600" />
                        )}
                        {message.sender === 'user' && (
                          <User className="w-4 h-4 mt-0.5 text-white" />
                        )}
                        <div>
                          <p className="text-sm">{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 max-w-xs px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-blue-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about properties..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}