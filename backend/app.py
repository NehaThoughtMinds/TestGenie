from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import ast
import json
from typing import List

app = FastAPI(title="TestGenie - Unit Test Generator")


class SourcePayload(BaseModel):
    source: str


def _choose_sample_value(param_name: str) -> str:
    name = param_name.lower()
    if "str" in name or "name" in name or "text" in name:
        return "'example'"
    if "count" in name or "num" in name or name == "n" or "index" in name or name == "i":
        return "1"
    if "flag" in name or name.startswith("is_") or name.startswith("has_"):
        return "True"
    return "None"


def generate_tests_from_source(source: str) -> dict:
    try:
        tree = ast.parse(source)
    except SyntaxError as e:
        raise ValueError(f"Failed to parse source: {e}")

    func_defs: List[ast.FunctionDef] = [n for n in tree.body if isinstance(n, ast.FunctionDef)]

    tests = []
    for fn in func_defs:
        name = fn.name
        params = [a.arg for a in fn.args.args]
        args = []
        for p in params:
            args.append(_choose_sample_value(p))
        args_str = ", ".join(args)
        test_name = f"test_{name}_basic"
        test_code = f"def {test_name}():\n"
        test_code += f"    result = module.{name}({args_str})\n"
        test_code += f"    assert result is not None\n\n"
        tests.append(test_code)

    if not tests:
        tests_content = "# No top-level functions detected in the provided source.\n"
        tests_content += "# Paste a Python module with functions and try again.\n"
    else:
        tests_content = ""
        tests_content += "from types import ModuleType\n\n"
        tests_content += f"user_src = {json.dumps(source)}\n"
        tests_content += "module = ModuleType('user_module')\n"
        tests_content += "exec(user_src, module.__dict__)\n\n"
        for t in tests:
            tests_content += t

    return {
        "filename": "test_generated.py",
        "content": tests_content,
        "functions_found": [f.name for f in func_defs],
    }


@app.post("/generate")
async def generate(payload: SourcePayload):
    try:
        result = generate_tests_from_source(payload.source)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return result


@app.get("/health")
async def health():
    return {"status": "ok"}


# ── NEW: Tree-sitter + OpenAI endpoint (for VS Code extension) ────────────────

from tree_sitter import Language, Parser
import tree_sitter_python as tspython
import tree_sitter_javascript as tsjavascript
import tree_sitter_java as tsjava
from openai import OpenAI
from typing import Optional

AI_LANGUAGES = {
    "python": {
        "language": Language(tspython.language()),
        "test_framework": "pytest",
        "framework_hints": "Prefix all test functions with test_. Use pytest.raises() for exceptions.",
        "test_file_suffix": "_test",
        "test_file_extension": ".py",
    },
    "javascript": {
        "language": Language(tsjavascript.language()),
        "test_framework": "Jest",
        "framework_hints": "Use describe() and it() blocks. Use expect() matchers.",
        "test_file_suffix": "",
        "test_file_extension": ".test.js",
    },
    
    "javascriptreact": {
        "language": Language(tsjavascript.language()),
        "test_framework": "Jest + React Testing Library",
        "framework_hints": "Use describe() and it() blocks. Use render() and screen.getByText() from @testing-library/react. Use fireEvent.click() for interactions.",
        "test_file_suffix": "",
        "test_file_extension": ".test.jsx",
    },
    "typescriptreact": {
        "language": Language(tsjavascript.language()),
        "test_framework": "Jest + React Testing Library",
        "framework_hints": "Use describe() and it() blocks. Use render() and screen.getByText() from @testing-library/react. Use fireEvent.click() for interactions.",
        "test_file_suffix": "",
        "test_file_extension": ".test.tsx",
    },
    "java": {
        "language": Language(tsjava.language()),
        "test_framework": "JUnit 5",
        "framework_hints": "Use @Test annotation. Use Assertions.assertEquals() and assertThrows().",
        "test_file_suffix": "Test",
        "test_file_extension": ".java",
    },
}

FUNCTION_NODE_TYPES = {
    "function_definition", "function_declaration",
    "method_declaration", "method_definition",
}
CLASS_NODE_TYPES = {
    "class_definition", "class_declaration",
}

def extract_symbols_ai(source: str, language_id: str) -> list:
    lang_config = AI_LANGUAGES[language_id]
    parser = Parser(lang_config["language"])
    tree = parser.parse(bytes(source, "utf-8"))

    symbols = []
    seen = set()

    def walk(node):
        if node.type in FUNCTION_NODE_TYPES or node.type in CLASS_NODE_TYPES:
            name_node = node.child_by_field_name("name")
            if name_node:
                name = name_node.text.decode("utf-8")
                symbol_type = "class" if node.type in CLASS_NODE_TYPES else "function"
                key = f"{symbol_type}:{name}"
                if key not in seen:
                    seen.add(key)
                    symbols.append({"type": symbol_type, "name": name})
        for child in node.children:
            walk(child)

    walk(tree.root_node)
    return symbols


class AIGenerateRequest(BaseModel):
    source: str
    language: str = "python"
    filename: Optional[str] = "source"
    api_key: Optional[str] = None

class AIGenerateResponse(BaseModel):
    filename: str
    content: str
    functions_found: List[str]
    classes_found: List[str]
    language: str
    test_framework: str


@app.post("/generate/ai", response_model=AIGenerateResponse)
async def generate_ai(payload: AIGenerateRequest):
    if payload.language not in AI_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language '{payload.language}'. Supported: {list(AI_LANGUAGES.keys())}"
        )

    lang_config = AI_LANGUAGES[payload.language]

    try:
        symbols = extract_symbols_ai(payload.source, payload.language)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse source: {e}")

    print("API KEY RECEIVED:", (payload.api_key or "")[:20])
    api_key = payload.api_key or os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="OpenAI API key not provided."
        )

    functions = "\n".join(f"  - {s['name']}" for s in symbols if s["type"] == "function")
    classes   = "\n".join(f"  - {s['name']}" for s in symbols if s["type"] == "class")
    symbol_section = ""
    if functions:
        symbol_section += f"Functions to test:\n{functions}\n"
    if classes:
        symbol_section += f"Classes to test:\n{classes}\n"
    if not symbol_section:
        symbol_section = "(infer from source code)"

    prompt = f"""Generate a complete {lang_config['test_framework']} test file for the following {payload.language} code.

{symbol_section}

Instructions: {lang_config['framework_hints']}
Include all imports. Output ONLY raw code, no markdown fences.

Source code:
{payload.source}"""

    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.2,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": "You write clean, correct unit tests. Never use markdown fences."},
                {"role": "user", "content": prompt}
            ]
        )
        generated = response.choices[0].message.content or ""
        generated = generated.replace("```python", "").replace("```javascript", "").replace("```java", "").replace("```", "").strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI error: {e}")

    suffix = lang_config["test_file_suffix"]
    ext    = lang_config["test_file_extension"]
    test_filename = f"{payload.filename}{suffix}{ext}"

    return AIGenerateResponse(
        filename=test_filename,
        content=generated,
        functions_found=[s["name"] for s in symbols if s["type"] == "function"],
        classes_found=[s["name"] for s in symbols if s["type"] == "class"],
        language=payload.language,
        test_framework=lang_config["test_framework"],
    )


# ── Cross-file analysis endpoint ──────────────────────────────────────────────

from analyzer.import_resolver import find_usages, format_usage_context

class AIGenerateWithContextRequest(BaseModel):
    source: str
    language: str = "python"
    filename: Optional[str] = "source"
    file_path: Optional[str] = None
    project_root: Optional[str] = None
    api_key: Optional[str] = None

@app.post("/generate/ai/full", response_model=AIGenerateResponse)
async def generate_ai_full(payload: AIGenerateWithContextRequest):
    if payload.language not in AI_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language '{payload.language}'. Supported: {list(AI_LANGUAGES.keys())}"
        )

    lang_config = AI_LANGUAGES[payload.language]

    # Extract symbols via Tree-sitter
    try:
        symbols = extract_symbols_ai(payload.source, payload.language)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse source: {e}")

    function_names = [s["name"] for s in symbols if s["type"] == "function"]

    # Cross-file usage analysis
    usage_context = ""
    if payload.file_path and payload.project_root and function_names:
        try:
            usages = find_usages(
                source_file_path=payload.file_path,
                project_root=payload.project_root,
                language=payload.language,
                function_names=function_names,
            )
            usage_context = format_usage_context(usages)
        except Exception:
            pass  # Non-fatal — proceed without cross-file context

    # Get API key
    api_key = payload.api_key or os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=400, detail="OpenAI API key not provided.")

    # Build prompt with cross-file context
    functions = "\n".join(f"  - {s['name']}" for s in symbols if s["type"] == "function")
    classes   = "\n".join(f"  - {s['name']}" for s in symbols if s["type"] == "class")
    symbol_section = ""
    if functions:
        symbol_section += f"Functions to test:\n{functions}\n"
    if classes:
        symbol_section += f"Classes to test:\n{classes}\n"
    if not symbol_section:
        symbol_section = "(infer from source code)"

    prompt = f"""Generate a complete {lang_config['test_framework']} test file for the following {payload.language} code.

{symbol_section}

{usage_context}

Instructions: {lang_config['framework_hints']}
Include all imports. Output ONLY raw code, no markdown fences.

Source code:
{payload.source}"""

    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.2,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": "You write clean, correct unit tests. Never use markdown fences."},
                {"role": "user", "content": prompt}
            ]
        )
        generated = response.choices[0].message.content or ""
        generated = generated.replace("```python", "").replace("```javascript", "").replace("```java", "").replace("```", "").strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI error: {e}")

    suffix = lang_config["test_file_suffix"]
    ext    = lang_config["test_file_extension"]
    test_filename = f"{payload.filename}{suffix}{ext}"

    return AIGenerateResponse(
        filename=test_filename,
        content=generated,
        functions_found=function_names,
        classes_found=[s["name"] for s in symbols if s["type"] == "class"],
        language=payload.language,
        test_framework=lang_config["test_framework"],
    )
