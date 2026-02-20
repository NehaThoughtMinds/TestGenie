export interface LanguageConfig {
  wasmFile: string;
  symbolQuery: string;
  testFramework: string;
  frameworkHints: string;
  testFileExtension: string;
  testFileSuffix: string;
}

export const LANGUAGE_REGISTRY: Record<string, LanguageConfig> = {

  python: {
    wasmFile: 'tree-sitter-python.wasm',
    symbolQuery: `
      (function_definition name: (identifier) @fn_name)
      (class_definition   name: (identifier) @class_name)
    `,
    testFramework: 'pytest',
    frameworkHints: `
- Prefix all test functions with test_.
- Use pytest.raises() for exception testing.
- Use fixtures for shared setup.
    `.trim(),
    testFileExtension: '.py',
    testFileSuffix: '_test',
  },

  javascript: {
    wasmFile: 'tree-sitter-javascript.wasm',
    symbolQuery: `
      (function_declaration name: (identifier) @fn_name)
      (method_definition name: (property_identifier) @fn_name)
      (class_declaration name: (identifier) @class_name)
    `,
    testFramework: 'Jest',
    frameworkHints: `
- Use describe() blocks to group related tests.
- Use it() or test() for individual cases.
- Use expect() with matchers like .toBe(), .toEqual(), .toThrow().
    `.trim(),
    testFileExtension: '.test.js',
    testFileSuffix: '',
  },

  javascriptreact: {
    wasmFile: 'tree-sitter-javascript.wasm',
    symbolQuery: `
      (function_declaration name: (identifier) @fn_name)
      (method_definition name: (property_identifier) @fn_name)
      (class_declaration name: (identifier) @class_name)
    `,
    testFramework: 'Jest + React Testing Library',
    frameworkHints: `
- Use describe() blocks to group related tests.
- Use it() or test() for individual cases.
- Use expect() with matchers like .toBe(), .toEqual(), .toThrow().
- For React components, use @testing-library/react.
- Use render() to render components, screen.getByText() to query.
- Use fireEvent.click() to simulate user interactions.
- Import { render, screen, fireEvent } from '@testing-library/react'.
    `.trim(),
    testFileExtension: '.test.jsx',
    testFileSuffix: '',
  },

  typescriptreact: {
    wasmFile: 'tree-sitter-javascript.wasm',
    symbolQuery: `
      (function_declaration name: (identifier) @fn_name)
      (method_definition name: (property_identifier) @fn_name)
      (class_declaration name: (identifier) @class_name)
    `,
    testFramework: 'Jest + React Testing Library',
    frameworkHints: `
- Use describe() blocks to group related tests.
- Use it() or test() for individual cases.
- Use expect() with matchers like .toBe(), .toEqual(), .toThrow().
- For React components, use @testing-library/react.
- Use render() to render components, screen.getByText() to query.
- Use fireEvent.click() to simulate user interactions.
- Import { render, screen, fireEvent } from '@testing-library/react'.
    `.trim(),
    testFileExtension: '.test.tsx',
    testFileSuffix: '',
  },

  java: {
    wasmFile: 'tree-sitter-java.wasm',
    symbolQuery: `
      (method_declaration name: (identifier) @fn_name)
      (class_declaration name: (identifier) @class_name)
    `,
    testFramework: 'JUnit 5',
    frameworkHints: `
- Annotate test methods with @Test.
- Use @BeforeEach for setup and @AfterEach for teardown.
- Use Assertions.assertEquals(), assertThrows(), assertNotNull().
    `.trim(),
    testFileExtension: '.java',
    testFileSuffix: 'Test',
  },

};

export function getLanguageConfig(languageId: string): LanguageConfig | null {
  return LANGUAGE_REGISTRY[languageId] ?? null;
}

export function getSupportedLanguages(): string[] {
  return Object.keys(LANGUAGE_REGISTRY);
}
