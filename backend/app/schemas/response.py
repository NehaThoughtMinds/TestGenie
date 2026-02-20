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
            return ", ".join(str(i) for i in v)  # [5, 3] → "5, 3"
        return str(v)                             # 1 → "1", 8 → "8"

    @field_validator("category", mode="before")
    @classmethod
    def fix_category(cls, v: Any) -> str:
        if v is None:
            return "happy_path"

        raw = str(v).strip().lower()
        # Pass through valid enum values unchanged
        if raw in {c.value for c in TestCategory}:
            return raw

        # Common synonyms / model variations
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


class GenerateTestResponse(BaseModel):
    success: bool
    file_name: Optional[str]
    language: str
    detected_language: str
    recommended_framework: str
    recommended_tool: str
    total_tests: int
    test_cases: List[TestCase]
    generation_time_ms: int
    model_used: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None