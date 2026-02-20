export interface TestCase {
  id: string;
  name: string;
  function_name: string;
  category: 'happy_path' | 'edge_case' | 'negative' | 'boundary';
  description: string;
  input: string;
  expected_output: string;
  test_code: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

export interface FileCoverage {
  file: string;
  line_coverage_pct: number;
  branch_coverage_pct?: number;
  lines_covered: number;
  lines_total: number;
  missing_lines: number[];
}

export interface CoverageReport {
  overall_line_coverage_pct?: number;
  overall_branch_coverage_pct?: number;
  files: FileCoverage[];
}

export interface GenerateTestResponse {
  success: boolean;
  file_name?: string;
  language: string;
  detected_language: string;
  recommended_framework: string;
  recommended_tool: string;
  total_tests: number;
  test_cases: TestCase[];
  coverage_report?: CoverageReport;
  generation_time_ms: number;
  model_used: string;
}

export interface GenerateTestRequest {
  source_code: string;
  coverage_depth?: 'minimal' | 'standard' | 'deep' | 'security';
  max_tests?: number;
}

export interface Language {
  code: string;
  name: string;
  extensions: string[];
}

export interface TestStats {
  total: number;
  happy: number;
  edge: number;
  neg: number;
  boundary: number;
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'warning';
}
