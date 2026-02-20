import * as vscode from 'vscode';

export interface EditorContext {
  fileContent: string;
  languageId: string;
  filePath: string;
  fileName: string;
}

export function getActiveEditorContext(): EditorContext | null {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage(
      'TestGenie: No active editor found. Please open a file first.'
    );
    return null;
  }

  const document = editor.document;

  if (document.isUntitled) {
    vscode.window.showErrorMessage(
      'TestGenie: Please save the file before generating tests.'
    );
    return null;
  }

  return {
    fileContent: document.getText(),
    languageId: document.languageId,
    filePath: document.uri.fsPath,
    fileName: document.fileName,
  };
}
