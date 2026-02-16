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
