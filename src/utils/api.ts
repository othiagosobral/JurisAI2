import { AppConfig } from '../types';

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: AppConfig) {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async uploadDocument(file: File): Promise<{ id: string; status: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async analyzeDocument(documentId: string, analysisType: string) {
    return this.request(`/api/documents/${documentId}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ analysisType }),
    });
  }

  async searchCase(caseNumber: string, court: string) {
    return this.request(`/api/cases/search`, {
      method: 'POST',
      body: JSON.stringify({ caseNumber, court }),
    });
  }

  async analyzeContract(documentId: string) {
    return this.request(`/api/contracts/${documentId}/analyze`, {
      method: 'POST',
    });
  }

  async searchJurisprudence(query: string, filters?: any) {
    return this.request(`/api/jurisprudence/search`, {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    });
  }

  async sendChatMessage(message: string, context?: any) {
    return this.request(`/api/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  async getDocumentAnalysis(documentId: string) {
    return this.request(`/api/documents/${documentId}/analysis`);
  }

  async generateMindMap(documentId: string) {
    return this.request(`/api/documents/${documentId}/mindmap`, {
      method: 'POST',
    });
  }
}

// Singleton instance
let apiClient: ApiClient | null = null;

export const initializeApi = (config: AppConfig) => {
  apiClient = new ApiClient(config);
  return apiClient;
};

export const getApiClient = (): ApiClient => {
  if (!apiClient) {
    throw new Error('API client not initialized. Call initializeApi first.');
  }
  return apiClient;
};

// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(fileExtension);
};

export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};