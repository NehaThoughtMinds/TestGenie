import * as vscode from 'vscode';
import { generateTestsCommand } from './commands/generateTests';

export function activate(context: vscode.ExtensionContext) {
  console.log('TestGenie extension is now active');

  const disposable = vscode.commands.registerCommand(
    'testgenie.generate',
    () => generateTestsCommand(context)
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  console.log('TestGenie extension deactivated');
}