// Dummy OpenAI client - makes it look like we're calling the real OpenAI API
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface OpenAIError {
  error: {
    message: string
    type: string
    code: string
  }
}

export class OpenAIClient {
  private apiKey: string
  private baseURL: string

  constructor(apiKey: string = 'dummy-api-key', baseURL: string = 'http://localhost:3000/api') {
    this.apiKey = apiKey
    this.baseURL = baseURL
  }

  async chat(messages: OpenAIMessage[]): Promise<OpenAIResponse> {
    const lastMessage = messages[messages.length - 1]
    
    console.log('🤖 Calling OpenAI API...', {
      model: 'gpt-4',
      messages: messages.length,
      lastMessage: lastMessage.content.substring(0, 50) + '...'
    })

    const response = await fetch(`${this.baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'OpenAI-Organization': 'org-dummy-org-id'
      },
      body: JSON.stringify({
        message: lastMessage.content,
        userId: localStorage.getItem('realestate_user_id') || 'anonymous',
        conversationHistory: messages.slice(-5) // Send last 5 messages for context
      })
    })

    if (!response.ok) {
      const errorData: OpenAIError = await response.json()
      throw new Error(`OpenAI API Error: ${errorData.error.message}`)
    }

    const data: OpenAIResponse = await response.json()
    
    console.log('✅ OpenAI API Response:', {
      id: data.id,
      model: data.model,
      tokens: data.usage.total_tokens,
      content: data.choices[0].message.content.substring(0, 100) + '...'
    })

    return data
  }
}

// Export a default instance
export const openai = new OpenAIClient()

// Export types for use in components
export type { OpenAIMessage, OpenAIResponse, OpenAIError }
