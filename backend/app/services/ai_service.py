from openai import OpenAI
import json
import time
from json_repair import repair_json
from app.core.config import settings
from app.schemas.request import GenerateTestRequest
from app.schemas.response import GenerateTestResponse, TestCase

client = OpenAI(api_key=settings.OPEN_API_KEY)

# Language to framework and tool mapping
LANGUAGE_TOOL_MAP = {
    "python": {"framework": "pytest", "tool": "coverage.py"},
    "java": {"framework": "junit", "tool": "jacoco"},
    "javascript": {"framework": "jest", "tool": "istanbul"},
    "typescript": {"framework": "jest", "tool": "istanbul"},
    "csharp": {"framework": "nunit", "tool": "opencover"},
    "go": {"framework": "testing", "tool": "gocov"},
}

SYSTEM_PROMPT = """You are an expert software testing engineer.
Given source code, generate structured unit test cases as a JSON object.
Return exactly this structure:
{
  "test_cases": [ ...array of test case objects... ]
}

Each test case object must have these fields:
  id, name, function_name, category, description,
  input, expected_output, test_code, priority, tags

IMPORTANT RULES:
- category MUST be one of: happy_path, edge_case, negative, boundary
  - happy_path: typical/valid inputs, expected success
  - edge_case: unusual but valid inputs (empty, None/null, big values, unicode, etc.)
  - boundary: min/max limits, off-by-one, length constraints, numeric bounds
  - negative: invalid inputs, errors, exceptions, rejects
- expected_output should be the actual value/result the function returns for the given input
- test_code should be complete, runnable test code for the detected language/framework
- For Python: use pytest syntax with assertions
- For Java: use JUnit syntax with assertions
- For JavaScript/TypeScript: use Jest syntax with expects

CRITICAL JSON FORMATTING RULES (strictly follow these):
- Return ONLY a valid JSON object — no markdown, no explanation, no code fences
- All strings must use double quotes only — never single quotes
- Inside string values (especially test_code), escape double quotes as \"
- Escape backslashes as \\
- Replace real newlines inside string values with \\n
- No trailing commas anywhere
- No comments inside JSON"""


def detect_language(source_code: str, filename: str = "") -> str:
    """Detect language from file extension first, then code patterns."""
    if filename:
        filename_lower = filename.lower()
        if filename_lower.endswith(('.tsx', '.ts')):
            return "typescript"
        elif filename_lower.endswith(('.jsx', '.js')):
            return "javascript"
        elif filename_lower.endswith('.py'):
            return "python"
        elif filename_lower.endswith('.java'):
            return "java"
        elif filename_lower.endswith(('.cs', '.csharp')):
            return "csharp"
        elif filename_lower.endswith('.go'):
            return "go"

    code_lower = source_code.lower()

    if "=>" in source_code or "async " in code_lower or "await " in code_lower:
        if "interface " in code_lower or ("type " in code_lower and "{" in source_code):
            return "typescript"
        return "javascript"
    elif "function " in code_lower or "const " in code_lower or "let " in code_lower or "var " in code_lower:
        return "javascript"

    if "def " in code_lower or "class " in code_lower or "__name__" in code_lower:
        return "python"

    if "public " in code_lower and "class " in code_lower:
        return "java"

    if "public " in code_lower and "void " in code_lower:
        return "csharp"

    if "func " in code_lower and "package " in code_lower:
        return "go"

    return "python"


def _extract_json(text: str) -> str:
    """
    Clean model output to get parsable JSON.
    - Strip markdown code fences
    - Extract outermost JSON object {} or array []
    """
    t = text.strip()

    # Strip markdown fences
    if t.startswith("```"):
        lines = t.splitlines()
        if lines[0].lstrip().startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        t = "\n".join(lines).strip()

    # Try to find a JSON object first (preferred, since we now ask for {"test_cases": [...]})
    obj_start = t.find("{")
    obj_end = t.rfind("}")
    if obj_start != -1 and obj_end != -1 and obj_end > obj_start:
        return t[obj_start: obj_end + 1].strip()

    # Fallback: try to find a JSON array
    arr_start = t.find("[")
    arr_end = t.rfind("]")
    if arr_start != -1 and arr_end != -1 and arr_end > arr_start:
        return t[arr_start: arr_end + 1].strip()

    return t


def _parse_json_safe(raw: str) -> list:
    """
    Parse JSON with multiple fallback layers:
    1. Direct json.loads
    2. json_repair fallback
    Raises ValueError if all attempts fail.
    """
    cleaned = _extract_json(raw)

    # Layer 1: strict parse
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as first_error:
        # Layer 2: attempt repair
        try:
            repaired = repair_json(cleaned)
            parsed = json.loads(repaired)
        except Exception:
            raise ValueError(
                f"AI returned invalid JSON that could not be repaired: {first_error.msg}\n"
                f"Raw output (first 500 chars): {raw[:500]}"
            ) from first_error

    # Normalise: we asked for {"test_cases": [...]} but handle bare arrays too
    if isinstance(parsed, dict):
        # Look for any key that holds a list
        for key in ("test_cases", "tests", "testCases", "test_cases_list"):
            if key in parsed and isinstance(parsed[key], list):
                return parsed[key]
        # If no known key, return the first list value found
        for value in parsed.values():
            if isinstance(value, list):
                return value
        raise ValueError(f"AI returned a JSON object but no test case array found. Keys: {list(parsed.keys())}")

    if isinstance(parsed, list):
        return parsed

    raise ValueError(f"AI returned unexpected JSON type: {type(parsed)}")


def _infer_category(case: dict) -> str:
    raw_cat = str(case.get("category", "")).strip().lower()
    allowed = {"happy_path", "edge_case", "negative", "boundary"}
    if raw_cat in allowed:
        return raw_cat

    text = " ".join(
        str(x or "")
        for x in (
            case.get("name"),
            case.get("description"),
            case.get("input"),
            case.get("expected_output"),
            case.get("test_code"),
            " ".join(case.get("tags") or []),
        )
    ).lower()

    negative_markers = (
        "raise", "raises", "assertthrows", "to throw", "throw ", "throws",
        "exception", "error", "invalid", "nullpointer", "typeerror", "valueerror",
        "reject", "rejected", "400", "401", "403", "404", "500",
    )
    if any(m in text for m in negative_markers):
        return "negative"

    boundary_markers = (
        "min", "max", "minimum", "maximum", "limit", "limits", "boundary",
        "0", "-1", "1", "off by one", "off-by-one",
        "len(", "length", "size", "overflow", "underflow",
    )
    if any(m in text for m in boundary_markers):
        return "boundary"

    edge_markers = (
        "edge", "corner", "empty", "blank", "whitespace",
        "none", "null", "nan", "infinity", "inf",
        "unicode", "emoji", "very large", "large input",
    )
    if any(m in text for m in edge_markers):
        return "edge_case"

    return "happy_path"


async def generate_test_cases(req: GenerateTestRequest, filename: str = "") -> GenerateTestResponse:
    start = time.time()

    detected_language = detect_language(req.source_code, filename)
    tool_config = LANGUAGE_TOOL_MAP.get(detected_language, LANGUAGE_TOOL_MAP["python"])

    user_prompt = f"""
Analyze the source code below and generate {req.max_tests} diverse test cases.

Use the correct framework for the detected language:
- Python   → pytest
- Java     → JUnit
- JavaScript/TypeScript → Jest
- C#       → NUnit
- Go       → testing package

Coverage Depth: {req.coverage_depth}
Detected Language: {detected_language}

Source code:
```
{req.source_code}
```

Return a JSON object in exactly this format (no markdown, no extra text):
{{
  "test_cases": [
    {{
      "id": "tc_001",
      "name": "...",
      "function_name": "...",
      "category": "happy_path",
      "description": "...",
      "input": "...",
      "expected_output": "...",
      "test_code": "...",
      "priority": "high",
      "tags": ["..."]
    }}
  ]
}}
"""

    response = client.chat.completions.create(
        model=settings.MODEL,
        max_tokens=settings.MAX_TOKENS,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )

    raw = (response.choices[0].message.content or "").strip()

    cases_data = _parse_json_safe(raw)

    # Normalise category for every test case
    for c in cases_data:
        if isinstance(c, dict):
            c["category"] = _infer_category(c)

    elapsed = int((time.time() - start) * 1000)

    return GenerateTestResponse(
        success=True,
        file_name=filename or None,
        language=detected_language,
        detected_language=detected_language,
        recommended_framework=tool_config["framework"],
        recommended_tool=tool_config["tool"],
        total_tests=len(cases_data),
        test_cases=[TestCase(**c) for c in cases_data],
        generation_time_ms=elapsed,
        model_used=settings.MODEL,
    )