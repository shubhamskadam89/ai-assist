from fastapi import APIRouter
from app.models.schemas import (
    CodeGuidanceRequest,
    CodeGuidanceResponse,
    ApproachDetectionRequest,
    ApproachDetectionResponse,
    HintGenerationRequest,
    HintGenerationResponse,
)
from app.services.openai_client import chat_completion
from app.services.prompt_builder import (
    CODE_SYSTEM_PROMPT,
    build_guidance_prompt,
    DETECTION_SYSTEM_PROMPT,
    build_detection_prompt,
    HINT_SYSTEM_PROMPT,
    build_hint_prompt,
)
from app.utils.json_utils import extract_json

router = APIRouter()


@router.post("/analyze", response_model=CodeGuidanceResponse)
async def analyze_code(req: CodeGuidanceRequest):
    print(f"Python Service: Received legacy analysis request for {req.language}")

    content = chat_completion(
        CODE_SYSTEM_PROMPT,
        build_guidance_prompt(
            req.expectedOptimal,
            req.language,
            req.rawCode,
            req.mistakeCount,
        ),
    )

    data = extract_json(content)
    print(f"Python Service: AI Analysis result: {data.get('detectedApproach')}")

    return CodeGuidanceResponse(**data)


@router.post("/detect-approach", response_model=ApproachDetectionResponse)
async def detect_approach(req: ApproachDetectionRequest):
    print(f"Python Service: Received detection request for {req.language}")

    content = chat_completion(
        DETECTION_SYSTEM_PROMPT,
        build_detection_prompt(req.language, req.rawCode),
    )

    data = extract_json(content)
    print(f"Python Service: Detected approach: {data.get('detectedApproach')}")

    return ApproachDetectionResponse(**data)


@router.post("/generate-hint", response_model=HintGenerationResponse)
async def generate_hint(req: HintGenerationRequest):
    print(
        f"Python Service: Generating hint for {req.detectedApproach} (expected: {req.expectedOptimal}, mistakes: {req.mistakeCount})"
    )

    content = chat_completion(
        HINT_SYSTEM_PROMPT,
        build_hint_prompt(
            req.expectedOptimal, req.detectedApproach, req.mistakeCount
        ),
    )

    data = extract_json(content)
    print("Python Service: Generated hint")

    return HintGenerationResponse(**data)
