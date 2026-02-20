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
- Use pytest fixtures for shared setup.
- Prefix all test functions with test_.
- Use pytest.raises() for exception testing.
- Import the module under test using a relative import.
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
- Use it() or test() for individual test cases.
- Use expect() with matchers like .toBe(), .toEqual(), .toThrow().
- Mock dependencies with jest.fn() or jest.mock().
- Use beforeEach/afterEach for setup and teardown.
    `.trim(),
    testFileExtension: '.test.js',
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
- Import org.junit.jupiter.api.* for annotations.
- Annotate test methods with @Test.
- Use @BeforeEach for setup and @AfterEach for teardown.
- Use Assertions.assertEquals(), assertThrows(), assertNotNull(), etc.
- Instantiate the class under test directly or use @ExtendWith(MockitoExtension.class) for mocks.
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
