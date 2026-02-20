import * as vscode from 'vscode';
import { ParsedSymbol } from '../parser/parserManager';

export interface LLMRequest {
  fileContent: string;
  languageId: string;
  fileName: string;
  filePath: string;
  projectRoot: string;
  symbols: ParsedSymbol[];
  testFramework: string;
  frameworkHints: string;
}

export interface LLMResponse {
  filename: string;
  content: string;
  functions_found: string[];
  classes_found: string[];
  language: string;
  test_framework: string;
}

export async function generateTestsFromLLM(req: LLMRequest): Promise<string> {
  const config = vscode.workspace.getConfiguration('testgenie');

  const apiKey =
    config.get<string>('openaiApiKey') ||
    process.env.OPENAI_API_KEY ||
    '';

  if (!apiKey) {
    throw new Error(
      'TestGenie: OpenAI API key not found. ' +
      'Set it in Settings → TestGenie → Openai Api Key.'
    );
  }

  const backendUrl =
    config.get<string>('backendUrl') || 'http://127.0.0.1:8000';

  const body = {
    source      : req.fileContent,
    language    : req.languageId,
    filename    : req.fileName.replace(/\.[^/.]+$/, ''),
    file_path   : req.filePath,
    project_root: req.projectRoot,
    api_key     : apiKey,
  };

  const response = await fetch(`${backendUrl}/generate/ai/full`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json() as any;
    throw new Error(error.detail ?? `Backend error: ${response.status}`);
  }

  const data = await response.json() as LLMResponse;
  return data.content;
}
