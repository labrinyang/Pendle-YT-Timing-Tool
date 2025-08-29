// API base configuration
const DEFAULT_TIMEOUT = 10000 // 10 seconds timeout

// Error type definition
export class ApiError extends Error {
  public status?: number
  public code?: string
  public details?: any
  
  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: any
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

// API response type
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  status?: number
}

// Generic request configuration
export interface RequestConfig {
  timeout?: number
  headers?: Record<string, string>
}

// Generic API request function
export async function apiRequest<T>(
  url: string,
  config: RequestConfig = {}
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, headers = {} } = config
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        'HTTP_ERROR'
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof ApiError) {
      throw error
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'Request timeout',
        408,
        'TIMEOUT_ERROR'
      )
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'Network connection failed',
        0,
        'NETWORK_ERROR',
        error.message
      )
    }
    
    throw new ApiError(
      'Unknown error',
      500,
      'UNKNOWN_ERROR',
      error instanceof Error ? error.message : String(error)
    )
  }
}

// Error handling utility function
export function handleApiError(error: unknown): ApiResponse {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: error.message,
      status: error.status,
    }
  }
  
  return {
    success: false,
    error: 'Unknown error',
    status: 500,
  }
}

// Retry mechanism
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i === maxRetries) {
        throw lastError
      }
      
      // Don't retry if it's not a network error
      if (error instanceof ApiError && error.code !== 'NETWORK_ERROR') {
        throw error
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  
  throw lastError!
}

// Batch request utility
export async function batchRequest<T>(
  requests: (() => Promise<T>)[],
  onError?: (error: Error, index: number) => void
): Promise<T[]> {
  const results = await Promise.allSettled(requests.map(fn => fn()))
  
  const successfulResults: T[] = []
  const errors: Error[] = []
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successfulResults.push(result.value)
    } else {
      errors.push(result.reason)
      if (onError) {
        onError(result.reason, index)
      }
    }
  })
  
  if (errors.length > 0) {
    console.warn(`${errors.length} requests failed`)
  }
  
  return successfulResults
}


