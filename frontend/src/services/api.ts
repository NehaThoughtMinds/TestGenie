const API_BASE_URL = '/api/v1';

import type { TestCase, GenerateTestResponse, GenerateTestRequest } from '../types';

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  static async generateFromText(request: GenerateTestRequest): Promise<GenerateTestResponse> {
    return this.request<GenerateTestResponse>('/tests/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async generateFromFile(
    file: File,
    coverageDepth: string = 'standard'
  ): Promise<GenerateTestResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('coverage_depth', coverageDepth);

    const response = await fetch(`${API_BASE_URL}/tests/generate/upload?include_coverage=true`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

export type { TestCase, GenerateTestResponse, GenerateTestRequest };
