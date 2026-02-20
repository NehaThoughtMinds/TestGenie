from openai import OpenAI
from typing import List

def generate_tests_from_requirements(
    requirements: List[str],
    language: str,
    framework: str,
    api_key: str,
    story_id: str,
    story_title: str,
) -> str:
    """
    Takes Jira requirements and generates a complete test file.
    """
    client = OpenAI(api_key=api_key)

    requirements_text = "\n".join(f"- {r}" for r in requirements)

    prompt = f"""You are a senior software engineer practicing Test-Driven Development.

A Jira story has been provided with the following details:

Story ID: {story_id}
Story Title: {story_title}

Requirements / Acceptance Criteria:
{requirements_text}

Your task:
1. Analyze each requirement carefully
2. Generate a complete {framework} test file in {language}
3. Each requirement must have at least one test function
4. Name test functions descriptively based on the requirement
5. Add a comment above each test referencing the requirement it covers
6. Include happy path, edge cases, and error cases
7. Include all necessary imports
8. Do NOT generate production code — only tests
9. Output ONLY raw test code, no markdown fences

Generate the complete test file now:"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.2,
        max_tokens=4096,
        messages=[
            {
                "role": "system",
                "content": "You are an expert TDD engineer. You write precise, requirement-driven tests. Never use markdown fences."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = response.choices[0].message.content or ""
    return content.replace("```python", "").replace("```javascript", "").replace("```java", "").replace("```", "").strip()


def generate_code_from_tests(
    test_code: str,
    language: str,
    api_key: str,
    story_id: str,
    story_title: str,
) -> str:
    """
    Takes generated tests and produces production code that passes them.
    """
    client = OpenAI(api_key=api_key)

    prompt = f"""You are a senior software engineer practicing Test-Driven Development.

Story ID: {story_id}
Story Title: {story_title}

The following test file has been generated from Jira requirements:

{test_code}

Your task:
1. Analyze all the test cases carefully
2. Generate production {language} code that makes ALL these tests pass
3. Implement only what is needed to pass the tests — nothing more
4. Include proper error handling matching what the tests expect
5. Add docstrings to all functions and classes
6. Output ONLY raw production code, no markdown fences
7. Do NOT include the test code in your output

Generate the production code now:"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.2,
        max_tokens=4096,
        messages=[
            {
                "role": "system",
                "content": "You are an expert software engineer. You write clean, production-quality code. Never use markdown fences."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = response.choices[0].message.content or ""
    return content.replace("```python", "").replace("```javascript", "").replace("```java", "").replace("```", "").strip()
