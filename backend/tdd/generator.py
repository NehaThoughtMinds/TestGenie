from openai import OpenAI
from typing import List, Optional

def generate_tests_from_requirements(
    requirements: List[str],
    language: str,
    framework: str,
    api_key: str,
    story_id: str,
    story_title: str,
    previous_test_code: Optional[str] = None,
    previous_production_code: Optional[str] = None,
    previous_story_id: Optional[str] = None,
) -> str:
    client = OpenAI(api_key=api_key)
    requirements_text = "\n".join(f"- {r}" for r in requirements)
    module_name = story_id.lower().replace("-", "_")

    continuation_section = ""
    if previous_production_code or previous_test_code:
        continuation_section = f"""
## Context from Previous Ticket ({previous_story_id})
This story is a continuation. The following code already exists.
Import and reuse existing classes. Do NOT re-test what is already covered.

### Existing Production Code:
{previous_production_code or "(not available)"}

### Existing Test Code:
{previous_test_code or "(not available)"}
---
"""

    prompt = f"""You are a senior software engineer practicing Test-Driven Development.

Story ID: {story_id}
Story Title: {story_title}
Production module name: {module_name}

Requirements / Acceptance Criteria:
{requirements_text}
{continuation_section}
RULES:
1. Import ONLY from the module named `{module_name}` — never use placeholder names
2. Every method called in tests must exist in production code
3. Use consistent class names throughout
4. Include all necessary imports
5. Each requirement must have at least one test function
6. Add a comment above each test referencing the requirement it covers
7. Include happy path, edge cases, and error cases
8. Output ONLY raw test code — no markdown fences

Generate the complete {framework} test file now:"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.2,
        max_tokens=4096,
        messages=[
            {"role": "system", "content": "You are an expert TDD engineer. Write precise, runnable tests. Never use markdown fences. Never use placeholder module names like 'your_module'."},
            {"role": "user",   "content": prompt}
        ]
    )

    content = response.choices[0].message.content or ""
    return content.replace("```python","").replace("```javascript","").replace("```java","").replace("```","").strip()


def generate_code_from_tests(
    test_code: str,
    language: str,
    api_key: str,
    story_id: str,
    story_title: str,
    previous_production_code: Optional[str] = None,
    previous_story_id: Optional[str] = None,
) -> str:
    client = OpenAI(api_key=api_key)

    continuation_section = ""
    if previous_production_code:
        continuation_section = f"""
## Existing Production Code from Previous Ticket ({previous_story_id})
Extend this — do NOT rewrite it. Add new methods/classes as needed.

{previous_production_code}
---
"""

    prompt = f"""You are a senior software engineer practicing Test-Driven Development.

Story ID: {story_id}
Story Title: {story_title}
{continuation_section}
The following test file has been generated from Jira requirements:

{test_code}

RULES:
1. Implement EVERY method and class referenced in the tests
2. Use EXACTLY the same class names as the tests use
3. Include proper error handling matching what tests expect
4. Add docstrings to all methods
5. Output ONLY raw production code — no markdown fences

Generate the production code now:"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.2,
        max_tokens=4096,
        messages=[
            {"role": "system", "content": "You are an expert software engineer. Write clean production code. Never use markdown fences."},
            {"role": "user",   "content": prompt}
        ]
    )

    content = response.choices[0].message.content or ""
    return content.replace("```python","").replace("```javascript","").replace("```java","").replace("```","").strip()
