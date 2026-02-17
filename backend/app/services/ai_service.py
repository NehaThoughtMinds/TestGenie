from openai import OpenAI
import json
import time
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
Given source code, generate structured unit test cases as a JSON array.
Each object must have: id, name, function_name, category, description,
input, expected_output, test_code, priority, tags.

IMPORTANT:
- expected_output should be the actual value/result the function returns for the given input
- test_code should be complete, runnable test code for the detected language/framework
- For Python: use pytest syntax with assertions
- For Java: use JUnit syntax with assertions
- For JavaScript/TypeScript: use Jest syntax with expects
- Return ONLY valid JSON. No markdown, no explanation."""


def detect_language(source_code: str, provided_language: str) -> str:
    """Detect language from source code patterns if needed."""
    language = provided_language.lower()
    
    # If already provided, return it
    if language in LANGUAGE_TOOL_MAP:
        return language
    
    # Detect from code patterns
    code_lower = source_code.lower()
    
    if "def " in code_lower or "import " in code_lower or ":" in code_lower:
        return "python"
    elif "public " in code_lower and "class " in code_lower:
        return "java"
    elif "function " in code_lower or "const " in code_lower or "let " in code_lower:
        return "javascript"
    elif "interface " in code_lower and "type " in code_lower:
        return "typescript"
    elif "public " in code_lower and "void " in code_lower:
        return "csharp"
    elif "func " in code_lower and "package " in code_lower:
        return "go"
    
    return "python"  # Default


async def generate_test_cases(req: GenerateTestRequest) -> GenerateTestResponse:
    start = time.time()
    
    # Detect language
    detected_language = detect_language(req.source_code, req.language)
    tool_config = LANGUAGE_TOOL_MAP.get(detected_language, LANGUAGE_TOOL_MAP["python"])

    user_prompt = f"""
Language: {detected_language}
Framework: {req.framework or tool_config['framework']}
Coverage Tool: {tool_config['tool']}
Coverage Depth: {req.coverage_depth}
Max tests: {req.max_tests}

Source code:
```{detected_language}
{req.source_code}
```

Generate {req.max_tests} diverse test cases as a JSON array.
Make sure each test case includes:
- Clear description of what is being tested
- Specific input values to test
- Expected output/result for those inputs
- Runnable test code using the {tool_config['framework']} framework
"""

    response = client.chat.completions.create(
        model=settings.MODEL,
        max_tokens=settings.MAX_TOKENS,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )

    raw = response.choices[0].message.content.strip()
    raw = raw.removeprefix("```json").removesuffix("```").strip()
    cases_data = json.loads(raw)

    elapsed = int((time.time() - start) * 1000)

    return GenerateTestResponse(
        success=True,
        file_name=None,
        language=req.language,
        detected_language=detected_language,
        recommended_framework=tool_config['framework'],
        recommended_tool=tool_config['tool'],
        total_tests=len(cases_data),
        test_cases=[TestCase(**c) for c in cases_data],
        generation_time_ms=elapsed,
        model_used=settings.MODEL,
    )