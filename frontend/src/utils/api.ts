import { APIResponseType } from "../types";

interface LoginResponse {
  success: boolean;
  message: string;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  StudentNumber: string;
  verification_required?: boolean;
}

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  verification_required?: boolean;
  StudentNumber?: string;
  success?: boolean;
}

interface ApiRequestConfig extends RequestInit {
  skipAuth?: boolean;
  retryOnRefresh?: boolean;
}

class ApiClient {
  private baseURL: string;
  private tokenKey = 'auth_tokens';
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Token management methods
  private getTokens(): TokenData | null {
    const tokens = localStorage.getItem(this.tokenKey);
    return tokens ? JSON.parse(tokens) : null;
  }

  private setTokens(data: TokenData): void {
    localStorage.setItem(this.tokenKey, JSON.stringify(data));
  }

  private clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private isTokenExpired(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return true;
    
    // Check if token expires in the next 5 minutes
    const expiresIn = tokens.expires_at - Date.now();
    return expiresIn < 5 * 60 * 1000;
  }

  // Refresh access token using refresh token
  private async refreshAccessToken(): Promise<string | null> {
    const tokens = this.getTokens();
    if (!tokens?.refresh_token) {
      this.clearTokens();
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: tokens.refresh_token }),
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const data = await response.json();
      const newTokenData: TokenData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || tokens.refresh_token,
        expires_at: Date.now() + (data.expires_in || 3600) * 1000,
      };

      this.setTokens(newTokenData);
      return newTokenData.access_token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.clearTokens();
      return null;
    }
  }

  // Get valid access token (refresh if needed)
  private async getValidAccessToken(): Promise<string | null> {
    const tokens = this.getTokens();
    
    if (!tokens) return null;

    if (this.isTokenExpired()) {
      return await this.refreshAccessToken();
    }

    return tokens.access_token;
  }

  // Abort controller management
  private createAbortController(key: string): AbortController {
    // Cancel any existing request with the same key
    this.cancelRequest(key);
    
    const controller = new AbortController();
    this.abortControllers.set(key, controller);
    return controller;
  }

  public cancelRequest(key: string): void {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(key);
    }
  }

  public cancelAllRequests(): void {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }

  // Main request method
  private async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {},
    requestKey?: string
  ): Promise<T> {
    const {
      skipAuth = false,
      retryOnRefresh = true,
      headers = {},
      ...restConfig
    } = config;

    // Create abort controller if requestKey is provided
    const abortController = requestKey
      ? this.createAbortController(requestKey)
      : undefined;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    };

    // Add authorization header if not skipping auth
    if (!skipAuth) {
      const token = await this.getValidAccessToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...restConfig,
        headers: requestHeaders,
        signal: abortController?.signal,
      });

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && !skipAuth && retryOnRefresh) {
        const newToken = await this.refreshAccessToken();
        
        if (newToken) {
          // Retry the request with new token
          const retryHeaders: Record<string, string> = {
            ...requestHeaders,
            'Authorization': `Bearer ${newToken}`,
          };
          const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
            ...restConfig,
            headers: retryHeaders,
            signal: abortController?.signal,
          });

          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => null);
            const error = new Error(
              errorData?.message || `HTTP error! status: ${retryResponse.status}`
            ) as any;
            error.response = errorData;
            error.status = retryResponse.status;
            throw error;
          }

          return await retryResponse.json();
        } else {
          // Refresh failed, redirect to login
          this.clearTokens();
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const error = new Error(
          errorData?.message || `HTTP error! status: ${response.status}`
        ) as any;
        error.response = errorData;
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      
      // Clean up abort controller
      if (requestKey) {
        this.abortControllers.delete(requestKey);
      }

      return data;
    } catch (error) {
      // Clean up abort controller on error
      if (requestKey) {
        this.abortControllers.delete(requestKey);
      }

      // Don't throw if request was cancelled
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`Request ${requestKey} was cancelled`);
        throw error;
      }

      throw error;
    }
  }

  // HTTP method helpers
  public get<T>(
    endpoint: string,
    config?: ApiRequestConfig,
    requestKey?: string
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' }, requestKey);
  }

  public post<T>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig,
    requestKey?: string
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      { ...config, method: 'POST', body: JSON.stringify(data) },
      requestKey
    );
  }

  public put<T>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig,
    requestKey?: string
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      { ...config, method: 'PUT', body: JSON.stringify(data) },
      requestKey
    );
  }

  public patch<T>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig,
    requestKey?: string
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      { ...config, method: 'PATCH', body: JSON.stringify(data) },
      requestKey
    );
  }

  public delete<T>(
    endpoint: string,
    config?: ApiRequestConfig,
    requestKey?: string
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' }, requestKey);
  }

  // Auth-specific methods
  public async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>(
      '/auth/login',
      { email, password },
      { skipAuth: true }
    );

    // Check if login was successful
    if (!response.success) {
      throw new Error(response.message || 'Login failed');
    }

    // Store tokens
    const tokenData: TokenData = {
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      expires_at: Date.now() + 3600 * 1000, // Default 1 hour
      verification_required: response.verification_required,
      StudentNumber: response.StudentNumber,
    };

    localStorage.setItem('email',email);
    localStorage.setItem('studentNumber',response.StudentNumber);
    this.setTokens(tokenData);
    
    return response; // Return full response including success and StudentNumber
  }

  public async logout(): Promise<APIResponseType> {
    try {
      // Call logout endpoint if authenticated
      const response = await this.post<APIResponseType>(
        '/auth/logout',
        {}, // ✅ use empty object, not []
        { skipAuth: false },
        'logout'
      );

      return response;
    } catch (error: any) {
      // Return a consistent response type even on failure
      return {
        success: false,
        message:
          error?.response?.message ||
          error?.message ||
          'An error occurred while logging out.',
      };
    } finally {
      // ✅ Always clear tokens and cancel any ongoing requests
      this.clearTokens();
      this.cancelAllRequests();
    }
  }


  public isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return tokens !== null && !this.isTokenExpired();
  }
}

// Create and export a singleton instance
// Replace with your actual API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const api = new ApiClient(API_BASE_URL);

// Export types for use in other files
export type { TokenData, ApiRequestConfig };

