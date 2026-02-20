from pydantic import BaseModel, field_validator
from typing import List, Optional, Any
from enum import Enum


class TestCategory(str, Enum):
    happy_path = "happy_path"
    edge_case = "edge_case"
    negative = "negative"
    boundary = "boundary"


class Priority(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class TestCase(BaseModel):
    id: str
    name: str
    function_name: str
    category: TestCategory
    description: str
    input: str
    expected_output: str
    test_code: str
    priority: Priority
    tags: List[str]

    @field_validator("id", "input", "expected_output", mode="before")
    @classmethod
    def coerce_to_str(cls, v: Any) -> str:
        if isinstance(v, list):
            return ", ".join(str(i) for i in v)
        return str(v)

    @field_validator("category", mode="before")
    @classmethod
    def fix_category(cls, v: Any) -> str:
        if v is None:
            return "happy_path"
        raw = str(v).strip().lower()
        if raw in {c.value for c in TestCategory}:
            return raw
        mapping = {
            "happy": "happy_path",
            "positive": "happy_path",
            "success": "happy_path",
            "normal": "happy_path",
            "edge": "edge_case",
            "edgecase": "edge_case",
            "edge_case": "edge_case",
            "corner": "edge_case",
            "corner_case": "edge_case",
            "negative": "negative",
            "error": "negative",
            "exception": "negative",
            "failure": "negative",
            "boundary": "boundary",
            "boundaries": "boundary",
            "limit": "boundary",
            "limits": "boundary",
            "boundary_check": "boundary",
        }
        return mapping.get(raw, "happy_path")

    @field_validator("priority", mode="before")
    @classmethod
    def fix_priority(cls, v: Any) -> str:
        return str(v).lower() if v else "medium"


# ── Coverage Models ────────────────────────────────────────────────

class FileCoverage(BaseModel):
    """Per-file coverage breakdown."""
    file: str
    line_coverage_pct: float
    branch_coverage_pct: Optional[float] = None
    lines_covered: int
    lines_total: int
    missing_lines: List[int] = []


class CoverageReport(BaseModel):
    """
    Coverage report returned alongside test cases.
    - For Python: populated with real numbers from coverage.py
    - For all other languages: execution_possible=False,
      commands and config_files are ready-to-paste instructions.
    """
    # Real numbers (Python only)
    overall_line_coverage_pct: Optional[float] = None
    overall_branch_coverage_pct: Optional[float] = None
    files: List[FileCoverage] = []


# ── Main Response ──────────────────────────────────────────────────

class GenerateTestResponse(BaseModel):
    success: bool
    file_name: Optional[str]
    language: str
    detected_language: str
    recommended_framework: str
    recommended_tool: str
    total_tests: int
    test_cases: List[TestCase]
    coverage_report: Optional[CoverageReport] = None
    generation_time_ms: int
    model_used: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None