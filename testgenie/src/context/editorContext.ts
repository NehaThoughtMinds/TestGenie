import * as vscode from 'vscode';

export interface EditorContext {
  fileContent: string;
  languageId: string;
  filePath: string;
  fileName: string;
  projectRoot: string;
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

  // Get workspace root — falls back to file's directory if no workspace
  const workspaceFolders = vscode.workspace.workspaceFolders;
  const projectRoot = workspaceFolders
    ? workspaceFolders[0].uri.fsPath
    : require('path').dirname(document.uri.fsPath);

  return {
    fileContent : document.getText(),
    languageId  : document.languageId,
    filePath    : document.uri.fsPath,
    fileName    : document.fileName,
    projectRoot,
  };
}
