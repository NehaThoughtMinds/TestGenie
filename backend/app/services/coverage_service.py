import json
from openai import OpenAI
from json_repair import repair_json
from app.core.config import settings
from app.schemas.response import CoverageReport, FileCoverage

client = OpenAI(api_key=settings.OPEN_API_KEY)

TOOL_META = {
    "python":     {"tool": "coverage.py",  "framework": "pytest"},
    "javascript": {"tool": "istanbul",     "framework": "jest"},
    "typescript": {"tool": "istanbul",     "framework": "jest"},
    "java":       {"tool": "jacoco",       "framework": "junit"},
    "csharp":     {"tool": "opencover",    "framework": "nunit"},
    "go":         {"tool": "gocov",        "framework": "testing"},
}

COVERAGE_SYSTEM_PROMPT = """You are an expert software testing engineer specialising in code coverage analysis.

You will be given:
1. Source code in a specific programming language
2. A list of generated unit test cases (with their test_code)

Your job is to CAREFULLY analyse which lines/branches of the source code are exercised
by the provided tests and produce a coverage report as a JSON object.

Return EXACTLY this JSON structure (no markdown, no explanation):
{
  "overall_line_coverage_pct": <float 0-100>,
  "overall_branch_coverage_pct": <float 0-100>,
  "lines_total": <int>,
  "lines_covered": <int>,
  "missing_lines": [<int>, ...]
}

RULES:
- Analyse the ENTIRE source code as a single unit.
- missing_lines must list actual line numbers from the source code that are not covered.
- Return ONLY valid JSON — double quotes, no trailing commas, no comments
"""


async def get_coverage(
    source_code: str,
    language: str,
    test_cases: list[dict],       # list of full TestCase dicts (id, name, test_code, etc.)
    filename: str = "source_file",
) -> CoverageReport:
    """
    Ask the LLM to analyse source code + test cases and return a coverage report.
    Works for ALL languages.
    """
    language = language.lower()
    meta = TOOL_META.get(language, {"tool": "coverage tool", "framework": "test framework"})

    # Format test cases clearly for the LLM
    formatted_tests = _format_test_cases(test_cases)

    user_prompt = f"""
Language: {language}
Coverage Tool: {meta['tool']}
Test Framework: {meta['framework']}
Filename: {filename}

===== SOURCE CODE =====
{source_code}

===== GENERATED TEST CASES =====
{formatted_tests}

Now carefully analyse which lines and branches of the source code are covered
by these test cases and return the coverage JSON report.
"""

    response = client.chat.completions.create(
        model=settings.MODEL,
        max_tokens=2000,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": COVERAGE_SYSTEM_PROMPT},
            {"role": "user",   "content": user_prompt},
        ],
    )

    raw = (response.choices[0].message.content or "").strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        data = json.loads(repair_json(raw))

    return _build_coverage_report(data, language, meta, filename)


# ──────────────────────────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────────────────────────

def _format_test_cases(test_cases: list[dict]) -> str:
    """Pretty-format test cases so the LLM can reason about them clearly."""
    parts = []
    for tc in test_cases:
        parts.append(
            f"[{tc.get('id', '?')}] {tc.get('name', 'Unnamed')}\n"
            f"  Category   : {tc.get('category', '')}\n"
            f"  Function   : {tc.get('function_name', '')}\n"
            f"  Input      : {tc.get('input', '')}\n"
            f"  Expected   : {tc.get('expected_output', '')}\n"
            f"  Test Code  :\n"
            + "\n".join(f"    {line}" for line in tc.get("test_code", "").splitlines())
        )
    return "\n\n".join(parts)


def _build_coverage_report(data: dict, language: str, meta: dict, filename: str) -> CoverageReport:
    """Map LLM JSON output → CoverageReport schema."""

    # Build a single FileCoverage object for the whole file
    file_coverages: list[FileCoverage] = [
        FileCoverage(
            file=filename,
            line_coverage_pct=float(data.get("overall_line_coverage_pct", 0.0)),
            branch_coverage_pct=float(data.get("overall_branch_coverage_pct", 0.0)),
            lines_covered=int(data.get("lines_covered", 0)),
            lines_total=int(data.get("lines_total", 0)),
            missing_lines=data.get("missing_lines", []),
        )
    ]

    # Build notes from gaps + recommendations
    return CoverageReport(
        overall_line_coverage_pct=float(data.get("overall_line_coverage_pct", 0.0)),
        overall_branch_coverage_pct=float(data.get("overall_branch_coverage_pct", 0.0)),
        files=file_coverages,
    )