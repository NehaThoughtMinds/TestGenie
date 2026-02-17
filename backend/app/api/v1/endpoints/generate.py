from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from app.schemas.request import GenerateTestRequest
from app.schemas.response import GenerateTestResponse, ErrorResponse
from app.services.ai_service import generate_test_cases
# from app.dependencies import verify_api_key
import json

router = APIRouter()

# ── POST: Generate from JSON body ──────────────────────────────────
@router.post(
    "/generate",
    response_model=GenerateTestResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Generate test cases from source code",
    tags=["Test Generation"]
)
async def generate(
    request: GenerateTestRequest,
    # _: str = Depends(verify_api_key)
):
    try:
        return await generate_test_cases(request)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned malformed JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── POST: Generate from uploaded file ──────────────────────────────
@router.post(
    "/generate/upload",
    response_model=GenerateTestResponse,
    summary="Generate test cases from uploaded file",
    tags=["Test Generation"]
)
async def generate_from_file(
    file: UploadFile = File(...),
    framework: str = None,
    coverage_depth: str = "standard",
    # _: str = Depends(verify_api_key)
):
    content = await file.read()
    source_code = content.decode("utf-8")

    ext_to_lang = {
        ".py": "python", ".js": "javascript",
        ".ts": "typescript", ".java": "java",
        ".cs": "csharp", ".go": "go"
    }
    suffix = "." + file.filename.rsplit(".", 1)[-1]
    language = ext_to_lang.get(suffix, "python")

    req = GenerateTestRequest(
        source_code=source_code,
        language=language,
        framework=framework,
        coverage_depth=coverage_depth,
    )
    result = await generate_test_cases(req)
    result.file_name = file.filename
    return result