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


def detect_language(source_code: str, filename: str = "") -> str:
    """Detect language from file extension first, then code patterns."""
    # Check file extension first (most reliable)
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
    
    # Detect from code patterns if extension didn't help
    code_lower = source_code.lower()
    
    # TypeScript/JavaScript detection (check before Python)
    if "=>" in source_code or "async " in code_lower or "await " in code_lower:
        # If has interface/type keywords, likely TypeScript
        if "interface " in code_lower or ("type " in code_lower and "{" in source_code):
            return "typescript"
        return "javascript"
    elif "function " in code_lower or "const " in code_lower or "let " in code_lower or "var " in code_lower:
        return "javascript"
    
    # Python detection
    if "def " in code_lower or "class " in code_lower or "__name__" in code_lower:
        return "python"
    
    # Java detection
    if "public " in code_lower and "class " in code_lower:
        return "java"
    
    # C# detection
    if "public " in code_lower and "void " in code_lower:
        return "csharp"
    
    # Go detection
    if "func " in code_lower and "package " in code_lower:
        return "go"
    
    return "python"  # Default


async def generate_test_cases(req: GenerateTestRequest, filename: str = "") -> GenerateTestResponse:
    start = time.time()
    
    # Detect language from source code and filename
    detected_language = detect_language(req.source_code, filename)
    tool_config = LANGUAGE_TOOL_MAP.get(detected_language, LANGUAGE_TOOL_MAP["python"])

    user_prompt = f"""
Analyze the source code below and generate {req.max_tests} diverse test cases.

IMPORTANT: Based on the programming language detected in the code:
- For Python: use pytest framework
- For Java: use JUnit framework
- For JavaScript/TypeScript: use Jest framework
- For C#: use NUnit framework
- For Go: use testing package

Coverage Depth: {req.coverage_depth}

Source code:
```
{req.source_code}
```

Generate test cases as a JSON array.
Make sure each test case includes:
- Clear description of what is being tested
- Specific input values to test
- Expected output/result for those inputs
- Runnable test code using the appropriate framework for {detected_language}
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
        language=detected_language,
        detected_language=detected_language,
        recommended_framework=tool_config['framework'],
        recommended_tool=tool_config['tool'],
        total_tests=len(cases_data),
        test_cases=[TestCase(**c) for c in cases_data],
        generation_time_ms=elapsed,
        model_used=settings.MODEL,
    )