import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

interface JiraGenerateResponse {
  story_id           : string;
  story_title        : string;
  requirements       : string[];
  test_filename      : string;
  test_code          : string;
  production_filename: string;
  production_code    : string;
  language           : string;
  test_framework     : string;
}

export async function generateFromJiraCommand(): Promise<void> {

  // 1. Get Jira credentials from settings
  const config     = vscode.workspace.getConfiguration('testgenie');
  const jiraUrl    = config.get<string>('jiraUrl')    || '';
  const jiraEmail  = config.get<string>('jiraEmail')  || '';
  const jiraToken  = config.get<string>('jiraToken')  || '';
  const apiKey     = config.get<string>('openaiApiKey') || process.env.OPENAI_API_KEY || '';
  const backendUrl = config.get<string>('backendUrl') || 'http://127.0.0.1:8000';

  // 2. Validate Jira credentials
  if (!jiraUrl || !jiraEmail || !jiraToken) {
    const action = await vscode.window.showErrorMessage(
      'TestGenie: Jira credentials not configured.',
      'Open Settings'
    );
    if (action === 'Open Settings') {
      vscode.commands.executeCommand('workbench.action.openSettings', 'testgenie.jira');
    }
    return;
  }

  if (!apiKey) {
    vscode.window.showErrorMessage(
      'TestGenie: OpenAI API key not found. Set it in Settings → TestGenie.'
    );
    return;
  }

  // 3. Ask for Jira story ID
  const storyId = await vscode.window.showInputBox({
    prompt     : 'Enter Jira Story ID',
    placeHolder: 'e.g. PROJ-123',
    validateInput: (value) => {
      if (!value || !value.trim()) return 'Story ID cannot be empty';
      if (!/^[A-Z]+-\d+$/.test(value.trim())) return 'Format must be like PROJ-123';
      return null;
    }
  });

  if (!storyId) return;

  // 4. Ask for language
  const language = await vscode.window.showQuickPick(
    ['python', 'javascript', 'java'],
    {
      placeHolder: 'Select language for code generation',
      title      : 'TestGenie: Select Language',
    }
  );

  if (!language) return;

  // 5. Ask where to save the files
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('TestGenie: Please open a workspace folder first.');
    return;
  }
  const workspaceRoot = workspaceFolders[0].uri.fsPath;

  // 6. Run the full pipeline
  await vscode.window.withProgress(
    {
      location   : vscode.ProgressLocation.Notification,
      title      : 'TestGenie: Jira TDD Pipeline',
      cancellable: false,
    },
    async (progress) => {
      try {
        progress.report({ message: `Fetching story ${storyId}...`, increment: 10 });

        const response = await fetch(`${backendUrl}/generate/jira`, {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({
            story_id   : storyId.trim(),
            language,
            api_key    : apiKey,
            jira_url   : jiraUrl,
            jira_email : jiraEmail,
            jira_token : jiraToken,
          }),
        });

        if (!response.ok) {
          const error = await response.json() as any;
          throw new Error(error.detail ?? `Backend error: ${response.status}`);
        }

        progress.report({ message: 'Generating test cases from requirements...', increment: 30 });

        const data = await response.json() as JiraGenerateResponse;

        progress.report({ message: 'Generating production code...', increment: 30 });

        // 7. Write test file
        const testFilePath = path.join(workspaceRoot, data.test_filename);
        await fs.writeFile(testFilePath, data.test_code, 'utf-8');

        // 8. Write production file
        const productionFilePath = path.join(workspaceRoot, data.production_filename);
        await fs.writeFile(productionFilePath, data.production_code, 'utf-8');

        progress.report({ message: 'Writing files...', increment: 20 });

        // 9. Open both files side by side
        await vscode.window.showTextDocument(
          vscode.Uri.file(productionFilePath),
          { viewColumn: vscode.ViewColumn.One, preview: false }
        );
        await vscode.window.showTextDocument(
          vscode.Uri.file(testFilePath),
          { viewColumn: vscode.ViewColumn.Two, preview: false }
        );

        // 10. Show summary
        vscode.window.showInformationMessage(
          `✅ TestGenie: Generated ${data.requirements.length} tests from ${storyId} — ${data.story_title}`,
          'View Files'
        );

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`TestGenie: ${message}`);
        console.error('[TestGenie Jira]', err);
      }
    }
  );
}
