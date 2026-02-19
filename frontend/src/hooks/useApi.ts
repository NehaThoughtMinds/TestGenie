import { useState } from 'react';
import { ApiService } from '../services/api';
import type { GenerateTestResponse, GenerateTestRequest } from '../services/api';

export const useApi = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiResponse, setApiResponse] = useState<GenerateTestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateFromText = async (request: GenerateTestRequest): Promise<GenerateTestResponse | null> => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await ApiService.generateFromText(request);
      setApiResponse(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate tests';
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateFromFile = async (file: File, coverageDepth: string = 'standard'): Promise<GenerateTestResponse | null> => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await ApiService.generateFromFile(file, coverageDepth);
      setApiResponse(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate tests';
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearError = () => setError(null);
  const clearResponse = () => setApiResponse(null);

  return {
    isProcessing,
    apiResponse,
    error,
    generateFromText,
    generateFromFile,
    clearError,
    clearResponse,
  };
};
