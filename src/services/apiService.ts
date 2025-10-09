// API Service for CodeMentor - Placeholder for future backend integration

export interface Hint {
  id: number
  type: 'syntax' | 'logic' | 'performance' | 'best-practice'
  message: string
  severity: 'low' | 'medium' | 'high'
  line?: number
  timestamp: number
}

export interface ProgressData {
  attempts: number
  hintsUsed: number[]
  timeSpent: number
  lastAttempt: number
  solved: boolean
  difficulty: string
}

export interface ProblemInfo {
  id: string
  title: string
  language: string
  platform: string
  difficulty?: string
}

export interface CodeAnalysis {
  hints: Hint[]
  score: number
  suggestions: string[]
  complexity: string
}

class ApiService {
  // private baseUrl: string = 'http://localhost:3001/api/v1'
  // private apiKey: string | null = null

  constructor() {
    // TODO: Set actual API endpoint when backend is ready
    // this.baseUrl = typeof process !== 'undefined' && process.env.NODE_ENV === 'production' 
    //   ? 'https://api.codementor.com/v1' 
    //   : 'http://localhost:3001/api/v1'
  }

  // setApiKey(key: string) {
  //   this.apiKey = key
  // }

  // private async makeRequest<T>(
  //   endpoint: string, 
  //   options: RequestInit = {}
  // ): Promise<T> {
  //   const url = `${this.baseUrl}${endpoint}`
  //   const headers = {
  //     'Content-Type': 'application/json',
  //     ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
  //     ...options.headers
  //   }

  //   try {
  //     const response = await fetch(url, {
  //       ...options,
  //       headers
  //     })

  //     if (!response.ok) {
  //       throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  //     }

  //     return await response.json()
  //   } catch (error) {
  //     console.error('API request failed:', error)
  //     throw error
  //   }
  // }

  // Code Analysis API
  async getHintsForCode(code: string, language: string, problemId?: string): Promise<Hint[]> {
    try {
      // TODO: Replace with actual API call
      console.log('Getting hints for code:', { code: code.substring(0, 100) + '...', language, problemId })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Return mock data for now
      return this.getMockHints(code, language)
    } catch (error) {
      console.error('Failed to get hints:', error)
      return []
    }
  }

  async analyzeCode(code: string, language: string, problemId?: string): Promise<CodeAnalysis> {
    try {
      // TODO: Replace with actual API call
      console.log('Analyzing code:', { code: code.substring(0, 100) + '...', language, problemId })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Return mock analysis
      return {
        hints: this.getMockHints(code, language),
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        suggestions: [
          'Consider adding input validation',
          'Optimize time complexity',
          'Add error handling'
        ],
        complexity: Math.random() > 0.5 ? 'O(n)' : 'O(n²)'
      }
    } catch (error) {
      console.error('Failed to analyze code:', error)
      throw error
    }
  }

  // Progress Tracking API
  async saveProgress(problemId: string, data: ProgressData): Promise<void> {
    try {
      // TODO: Replace with actual API call
      console.log('Saving progress:', { problemId, data })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // For now, just log the data
      console.log('Progress saved successfully')
    } catch (error) {
      console.error('Failed to save progress:', error)
      throw error
    }
  }

  async getProgress(userId?: string): Promise<Record<string, ProgressData>> {
    try {
      // TODO: Replace with actual API call
      console.log('Getting progress for user:', userId)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Return mock progress data
      return this.getMockProgress()
    } catch (error) {
      console.error('Failed to get progress:', error)
      return {}
    }
  }

  // User Management API
  async authenticateUser(email: string, _password: string): Promise<{ token: string; user: any }> {
    try {
      // TODO: Replace with actual API call
      console.log('Authenticating user:', email)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Return mock authentication
      return {
        token: 'mock-jwt-token',
        user: {
          id: 'user-123',
          email,
          name: 'John Doe',
          subscription: 'free'
        }
      }
    } catch (error) {
      console.error('Authentication failed:', error)
      throw error
    }
  }

  async getUserProfile(): Promise<any> {
    try {
      // TODO: Replace with actual API call
      console.log('Getting user profile')
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Return mock user profile
      return {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John Doe',
        subscription: 'free',
        joinDate: '2024-01-01',
        totalProblems: 25,
        solvedProblems: 18
      }
    } catch (error) {
      console.error('Failed to get user profile:', error)
      throw error
    }
  }

  // WebSocket connection for real-time features
  async connectWebSocket(): Promise<WebSocket | null> {
    try {
      // TODO: Replace with actual WebSocket endpoint
      const wsUrl = 'ws://localhost:3001/ws'
      
      console.log('Connecting to WebSocket:', wsUrl)
      
      // For now, return null (WebSocket not implemented)
      return null
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      return null
    }
  }

  // Mock data methods (to be removed when real API is ready)
  private getMockHints(code: string, language: string): Hint[] {
    const hints: Hint[] = [
      {
        id: 1,
        type: 'syntax',
        message: 'Looks like you forgot a semicolon at the end of line 5.',
        severity: 'high',
        line: 5,
        timestamp: Date.now() - 30000
      },
      {
        id: 2,
        type: 'logic',
        message: 'Check your loop bounds; you may be iterating one step too far.',
        severity: 'medium',
        line: 12,
        timestamp: Date.now() - 25000
      },
      {
        id: 3,
        type: 'performance',
        message: 'Consider using a HashMap for O(1) lookups instead of O(n) array search.',
        severity: 'medium',
        line: 8,
        timestamp: Date.now() - 20000
      }
    ]

    // Filter hints based on code content and language
    return hints.filter(hint => {
      if (language === 'javascript' && hint.type === 'syntax') {
        return code.includes(';') === false
      }
      return Math.random() > 0.3 // Randomly show 70% of hints
    })
  }

  private getMockProgress(): Record<string, ProgressData> {
    return {
      'leetcode_two_sum': {
        attempts: 3,
        hintsUsed: [1, 2, 4],
        timeSpent: 1800000,
        lastAttempt: Date.now() - 3600000,
        solved: true,
        difficulty: 'easy'
      },
      'leetcode_add_two_numbers': {
        attempts: 5,
        hintsUsed: [2, 3, 5],
        timeSpent: 2700000,
        lastAttempt: Date.now() - 7200000,
        solved: false,
        difficulty: 'medium'
      }
    }
  }
}

// Export singleton instance
export const apiService = new ApiService()
