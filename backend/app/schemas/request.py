from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional

class Language(str, Enum):
    python = "python"
    javascript = "javascript"
    typescript = "typescript"
    java = "java"

class CoverageDepth(str, Enum):
    minimal = "minimal"
    standard = "standard"
    deep = "deep"
    security = "security"

class GenerateTestRequest(BaseModel):
    source_code: str = Field(..., min_length=10, description="Source code to analyze")
    coverage_depth: CoverageDepth = CoverageDepth.standard
    max_tests: int = Field(default=10, ge=1, le=50)

    class Config:
        json_schema_extra = {
            "example": {
                "source_code": "def add(a, b): return a + b",
                "coverage_depth": "standard"
            }
        }