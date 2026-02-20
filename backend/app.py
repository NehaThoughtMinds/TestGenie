
 
 
# ── NEW: Tree-sitter + OpenAI endpoint (for VS Code extension) ────────────────
 
import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

try:
    from tree_sitter import Language, Parser  # type: ignore[import-not-found]
except ImportError:
    Language = None  # type: ignore[assignment]
    Parser = None  # type: ignore[assignment]

try:
    import tree_sitter_python as tspython  # type: ignore[import-not-found]
except ImportError:
    tspython = None

try:
    import tree_sitter_javascript as tsjavascript  # type: ignore[import-not-found]
except ImportError:
    tsjavascript = None

try:
    import tree_sitter_java as tsjava  # type: ignore[import-not-found]
except ImportError:
    tsjava = None
from openai import OpenAI

app = FastAPI()
 
AI_LANGUAGES = {}

if Language is not None and tspython is not None:
    AI_LANGUAGES["python"] = {
        "language": Language(tspython.language(), "python"),
        "test_framework": "pytest",
        "framework_hints": "Prefix all test functions with test_. Use pytest.raises() for exceptions.",
        "test_file_suffix": "_test",
        "test_file_extension": ".py",
    }

if Language is not None and tsjavascript is not None:
    AI_LANGUAGES["javascript"] = {
        "language": Language(tsjavascript.language(), "javascript"),
        "test_framework": "Jest",
        "framework_hints": "Use describe() and it() blocks. Use expect() matchers.",
        "test_file_suffix": "",
        "test_file_extension": ".test.js",
    }

if Language is not None and tsjava is not None:
    AI_LANGUAGES["java"] = {
        "language": Language(tsjava.language(), "java"),
        "test_framework": "JUnit 5",
        "framework_hints": "Use @Test annotation. Use Assertions.assertEquals() and assertThrows().",
        "test_file_suffix": "Test",
        "test_file_extension": ".java",
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
 
 