import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { LanguageConfig } from '../parser/languages';

export interface WriteResult {
  uri: vscode.Uri;
  testFilePath: string;
  alreadyExisted: boolean;
}

export function deriveTestFilePath(
  sourceFilePath: string,
  langConfig: LanguageConfig
): string {
  const dir      = path.dirname(sourceFilePath);
  const ext      = path.extname(sourceFilePath);
  const baseName = path.basename(sourceFilePath, ext);

  const testFileName = `${baseName}${langConfig.testFileSuffix}${langConfig.testFileExtension}`;
  return path.join(dir, testFileName);
}

export async function writeTestFile(
  sourceFilePath: string,
  generatedCode: string,
  langConfig: LanguageConfig
): Promise<WriteResult | null> {

  const testFilePath = deriveTestFilePath(sourceFilePath, langConfig);
  const uri          = vscode.Uri.file(testFilePath);

  let alreadyExisted = false;
  try {
    await fs.access(testFilePath);
    alreadyExisted = true;

    const choice = await vscode.window.showWarningMessage(
      `TestGenie: ${path.basename(testFilePath)} already exists. Overwrite?`,
      { modal: true },
      'Overwrite',
      'Cancel'
    );

    if (choice !== 'Overwrite') {
      return null;
    }
  } catch {
    // File does not exist — proceed normally
  }

  await fs.writeFile(testFilePath, generatedCode, 'utf-8');

  await vscode.window.showTextDocument(uri, {
    preview: false,
    viewColumn: vscode.ViewColumn.Beside,
  });

  return { uri, testFilePath, alreadyExisted };
}
