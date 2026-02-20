from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from app.schemas.request import GenerateTestRequest
from app.schemas.response import GenerateTestResponse, ErrorResponse
from app.services.ai_service import generate_test_cases
import json

router = APIRouter()


# ── POST: Generate from JSON body ──────────────────────────────────
@router.post(
    "/generate",
    response_model=GenerateTestResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Generate test cases from source code",
    tags=["Test Generation"],
)
async def generate(
    request: GenerateTestRequest,
    include_coverage: bool = Query(default=True, description="Also return coverage report / commands"),
):
    try:
        return await generate_test_cases(request, include_coverage=include_coverage)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned malformed JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── POST: Generate from uploaded file ──────────────────────────────
@router.post(
    "/generate/upload",
    response_model=GenerateTestResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Generate test cases from uploaded source file",
    tags=["Test Generation"],
)
async def generate_from_file(
    file: UploadFile = File(...),
    coverage_depth: str = Query(default="standard"),
    include_coverage: bool = Query(default=True, description="Also return coverage report / commands"),
):
    try:
        content = await file.read()
        source_code = content.decode("utf-8")

        req = GenerateTestRequest(
            source_code=source_code,
            coverage_depth=coverage_depth,
        )

        result = await generate_test_cases(req, filename=file.filename, include_coverage=include_coverage)
        result.file_name = file.filename
        return result

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned malformed JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


