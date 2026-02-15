from fastapi import APIRouter
from app.models.schemas import (
    ProblemClassificationRequest,
    ProblemClassificationResponse,
)
from app.services.openai_client import chat_completion
from app.services.prompt_builder import (
    PROBLEM_SYSTEM_PROMPT,
    build_problem_prompt,
)
from app.utils.json_utils import extract_json

router = APIRouter()


@router.post("/classify", response_model=ProblemClassificationResponse)
async def classify_problem(req: ProblemClassificationRequest):

    content = chat_completion(
        PROBLEM_SYSTEM_PROMPT,
        build_problem_prompt(req.title, req.description),
    )

    data = extract_json(content)

    return ProblemClassificationResponse(**data)
