import * as vscode from 'vscode';
import { generateTestsCommand } from './commands/generateTests';
import { generateFromJiraCommand } from './commands/generateFromJira';

export function activate(context: vscode.ExtensionContext) {
  console.log('TestGenie extension is now active');

  // Existing command — generate tests for current file
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'testgenie.generate',
      () => generateTestsCommand(context)
    )
  );

  // New command — generate from Jira story
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'testgenie.generateFromJira',
      () => generateFromJiraCommand()
    )
  );
}

export function deactivate() {
  console.log('TestGenie extension deactivated');
}
