import os
import re
from typing import Dict, List

# ── Language-specific import patterns ────────────────────────────────────────

IMPORT_PATTERNS = {
    "python": [
        r"from\s+([\w.]+)\s+import",   # from utils import something
        r"import\s+([\w.]+)",           # import utils
    ],
    "javascript": [
        r"require\(['\"](.+?)['\"]\)",          # require('./utils')
        r"from\s+['\"](.+?)['\"]",              # import x from './utils'
    ],
    "javascriptreact": [
        r"require\(['\"](.+?)['\"]\)",
        r"from\s+['\"](.+?)['\"]",
    ],
    "java": [
        r"import\s+([\w.]+);",                  # import com.example.Utils
    ],
}

FILE_EXTENSIONS = {
    "python": [".py"],
    "javascript": [".js", ".mjs"],
    "javascriptreact": [".jsx", ".js"],
    "java": [".java"],
}

def _get_module_name(file_path: str, language: str) -> str:
    """Convert a file path to a module name for matching imports."""
    base = os.path.basename(file_path)
    name = os.path.splitext(base)[0]
    return name

def _file_imports_module(file_content: str, module_name: str, language: str) -> bool:
    """Check if a file imports a given module."""
    patterns = IMPORT_PATTERNS.get(language, [])
    for pattern in patterns:
        matches = re.findall(pattern, file_content)
        for match in matches:
            # Check if the module name appears in the import path
            if module_name in match.replace("/", ".").replace("\\", "."):
                return True
    return False

def _extract_usage_context(file_content: str, function_names: List[str], lines_context: int = 3) -> List[dict]:
    """Extract lines where the functions are actually called."""
    usages = []
    lines = file_content.splitlines()

    for i, line in enumerate(lines):
        for fn_name in function_names:
            # Match function calls like fn_name( or fn_name.something(
            if re.search(rf'\b{re.escape(fn_name)}\s*\(', line):
                start = max(0, i - lines_context)
                end   = min(len(lines), i + lines_context + 1)
                context = "\n".join(lines[start:end])
                usages.append({
                    "function": fn_name,
                    "line": i + 1,
                    "context": context,
                })
                break  # avoid duplicate entries per line

    return usages

def find_usages(
    source_file_path: str,
    project_root: str,
    language: str,
    function_names: List[str],
    max_files: int = 50,
) -> Dict[str, List[dict]]:
    """
    Scan the project for files that import from source_file_path
    and extract how each function is used.

    Returns a dict: { "relative/path/to/file.py": [usage, ...] }
    """
    module_name = _get_module_name(source_file_path, language)
    extensions  = FILE_EXTENSIONS.get(language, [])
    results     = {}
    files_scanned = 0

    for root, dirs, files in os.walk(project_root):
        # Skip common non-source directories
        dirs[:] = [d for d in dirs if d not in {
            'node_modules', 'venv', '__pycache__', '.git',
            'dist', 'build', 'out', '.vscode', 'target'
        }]

        for filename in files:
            if not any(filename.endswith(ext) for ext in extensions):
                continue

            full_path = os.path.join(root, filename)

            # Skip the source file itself
            if os.path.abspath(full_path) == os.path.abspath(source_file_path):
                continue

            if files_scanned >= max_files:
                break

            try:
                content = open(full_path, encoding='utf-8', errors='ignore').read()
                files_scanned += 1

                if _file_imports_module(content, module_name, language):
                    usages = _extract_usage_context(content, function_names)
                    if usages:
                        rel_path = os.path.relpath(full_path, project_root)
                        results[rel_path] = usages

            except Exception:
                continue

    return results


def format_usage_context(usages: Dict[str, List[dict]]) -> str:
    """Format the usage map into a readable string for the LLM prompt."""
    if not usages:
        return ""

    lines = ["## How these functions are used across the project\n"]

    for file_path, file_usages in usages.items():
        lines.append(f"### {file_path}")
        for usage in file_usages:
            lines.append(f"- `{usage['function']}()` called at line {usage['line']}:")
            lines.append(f"```\n{usage['context']}\n```")
        lines.append("")

    return "\n".join(lines)
