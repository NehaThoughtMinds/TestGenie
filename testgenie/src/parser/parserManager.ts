import * as path from 'path';
import * as vscode from 'vscode';
import { LanguageConfig, getLanguageConfig, getSupportedLanguages } from './languages';

export interface ParsedSymbol {
  type: 'function' | 'class';
  name: string;
}

export interface ParseResult {
  symbols: ParsedSymbol[];
  languageConfig: LanguageConfig;
}

let parserReady = false;
let ParserClass: any = null;
let LanguageClass: any = null;

async function ensureParserInit(extensionPath: string): Promise<void> {
  if (parserReady) return;

  const treeSitter = require('web-tree-sitter');
  ParserClass = treeSitter.Parser;
  LanguageClass = treeSitter.Language;

  await ParserClass.init({
    locateFile: () =>
      path.join(extensionPath, 'node_modules', 'web-tree-sitter', 'web-tree-sitter.wasm'),
  });

  parserReady = true;
}

export async function parseFile(
  context: vscode.ExtensionContext,
  languageId: string,
  fileContent: string
): Promise<ParseResult | null> {

  const langConfig = getLanguageConfig(languageId);

  if (!langConfig) {
    const supported = getSupportedLanguages().join(', ');
    vscode.window.showWarningMessage(
      `TestGenie: Language "${languageId}" is not supported yet. Supported: ${supported}.`
    );
    return null;
  }

  await ensureParserInit(context.extensionPath);

  const wasmPath = path.join(context.extensionPath, 'grammars', langConfig.wasmFile);
  const Language = await LanguageClass.load(wasmPath);

  const parser = new ParserClass();
  parser.setLanguage(Language);
  const tree = parser.parse(fileContent);

  const seen = new Set<string>();
  const symbols: ParsedSymbol[] = [];

  function walk(node: any) {
    const isFunctionNode =
      node.type === 'function_definition' ||
      node.type === 'function_declaration' ||
      node.type === 'method_declaration' ||
      node.type === 'method_definition';

    const isClassNode =
      node.type === 'class_definition' ||
      node.type === 'class_declaration';

    if (isFunctionNode || isClassNode) {
      const nameNode = node.childForFieldName('name');
      if (nameNode) {
        const name = nameNode.text;
        const type: ParsedSymbol['type'] = isClassNode ? 'class' : 'function';
        const key = `${type}:${name}`;
        if (!seen.has(key)) {
          seen.add(key);
          symbols.push({ type, name });
        }
      }
    }

    for (const child of node.children) {
      walk(child);
    }
  }

  walk(tree.rootNode);

  return { symbols, languageConfig: langConfig };
}
