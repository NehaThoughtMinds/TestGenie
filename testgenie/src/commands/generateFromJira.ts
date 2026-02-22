import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

interface JiraGenerateResponse {
  story_id            : string;
  story_title         : string;
  requirements        : string[];
  test_filename       : string;
  test_code           : string;
  production_filename : string;
  production_code     : string;
  language            : string;
  test_framework      : string;
}

// ── Detect existing project language ─────────────────────────────────────────

async function detectProjectLanguage(projectRoot: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(projectRoot, { withFileTypes: true });
    const files   = entries.filter(e => e.isFile()).map(e => e.name);

    if (files.some(f => f === 'package.json')) {
      const pkg  = JSON.parse(await fs.readFile(path.join(projectRoot, 'package.json'), 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      return 'react' in deps ? 'javascriptreact' : 'javascript';
    }
    if (files.some(f => ['pom.xml','build.gradle','build.gradle.kts'].includes(f))) return 'java';
    if (files.some(f => ['requirements.txt','pyproject.toml','setup.py','setup.cfg'].includes(f))) return 'python';
    if (files.some(f => f.endsWith('.py')))   return 'python';
    if (files.some(f => f.endsWith('.js') || f.endsWith('.jsx'))) return 'javascript';
    if (files.some(f => f.endsWith('.java'))) return 'java';
  } catch { /* ignore */ }
  return null;
}

// ── Derive filenames from story ID and language ───────────────────────────────

function deriveFilenames(storyId: string, language: string): { testFile: string; productionFile: string } {
  const slug = storyId.toLowerCase().replace(/-/g, '_');
  const map: Record<string, { testFile: string; productionFile: string }> = {
    python          : { testFile: `${slug}_test.py`,   productionFile: `${slug}.py`   },
    javascript      : { testFile: `${slug}.test.js`,   productionFile: `${slug}.js`   },
    javascriptreact : { testFile: `${slug}.test.jsx`,  productionFile: `${slug}.jsx`  },
    java            : { testFile: `${slug}Test.java`,  productionFile: `${slug}.java` },
  };
  return map[language] ?? { testFile: `${slug}_test.py`, productionFile: `${slug}.py` };
}

// ── Check if files for a story already exist ─────────────────────────────────

async function checkExistingFiles(
  workspaceRoot: string,
  storyId: string,
  language: string
): Promise<{ testExists: boolean; productionExists: boolean; testPath: string; productionPath: string }> {
  const { testFile, productionFile } = deriveFilenames(storyId, language);
  const testPath       = path.join(workspaceRoot, testFile);
  const productionPath = path.join(workspaceRoot, productionFile);

  let testExists = false;
  let productionExists = false;

  try { await fs.access(testPath);       testExists = true;       } catch { /* not found */ }
  try { await fs.access(productionPath); productionExists = true; } catch { /* not found */ }

  return { testExists, productionExists, testPath, productionPath };
}

// ── Read existing files as context for continuation ──────────────────────────

async function readFileIfExists(filePath: string): Promise<string | null> {
  try { return await fs.readFile(filePath, 'utf-8'); } catch { return null; }
}

// ── Main command ──────────────────────────────────────────────────────────────

export async function generateFromJiraCommand(): Promise<void> {

  const config     = vscode.workspace.getConfiguration('testgenie');
  const jiraUrl    = config.get<string>('jiraUrl')      || '';
  const jiraEmail  = config.get<string>('jiraEmail')    || '';
  const jiraToken  = config.get<string>('jiraToken')    || '';
  const apiKey     = config.get<string>('openaiApiKey') || process.env.OPENAI_API_KEY || '';
  const backendUrl = config.get<string>('backendUrl')   || 'http://127.0.0.1:8000';

  if (!jiraUrl || !jiraEmail || !jiraToken) {
    const action = await vscode.window.showErrorMessage(
      'TestGenie: Jira credentials not configured.', 'Open Settings'
    );
    if (action === 'Open Settings') {
      vscode.commands.executeCommand('workbench.action.openSettings', 'testgenie.jira');
    }
    return;
  }

  if (!apiKey) {
    vscode.window.showErrorMessage('TestGenie: OpenAI API key not found.');
    return;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('TestGenie: Please open a workspace folder first.');
    return;
  }
  const workspaceRoot = workspaceFolders[0].uri.fsPath;

  // ── Step 1: Get story ID ──────────────────────────────────────────────────

  const storyId = await vscode.window.showInputBox({
    prompt      : 'Enter Jira Story ID',
    placeHolder : 'e.g. PROJ-123',
    validateInput: (v) => {
      if (!v?.trim()) return 'Story ID cannot be empty';
      if (!/^[A-Z]+-\d+$/.test(v.trim())) return 'Format must be like PROJ-123';
      return null;
    }
  });
  if (!storyId) return;

  // ── Step 2: Smart language detection ────────────────────────────────────

  let language: string | undefined;
  const detectedLanguage = await detectProjectLanguage(workspaceRoot);

  if (detectedLanguage) {
    const labels: Record<string, string> = {
      python: 'Python', javascript: 'JavaScript',
      javascriptreact: 'React (JSX)', java: 'Java',
    };
    vscode.window.showInformationMessage(
      `TestGenie: Detected existing ${labels[detectedLanguage]} project — continuing in ${labels[detectedLanguage]}.`
    );
    language = detectedLanguage;
  } else {
    language = await vscode.window.showQuickPick(
      [
        { label: '🐍 Python',      description: 'pytest',                       detail: 'python' },
        { label: '🟨 JavaScript',  description: 'Jest',                         detail: 'javascript' },
        { label: '⚛️  React (JSX)', description: 'Jest + React Testing Library', detail: 'javascriptreact' },
        { label: '☕ Java',        description: 'JUnit 5',                      detail: 'java' },
      ],
      { placeHolder: 'Select language for code generation', title: 'TestGenie: New Project — Select Language' }
    ).then(s => s?.detail);
  }
  if (!language) return;

  // ── Step 3: Scenario 1 — Check if files already exist for THIS ticket ────

  const existing = await checkExistingFiles(workspaceRoot, storyId.trim(), language);

  if (existing.testExists || existing.productionExists) {
    const existingList = [
      existing.productionExists ? path.basename(existing.productionPath) : null,
      existing.testExists       ? path.basename(existing.testPath)       : null,
    ].filter(Boolean).join(' and ');

    const action = await vscode.window.showWarningMessage(
      `TestGenie: Files already exist for ${storyId.trim()} (${existingList}). Do you want to replace them?`,
      { modal: true },
      'Yes, Replace',
      'No, Cancel'
    );

    if (action !== 'Yes, Replace') {
      vscode.window.showInformationMessage('TestGenie: Generation cancelled.');
      return;
    }
  }

  // ── Step 4: Scenario 2 — Check if this is a continuation ticket ──────────

  let previousTestCode       : string | null = null;
  let previousProductionCode : string | null = null;
  let previousStoryId        : string | null = null;

  // Ask if this ticket is a continuation of another
  const isContinuation = await vscode.window.showQuickPick(
    [
      { label: '🆕 New story',          description: 'Start fresh',                        detail: 'new' },
      { label: '🔗 Continuation story', description: 'Builds on a previous Jira ticket',   detail: 'continuation' },
    ],
    { placeHolder: 'Is this a new story or a continuation of a previous ticket?', title: 'TestGenie: Story Type' }
  ).then(s => s?.detail);

  if (!isContinuation) return;

  if (isContinuation === 'continuation') {
    const prevStoryId = await vscode.window.showInputBox({
      prompt      : 'Enter the previous Jira Story ID to use as context',
      placeHolder : 'e.g. PROJ-122',
      validateInput: (v) => {
        if (!v?.trim()) return 'Story ID cannot be empty';
        if (!/^[A-Z]+-\d+$/.test(v.trim())) return 'Format must be like PROJ-122';
        return null;
      }
    });

    if (prevStoryId) {
      const prevFiles = await checkExistingFiles(workspaceRoot, prevStoryId.trim(), language);

      previousProductionCode = await readFileIfExists(prevFiles.productionPath);
      previousTestCode       = await readFileIfExists(prevFiles.testPath);
      previousStoryId        = prevStoryId.trim();

      if (previousProductionCode || previousTestCode) {
        vscode.window.showInformationMessage(
          `TestGenie: Found existing code from ${prevStoryId.trim()} — using as context for generation.`
        );
      } else {
        vscode.window.showWarningMessage(
          `TestGenie: No existing files found for ${prevStoryId.trim()}. Proceeding without context.`
        );
      }
    }
  }

  // ── Step 5: Run the full pipeline ─────────────────────────────────────────

  await vscode.window.withProgress(
    {
      location   : vscode.ProgressLocation.Notification,
      title      : 'TestGenie: Jira TDD Pipeline',
      cancellable: false,
    },
    async (progress) => {
      try {
        progress.report({ message: `Fetching story ${storyId.trim()}...`, increment: 10 });

        const response = await fetch(`${backendUrl}/generate/jira`, {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({
            story_id                : storyId.trim(),
            language,
            api_key                 : apiKey,
            jira_url                : jiraUrl,
            jira_email              : jiraEmail,
            jira_token              : jiraToken,
            previous_test_code      : previousTestCode,
            previous_production_code: previousProductionCode,
            previous_story_id       : previousStoryId,
          }),
        });

        if (!response.ok) {
          const error = await response.json() as any;
          throw new Error(error.detail ?? `Backend error: ${response.status}`);
        }

        progress.report({ message: 'Generating test cases from requirements...', increment: 30 });
        const data = await response.json() as JiraGenerateResponse;
        progress.report({ message: 'Generating production code...', increment: 30 });

        await fs.writeFile(existing.productionPath || path.join(workspaceRoot, data.production_filename), data.production_code, 'utf-8');
        await fs.writeFile(existing.testPath       || path.join(workspaceRoot, data.test_filename),       data.test_code,        'utf-8');

        progress.report({ message: 'Writing files...', increment: 20 });

        await vscode.window.showTextDocument(
          vscode.Uri.file(existing.productionPath || path.join(workspaceRoot, data.production_filename)),
          { viewColumn: vscode.ViewColumn.One, preview: false }
        );
        await vscode.window.showTextDocument(
          vscode.Uri.file(existing.testPath || path.join(workspaceRoot, data.test_filename)),
          { viewColumn: vscode.ViewColumn.Two, preview: false }
        );

        const contextNote = previousStoryId ? ` (built on ${previousStoryId})` : '';
        vscode.window.showInformationMessage(
          `✅ TestGenie: Generated ${data.requirements.length} tests from ${storyId.trim()} — ${data.story_title}${contextNote}`
        );

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`TestGenie: ${message}`);
        console.error('[TestGenie Jira]', err);
      }
    }
  );
}
