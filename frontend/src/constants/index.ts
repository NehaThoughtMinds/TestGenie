export const LANGUAGES = [
  'Python',
  'JavaScript', 
  'TypeScript', 
  'Java', 
  'C#', 
  'Go', 
  'Rust'
] as const;

export const FILE_EXTENSIONS = [
  '.py', '.js', '.ts', '.java', '.cs', '.go', '.rs', '.cpp', '.rb', '.php', '.swift', '.kt'
];

export const COVERAGE_DEPTH_OPTIONS = [
  { value: 'minimal', label: 'Minimal — Happy path only' },
  { value: 'standard', label: 'Standard — Happy + Edge cases' },
  { value: 'deep', label: 'Deep — Full boundary analysis' },
  { value: 'security', label: 'Security — Injection tests' }
] as const;

export const MAX_TESTS_OPTIONS = [
  { value: 5, label: '5 tests' },
  { value: 10, label: '10 tests' },
  { value: 20, label: '20 tests' },
  { value: 30, label: '30 tests' },
  { value: 50, label: '50 tests' }
] as const;

export const TEST_FRAMEWORK_OPTIONS = [
  'Auto-detect',
  'pytest (Python)',
  'unittest (Python)',
  'Jest (JS)',
  'Mocha (JS)',
  'JUnit (Java)'
] as const;

export const PLACEHOLDER_CODE = `# Or paste your code directly here...
# Example:
def calculate_discount(price, percent):
    if percent < 0 or percent > 100:
        raise ValueError('Invalid percent')
    return price * (1 - percent / 100)`;
