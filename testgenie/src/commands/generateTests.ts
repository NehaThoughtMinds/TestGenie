import * as vscode from 'vscode';
import * as path from 'path';
import { getActiveEditorContext } from '../context/editorContext';
import { parseFile } from '../parser/parserManager';
import { generateTestsFromLLM } from '../llm/llmClient';
import { writeTestFile } from '../fileio/testWriter';

export async function generateTestsCommand(
  context: vscode.ExtensionContext
): Promise<void> {

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'TestGenie',
      cancellable: false,
    },
    async (progress) => {
      try {
        progress.report({ message: 'Reading file…', increment: 5 });
        const editorCtx = getActiveEditorContext();
        if (!editorCtx) return;

        progress.report({ message: 'Analysing code structure…', increment: 15 });
        const parseResult = await parseFile(context, editorCtx.languageId, editorCtx.fileContent);
        if (!parseResult) return;

        const { symbols, languageConfig } = parseResult;
        const symbolSummary = [
          symbols.filter(s => s.type === 'function').length + ' function(s)',
          symbols.filter(s => s.type === 'class').length   + ' class(es)',
        ].join(', ');

        vscode.window.showInformationMessage(
          `TestGenie: Found ${symbolSummary}. Scanning project for usages…`
        );

        progress.report({ message: 'Scanning project for cross-file usages…', increment: 20 });

        progress.report({ message: `Calling OpenAI (${languageConfig.testFramework})…`, increment: 30 });
        const generatedCode = await generateTestsFromLLM({
          fileContent : editorCtx.fileContent,
          languageId  : editorCtx.languageId,
          fileName    : path.basename(editorCtx.filePath),
          filePath    : editorCtx.filePath,
          projectRoot : editorCtx.projectRoot,
          symbols,
          testFramework : languageConfig.testFramework,
          frameworkHints: languageConfig.frameworkHints,
        });

        progress.report({ message: 'Writing test file…', increment: 45 });
        const writeResult = await writeTestFile(
          editorCtx.filePath,
          generatedCode,
          languageConfig
        );

        if (!writeResult) return;

        const fileName = path.basename(writeResult.testFilePath);
        const action   = writeResult.alreadyExisted ? 'overwritten' : 'created';

        vscode.window.showInformationMessage(
          `✅ TestGenie: ${fileName} ${action} successfully!`
        );

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`TestGenie: ${message}`);
        console.error('[TestGenie] Error:', err);
      }
    }
  );
}
